import { Animated, type ViewProps } from "react-native";

import { useEntranceSpring } from "../../hooks/useEntranceAnimation";

type FadeInViewProps = ViewProps & {
  delay?: number;
};

export function FadeInView({ delay = 0, style, ...props }: FadeInViewProps) {
  const progress = useEntranceSpring(delay);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1],
              }),
            },
          ],
        },
      ]}
      {...props}
    />
  );
}
