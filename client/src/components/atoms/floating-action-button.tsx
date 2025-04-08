import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import { IconButton } from '../iconbutton';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/designSystem';
import { IconName } from '../icon';

type Props = {
  icon: IconName;
  onPress?: () => void;
};

export const FloatingActionButton: React.FC<Props> = ({icon, onPress}) => {
  return (
    <View style={styles.fabContainer}>
      <IconButton name={icon} color={colors.primary} onPress={onPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
});
