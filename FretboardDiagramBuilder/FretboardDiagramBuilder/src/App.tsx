import { useRef, useState } from 'react';
import { Controls } from './Controls';
import { FretboardDiagram, exportPng, exportSvgElement } from './FretboardDiagram';
import { clearDiagram, createEmptyDiagram } from './diagramUtils';

function App() {
  const [diagram, setDiagram] = useState(() => createEmptyDiagram(6, 6));
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const showStatus = (message: string) => {
    setExportStatus(message);
    setTimeout(() => setExportStatus(null), 2500);
  };

  const handleExportSvg = async () => {
    if (!svgRef.current) return;
    const svgString = exportSvgElement(svgRef.current);
    try {
      await navigator.clipboard.writeText(svgString);
      showStatus('SVG copied to clipboard');
    } catch {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${diagram.title || 'fretboard'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      showStatus('SVG downloaded');
    }
  };

  const handleExportPng = async () => {
    if (!svgRef.current) return;
    const name = `${(diagram.title || 'fretboard').replace(/\s+/g, '-').toLowerCase()}.png`;
    await exportPng(svgRef.current, name);
    showStatus('PNG downloaded');
  };

  return (
    <div className="app">
      <Controls
        diagram={diagram}
        onChange={setDiagram}
        onClear={() => setDiagram(clearDiagram(diagram))}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        exportStatus={exportStatus}
      />
      <main className="canvas-area">
        <div className="diagram-wrapper">
          <FretboardDiagram diagram={diagram} onChange={setDiagram} exportRef={svgRef} />
        </div>
      </main>
    </div>
  );
}

export default App;
