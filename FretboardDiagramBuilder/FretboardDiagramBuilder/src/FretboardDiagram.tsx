import { useRef } from 'react';
import { cssVarMap, theme } from './theme';
import type { DiagramState } from './types';
import { cycleCell, cycleNutState } from './diagramUtils';

type Props = {
  diagram: DiagramState;
  onChange: (diagram: DiagramState) => void;
  exportRef?: React.RefObject<SVGSVGElement | null>;
};

const LAYOUT = {
  paddingLeft: 48,
  paddingTop: 40,
  paddingBottom: 24,
  paddingRight: 24,
  nutWidth: 10,
  fretSpacing: 52,
  stringSpacing: 28,
  dotRadius: 11,
  nutHeight: 36,
};

export function FretboardDiagram({ diagram, onChange, exportRef }: Props) {
  const internalRef = useRef<SVGSVGElement>(null);
  const svgRef = exportRef ?? internalRef;

  const width =
    LAYOUT.paddingLeft +
    LAYOUT.nutWidth +
    diagram.numFrets * LAYOUT.fretSpacing +
    LAYOUT.paddingRight;
  const height =
    LAYOUT.paddingTop +
    LAYOUT.nutHeight +
    (diagram.numStrings - 1) * LAYOUT.stringSpacing +
    LAYOUT.paddingBottom;

  const stringY = (stringIndex: number) =>
    LAYOUT.paddingTop + LAYOUT.nutHeight + stringIndex * LAYOUT.stringSpacing;

  const fretX = (fretIndex: number) =>
    LAYOUT.paddingLeft + LAYOUT.nutWidth + fretIndex * LAYOUT.fretSpacing;

  const handleNutClick = (stringIndex: number) => {
    const next = structuredClone(diagram);
    next.nutStates[stringIndex] = cycleNutState(next.nutStates[stringIndex]);
    if (next.nutStates[stringIndex] !== null) {
      next.cells[stringIndex] = next.cells[stringIndex].map(() => ({
        active: false,
        isRoot: false,
      }));
    }
    onChange(next);
  };

  const handleFretClick = (stringIndex: number, fretIndex: number) => {
    const next = structuredClone(diagram);
    next.nutStates[stringIndex] = null;
    next.cells[stringIndex][fretIndex] = cycleCell(next.cells[stringIndex][fretIndex]);
    onChange(next);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="fretboard-svg"
      role="img"
      aria-label={diagram.title || 'Fretboard diagram'}
    >
      <rect x={0} y={0} width={width} height={height} fill="var(--board-bg)" rx={8} />

      {diagram.title && (
        <text
          x={width / 2}
          y={28}
          textAnchor="middle"
          className="diagram-title"
          fill="var(--text-primary)"
        >
          {diagram.title}
        </text>
      )}

      {diagram.showStringLabels &&
        diagram.tuning.map((note, s) => (
          <text
            key={`string-label-${s}`}
            x={LAYOUT.paddingLeft - 14}
            y={stringY(s) + 5}
            textAnchor="end"
            className="string-label"
            fill="var(--text-muted)"
          >
            {note}
          </text>
        ))}

      {/* Nut */}
      <rect
        x={LAYOUT.paddingLeft}
        y={stringY(0) - 4}
        width={LAYOUT.nutWidth}
        height={(diagram.numStrings - 1) * LAYOUT.stringSpacing + 8}
        fill="var(--nut-color)"
        rx={2}
      />

      {/* Fret lines */}
      {Array.from({ length: diagram.numFrets + 1 }, (_, i) => {
        const x = LAYOUT.paddingLeft + LAYOUT.nutWidth + i * LAYOUT.fretSpacing;
        const isNut = i === 0;
        return (
          <line
            key={`fret-line-${i}`}
            x1={x}
            y1={stringY(0) - 6}
            x2={x}
            y2={stringY(diagram.numStrings - 1) + 6}
            stroke={isNut ? 'var(--nut-color)' : 'var(--fret-color)'}
            strokeWidth={isNut ? 4 : 2}
          />
        );
      })}

      {/* Strings */}
      {Array.from({ length: diagram.numStrings }, (_, s) => (
        <line
          key={`string-${s}`}
          x1={LAYOUT.paddingLeft}
          y1={stringY(s)}
          x2={LAYOUT.paddingLeft + LAYOUT.nutWidth + diagram.numFrets * LAYOUT.fretSpacing}
          y2={stringY(s)}
          stroke="var(--string-color)"
          strokeWidth={1.5 + (diagram.numStrings - s) * 0.15}
        />
      ))}

      {/* Nut markers (open / muted) */}
      {diagram.nutStates.map((state, s) => {
        if (!state) return null;
        const cx = LAYOUT.paddingLeft + LAYOUT.nutWidth / 2;
        const cy = stringY(s);
        return (
          <g key={`nut-marker-${s}`}>
            <circle
              cx={cx}
              cy={cy}
              r={LAYOUT.dotRadius}
              fill="transparent"
              className="click-target"
              onClick={() => handleNutClick(s)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              className="nut-marker"
              fill={state === 'muted' ? 'var(--muted-color)' : 'var(--open-color)'}
              onClick={() => handleNutClick(s)}
              style={{ cursor: 'pointer' }}
            >
              {state === 'open' ? '○' : '×'}
            </text>
          </g>
        );
      })}

      {/* Empty nut click zones */}
      {diagram.nutStates.map((state, s) => {
        if (state) return null;
        return (
          <circle
            key={`nut-click-${s}`}
            cx={LAYOUT.paddingLeft + LAYOUT.nutWidth / 2}
            cy={stringY(s)}
            r={LAYOUT.dotRadius + 4}
            fill="transparent"
            className="click-target"
            onClick={() => handleNutClick(s)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Fret dots */}
      {diagram.cells.map((row, s) =>
        row.map((cell, f) => {
          const cx = fretX(f) + LAYOUT.fretSpacing / 2;
          const cy = stringY(s);
          const hasDot = cell.active;

          return (
            <g key={`cell-${s}-${f}`}>
              <circle
                cx={cx}
                cy={cy}
                r={LAYOUT.dotRadius + 6}
                fill="transparent"
                className="click-target"
                onClick={() => handleFretClick(s, f)}
                style={{ cursor: 'pointer' }}
              />
              {hasDot && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={LAYOUT.dotRadius}
                  fill={cell.isRoot ? 'var(--root-dot)' : 'var(--note-dot)'}
                  stroke={cell.isRoot ? 'var(--root-dot-border)' : 'none'}
                  strokeWidth={2}
                  onClick={() => handleFretClick(s, f)}
                  style={{ cursor: 'pointer' }}
                />
              )}
            </g>
          );
        }),
      )}

      {diagram.startFret > 0 && (
        <text
          x={LAYOUT.paddingLeft + LAYOUT.nutWidth / 2}
          y={stringY(diagram.numStrings - 1) + 22}
          textAnchor="middle"
          className="start-fret-label"
          fill="var(--text-muted)"
        >
          {diagram.startFret}fr
        </text>
      )}
    </svg>
  );
}

export function exportSvgElement(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('.click-target').forEach((el) => el.remove());

  clone.querySelectorAll('[fill], [stroke]').forEach((el) => {
    for (const attr of ['fill', 'stroke'] as const) {
      const value = el.getAttribute(attr);
      if (value && value in cssVarMap) {
        el.setAttribute(attr, cssVarMap[value]);
      }
    }
  });

  const styles = `
    .diagram-title { font-family: Georgia, serif; font-size: 18px; font-weight: 600; fill: ${theme.textPrimary}; }
    .string-label, .start-fret-label { font-family: system-ui, sans-serif; font-size: 12px; fill: ${theme.textMuted}; }
    .nut-marker { font-family: system-ui, sans-serif; font-size: 16px; font-weight: 700; }
  `;

  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = styles;
  clone.insertBefore(styleEl, clone.firstChild);

  const bg = clone.querySelector('rect');
  if (bg) {
    bg.setAttribute('fill', theme.boardBg);
  }

  return new XMLSerializer().serializeToString(clone);
}

export async function exportPng(svg: SVGSVGElement, filename: string): Promise<void> {
  const svgString = exportSvgElement(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = svg.viewBox.baseVal.width * 2;
  canvas.height = svg.viewBox.baseVal.height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  ctx.fillStyle = theme.boardBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (!pngBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pngBlob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png');
}
