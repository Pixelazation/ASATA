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
};

export const FormField: React.FC<Props> = ({label, placeholder, value, onChangeText, keyboardType, inputMode, secureTextEntry}) => {
  return (
    <View paddingH-s3 paddingV-s2>
      <TextField
        accent
        fieldStyle={{backgroundColor: 'white', borderWidth: 2, borderColor: 'grey', borderRadius: 6, padding: 4}}
        label={label}
        labelColor={colors.accent}
        labelStyle={{fontWeight: 'bold'}}
        placeholder={placeholder}
        placeholderTextColor={'grey'}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        inputMode={inputMode}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};
