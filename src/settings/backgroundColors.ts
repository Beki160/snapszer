import { BackgroundColorId, BackgroundColorOption, BackgroundPalette } from './types';

export const BACKGROUND_COLOR_OPTIONS: BackgroundColorOption[] = [
  { id: 'klasszikus', label: 'Klasszikus zöld' },
  { id: 'ejfekete', label: 'Éjfekete' },
  { id: 'kek', label: 'Mélykék' },
  { id: 'bordo', label: 'Bordó' },
  { id: 'lila', label: 'Lila' },
  { id: 'erdo', label: 'Erdő' },
  { id: 'turkiz', label: 'Türkiz' },
  { id: 'antracit', label: 'Antracit' },
  { id: 'mahagoni', label: 'Mahagóni' },
  { id: 'ocean', label: 'Óceán' },
];

export const DEFAULT_BACKGROUND_COLOR: BackgroundColorId = 'klasszikus';

const PALETTES: Record<BackgroundColorId, BackgroundPalette> = {
  klasszikus: {
    menuRoot: '#0F2A22',
    menuAtmosphere: '#16382D',
    gameRoot: '#1B4D3E',
    surface: '#16382D',
    surfaceBorder: '#16382D',
    surfaceSelected: '#1A4035',
  },
  ejfekete: {
    menuRoot: '#0D0D18',
    menuAtmosphere: '#1A1A2E',
    gameRoot: '#12121F',
    surface: '#1A1A2E',
    surfaceBorder: '#252540',
    surfaceSelected: '#222240',
  },
  kek: {
    menuRoot: '#0F1A33',
    menuAtmosphere: '#152547',
    gameRoot: '#1A3055',
    surface: '#152547',
    surfaceBorder: '#1E3560',
    surfaceSelected: '#1A3055',
  },
  bordo: {
    menuRoot: '#2E0F1A',
    menuAtmosphere: '#470F1F',
    gameRoot: '#5C1A2E',
    surface: '#470F1F',
    surfaceBorder: '#5C1A2E',
    surfaceSelected: '#521525',
  },
  lila: {
    menuRoot: '#1A0F33',
    menuAtmosphere: '#250F47',
    gameRoot: '#3D1A6B',
    surface: '#250F47',
    surfaceBorder: '#351A60',
    surfaceSelected: '#301555',
  },
  erdo: {
    menuRoot: '#0F2A1A',
    menuAtmosphere: '#1A3D26',
    gameRoot: '#1A5C3A',
    surface: '#1A3D26',
    surfaceBorder: '#224D30',
    surfaceSelected: '#1E452C',
  },
  turkiz: {
    menuRoot: '#0A2626',
    menuAtmosphere: '#0D4A4A',
    gameRoot: '#126B6B',
    surface: '#0D4A4A',
    surfaceBorder: '#115858',
    surfaceSelected: '#0F5555',
  },
  antracit: {
    menuRoot: '#1A1A1A',
    menuAtmosphere: '#2A2A2A',
    gameRoot: '#333333',
    surface: '#2A2A2A',
    surfaceBorder: '#383838',
    surfaceSelected: '#303030',
  },
  mahagoni: {
    menuRoot: '#2A1A0F',
    menuAtmosphere: '#3D2617',
    gameRoot: '#5C3A1A',
    surface: '#3D2617',
    surfaceBorder: '#4D3020',
    surfaceSelected: '#452B18',
  },
  ocean: {
    menuRoot: '#0A1F2E',
    menuAtmosphere: '#0F3047',
    gameRoot: '#1A4A6B',
    surface: '#0F3047',
    surfaceBorder: '#153A55',
    surfaceSelected: '#123550',
  },
};

export function getBackgroundPalette(id: BackgroundColorId): BackgroundPalette {
  return PALETTES[id];
}

export function getBackgroundColorLabel(id: BackgroundColorId): string {
  return BACKGROUND_COLOR_OPTIONS.find((option) => option.id === id)?.label ?? id;
}
