import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import { Icon, IconName } from '../icon';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../../utils/designSystem';

type Props = {
  label?: string;
  icon: IconName;
  selected: boolean;
  onPress?: () => void;
};

export const RadioOption: React.FC<Props> = (props) => {
  const {label, icon, selected, onPress} = props;

  return (
    <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Pressable style={[styles.pressable, selected && styles.selected]} onPress={onPress}>
        <Icon name={icon} size={32} color={selected ? 'white' : colors.primary} />
      </Pressable>
      <Text style={[styles.label, selected && styles.selectedText]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: 60, 
    aspectRatio: 1, 
    backgroundColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    
  },
  selectedText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: colors.placeholder,
  }
})