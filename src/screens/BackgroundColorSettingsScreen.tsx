import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BACKGROUND_COLOR_OPTIONS, getBackgroundPalette } from '../settings/backgroundColors';
import { useSettings } from '../settings/SettingsContext';
import { BackgroundColorId } from '../settings/types';

type Props = {
  onBack: () => void;
};

const SWATCH_WIDTH = 56;
const SWATCH_HEIGHT = 36;

export function BackgroundColorSettingsScreen({ onBack }: Props) {
  const { backgroundColorId, setBackgroundColorId, background } = useSettings();

  const handleSelect = (id: BackgroundColorId) => {
    setBackgroundColorId(id);
  };

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
        <Text style={styles.title}>Háttér színe</Text>
        <Text style={styles.subtitle}>Válassz egy színt a játék hátteréhez</Text>
      </View>

      <FlatList
        data={BACKGROUND_COLOR_OPTIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = item.id === backgroundColorId;
          const palette = getBackgroundPalette(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: background.surface },
                selected && {
                  borderColor: '#D4A017',
                  backgroundColor: background.surfaceSelected,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => handleSelect(item.id)}
            >
              <View style={styles.swatch}>
                <View
                  style={[
                    styles.swatchBase,
                    { backgroundColor: palette.menuRoot, width: SWATCH_WIDTH, height: SWATCH_HEIGHT },
                  ]}
                />
                <View
                  style={[
                    styles.swatchOverlay,
                    { backgroundColor: palette.menuAtmosphere },
                  ]}
                />
              </View>
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {item.label}
              </Text>
              {selected ? <Text style={styles.checkmark}>✓</Text> : null}
            </Pressable>
          );
        }}
      />
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
    paddingBottom: 16,
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
    fontSize: 28,
    color: '#F3E6C8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#C9B896',
  },
  list: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  swatch: {
    width: SWATCH_WIDTH,
    height: SWATCH_HEIGHT,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  swatchBase: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  swatchOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '40%',
    opacity: 0.85,
  },
  optionLabel: {
    flex: 1,
    marginLeft: 16,
    fontSize: 17,
    color: '#F3E6C8',
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: '#D4A017',
  },
  checkmark: {
    color: '#D4A017',
    fontSize: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
