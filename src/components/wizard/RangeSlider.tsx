import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Brand } from '@/constants/brand';
import type { StepField } from '@/lib/wizardSteps';
import { formatRangeEndpoint as formatEndpoint } from '@/lib/wizardHelpers';

/* eslint-disable react-hooks/refs, react-hooks/immutability --
   These two rules assume plain React state and refs. This file uses
   react-native-reanimated shared values and react-native-gesture-handler
   worklets instead: mutating a SharedValue's `.value` from a gesture
   callback (which runs on the UI thread, not during render) is the
   documented, correct way to use both libraries, not the render-time ref
   misuse these rules are meant to catch. */

const THUMB = 24;

// Pure math, no React Native involved, so this is safe to call from plain
// JS (for the text labels) and to inline directly inside a worklet (for the
// gesture handlers) without needing its own 'worklet' directive.
function snap(raw: number, lo: number, hi: number, step: number): number {
  const stepped = Math.round((raw - lo) / step) * step + lo;
  return Math.max(lo, Math.min(hi, stepped));
}

// Driven entirely by react-native-reanimated + react-native-gesture-handler
// (both already in the project, both included in Expo Go): the thumbs and
// the fill bar are animated on the UI thread via shared values, so they
// track a finger in real time regardless of what the JS thread is doing —
// an earlier PanResponder + setState version visibly stuttered because
// every pixel of drag re-rendered React state. Also reports the live value
// to the parent on every update (not just on release), since decoupling the
// animation from React state means that no longer costs smoothness.
export function RangeSlider({
  field,
  curMin,
  curMax,
  onChangeMin,
  onChangeMax,
}: {
  field: StepField;
  curMin: number;
  curMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const lo = field.min ?? 0;
  const hi = field.max ?? 60;
  const step = field.step ?? 5;

  const [trackWidth, setTrackWidth] = useState(0);
  const [minVal, setMinVal] = useState(curMin);
  const [maxVal, setMaxVal] = useState(curMax);
  const draggingMin = useRef(false);
  const draggingMax = useRef(false);
  const lastMinReported = useRef(curMin);
  const lastMaxReported = useRef(curMax);

  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const minStartX = useSharedValue(0);
  const maxStartX = useSharedValue(0);

  function xForValue(v: number, width: number): number {
    return ((v - lo) / (hi - lo)) * width;
  }

  // Keep the shared (native-thread) positions in sync with the parent's
  // value and with layout, but never fight a gesture that's in progress.
  useEffect(() => {
    if (trackWidth <= 0) return;
    if (!draggingMin.current) minX.value = xForValue(curMin, trackWidth);
    if (!draggingMax.current) maxX.value = xForValue(curMax, trackWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackWidth, curMin, curMax]);

  function onLayout(e: LayoutChangeEvent) {
    setTrackWidth(e.nativeEvent.layout.width - THUMB);
  }

  const reportMin = useCallback(
    (v: number) => {
      setMinVal(v);
      if (v !== lastMinReported.current) {
        lastMinReported.current = v;
        onChangeMin(v);
      }
    },
    [onChangeMin]
  );
  const reportMax = useCallback(
    (v: number) => {
      setMaxVal(v);
      if (v !== lastMaxReported.current) {
        lastMaxReported.current = v;
        onChangeMax(v);
      }
    },
    [onChangeMax]
  );

  function beginDragMin() {
    draggingMin.current = true;
  }
  function endDragMin() {
    draggingMin.current = false;
  }
  function beginDragMax() {
    draggingMax.current = true;
  }
  function endDragMax() {
    draggingMax.current = false;
  }

  // Gestures are rebuilt every render (cheap) rather than memoized, so they
  // always close over the current trackWidth/maxX instead of stale ones —
  // same reasoning as PanResponder being recreated every render before.
  const minGesture = Gesture.Pan()
    .onStart(() => {
      minStartX.value = minX.value;
      runOnJS(beginDragMin)();
    })
    .onUpdate((e) => {
      const next = Math.min(Math.max(minStartX.value + e.translationX, 0), maxX.value);
      minX.value = next;
      const pct = trackWidth > 0 ? next / trackWidth : 0;
      const stepped = snap(lo + pct * (hi - lo), lo, hi, step);
      runOnJS(reportMin)(stepped);
    })
    .onEnd(() => {
      runOnJS(endDragMin)();
    });

  const maxGesture = Gesture.Pan()
    .onStart(() => {
      maxStartX.value = maxX.value;
      runOnJS(beginDragMax)();
    })
    .onUpdate((e) => {
      const next = Math.max(Math.min(maxStartX.value + e.translationX, trackWidth), minX.value);
      maxX.value = next;
      const pct = trackWidth > 0 ? next / trackWidth : 0;
      const stepped = snap(lo + pct * (hi - lo), lo, hi, step);
      runOnJS(reportMax)(stepped);
    })
    .onEnd(() => {
      runOnJS(endDragMax)();
    });

  const minThumbStyle = useAnimatedStyle(() => ({
    left: minX.value,
    zIndex: minX.value > maxX.value / 2 ? 1 : 2,
  }));
  const maxThumbStyle = useAnimatedStyle(() => ({
    left: maxX.value,
    zIndex: minX.value > maxX.value / 2 ? 2 : 1,
  }));
  const fillStyle = useAnimatedStyle(() => ({
    left: minX.value + THUMB / 2,
    width: Math.max(0, maxX.value - minX.value),
  }));

  return (
    <View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>{formatEndpoint(field, minVal, 'min')}</Text>
        <Text style={styles.labelText}>{formatEndpoint(field, maxVal, 'max')}</Text>
      </View>
      <View style={styles.track} onLayout={onLayout}>
        <View style={styles.trackBg} />
        {trackWidth > 0 && (
          <>
            <Animated.View style={[styles.trackFill, fillStyle]} />
            <GestureDetector gesture={minGesture}>
              <Animated.View hitSlop={12} style={[styles.thumb, minThumbStyle]} />
            </GestureDetector>
            <GestureDetector gesture={maxGesture}>
              <Animated.View hitSlop={12} style={[styles.thumb, maxThumbStyle]} />
            </GestureDetector>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  labelText: { fontSize: 14, fontWeight: '700', color: Brand.text },
  track: { height: THUMB, justifyContent: 'center' },
  trackBg: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.border,
  },
  trackFill: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.primary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: Brand.primary,
    borderWidth: 2,
    borderColor: Brand.background,
  },
});
