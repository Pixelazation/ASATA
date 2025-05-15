import React, { useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { DateTimePicker, Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { services, useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import { NavioSection } from '@app/components/sections/NavioSection';
import { FormField } from '../../../components/form-field';
import { colors } from '../../../utils/designSystem';
import { ItineraryApi } from '../../../services/api/itineraries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBack } from '../../../components/molecules/header-back';
import { BG_IMAGE_2 } from '../../../assets';
import { ImagePicker } from '../../../components/molecules/image-picker';
import { ImagePickerAsset } from 'expo-image-picker';
import { RadioSelection } from '../../../components/molecules/radio-selection';
import { IconName } from '../../../components/icon';
import { MediaApi } from '../../../services/api/media';
import { set } from 'lodash';

export type Params = {
  type?: 'push' | 'show';
  itineraryId: string;
  activity?: ActivityType;
};

const ActivitySchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  description: Yup.string(),
  start_time: Yup.date().required('Required'),
  end_time: Yup.date()
    .min(Yup.ref('start_time'), 'End time must be after start time')
    .required('Required'),
  category: Yup.string(),
  location: Yup.string(),
});

export const ActivityForm: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const [image, setImage] = useState<ImagePickerAsset | string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const { itineraryId, activity } = params;

  const categoryOptions = [
    { name: 'food', label: 'Eat', icon: 'restaurant' },
    { name: 'leisure', label: 'Enjoy', icon: 'sunny' },
    { name: 'accomodation', label: 'Stay', icon: 'business' },
  ] as {name: string, label: string, icon: IconName}[];

  React.useEffect(() => {
    if (activity) {
      setImage(activity.image_url as string | null);
    }

    navigation.setOptions({});
  }, []);

  const addActivity = async (values: any) => {
    try {
      const newActivity = {
        cost: 500,
        image_url: await uploadImage(),
        ...values
      };

      await ItineraryApi.addActivity(itineraryId, newActivity);
      console.log(newActivity);
      navio.goBack();
    } catch (error) {
      handleRequestError(error);
    }
  };

  const updateActivity = async (values: any) => {
    try {
      const newActivityDetails = {
        image_url: typeof(image) != 'string' ? await uploadImage() : image,
        category: category,
        ...values
      };

      await ItineraryApi.updateActivity(activity?.id!, newActivityDetails);
      console.log(newActivityDetails);
      navio.goBack();
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleRequestError = (error: any) => {
    const err = error as { message?: string };
    
    console.error(`Error ${activity ? 'editing' : 'adding'} activity:`, err);
  
    if (err.message?.includes("overlaps")) {
      Alert.alert(
        "Activity Overlap",
        "This activity overlaps with an existing one. Please choose a different time/date.",
        [{ text: "OK" }]
      );
    } else if (err.message?.includes("dates")) {
      Alert.alert(
        "Activity Overlap",
        "Activity must be within the itinerary dates. Please choose a different time/date.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Error",
        `An unexpected error occurred while ${activity ? 'editing' : 'adding'}  the activity.`,
        [{ text: "OK" }]
      );
    }
  }

  const uploadImage = async (): Promise<string|null> => {
      if (!image) return null;
  
      try {
        const url = await MediaApi.uploadImage(image as ImagePickerAsset);
        console.log('Image uploaded successfully:', url);
        return url;
      } catch (error) {
        console.error('Image upload failed:', error);
        Alert.alert('Upload Failed', 'Something went wrong while uploading the image.');
      }
  
      return null;
    }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={image ? {uri: typeof(image) == 'string' ? image: image.uri} : BG_IMAGE_2} resizeMode='cover' style={{minHeight: 100, padding: 20, marginBottom: -20}}>
        <HeaderBack />
      </ImageBackground>
      <View bg-white style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Formik
          initialValues={activity ? {
            name: activity.name,
            description: activity.description,
            start_time: new Date(activity.start_time),
            end_time: new Date(activity.end_time),
            category: activity.category,
            location: activity.location,
            cost: activity.cost ? activity.cost.toString() : '',
          } : {
            name: '',
            description: '',
            start_time: new Date(),
            end_time: new Date(),
            category: '',
            location: '',
          }}
          validationSchema={ActivitySchema}
          onSubmit={activity ? updateActivity : addActivity}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 32, paddingBottom: 100, gap: 8 }}>
              <Text section style={styles.header}>{activity ? "Edit" : "Add"} Activity</Text>
              <FormField
                label="Name"
                placeholder="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                // error={touched.name && errors.name ? errors.name : undefined}
              />

              <RadioSelection label='Category' options={categoryOptions} selected={category} selectFunction={setCategory} />

              <FormField
                label="Description"
                placeholder="Description"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
              />

              <FormField
                label="Estimated Cost"
                placeholder="(Optional)"
                value={values.cost}
                onChangeText={handleChange('cost')}
                onBlur={handleBlur('cost')}
              />

              <FormField
                label="Location"
                placeholder="Location"
                value={values.location}
                onChangeText={handleChange('location')}
                onBlur={handleBlur('location')}
              />

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <DateTimePicker
                  accent
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  fieldStyle={{
                    backgroundColor: '#ECF2F0',
                    borderRadius: 100,
                    paddingVertical: 4,
                    marginTop: 4,
                  }}
                  label="Start Date"
                  labelColor={colors.primary}
                  labelStyle={{ fontWeight: 'bold' }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={'grey'}
                  value={values.start_time}
                  onChange={(date: Date) => setFieldValue('start_time', date)}
                  mode="date"
                  minimumDate={new Date()}
                />
                <DateTimePicker
                  accent
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  fieldStyle={{
                    backgroundColor: '#ECF2F0',
                    borderRadius: 100,
                    paddingVertical: 4,
                    marginTop: 4,
                  }}
                  label="Start Time"
                  labelColor={colors.primary}
                  labelStyle={{ fontWeight: 'bold' }}
                  placeholder="HH:MM"
                  placeholderTextColor={'grey'}
                  value={values.start_time}
                  onChange={(date: Date) => setFieldValue('start_time', date)}
                  mode="time"
                  minimumDate={new Date()}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <DateTimePicker
                  accent
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  fieldStyle={{
                    backgroundColor: '#ECF2F0',
                    borderRadius: 100,
                    paddingVertical: 4,
                    marginTop: 4,
                  }}
                  label="End Date"
                  labelColor={colors.primary}
                  labelStyle={{ fontWeight: 'bold' }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={'grey'}
                  value={values.end_time}
                  onChange={(date: Date) => setFieldValue('end_time', date)}
                  mode="date"
                  minimumDate={new Date()}
                />
                <DateTimePicker
                  accent
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  fieldStyle={{
                    backgroundColor: '#ECF2F0',
                    borderRadius: 100,
                    paddingVertical: 4,
                    marginTop: 4,
                  }}
                  label="End Time"
                  labelColor={colors.primary}
                  labelStyle={{ fontWeight: 'bold' }}
                  placeholder="HH:MM"
                  placeholderTextColor={'grey'}
                  value={values.end_time}
                  onChange={(date: Date) => setFieldValue('end_time', date)}
                  mode="time"
                  minimumDate={new Date()}
                />
              </View>

              <ImagePicker image={image} setImage={setImage} />

              <View style={{ marginTop: 16 }}>
                <Text
                  onPress={handleSubmit as any}
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                    padding: 12,
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  Submit
                </Text>
              </View>
            </ScrollView>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  header: {
    letterSpacing: 1.25
  },
});

ActivityForm.options = (props) => ({
  headerShown: false,
  title: `Add Activity`,
});
