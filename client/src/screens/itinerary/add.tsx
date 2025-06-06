import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet } from 'react-native';
import { DateTimePicker, Text, View, Button } from 'react-native-ui-lib';
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
import { BG_IMAGE_2 } from '../../assets';
import { ImagePicker } from '../../components/molecules/image-picker';
import { HeaderBack } from '../../components/molecules/header-back';
import { MapModal } from '../../components/molecules/map-modal';

export type Params = {
  type?: 'push' | 'show';
  itineraryId?: string;
  duplicateId?: string;
  onCreated?: (id: string) => void;
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
  longitude: Yup.number().optional(),
  latitude: Yup.number().optional(),
});

export const ItineraryForm: NavioScreen = observer(() => {
  useAppearance();
  const { t, navio } = useServices();
  const navigation = navio.useN();
  const { itineraryId, duplicateId, onCreated } = navio.useParams<Params>();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ItineraryType>();
  const [image, setImage] = useState<ImagePickerAsset | string | null>(null);
  const [mapVisible, setMapVisible] = useState<boolean>(false);

  useEffect(() => {
    if (itineraryId) {
      fetchDetails();
    } else if (duplicateId) {
      fetchDuplicate();
    }
    navigation.setOptions({});
  }, []);

  const fetchDuplicate = async () => {
    try {
      const data = await ItineraryApi.getItineraryDetails(duplicateId!);
      // Remove id and adjust title for duplication
      setDetails({
        ...data,
        title: data.title + " (Copy)",
        // Optionally reset dates or other fields as needed
      });
      setImage(data.image_url);
    } catch (error) {
      console.error("Error fetching itinerary for duplication:", error);
    }
  };

  const addItinerary = async (values: any) => {
    setLoading(true);
    try {
      const newItinerary = {
        image_url: await uploadImage(),
        ...values
      };

      type AddItineraryResponse = { id: string }[];
      const apiResult = await ItineraryApi.addItinerary(newItinerary) as unknown as AddItineraryResponse;
      const newId = apiResult?.[0]?.id;

      if (onCreated && newId) {
        onCreated(newId);
        return;
      }
      navio.goBack();
    } catch (error) {
      console.error("Error adding itinerary:", error);
      setLoading(false);
    }
  };

  const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await ItineraryApi.getItineraryDetails(itineraryId!);
        console.log("Fetched itinerary:", data); // Debugging log
        setDetails(data);
        setImage(data.image_url);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

  const updateItinerary = async (values: any) => {
    setLoading(true); // Disable button immediately
    try {
      const newItineraryDetails = {
        image_url: typeof(image) != 'string' ? await uploadImage() : image,
        ...values
      };

      await ItineraryApi.updateItinerary(itineraryId!, newItineraryDetails);
      console.log(newItineraryDetails);
      navio.goBack();
    } catch (error) {
      console.error("Error updating itinerary:", error);
      setLoading(false); // Only re-enable if there's an error
    }
  };

  const uploadImage = async (): Promise<string|null> => {
    if (!image) return null;
    // If image is already a URL (string), just return it
    if (typeof image === 'string') return image;
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

  return loading ? (
    <View style={{ flex: 1, flexGrow: 1, gap: 16, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={120} color={colors.primary} />
      <Text style={{ textAlign: 'center' }}>Fetching details</Text>
    </View>
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={image ? {uri: typeof(image) == 'string' ? image: image.uri} : BG_IMAGE_2} resizeMode='cover' style={{minHeight: 100, padding: 20, marginBottom: -20}}>
        <HeaderBack />
      </ImageBackground>
      <View bg-white style={{ paddingHorizontal: 32, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Formik
          enableReinitialize
          initialValues={details ? {
            title: details.title,
            start_date: new Date(details.start_date),
            end_date: new Date(details.end_date),
            budget: details.budget.toString(),
            location: details.location,
            longitude: details.longitude ?? undefined,
            latitude: details.latitude ?? undefined,
          } : {
            title: '',
            start_date: null,
            end_date: null,
            budget: '',
            location: '',
            longitude: undefined,
            latitude: undefined,
          }}
          validationSchema={ItinerarySchema}
          onSubmit={itineraryId ? updateItinerary : addItinerary}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <ScrollView contentContainerStyle={{ gap: 8, marginTop: 8, flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              <Text section style={styles.header}>{itineraryId ? "Edit" : "Add"} Itinerary</Text>
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
                keyboardType="numeric" // Only numeric input allowed
              />

              {errors.budget && touched.budget && (
                <Text style={{ color: '#b22222', fontSize: 12, marginTop: -8, marginBottom: 4 }}>
                  Please enter a valid budget amount.
                </Text>
              )}

              <FormField
                label="Location"
                placeholder="Enter Location"
                value={values.location}
                onChangeText={handleChange('location')}
                onBlur={handleBlur('location')}
                trailingAccessory={
                  <Pressable onPress={() => setMapVisible(true)}>
                    <Icon name='map-outline' color={colors.primary}/>
                  </Pressable>
                }
              />

              <MapModal
                visible={mapVisible}
                closeModal={() => setMapVisible(false)}
                initLoc={{loc: values['location'], long: values['longitude'] || null, lat: values['latitude'] || null}}
                setLocation={(loc, long, lat) => {
                  setFieldValue('location', loc);
                  setFieldValue('longitude', long);
                  setFieldValue('latitude', lat);
                }}
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

              <ImagePicker image={image} setImage={setImage}/>

              <View style={{ marginTop: 16 }}>
                <Button
                  label={
                    loading
                      ? (itineraryId ? "Updating..." : "Creating...") + " Itinerary"
                      : (itineraryId ? "Update" : "Create") + " Itinerary"
                  }
                  onPress={loading ? undefined : handleSubmit as any}
                  backgroundColor={loading ? '#d3d3d3' : colors.primary}
                  color={loading ? '#888' : 'white'}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    opacity: loading ? 0.7 : 1,
                    marginTop: 0,
                  }}
                  disabled={loading}
                />
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

ItineraryForm.options = (props) => ({
  headerShown: false,
  title: `Add Itinerary`,
});
