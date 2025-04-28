import React from 'react';
import { ScrollView } from 'react-native';
import { DateTimePicker, Text, View } from 'react-native-ui-lib';
import { observer } from 'mobx-react';
import { NavioScreen } from 'rn-navio';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { services, useServices } from '@app/services';
import { useAppearance } from '@app/utils/hooks';
import { NavioSection } from '@app/components/sections/NavioSection';
import { FormField } from '../components/form-field';
import { colors } from '../utils/designSystem';
import { ItineraryApi } from '../services/api/itineraries';

export type Params = {
  type?: 'push' | 'show';
  itineraryId: string;
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

  const { itineraryId } = params;

  React.useEffect(() => {
    navigation.setOptions({});
  }, []);

  const addActivity = async (values: any) => {
    try {
      const newActivity = {
        cost: 500,
        ...values
      };

      await ItineraryApi.addActivity(itineraryId, newActivity);
      console.log(newActivity);
      navio.goBack();
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  return (
    <Formik
      initialValues={{
        name: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(),
        category: '',
        location: '',
      }}
      validationSchema={ActivitySchema}
      onSubmit={addActivity}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
          <FormField
            label="Name"
            placeholder="Name"
            value={values.name}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            // error={touched.name && errors.name ? errors.name : undefined}
          />

          <FormField
            label="Description"
            placeholder="Description"
            value={values.description}
            onChangeText={handleChange('description')}
            onBlur={handleBlur('description')}
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

          <FormField
            label="Category"
            placeholder="Category"
            value={values.category}
            onChangeText={handleChange('category')}
            onBlur={handleBlur('category')}
          />

          <FormField
            label="Location"
            placeholder="Location"
            value={values.location}
            onChangeText={handleChange('location')}
            onBlur={handleBlur('location')}
          />

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
  );
});

ActivityForm.options = (props) => ({
  headerShown: true,
  title: `Add Activity`,
});
