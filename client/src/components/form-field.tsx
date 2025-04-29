import React from 'react';
import {View, TextField} from 'react-native-ui-lib';
import { colors } from '../utils/designSystem';
import { InputModeOptions, KeyboardTypeOptions } from 'react-native';

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e: any) => void;
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
        fieldStyle={{backgroundColor: '#ECF2F0', borderRadius: 100, paddingVertical: 4, paddingRight: 16, marginTop: 4}}
        labelColor={colors.primary}
        labelStyle={{fontWeight: 'bold'}}
        placeholderTextColor={'grey'}
        {...props}
      />
    </View>
  );
};
