import type { TuningPreset } from './types';

export const CHROMATIC = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const TUNING_PRESETS: TuningPreset[] = [
  { id: 'standard-6', name: 'Standard (E A D G B E)', strings: ['E', 'A', 'D', 'G', 'B', 'E'] },
  { id: 'drop-d', name: 'Drop D (D A D G B E)', strings: ['D', 'A', 'D', 'G', 'B', 'E'] },
  { id: 'dadgad', name: 'DADGAD', strings: ['D', 'A', 'D', 'G', 'A', 'D'] },
  { id: 'open-g', name: 'Open G (D G D G B D)', strings: ['D', 'G', 'D', 'G', 'B', 'D'] },
  { id: 'bass-4', name: 'Bass Standard (E A D G)', strings: ['E', 'A', 'D', 'G'] },
  { id: 'bass-5', name: 'Bass 5-string (B E A D G)', strings: ['B', 'E', 'A', 'D', 'G'] },
  { id: 'ukulele', name: 'Ukulele (G C E A)', strings: ['G', 'C', 'E', 'A'] },
];

export const STRING_OPTIONS = [4, 5, 6, 7, 8];
export const FRET_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
