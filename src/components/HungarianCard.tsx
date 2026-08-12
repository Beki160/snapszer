import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card } from '../game/types';
import { CARD_BACK_IMAGE, getCardImage } from './cardImages';

type Props = {
  card: Card;
  width?: number;
  height?: number;
  selected?: boolean;
  faceDown?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
};

export function HungarianCard({
  card,
  width = 72,
  height = 116,
  selected = false,
  faceDown = false,
  dimmed = false,
  highlighted = false,
}: Props) {
  return (
    <View
      style={[
        styles.frame,
        selected && styles.selected,
        highlighted && styles.highlighted,
        { width, height },
      ]}
    >
      <Image
        source={faceDown ? CARD_BACK_IMAGE : getCardImage(card)}
        style={[
          { width: highlighted ? width - 4 : width, height: highlighted ? height - 4 : height },
          dimmed && styles.dimmedImage,
        ]}
        resizeMode="contain"
        accessibilityLabel={faceDown ? 'Lefordított lap' : card.id}
      />
      {dimmed ? <View style={styles.dimOverlay} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlighted: {
    borderWidth: 2,
    borderColor: '#D4A017',
    backgroundColor: 'rgba(212, 160, 23, 0.18)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selected: {
    transform: [{ translateY: -10 }],
  },
  dimmedImage: {
    opacity: 0.35,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20, 30, 25, 0.45)',
  },
});
