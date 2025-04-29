import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../../utils/designSystem';
import { IconButton } from '../iconbutton';
import { IconName } from '../icon';
import { Text } from 'react-native-ui-lib';

type Props = {
  icon: IconName;
  onPress1?: () => void;
  onPress2?: () => void;
};

export const FloatingActionMenu: React.FC<Props> = ({icon, onPress1, onPress2}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const rotation = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const buttonScale = useSharedValue(0);
  const buttonTranslateY = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { translateY: buttonTranslateY.value }
    ],
    opacity: buttonScale.value,
  }));
 
  const handlePress = () => {
    if (expanded) {
      rotation.value = withTiming(0, { duration: 300 });
      buttonScale.value = withTiming(0, { duration: 300 });
      buttonTranslateY.value = withTiming(0, { duration: 300 });
    } else {
      rotation.value = withTiming(-135, { duration: 300 });
      buttonScale.value = withTiming(1, { duration: 300 });
      buttonTranslateY.value = withTiming(-70, { duration: 300 }); // Slide upwards by 70px
    }
    setExpanded(!expanded);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.expandedContainer}>
          <Animated.View style={[styles.extraButton, buttonStyle]}>
            <IconButton name="bulb-outline" color={colors.primary} onPress={onPress1} />
          </Animated.View>
          <Animated.View style={[styles.extraButton, buttonStyle]}>
            <IconButton name="pencil" color={colors.primary} onPress={onPress2} />
          </Animated.View>
        </View>

      <Animated.View style={[styles.fabContainer, animatedStyle]}>
        <IconButton name={icon} color={colors.primary} onPress={handlePress} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  expandedContainer: {
    position: 'absolute',
    bottom: 15,
    right: 25,
    alignItems: 'center',
    gap: 10,
  },
  extraButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
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
