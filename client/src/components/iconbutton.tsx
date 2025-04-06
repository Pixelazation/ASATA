import React from "react";
import { Bounceable } from "rn-bounceable";
import { Icon, IconName } from "./icon";
import { Colors } from "react-native-ui-lib";

type IconButtonProps = {
  name: IconName;
  color?: string;
  onPress?: () => void;
};

export const IconButton: React.FC<IconButtonProps> = ({ name, color = Colors.primary, onPress }) => {
  return (
    <Bounceable onPress={onPress}>
      <Icon name={name} size={24} color={color} />
    </Bounceable>
  );
};
