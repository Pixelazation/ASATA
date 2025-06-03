import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import { Icon, IconName } from '../icon';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../../utils/designSystem';
import { RadioOption } from '../atoms/radio-option';

type OptionType = {
  name: string;
  label?: string;
  icon: IconName;
}

type Props = {
  label?: string;
  pressableSize?: number;
  selected: string | null;
  selectFunction: React.Dispatch<React.SetStateAction<string | null>>;
  options: OptionType[];
};

export const RadioSelection: React.FC<Props> = (props) => {
  const {label, selected, selectFunction, options, pressableSize} = props;

  return (
    <View style={{ gap: 8}}>
      {label && (
        <Text style={{fontWeight: 'bold', color: colors.primary}}>
          {label}
        </Text>
      )}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignContent: 'center' }}>
        {options.map(({name, label, icon}, index) => {
          return (
            <RadioOption
              key={index}
              label={label}
              icon={icon}
              selected={selected === name}
              size={pressableSize}
              onPress={() => selectFunction(selected == name ? null : name)}
            />
          )
        })}
      </View>
    </View>
  );
};
