import React from 'react';
import {View} from 'react-native-ui-lib';
import { useServices } from '../../services';
import { IconButton } from '../iconbutton';
import { StyleSheet } from 'react-native';

type Props = {
  
};

export const HeaderBack: React.FC<Props> = (props) => {
  const { t, navio } = useServices();
  const navigation = navio.useN();

  return (
    <View style={styles.headerButton}>
      <IconButton
        name='arrow-back'
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
