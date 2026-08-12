import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  alertOnly?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Igen',
  cancelLabel = 'Mégsem',
  alertOnly = false,
  onConfirm,
  onCancel,
}: Props) {
  const handleDismiss = onCancel ?? onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {alertOnly ? (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                onPress={onConfirm}
              >
                <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
                  onPress={onCancel!}
                >
                  <Text style={styles.btnGhostText}>{cancelLabel}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                  onPress={onConfirm}
                >
                  <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
                </Pressable>
              </>
            )}
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
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnGhostText: {
    color: '#5A4E3A',
    fontSize: 16,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#D4A017',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: '#1A1408',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
