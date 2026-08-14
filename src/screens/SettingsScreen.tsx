import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '../settings/SettingsContext';

type Props = {
  onBack: () => void;
  onCardBackPress: () => void;
  onBackgroundColorPress: () => void;
};

export function SettingsScreen({ onBack, onCardBackPress, onBackgroundColorPress }: Props) {
  const { background } = useSettings();

  return (
    <View style={[styles.root, { backgroundColor: background.menuRoot }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { borderBottomColor: background.surfaceBorder }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vissza"
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: background.surface },
          ]}
          onPress={onBack}
        >
          <Text style={styles.backText}>← Vissza</Text>
        </Pressable>
        <Text style={styles.title}>Beállítások</Text>
      </View>

      <View style={styles.list}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kártyapakli hátulja"
          style={({ pressed }) => [
            styles.listItem,
            { borderBottomColor: background.surfaceBorder },
            pressed && { backgroundColor: background.surface },
          ]}
          onPress={onCardBackPress}
        >
          <Text style={styles.listItemText}>Kártyapakli hátulja</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Háttér színe"
          style={({ pressed }) => [
            styles.listItem,
            { borderBottomColor: background.surfaceBorder },
            pressed && { backgroundColor: background.surface },
          ]}
          onPress={onBackgroundColorPress}
        >
          <Text style={styles.listItemText}>Háttér színe</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  backText: {
    color: '#D4A017',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 32,
    color: '#F3E6C8',
  },
  list: {
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  listItemText: {
    color: '#F3E6C8',
    fontSize: 17,
  },
  chevron: {
    color: '#C9B896',
    fontSize: 24,
    fontWeight: '300',
  },
});
