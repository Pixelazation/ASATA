import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import { DateTimePicker, Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import { FormField } from '../../components/form-field';
import { colors } from '../../utils/designSystem';
import { ItineraryApi } from '../../services/api/itineraries';
import { dateToDateString } from '../../utils/dateutils';
import { Icon } from '../../components/icon';
import { MediaApi } from '../../services/api/media';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePickerAsset } from 'expo-image-picker';

export type Params = {
  type?: 'push' | 'show';
};

const ItinerarySchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string(),
  start_date: Yup.date().required('Required'),
  end_date: Yup.date()
    .min(Yup.ref('start_date'), 'End time must be after start time')
    .required('Required'),
  budget: Yup.number().moreThan(0),
  location: Yup.string(),
});

export const ItineraryForm: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const params = navio.useParams<Params>();

  const [imageData, setImageData] = useState<ImagePickerAsset | null>(null);

  React.useEffect(() => {
    navigation.setOptions({});
  }, []);

  const addItinerary = async (values: any) => {
    try {
      const newItinerary = {
        ...values
      };

      await ItineraryApi.addItinerary(newItinerary);
      console.log(newItinerary);
      navio.goBack();
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const getImage = async () => {
    const uri = await MediaApi.pickImage();
    if (uri) {
      setImageData(uri);
    }
  }

  const uploadImage = async () => {
    try {
      const url = await MediaApi.uploadImage(imageData!);
      console.log('Image uploaded successfully:', url);
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Upload Failed', 'Something went wrong while uploading the image.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text section style={styles.header}>Add Itinerary</Text>
        <Formik
        initialValues={{
          title: '',
          start_date: null,
          end_date: null,
          budget: '',
          location: '',
        }}
        validationSchema={ItinerarySchema}
        onSubmit={addItinerary}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <ScrollView contentContainerStyle={{ gap: 16, padding: 16, flexGrow: 1 }}>
            <FormField
              label="Itinerary Name"
              placeholder="e.g. Cebu Trip"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
            />

            <FormField
              label="Budget"
              placeholder="Enter Budget"
              value={values.budget}
              onChangeText={handleChange('budget')}
              onBlur={handleBlur('budget')}
            />

            <FormField
              label="Location"
              placeholder="Enter Location"
              value={values.location}
              onChangeText={handleChange('location')}
              onBlur={handleBlur('location')}
              trailingAccessory={<Icon name='map-outline' color={colors.primary} />}
            />

            <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
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
                placeholder="YYYY/MM/DD"
                placeholderTextColor={'grey'}
                value={values.start_date}
                onChange={(date: Date) => setFieldValue('start_date', date)}
                mode="date"
                minimumDate={new Date()}
                dateFormatter={dateToDateString}
              />
              </View>
              
              <View style={{ flex: 1 }}>
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
                placeholder="YYYY/MM/DD"
                placeholderTextColor={'grey'}
                value={values.end_date}
                onChange={(date: Date) => setFieldValue('end_date', date)}
                mode="date"
                minimumDate={new Date()}
                dateFormatter={dateToDateString}
              />
              </View>
              
            </View>

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

            <View style={{ marginTop: 16 }}>
              <Text
                onPress={getImage}
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  padding: 12,
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                Get Image
              </Text>
            </View>
            {imageData && (
              <View>
                <Image
                  source={{ uri: imageData.uri }}
                  style={{ width: 300, height: 200, marginTop: 20, borderRadius: 10 }}
                  resizeMode="cover"
                />
                <Text
                  onPress={uploadImage}
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                    padding: 12,
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  Upload
                </Text>
              </View>
              
              
            )}
          </ScrollView>
        )}
      </Formik>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  header: {
    padding: 16,
    letterSpacing: 1.25
  },
});

ItineraryForm.options = (props) => ({
  headerShown: false,
  title: `Add Itinerary`,
});
