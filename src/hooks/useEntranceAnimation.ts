import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native";

function startUnlessReducedMotion(
  value: Animated.Value,
  createAnimation: () => Animated.CompositeAnimation,
) {
  let animation: Animated.CompositeAnimation | undefined;
  let cancelled = false;

  AccessibilityInfo.isReduceMotionEnabled()
    .then((reduced) => {
      if (cancelled) {
        return;
      }
      if (reduced) {
        value.setValue(1);
        return;
      }
      animation = createAnimation();
      animation.start();
    })
    .catch(() => value.setValue(1));

  return () => {
    cancelled = true;
    animation?.stop();
  };
}

export function useEntranceSpring(delay = 0) {
  const [value] = useState(() => new Animated.Value(0));

  useEffect(
    () =>
      startUnlessReducedMotion(value, () =>
        Animated.spring(value, {
          toValue: 1,
          delay,
          stiffness: 140,
          damping: 16,
          mass: 1,
          useNativeDriver: Platform.OS !== "web",
        }),
      ),
    [delay, value],
  );

  return value;
}

export function useEntranceProgress(delay = 0, duration = 1100) {
  const [value] = useState(() => new Animated.Value(0));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listener = value.addListener((state) => setProgress(state.value));
    const stop = startUnlessReducedMotion(value, () =>
      Animated.timing(value, {
        toValue: 1,
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    return () => {
      stop();
      value.removeListener(listener);
    };
  }, [delay, duration, value]);

  return progress;
}
