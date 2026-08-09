import type { DiagramState } from './types';
import { FRET_OPTIONS, STRING_OPTIONS, TUNING_PRESETS } from './constants';

type Props = {
  diagram: DiagramState;
  onChange: (diagram: DiagramState) => void;
  onClear: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  exportStatus: string | null;
};

export function Controls({
  diagram,
  onChange,
  onClear,
  onExportSvg,
  onExportPng,
  exportStatus,
}: Props) {
  const update = (partial: Partial<DiagramState>) => {
    onChange({ ...diagram, ...partial });
  };

  const handleStringsChange = (numStrings: number) => {
    const preset = TUNING_PRESETS.find((p) => p.strings.length === numStrings);
    onChange({
      ...diagram,
      numStrings,
      tuning: preset ? [...preset.strings] : diagram.tuning.slice(0, numStrings),
      nutStates: Array.from({ length: numStrings }, (_, i) => diagram.nutStates[i] ?? null),
      cells: Array.from({ length: numStrings }, (_, s) =>
        Array.from({ length: diagram.numFrets }, (_, f) =>
          diagram.cells[s]?.[f] ?? { active: false, isRoot: false },
        ),
      ),
    });
  };

  const handleFretsChange = (numFrets: number) => {
    onChange({
      ...diagram,
      numFrets,
      cells: diagram.cells.map((row) =>
        Array.from({ length: numFrets }, (_, f) => row[f] ?? { active: false, isRoot: false }),
      ),
    });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = TUNING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      ...diagram,
      numStrings: preset.strings.length,
      tuning: [...preset.strings],
      nutStates: Array.from({ length: preset.strings.length }, () => null),
      cells: Array.from({ length: preset.strings.length }, () =>
        Array.from({ length: diagram.numFrets }, () => ({ active: false, isRoot: false })),
      ),
    });
  };

  const matchingPreset = TUNING_PRESETS.find(
    (p) =>
      p.strings.length === diagram.numStrings &&
      p.strings.every((n, i) => n === diagram.tuning[i]),
  );

  return (
    <aside className="controls">
      <header className="controls-header">
        <h1>Fretboard Builder</h1>
        <p>Create chord and scale diagrams for guitar, bass, and more.</p>
      </header>

      <section className="control-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. C Major, Am7"
          value={diagram.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </section>

      <section className="control-group">
        <label htmlFor="preset">Tuning preset</label>
        <select
          id="preset"
          value={matchingPreset?.id ?? ''}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          <option value="" disabled>
            Custom
          </option>
          {TUNING_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </section>

      <div className="control-row">
        <section className="control-group">
          <label htmlFor="strings">Strings</label>
          <select
            id="strings"
            value={diagram.numStrings}
            onChange={(e) => handleStringsChange(Number(e.target.value))}
          >
            {STRING_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </section>

        <section className="control-group">
          <label htmlFor="frets">Frets shown</label>
          <select
            id="frets"
            value={diagram.numFrets}
            onChange={(e) => handleFretsChange(Number(e.target.value))}
          >
            {FRET_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </section>
      </div>

      <section className="control-group">
        <label htmlFor="startFret">Starting fret</label>
        <input
          id="startFret"
          type="number"
          min={0}
          max={18}
          value={diagram.startFret}
          onChange={(e) => update({ startFret: Math.max(0, Number(e.target.value)) })}
        />
        <span className="hint">Use for positions higher up the neck (e.g. 5 for 5th fret)</span>
      </section>

      <section className="control-group toggles">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={diagram.showStringLabels}
            onChange={(e) => update({ showStringLabels: e.target.checked })}
          />
          Show open string notes
        </label>
      </section>

      <section className="control-group help-box">
        <h3>How to use</h3>
        <ul>
          <li>
            <strong>Click</strong> a fret to add a blue dot
          </li>
          <li>
            <strong>Click again</strong> to mark it as the root
          </li>
          <li>
            <strong>Click a third time</strong> to remove it
          </li>
          <li>
            <strong>Click</strong> the nut to toggle open (○) or muted (×)
          </li>
        </ul>
      </section>

      <div className="action-buttons">
        <button type="button" className="btn btn-secondary" onClick={onClear}>
          Clear diagram
        </button>
        <button type="button" className="btn btn-primary" onClick={onExportPng}>
          Download PNG
        </button>
        <button type="button" className="btn btn-primary" onClick={onExportSvg}>
          Copy SVG
        </button>
      </div>

      {exportStatus && <p className="export-status">{exportStatus}</p>}
    </aside>
  );
}
