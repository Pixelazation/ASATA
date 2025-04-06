import React from 'react';
import {View, Text, TextField, Colors} from 'react-native-ui-lib';
import { colors } from '../utils/designSystem';
import { InputModeOptions, KeyboardTypeOptions } from 'react-native';
import { Validator } from 'react-native-ui-lib/src/incubator/TextField/types';

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
  return (
    <View>
      <TextField
        accent
        style={{paddingHorizontal: 16, paddingVertical: 4}}
        fieldStyle={{backgroundColor: '#ECF2F0', borderRadius: 100, paddingVertical: 4, marginTop: 4}}
        labelColor={colors.primary}
        labelStyle={{fontWeight: 'bold'}}
        placeholderTextColor={'grey'}
        {...props}
      />
    </View>
  );
};
