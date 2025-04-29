import React from "react";
import { Bounceable } from "rn-bounceable";
import { Icon, IconName } from "./icon";
import { Colors } from "react-native-ui-lib";

type IconButtonProps = {
  name: IconName;
  color?: string;
  size?: number;
  onPress?: () => void;
};

export const IconButton: React.FC<IconButtonProps> = ({ name, color = Colors.primary, size = 24, onPress }) => {
  return (
    <Bounceable onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </Bounceable>
  );
};
