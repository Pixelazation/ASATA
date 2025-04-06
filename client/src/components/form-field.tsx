import React from 'react';
import {View, Text, TextField} from 'react-native-ui-lib';
import { colors } from '../utils/designSystem';
import { InputModeOptions, KeyboardTypeOptions } from 'react-native';

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  inputMode?: InputModeOptions;
  secureTextEntry?: boolean;
  leadingAccessory?: React.ReactElement;
  trailingAccessory?: React.ReactElement;
};

export const FormField: React.FC<Props> = (props) => {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    inputMode,
    secureTextEntry,
    leadingAccessory,
    trailingAccessory
  } = props;

  return (
    <View>
      <TextField
        accent
        style={{paddingHorizontal: 16, paddingVertical: 8}}
        fieldStyle={{backgroundColor: '#ECF2F0', borderRadius: 100, paddingVertical: 8, marginTop: 8}}
        label={label}
        labelColor={colors.primary}
        labelStyle={{fontWeight: 'bold'}}
        placeholder={placeholder}
        placeholderTextColor={'grey'}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        inputMode={inputMode}
        secureTextEntry={secureTextEntry}
        leadingAccessory={leadingAccessory}
        trailingAccessory={trailingAccessory}
      />
    </View>
  );
};
