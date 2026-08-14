import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card } from '../game/types';
import { useSettings } from '../settings/SettingsContext';
import { CardBackDesign } from './CardBackDesign';
import { getCardImage } from './cardImages';

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
  const { cardBackId } = useSettings();
  const displayWidth = highlighted ? width - 4 : width;
  const displayHeight = highlighted ? height - 4 : height;

  return (
    <View
      style={[
        styles.frame,
        selected && styles.selected,
        highlighted && styles.highlighted,
        { width, height },
      ]}
    >
      {faceDown ? (
        <View style={dimmed ? styles.dimmedImage : undefined}>
          <CardBackDesign id={cardBackId} width={displayWidth} height={displayHeight} />
        </View>
      ) : (
        <Image
          source={getCardImage(card)}
          style={[
            { width: displayWidth, height: displayHeight },
            dimmed && styles.dimmedImage,
          ]}
          resizeMode="contain"
          accessibilityLabel={card.id}
        />
      )}
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
