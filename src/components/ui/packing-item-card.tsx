import { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { PackingItem } from '@/src/types';

interface PackingItemCardProps {
  item: PackingItem;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

const SHATTER_DURATION_MS = 280;
type ProgressValue = ReturnType<typeof useSharedValue<number>>;

export function PackingItemCard({
  item,
  onToggle,
  onDelete,
}: PackingItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 54 });

  const crushProgress = useSharedValue(0);
  const shatterProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handleDeletePress = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    crushProgress.value = withSequence(
      withTiming(1, {
        duration: 42,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: 34,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0.72, {
        duration: 36,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0, {
        duration: 28,
        easing: Easing.inOut(Easing.quad),
      })
    );
    contentOpacity.value = withTiming(0, {
      duration: 78,
      easing: Easing.out(Easing.quad),
    });
    shatterProgress.value = withTiming(
      1,
      {
        duration: SHATTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onDelete)(item.id);
        }
      }
    );
  };

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 - crushProgress.value * 0.028 },
      {
        rotateZ: `${(
          crushProgress.value * 2.9 - shatterProgress.value * 1.35
        ).toFixed(2)}deg`,
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Animated.View style={[styles.itemRow, rowAnimatedStyle]} onLayout={handleLayout}>
      <Animated.View
        style={[styles.contentLayer, styles.cardSurface, contentAnimatedStyle]}
      >
        <PackingItemCardContent
          item={item}
          isInteractionDisabled={isDeleting}
          onToggle={onToggle}
          onDelete={handleDeletePress}
        />
      </Animated.View>

      {isDeleting ? (
        <ShatterOverlay
          item={item}
          width={layout.width}
          height={layout.height}
          progress={shatterProgress}
        />
      ) : null}
    </Animated.View>
  );
}

interface PackingItemCardContentProps {
  item: PackingItem;
  isInteractionDisabled: boolean;
  onToggle: (itemId: string) => void;
  onDelete: () => void;
}

function PackingItemCardContent({
  item,
  isInteractionDisabled,
  onToggle,
  onDelete,
}: PackingItemCardContentProps) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.itemMain,
          pressed && !isInteractionDisabled && styles.itemMainPressed,
        ]}
        onPress={() => {
          if (!isInteractionDisabled) {
            onToggle(item.id);
          }
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isPacked, disabled: isInteractionDisabled }}
        disabled={isInteractionDisabled}
      >
        <View style={[styles.checkbox, item.isPacked && styles.checkboxChecked]}>
          {item.isPacked ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={[styles.itemText, item.isPacked && styles.itemTextPacked]}>
          {item.name}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && !isInteractionDisabled && styles.deleteButtonPressed,
        ]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.name}`}
        disabled={isInteractionDisabled}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </>
  );
}

interface ShatterOverlayProps {
  item: PackingItem;
  width: number;
  height: number;
  progress: ProgressValue;
}

function ShatterOverlay({
  item,
  width,
  height,
  progress,
}: ShatterOverlayProps) {
  if (width === 0 || height === 0) {
    return null;
  }

  const shards = createShards(width, height);
  const particles = createParticles(width, height);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {shards.map((shard, index) => (
        <ShatterPiece
          key={`${item.id}-${index}`}
          item={item}
          width={width}
          height={height}
          progress={progress}
          shard={shard}
        />
      ))}
      {particles.map((particle, index) => (
        <ShatterParticle
          key={`${item.id}-particle-${index}`}
          progress={progress}
          particle={particle}
        />
      ))}
    </View>
  );
}

interface ShardDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  translateX: number;
  translateY: number;
  rotate: number;
  scale: number;
  radius?: number;
}

function createShards(width: number, height: number): ShardDefinition[] {
  return [
    {
      x: 0,
      y: 0,
      width: width * 0.29,
      height: height * 0.42,
      translateX: -36,
      translateY: -24,
      rotate: -14,
      scale: 0.9,
      radius: 10,
    },
    {
      x: width * 0.28,
      y: 0,
      width: width * 0.18,
      height: height * 0.48,
      translateX: -14,
      translateY: -12,
      rotate: -6,
      scale: 0.94,
      radius: 8,
    },
    {
      x: width * 0.44,
      y: 0,
      width: width * 0.16,
      height: height * 0.4,
      translateX: 8,
      translateY: -28,
      rotate: 9,
      scale: 0.9,
      radius: 8,
    },
    {
      x: width * 0.58,
      y: 0,
      width: width * 0.17,
      height: height * 0.55,
      translateX: 34,
      translateY: -10,
      rotate: 16,
      scale: 0.87,
      radius: 9,
    },
    {
      x: width * 0.74,
      y: 0,
      width: width * 0.26,
      height: height * 0.46,
      translateX: 54,
      translateY: -6,
      rotate: 24,
      scale: 0.84,
      radius: 10,
    },
    {
      x: 0,
      y: height * 0.42,
      width: width * 0.25,
      height: height * 0.58,
      translateX: -24,
      translateY: 22,
      rotate: -18,
      scale: 0.86,
      radius: 10,
    },
    {
      x: width * 0.23,
      y: height * 0.5,
      width: width * 0.19,
      height: height * 0.5,
      translateX: -10,
      translateY: 28,
      rotate: -7,
      scale: 0.9,
      radius: 8,
    },
    {
      x: width * 0.4,
      y: height * 0.38,
      width: width * 0.18,
      height: height * 0.62,
      translateX: 10,
      translateY: 34,
      rotate: 10,
      scale: 0.83,
      radius: 9,
    },
    {
      x: width * 0.56,
      y: height * 0.54,
      width: width * 0.17,
      height: height * 0.46,
      translateX: 24,
      translateY: 22,
      rotate: 18,
      scale: 0.84,
      radius: 8,
    },
    {
      x: width * 0.72,
      y: height * 0.44,
      width: width * 0.28,
      height: height * 0.56,
      translateX: 42,
      translateY: 26,
      rotate: 27,
      scale: 0.8,
      radius: 10,
    },
  ];
}

interface ParticleDefinition {
  x: number;
  y: number;
  size: number;
  translateX: number;
  translateY: number;
  scale: number;
}

function createParticles(width: number, height: number): ParticleDefinition[] {
  return [
    { x: width * 0.66, y: height * 0.25, size: 5, translateX: 42, translateY: -26, scale: 0.7 },
    { x: width * 0.72, y: height * 0.34, size: 4, translateX: 54, translateY: -8, scale: 0.5 },
    { x: width * 0.61, y: height * 0.47, size: 6, translateX: 36, translateY: 6, scale: 0.65 },
    { x: width * 0.77, y: height * 0.54, size: 5, translateX: 60, translateY: 10, scale: 0.6 },
    { x: width * 0.81, y: height * 0.4, size: 3, translateX: 68, translateY: -2, scale: 0.4 },
    { x: width * 0.53, y: height * 0.16, size: 4, translateX: 16, translateY: -34, scale: 0.5 },
    { x: width * 0.48, y: height * 0.68, size: 4, translateX: 12, translateY: 30, scale: 0.45 },
  ];
}

interface ShatterPieceProps {
  item: PackingItem;
  width: number;
  height: number;
  progress: ProgressValue;
  shard: ShardDefinition;
}

function ShatterPiece({
  item,
  width,
  height,
  progress,
  shard,
}: ShatterPieceProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: shard.translateX * progress.value },
      { translateY: shard.translateY * progress.value },
      { rotateZ: `${(shard.rotate * progress.value).toFixed(2)}deg` },
      { scale: 1 - (1 - shard.scale) * progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.shard,
        {
          left: shard.x,
          top: shard.y,
          width: shard.width,
          height: shard.height,
          borderRadius: shard.radius ?? 12,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.shardInner,
          styles.cardSurface,
          {
            width,
            height,
            transform: [{ translateX: -shard.x }, { translateY: -shard.y }],
          },
        ]}
      >
        <PackingItemCardContent
          item={item}
          isInteractionDisabled={true}
          onToggle={() => { }}
          onDelete={() => { }}
        />
      </View>
    </Animated.View>
  );
}

interface ShatterParticleProps {
  progress: ProgressValue;
  particle: ParticleDefinition;
}

function ShatterParticle({
  progress,
  particle,
}: ShatterParticleProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * 0.95,
    transform: [
      { translateX: particle.translateX * progress.value },
      { translateY: particle.translateY * progress.value },
      { scale: 1 - (1 - particle.scale) * progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  itemRow: {
    minHeight: 54,
    position: 'relative',
  },
  cardSurface: {
    borderWidth: 1.2,
    borderColor: '#cfcac2',
    borderRadius: 18,
    backgroundColor: '#fbfaf7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 12,
    shadowColor: '#beb8af',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  contentLayer: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  shard: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 12,
  },
  shardInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 12,
    shadowColor: '#d7d0c8',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#e7e0d7',
    shadowColor: '#d6cfc6',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  itemMain: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  itemMainPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#bdb9b2',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffdfa',
  },
  checkboxChecked: {
    backgroundColor: '#76787d',
    borderColor: '#76787d',
  },
  checkboxMark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#52555a',
  },
  itemTextPacked: {
    color: '#97938d',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  deleteButtonPressed: {
    backgroundColor: '#ece8e1',
    transform: [{ scale: 0.92 }],
  },
  deleteText: {
    fontSize: 21,
    lineHeight: 21,
    fontWeight: '400',
    color: '#767980',
  },
});
