import React from 'react';
import {View, Text, Image, Assets} from 'react-native-ui-lib';

type Props = {
  title?: string;
};

export const SplashBanner: React.FC<Props> = (props) => {
  Assets.loadAssetsGroup('images', {
    logo: require('../assets/splash1.png')
  });

  return (
    <View>
      <Image assetName='logo' assetGroup='images' />
    </View>
  );
};
