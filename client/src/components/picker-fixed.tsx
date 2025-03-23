import React from 'react';
import {View, Text, Picker} from 'react-native-ui-lib';
import { colors } from '../utils/designSystem';

type Props = {
  label: string;
  value: string;
  placeholder: string;
  items: string[];
  onValueChange: (itemValue: string) => void;
};

export const PickerFixed: React.FC<Props> = ({label, value, placeholder, items, onValueChange}) => {
  return (
    <Picker
      label={label}
      labelColor={colors.primary}
      labelStyle={{fontWeight: 'bold'}}
      value={value}
      placeholder={placeholder}
      onChange={onValueChange}
      fieldType={'dropdown'}
      style={{paddingHorizontal: 16, paddingVertical: 8}}
      fieldStyle={{backgroundColor: '#ECF2F0', borderRadius: 100}}
      useWheelPicker
    >
      {items.map((item, index) => (
        <Picker.Item key={index} value={item} label={item} />
      ))}
    </Picker>
  );
};
