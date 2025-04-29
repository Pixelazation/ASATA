import React from 'react';
import { StyleSheet } from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import { colors } from '../../utils/designSystem';

type Props = {
  title?: string;
};

export const LineProgressHead: React.FC<Props> = ({title}) => {
  return (
    <View style={styles.container}>
      <View style={styles.outer}>
        <View style={styles.inner}>
        </View>
      </View>
      <View style={styles.line}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outer: {
    backgroundColor: colors.accent,
    borderRadius: 100,
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    backgroundColor: '#D7EAE2',
    borderRadius: 100,
    height: 10,
    width: 10
  },
  line: {
    backgroundColor: colors.accent,
    width: 6,
    flex: 1,
    alignSelf: 'center',
    marginVertical: -2,
    zIndex: -1,
  }
})