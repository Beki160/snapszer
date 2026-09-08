import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getDifficultyLabel } from '../settings/difficulty';
import { DifficultyLevel } from '../settings/types';

type Props = {
  level: DifficultyLevel;
  variant?: 'menu' | 'game';
};

const VARIANT_COLORS: Record<DifficultyLevel, string> = {
  easy: '#6B9E78',
  medium: '#D4A017',
  hard: '#C45C4A',
};

export function DifficultyBadge({ level, variant = 'menu' }: Props) {
  const accent = VARIANT_COLORS[level];
  const isGame = variant === 'game';

  return (
    <View
      style={[
        styles.badge,
        isGame ? styles.badgeGame : styles.badgeMenu,
        { borderColor: accent },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.label, isGame && styles.labelGame]}>
        {isGame ? getDifficultyLabel(level) : `Aktív: ${getDifficultyLabel(level)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  badgeMenu: {
    backgroundColor: 'rgba(26, 20, 8, 0.45)',
    marginBottom: 18,
  },
  badgeGame: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: '#F3E6C8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelGame: {
    fontSize: 12,
  },
});
