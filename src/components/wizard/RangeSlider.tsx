import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Brand } from '@/constants/brand';
import type { StepField } from '@/lib/wizardSteps';
import { formatRangeEndpoint as formatEndpoint } from '@/lib/wizardHelpers';

const THUMB = 24;

function snap(raw: number, lo: number, hi: number, step: number): number {
  const stepped = Math.round((raw - lo) / step) * step + lo;
  return Math.max(lo, Math.min(hi, stepped));
}

// Pure React Native (PanResponder + core Views), no native slider package,
// so this keeps working in Expo Go. Mirrors the website's two-stacked-range-
// inputs trick: two independently draggable thumbs over one track, each
// clamped so it can't cross the other.
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
  const trackWidthRef = useRef(0);
  const dragStart = useRef(0);

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width - THUMB;
    trackWidthRef.current = w;
    setTrackWidth(w);
  }

  function valueAtX(x: number): number {
    const w = trackWidthRef.current || 1;
    const pct = Math.max(0, Math.min(1, x / w));
    return snap(lo + pct * (hi - lo), lo, hi, step);
  }

  function xForValue(v: number): number {
    return ((v - lo) / (hi - lo)) * trackWidth;
  }

  function startDrag(end: 'min' | 'max') {
    dragStart.current = xForValue(end === 'min' ? curMin : curMax);
  }

  function moveDrag(end: 'min' | 'max', dx: number) {
    const next = valueAtX(dragStart.current + dx);
    if (end === 'min') onChangeMin(Math.min(next, curMax));
    else onChangeMax(Math.max(next, curMin));
  }

  // Recreated every render (cheap: a plain object of callbacks) rather than
  // stashed once in a ref, so each handler always closes over the current
  // curMin/curMax/trackWidth instead of whatever they were on first render.
  //
  // react-hooks/refs flags this because startDrag/moveDrag touch a ref and
  // get handed to PanResponder.create during render — but PanResponder
  // (an RN API that predates hooks) only *stores* these callbacks here and
  // calls them later, from real gesture events, never during render itself.
  // eslint-disable-next-line react-hooks/refs
  const minResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => startDrag('min'),
    onPanResponderMove: (_e, gesture) => moveDrag('min', gesture.dx),
  });

  // eslint-disable-next-line react-hooks/refs
  const maxResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => startDrag('max'),
    onPanResponderMove: (_e, gesture) => moveDrag('max', gesture.dx),
  });

  const minX = xForValue(curMin);
  const maxX = xForValue(curMax);
  const minOnTop = minX > trackWidth / 2;

  return (
    <View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>{formatEndpoint(field, curMin, 'min')}</Text>
        <Text style={styles.labelText}>{formatEndpoint(field, curMax, 'max')}</Text>
      </View>
      <View style={styles.track} onLayout={onLayout}>
        <View style={styles.trackBg} />
        {trackWidth > 0 && (
          <>
            <View style={[styles.trackFill, { left: minX + THUMB / 2, width: Math.max(0, maxX - minX) }]} />
            <View
              {...minResponder.panHandlers}
              style={[styles.thumb, { left: minX, zIndex: minOnTop ? 1 : 2 }]}
            />
            <View
              {...maxResponder.panHandlers}
              style={[styles.thumb, { left: maxX, zIndex: minOnTop ? 2 : 1 }]}
            />
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
