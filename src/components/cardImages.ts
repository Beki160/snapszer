import { ImageSourcePropType } from 'react-native';
import { Card, Rank, Suit } from '../game/types';

const SUIT_FILE: Record<Suit, string> = {
  piros: 'heart',
  tok: 'bell',
  zold: 'leaf',
  makk: 'acorn',
};

const RANK_FILE: Record<Rank, string> = {
  also: 'unter',
  felso: 'ober',
  kiraly: 'king',
  tizes: 'ten',
  asz: 'ace',
};

const CARD_IMAGES: Record<string, ImageSourcePropType> = {
  'heart-ace': require('../../assets/cards/heart-ace.png'),
  'heart-ten': require('../../assets/cards/heart-ten.png'),
  'heart-king': require('../../assets/cards/heart-king.png'),
  'heart-ober': require('../../assets/cards/heart-ober.png'),
  'heart-unter': require('../../assets/cards/heart-unter.png'),
  'bell-ace': require('../../assets/cards/bell-ace.png'),
  'bell-ten': require('../../assets/cards/bell-ten.png'),
  'bell-king': require('../../assets/cards/bell-king.png'),
  'bell-ober': require('../../assets/cards/bell-ober.png'),
  'bell-unter': require('../../assets/cards/bell-unter.png'),
  'leaf-ace': require('../../assets/cards/leaf-ace.png'),
  'leaf-ten': require('../../assets/cards/leaf-ten.png'),
  'leaf-king': require('../../assets/cards/leaf-king.png'),
  'leaf-ober': require('../../assets/cards/leaf-ober.png'),
  'leaf-unter': require('../../assets/cards/leaf-unter.png'),
  'acorn-ace': require('../../assets/cards/acorn-ace.png'),
  'acorn-ten': require('../../assets/cards/acorn-ten.png'),
  'acorn-king': require('../../assets/cards/acorn-king.png'),
  'acorn-ober': require('../../assets/cards/acorn-ober.png'),
  'acorn-unter': require('../../assets/cards/acorn-unter.png'),
};

export const CARD_BACK_IMAGE: ImageSourcePropType = require('../../assets/cards/back.png');

export function getCardImage(card: Card): ImageSourcePropType {
  const key = `${SUIT_FILE[card.suit]}-${RANK_FILE[card.rank]}`;
  const image = CARD_IMAGES[key];
  if (!image) {
    throw new Error(`Nincs kép a laphoz: ${key}`);
  }
  return image;
}
