export type NutState = 'open' | 'muted' | null;

export type FretCell = {
  active: boolean;
  isRoot: boolean;
};

export type TuningPreset = {
  id: string;
  name: string;
  strings: string[];
};

export type DiagramState = {
  title: string;
  numStrings: number;
  numFrets: number;
  startFret: number;
  tuning: string[];
  nutStates: NutState[];
  cells: FretCell[][];
  showStringLabels: boolean;
};
