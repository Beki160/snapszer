import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { DIFFICULTY_OPTIONS } from '../settings/difficulty';
import { useSettings } from '../settings/SettingsContext';
import { DifficultyLevel } from '../settings/types';

type Props = {
  onNewGame: () => void;
  onNewMatch: () => void;
  onSettings: () => void;
};

export function HomeScreen({ onNewGame, onNewMatch, onSettings }: Props) {
  const { background, difficulty, setDifficulty } = useSettings();

  const renderDifficultyOption = (level: DifficultyLevel, label: string) => {
    const selected = difficulty === level;
    return (
      <Pressable
        key={level}
        accessibilityRole="button"
        accessibilityLabel={`${label} nehézség`}
        accessibilityState={{ selected }}
        style={({ pressed }) => [
          styles.difficultyOption,
          selected && styles.difficultyOptionSelected,
          pressed && styles.ctaPressed,
        ]}
        onPress={() => setDifficulty(level)}
      >
        <Text
          style={[
            styles.difficultyOptionText,
            selected && styles.difficultyOptionTextSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: background.menuRoot }]}>
      <StatusBar style="light" />
      <View style={[styles.atmosphere, { backgroundColor: background.menuAtmosphere }]} />
      <Text style={styles.brand}>Snapszer</Text>
      <Text style={styles.subtitle}>Klasszikus magyar kártyajáték</Text>

      <View style={styles.difficultySection}>
        <Text style={styles.difficultyLabel}>Nehézség</Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTY_OPTIONS.map((option) =>
            renderDifficultyOption(option.id, option.label),
          )}
        </View>
        <Text style={styles.difficultyHint}>
          {DIFFICULTY_OPTIONS.find((o) => o.id === difficulty)?.description}
        </Text>
        <DifficultyBadge level={difficulty} variant="menu" />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Új játék"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={onNewGame}
      >
        <Text style={styles.ctaText}>Új játék</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Új parti"
        style={({ pressed }) => [styles.ctaSecondary, pressed && styles.ctaPressed]}
        onPress={onNewMatch}
      >
        <Text style={styles.ctaSecondaryText}>Új parti</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Beállítások"
        style={({ pressed }) => [styles.settingsButton, pressed && styles.ctaPressed]}
        onPress={onSettings}
      >
        <Text style={styles.settingsText}>Beállítások</Text>
      </Pressable>

      <Text style={styles.hint}>
        Parti: elsőként 7 pontig — 1/2/3 pont játszmánként
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  atmosphere: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  brand: {
    fontFamily: 'serif',
    fontSize: 52,
    color: '#F3E6C8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#C9B896',
    marginBottom: 28,
  },
  difficultySection: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
    alignItems: 'center',
  },
  difficultyLabel: {
    color: '#F3E6C8',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B5A3E',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 20, 8, 0.35)',
  },
  difficultyOptionSelected: {
    borderColor: '#D4A017',
    backgroundColor: 'rgba(212, 160, 23, 0.18)',
  },
  difficultyOptionText: {
    color: '#C9B896',
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyOptionTextSelected: {
    color: '#F3E6C8',
  },
  difficultyHint: {
    marginTop: 8,
    color: '#A89472',
    fontSize: 12,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: '#D4A017',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A017',
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: '#1A1408',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaSecondaryText: {
    color: '#F3E6C8',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  settingsText: {
    color: '#C9B896',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  hint: {
    marginTop: 12,
    color: '#C9B896',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
