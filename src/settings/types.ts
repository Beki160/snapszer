export type CardBackId =
  | 'klasszikus'
  | 'zold'
  | 'kek'
  | 'bordo'
  | 'lila'
  | 'arany'
  | 'ejfekete'
  | 'turkiz'
  | 'krem'
  | 'piros';

export type CardBackOption = {
  id: CardBackId;
  label: string;
};

export type BackgroundColorId =
  | 'klasszikus'
  | 'ejfekete'
  | 'kek'
  | 'bordo'
  | 'lila'
  | 'erdo'
  | 'turkiz'
  | 'antracit'
  | 'mahagoni'
  | 'ocean';

export type BackgroundColorOption = {
  id: BackgroundColorId;
  label: string;
};

export type BackgroundPalette = {
  menuRoot: string;
  menuAtmosphere: string;
  gameRoot: string;
  surface: string;
  surfaceBorder: string;
  surfaceSelected: string;
};
