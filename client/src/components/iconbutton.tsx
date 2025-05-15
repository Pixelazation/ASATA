import React from "react";
import { Icon, IconName } from "./icon";
import { Colors } from "react-native-ui-lib";
import { Pressable } from 'react-native';

type IconButtonProps = {
  name: IconName;
  color?: string;
  size?: number;
  onPress?: () => void;
};

export const IconButton: React.FC<IconButtonProps> = ({ name, color = Colors.primary, size = 24, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
};
