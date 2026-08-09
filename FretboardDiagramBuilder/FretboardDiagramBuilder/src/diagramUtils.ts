import type { DiagramState, FretCell, NutState } from './types';
import { TUNING_PRESETS } from './constants';

export function createEmptyCell(): FretCell {
  return { active: false, isRoot: false };
}

export function createEmptyDiagram(
  numStrings: number,
  numFrets: number,
  tuning?: string[],
): DiagramState {
  const preset = TUNING_PRESETS.find((p) => p.strings.length === numStrings);
  const resolvedTuning =
    tuning ??
    preset?.strings ??
    TUNING_PRESETS.find((p) => p.id === 'standard-6')!.strings.slice(0, numStrings);

  return {
    title: '',
    numStrings,
    numFrets,
    startFret: 0,
    tuning: [...resolvedTuning],
    nutStates: Array.from({ length: numStrings }, () => null),
    cells: Array.from({ length: numStrings }, () =>
      Array.from({ length: numFrets }, () => createEmptyCell()),
    ),
    showStringLabels: true,
  };
}

export function cycleNutState(current: NutState): NutState {
  if (current === null) return 'open';
  if (current === 'open') return 'muted';
  return null;
}

export function cycleCell(cell: FretCell): FretCell {
  if (!cell.active) {
    return { active: true, isRoot: false };
  }
  if (!cell.isRoot) {
    return { active: true, isRoot: true };
  }
  return { active: false, isRoot: false };
}

export function clearDiagram(diagram: DiagramState): DiagramState {
  return createEmptyDiagram(diagram.numStrings, diagram.numFrets, diagram.tuning);
}
