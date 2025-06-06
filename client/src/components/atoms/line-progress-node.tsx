import React from 'react';
import { StyleSheet } from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import { colors } from '../../utils/designSystem';

type Props = {
  finished?: boolean;
};

export const LineProgressNode: React.FC<Props> = ({finished}) => {
  return (
    <View style={styles.container}>
      <View style={finished ? [styles.outer, styles.finished] : styles.outer}>
        <View style={styles.inner}>
        </View>
      </View>
      <View style={finished ? [styles.line, styles.finished] : styles.line}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outer: {
    backgroundColor: '#D7EAE2',
    borderRadius: 100,
    height: 16,
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    backgroundColor: '#ECF2F0',
    borderRadius: 100,
    height: 10,
    width: 10
  },
  line: {
    backgroundColor: '#D7EAE2',
    width: 6,
    flex: 1,
    alignSelf: 'center',
    marginVertical: -2,
    zIndex: -1,
  },
  finished: {
    backgroundColor: colors.accent,
  }
})