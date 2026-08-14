import { CardBackId, CardBackOption } from './types';

export const CARD_BACK_OPTIONS: CardBackOption[] = [
  { id: 'klasszikus', label: 'Klasszikus' },
  { id: 'zold', label: 'Zöld' },
  { id: 'kek', label: 'Kék' },
  { id: 'bordo', label: 'Bordó' },
  { id: 'lila', label: 'Lila' },
  { id: 'arany', label: 'Arany' },
  { id: 'ejfekete', label: 'Éjfekete' },
  { id: 'turkiz', label: 'Türkiz' },
  { id: 'krem', label: 'Krém' },
  { id: 'piros', label: 'Piros' },
];

export const DEFAULT_CARD_BACK: CardBackId = 'klasszikus';

export function getCardBackLabel(id: CardBackId): string {
  return CARD_BACK_OPTIONS.find((option) => option.id === id)?.label ?? id;
}
