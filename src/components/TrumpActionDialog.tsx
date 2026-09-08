import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onExchange: () => void;
  onCloseTalon: () => void;
};

export function TrumpActionDialog({
  visible,
  onClose,
  onExchange,
  onCloseTalon,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Mit szeretnél?</Text>
          <Text style={styles.message}>
            Adu cseréje vagy takarás — takarás után minden ütésnek a tiédnek kell lennie.
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Text style={styles.btnSecondaryText}>Mégsem</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={() => {
                onClose();
                onExchange();
              }}
            >
              <Text style={styles.btnSecondaryText}>Adu csere</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              onPress={() => {
                onClose();
                onCloseTalon();
              }}
            >
              <Text style={styles.btnPrimaryText}>Takarás</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F3E6C8',
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1408',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#3A3224',
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnSecondaryText: {
    color: '#5A4E3A',
    fontSize: 15,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#D4A017',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: '#1A1408',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
