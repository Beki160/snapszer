import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Props = {
  onNewGame: () => void;
  onNewMatch: () => void;
};

export function HomeScreen({ onNewGame, onNewMatch }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.atmosphere} />
      <Text style={styles.brand}>Snapszer</Text>
      <Text style={styles.subtitle}>Klasszikus magyar kártyajáték</Text>

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

      <Text style={styles.hint}>
        Parti: elsőként 7 pontig — 1/2/3 pont játszmánként
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F2A22',
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
    backgroundColor: '#16382D',
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
    marginBottom: 40,
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
  hint: {
    marginTop: 28,
    color: '#C9B896',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
