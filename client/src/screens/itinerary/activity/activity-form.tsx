import React, { useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, Pressable } from 'react-native';
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
import { Icon, IconName } from '../../../components/icon';
import { MediaApi } from '../../../services/api/media';
import { set } from 'lodash';
import { MapModal } from '../../../components/molecules/map-modal';

// Update your Params type to include category
export type Params = {
  type?: 'push' | 'show';
  itineraryId: string;
  activity?: ActivityType;
  prefill?: {
    name?: string;
    description?: string;
    location?: string;
    image_url?: string;
  };
  category?: string; // Add this line
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
  cost: Yup.string()
    .matches(/^\d*\.?\d*$/, 'Estimated Cost must be a number'), // <-- Only allow numbers and optional decimal
});

export const ActivityForm: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const { itineraryId, activity, prefill } = params;

  const [image, setImage] = useState<ImagePickerAsset | string | null>(
    activity?.image_url ?? prefill?.image_url ?? null // <-- Use prefill.image_url if available
  );
  const [category, setCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState<boolean>(false);

  const categoryOptions = [
    { name: 'restaurants', label: 'Eat', icon: 'restaurant' },
    { name: 'attractions', label: 'Enjoy', icon: 'sunny' },
    { name: 'hotels', label: 'Stay', icon: 'business' },
  ] as {name: string, label: string, icon: IconName}[];

  React.useEffect(() => {
    if (activity) {
      setImage(activity.image_url as string | null);
      setCategory(activity.category);
    } else if (prefill?.image_url) {
      setImage(prefill.image_url); // <-- Set image from prefill if present
    } else if (params.category) {
      setCategory(params.category);
    }
  }, [activity, prefill?.image_url, params.category]);

  const addActivity = async (values: any) => {
    setSubmitting(true);
    try {
      const newActivity = {
        category: category,
        image_url: typeof(image) != 'string' ? await uploadImage() : image,
        ...values
      };

      await ItineraryApi.addActivity(itineraryId, newActivity);
      console.log(newActivity);
      navio.goBack();
    } catch (error) {
      handleRequestError(error); 
    } finally {
      setSubmitting(false);
    }
  };

  const updateActivity = async (values: any) => {
    setSubmitting(true);
    try {
      const newActivityDetails = {
        image_url: typeof(image) != 'string' ? await uploadImage() : image,
        category: category,
        ...values,
        cost: values.cost == '' ? undefined : values.cost,
      };

      console.log(values.cost);
      await ItineraryApi.updateActivity(activity?.id!, newActivityDetails);
      
      navio.goBack();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setSubmitting(false);
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
          initialValues={{
            name: activity?.name ?? prefill?.name ?? '',
            description: activity?.description ?? prefill?.description ?? '',
            location: activity?.location ?? prefill?.location ?? '',
            start_time: activity?.start_time ? new Date(activity.start_time) : new Date(),
            end_time: activity?.end_time ? new Date(activity.end_time) : new Date(new Date().getTime() + 3600000), // Default to 1 hour later
            cost: activity?.cost ? activity.cost.toString() : '',
            category: activity?.category ?? '',
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
                keyboardType="numeric" // <-- Only show numeric keyboard
              />

              <FormField
                label="Location"
                placeholder="Location"
                value={values.location}
                onChangeText={handleChange('location')}
                onBlur={handleBlur('location')}
                trailingAccessory={
                  <Pressable onPress={() => setMapVisible(true)}>
                    <Icon name='map-outline' color={colors.primary} />
                  </Pressable>
                }
              />

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <DateTimePicker
                  accent
                  style={{ paddingHorizontal: 16, paddingVertical: 8, minWidth: 140 }} // <-- extended width
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
                  style={{ paddingHorizontal: 16, paddingVertical: 8, minWidth: 140 }} // <-- extended width
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
                  style={{ paddingHorizontal: 16, paddingVertical: 8, minWidth: 140 }} // <-- extended width
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
                  style={{ paddingHorizontal: 16, paddingVertical: 8, minWidth: 140 }} // <-- extended width
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

              <MapModal
                visible={mapVisible}
                closeModal={() => setMapVisible(false)}
                setLocation={(loc) => setFieldValue('location', loc)}
              />

              <View style={{ marginTop: 16 }}>
                <Text
                  onPress={!submitting ? (handleSubmit as any) : undefined}
                  style={{
                    backgroundColor: submitting ? '#ccc' : colors.primary,
                    color: 'white',
                    padding: 12,
                    borderRadius: 8,
                    textAlign: 'center',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
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
