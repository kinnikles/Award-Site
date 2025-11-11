import React, { useEffect, useRef, useState } from "react";

// THE AWARD FORGE – BRANDED MVP
// - Brand teal from logo: #13CFD1
// - Dark UI gray: #2B2F35
// - Font: Cambria (falls back to Georgia/serif)
// - Most text white; headings in brand teal
// - Buttons dark gray with teal outline

export default function AwardTemplateBuilder() {
  // Canvas base size in inches & dpi for high-res export
  const [sizeInches, setSizeInches] = useState({ w: 11, h: 8.5 });
  const [dpi, setDpi] = useState(300);
  const pxW = Math.round(sizeInches.w * dpi);
  const pxH = Math.round(sizeInches.h * dpi);

  // Background image
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const [bgFit, setBgFit] = useState<"cover" | "contain" | "stretch">("cover");
  const [bleedInches, setBleedInches] = useState(0.125);

  type TextItemKey = "name" | "title" | "date" | "park" | "signer" | "notes";
  type TextItem = {
    key: TextItemKey; label: string; text: string; x: number; y: number; maxWidth: number; align: CanvasTextAlign;
    fontFamily: string; fontSize: number; weight: "normal" | "bold" | number; italic: boolean; letterSpacing: number;
    fill: string; shadow: { enabled: boolean; blur: number; offsetX: number; offsetY: number; color: string };
    visible: boolean; lineHeight: number; allCaps: boolean;
  };

  const brandFont = "'Cambria', 'Georgia', serif";

  const [items, setItems] = useState<Record<TextItemKey, TextItem>>({
    name: {
      key: "name", label: "Recipient Name", text: "Recipient Name", x: pxW * 0.5, y: pxH * 0.42, maxWidth: pxW * 0.8,
      align: "center", fontFamily: brandFont, fontSize: 42, weight: 700, italic: false, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 8, offsetX: 0, offsetY: 2, color: "rgba(0,0,0,0.25)" },
      visible: true, lineHeight: 1.1, allCaps: false,
    },
    title: {
      key: "title", label: "Award Title", text: "Order of the Raven – 3rd", x: pxW * 0.5, y: pxH * 0.30, maxWidth: pxW * 0.9,
      align: "center", fontFamily: brandFont, fontSize: 32, weight: 700, italic: false, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 6, offsetX: 0, offsetY: 2, color: "rgba(0,0,0,0.2)" },
      visible: true, lineHeight: 1.15, allCaps: false,
    },
    date: {
      key: "date", label: "Date", text: new Date().toLocaleDateString(), x: pxW * 0.82, y: pxH * 0.9, maxWidth: pxW * 0.3,
      align: "center", fontFamily: brandFont, fontSize: 16, weight: 600, italic: false, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 3, offsetX: 0, offsetY: 1, color: "rgba(0,0,0,0.2)" },
      visible: true, lineHeight: 1.2, allCaps: false,
    },
    park: {
      key: "park", label: "Park / Kingdom", text: "Ravenstone Park, Northreach", x: pxW * 0.18, y: pxH * 0.9, maxWidth: pxW * 0.3,
      align: "center", fontFamily: brandFont, fontSize: 16, weight: 600, italic: false, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 3, offsetX: 0, offsetY: 1, color: "rgba(0,0,0,0.2)" },
      visible: true, lineHeight: 1.2, allCaps: false,
    },
    signer: {
      key: "signer", label: "Signer(s)", text: "Monarch ✦ Prime Minister", x: pxW * 0.5, y: pxH * 0.82, maxWidth: pxW * 0.7,
      align: "center", fontFamily: brandFont, fontSize: 18, weight: 700, italic: false, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 3, offsetX: 0, offsetY: 1, color: "rgba(0,0,0,0.2)" },
      visible: true, lineHeight: 1.2, allCaps: false,
    },
    notes: {
      key: "notes", label: "Citation / Notes", text: "For exemplary service to the realm and exemplary arts.", x: pxW * 0.5, y: pxH * 0.65, maxWidth: pxW * 0.75,
      align: "center", fontFamily: brandFont, fontSize: 20, weight: 400, italic: true, letterSpacing: 0,
      fill: "#ffffff", shadow: { enabled: false, blur: 4, offsetX: 0, offsetY: 1, color: "rgba(0,0,0,0.2)" },
      visible: true, lineHeight: 1.3, allCaps: false,
    },
  });

  const [activeKey, setActiveKey] = useState<TextItemKey>("title");
  const [showGuides, setShowGuides] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (!bgUrl) return; const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { bgImgRef.current = img; draw(); }; img.src = bgUrl; }, [bgUrl, pxW, pxH, bgFit]);
  useEffect(() => { draw(); }, [items, showGuides, bleedInches, dpi, sizeInches]);

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (!f) return; setBgUrl(URL.createObjectURL(f)); }
  function setItem<K extends TextItemKey>(key: K, patch: Partial<TextItem>) { setItems((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })); }

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return; canvas.width = pxW; canvas.height = pxH; const ctx = canvas.getContext("2d"); if (!ctx) return;
    // Brand teal page background
    ctx.fillStyle = "#13CFD1"; ctx.fillRect(0, 0, pxW, pxH);

    const img = bgImgRef.current; if (img) { const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = computeObjectFit(img.width, img.height, pxW, pxH, bgFit); ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); }

    if (showGuides) { ctx.save(); const bleed = bleedInches * dpi; ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1; ctx.strokeRect(0, 0, pxW, pxH); ctx.setLineDash([8, 6]); ctx.strokeRect(bleed, bleed, pxW - bleed * 2, pxH - bleed * 2); ctx.restore(); }

    (Object.values(items) as TextItem[]).forEach((it) => {
      if (!it.visible || !it.text) return; ctx.save(); const fontSpec = `${it.italic ? "italic " : ""}${it.weight} ${ptToPx(it.fontSize)}px ${it.fontFamily}`; ctx.font = fontSpec; ctx.fillStyle = it.fill; ctx.textAlign = it.align; ctx.textBaseline = "alphabetic";
      if (it.shadow.enabled) { ctx.shadowBlur = it.shadow.blur; ctx.shadowColor = it.shadow.color; ctx.shadowOffsetX = it.shadow.offsetX; ctx.shadowOffsetY = it.shadow.offsetY; }
      const text = it.allCaps ? it.text.toUpperCase() : it.text; wrapText(ctx, text, it.x, it.y, it.maxWidth, it.lineHeight, it.align, it.letterSpacing); ctx.restore();
    });
  }

  function ptToPx(pt: number) { return (pt * dpi) / 72; }
  function computeObjectFit(srcW: number, srcH: number, dstW: number, dstH: number, fit: "cover" | "contain" | "stretch") {
    if (fit === "stretch") return { sx: 0, sy: 0, sWidth: srcW, sHeight: srcH, dx: 0, dy: 0, dWidth: dstW, dHeight: dstH };
    const srcRatio = srcW / srcH; const dstRatio = dstW / dstH;
    if ((fit === "cover" && srcRatio > dstRatio) || (fit === "contain" && srcRatio < dstRatio)) { const newW = srcH * dstRatio; const sx = (srcW - newW) / 2; return { sx, sy: 0, sWidth: newW, sHeight: srcH, dx: 0, dy: 0, dWidth: dstW, dHeight: dstH }; }
    const newH = srcW / dstRatio; const sy = (srcH - newH) / 2; return { sx: 0, sy, sWidth: srcW, sHeight: newH, dx: 0, dy: 0, dWidth: dstW, dHeight: dstH };
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeightEm: number, align: CanvasTextAlign, letterSpacing: number) {
    const words = text.split(/\s+/); const lines: string[] = []; let line = ""; const space = " ";
    function measureWithSpacing(str: string) { const m = ctx.measureText(str); const extra = Math.max(0, str.length - 1) * letterSpacing; return m.width + extra; }
    for (let i = 0; i < words.length; i++) { const test = line ? line + space + words[i] : words[i]; if (measureWithSpacing(test) > maxWidth && line) { lines.push(line); line = words[i]; } else { line = test; } }
    lines.push(line); const lineHeightPx = parseFloat(ctx.font) * lineHeightEm; lines.forEach((ln, idx) => { drawWithLetterSpacing(ctx, ln, x, y + idx * lineHeightPx, align, letterSpacing); });
  }

  function drawWithLetterSpacing(ctx: CanvasRenderingContext2D, str: string, x: number, y: number, align: CanvasTextAlign, letterSpacing: number) {
    if (!letterSpacing) { ctx.fillText(str, x, y); return; }
    const metrics = ctx.measureText(str); let startX = x; if (align === "center") startX = x - metrics.width / 2 - ((str.length - 1) * letterSpacing) / 2; if (align === "right" || align === "end") startX = x - metrics.width - (str.length - 1) * letterSpacing;
    for (let i = 0; i < str.length; i++) { const ch = str[i]; ctx.fillText(ch, startX, y); startX += ctx.measureText(ch).width + letterSpacing; }
  }

  const [drag, setDrag] = useState<{ key: TextItemKey; dx: number; dy: number } | null>(null);
  function onMouseDown(e: React.MouseEvent, key: TextItemKey) { const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setDrag({ key, dx: e.clientX - rect.left, dy: e.clientY - rect.top }); }
  function onMouseMove(e: React.MouseEvent) { if (!drag || !previewRef.current) return; const r = previewRef.current.getBoundingClientRect(); const scaleX = pxW / r.width; const scaleY = pxH / r.height; const newX = (e.clientX - r.left) * scaleX; const newY = (e.clientY - r.top) * scaleY; setItem(drag.key, { x: newX, y: newY }); }
  function onMouseUp() { setDrag(null); }

  function downloadPng() { if (!canvasRef.current) return; const dataUrl = canvasRef.current.toDataURL("image/png"); const a = document.createElement("a"); a.href = dataUrl; a.download = `award_${Date.now()}.png`; a.click(); }
  function resetPositions() { setItem("name", { x: pxW * 0.5, y: pxH * 0.42 }); setItem("title", { x: pxW * 0.5, y: pxH * 0.3 }); setItem("notes", { x: pxW * 0.5, y: pxH * 0.65 }); setItem("signer", { x: pxW * 0.5, y: pxH * 0.82 }); setItem("park", { x: pxW * 0.18, y: pxH * 0.9 }); setItem("date", { x: pxW * 0.82, y: pxH * 0.9 }); }

  const previewMaxW = 880; const previewScale = Math.min(1, previewMaxW / pxW);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#13CFD1', color: '#ffffff' }}>
      <style>{`:root{--brand-teal:#13CFD1;--brand-dark:#2B2F35;} body{font-family: Cambria, Georgia, serif;} .card{background:var(--brand-dark);color:#fff;border:1px solid rgba(19,207,209,0.25);box-shadow:0 6px 18px rgba(0,0,0,.2);border-radius:1rem} .btn{background:#2B2F35;color:#fff;border:2px solid var(--brand-teal);border-radius:1rem;padding:.5rem 1rem;box-shadow:0 2px 8px rgba(0,0,0,.25)} .btn:hover{filter:brightness(1.1)} h1,h2{color:var(--brand-teal);} .muted{color:rgba(255,255,255,.85)}`} </style>
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">The Award Forge – Builder (MVP)</h1>
            <p className="text-sm muted">Upload your design, edit fields, drag to position, export 300 DPI PNG.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadPng} className="btn">Download PNG</button>
            <button onClick={resetPositions} className="btn">Reset Positions</button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <section className="lg:col-span-1">
            <div className="card p-4 md:p-5">
              <h2 className="font-semibold mb-3">Background</h2>
              <div className="flex flex-col gap-3">
                <input type="file" accept="image/*" onChange={handleBgUpload} />
                <div className="flex items-center gap-2 text-sm">
                  <label className="mr-1">Fit</label>
                  <select value={bgFit} onChange={(e) => setBgFit(e.target.value as any)} className="border rounded px-2 py-1 bg-transparent">
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="flex items-center gap-2">Bleed (in)
                    <input type="number" step="0.01" value={bleedInches} onChange={(e) => setBleedInches(parseFloat(e.target.value || "0"))} className="border rounded px-2 py-1 w-24 bg-transparent" />
                  </label>
                  <label className="flex items-center gap-2">DPI
                    <input type="number" value={dpi} onChange={(e) => setDpi(parseInt(e.target.value || "300"))} className="border rounded px-2 py-1 w-24 bg-transparent" />
                  </label>
                  <label className="flex items-center gap-2">Width (in)
                    <input type="number" step="0.01" value={sizeInches.w} onChange={(e) => setSizeInches({ ...sizeInches, w: parseFloat(e.target.value || "0") })} className="border rounded px-2 py-1 w-24 bg-transparent" />
                  </label>
                  <label className="flex items-center gap-2">Height (in)
                    <input type="number" step="0.01" value={sizeInches.h} onChange={(e) => setSizeInches({ ...sizeInches, h: parseFloat(e.target.value || "0") })} className="border rounded px-2 py-1 w-24 bg-transparent" />
                  </label>
                </div>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} /> Show guides</label>
              </div>
            </div>

            <div className="card p-4 md:p-5 mt-6">
              <h2 className="font-semibold mb-3">Text Fields</h2>
              <div className="flex gap-2 flex-wrap mb-3">
                {(["title","name","notes","signer","park","date"] as TextItemKey[]).map((k) => (
                  <button key={k} onClick={() => setActiveKey(k)} className={`btn ${activeKey===k?"" : "opacity-80"}`}>{k}</button>
                ))}
              </div>
              <FieldEditor item={items[activeKey]} onChange={(patch)=> setItem(activeKey, patch)} />
            </div>
          </section>

          {/* Preview & Export Canvas */}
          <section className="lg:col-span-2">
            <div className="card p-3 md:p-4">
              <h2 className="font-semibold mb-3">Live Preview</h2>
              <div
                ref={previewRef}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                className="relative w-full mx-auto rounded-xl overflow-hidden"
                style={{ width: Math.round(pxW * previewScale), height: Math.round(pxH * previewScale), background:'#0f172a' }}
              >
                <div className="absolute inset-0">
                  {bgUrl ? (
                    <img src={bgUrl} alt="Background" className="w-full h-full" style={{ objectFit: bgFit as any }} />
                  ) : (
                    <div className="w-full h-full grid place-items-center muted text-sm">
                      Upload a background image to begin (PNG/JPG/SVG).
                    </div>
                  )}
                </div>

                {showGuides && (
                  <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)" }}>
                    <div
                      className="absolute border-2 border-dashed"
                      style={{ borderColor: "rgba(255,255,255,.35)", left: bleedInches * dpi * previewScale, top: bleedInches * dpi * previewScale, right: bleedInches * dpi * previewScale, bottom: bleedInches * dpi * previewScale }}
                    />
                  </div>
                )}

                {(Object.values(items) as TextItem[]).filter(i=>i.visible).map((it) => (
                  <DraggableText key={it.key} item={it} scale={previewScale} onMouseDown={(e)=>onMouseDown(e, it.key)} />
                ))}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </section>
        </div>

        <footer className="mt-8 text-xs muted">
          <p>Tip: Keep DPI 300 for crisp prints. To get a PDF, use your system's "Print to PDF" on the exported PNG.</p>
        </footer>
      </div>
    </div>
  );
}

function DraggableText({ item, scale, onMouseDown }: { item: any; scale: number; onMouseDown: (e: React.MouseEvent)=>void }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: item.x * scale,
    top: item.y * scale,
    transform: "translate(-50%, -80%)",
    fontFamily: item.fontFamily,
    fontWeight: item.weight,
    fontStyle: item.italic ? "italic" : "normal",
    fontSize: Math.max(10, item.fontSize * (scale * (300/72))) / 4,
    letterSpacing: `${item.letterSpacing * scale}px`,
    color: item.fill,
    textTransform: item.allCaps ? "uppercase" : "none",
    textShadow: item.shadow?.enabled ? `${item.shadow.offsetX*scale}px ${item.shadow.offsetY*scale}px ${item.shadow.blur*scale}px ${item.shadow.color}` : "none",
    userSelect: "none",
    cursor: "grab",
    maxWidth: item.maxWidth * scale,
    textAlign: item.align as any,
    lineHeight: 1.1,
    padding: ".15rem .25rem",
    background: "rgba(0,0,0,0.0)",
  };
  return (
    <div onMouseDown={onMouseDown} style={style} title={`Drag to move: ${item.label}`}>
      <span className="whitespace-pre-wrap break-words">{item.text}</span>
    </div>
  );
}

function FieldEditor({ item, onChange }: { item: any; onChange: (patch: Partial<any>) => void }) {
  return (
    <div className="grid gap-3 text-sm">
      <label className="grid gap-1">
        <span className="muted">{item.label}</span>
        <textarea value={item.text} onChange={(e)=>onChange({ text: e.target.value })} className="border rounded p-2 min-h-[72px] bg-transparent text-white" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1">Font family
          <input value={item.fontFamily} onChange={(e)=>onChange({ fontFamily: e.target.value })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Font size (pt)
          <input type="number" value={item.fontSize} onChange={(e)=>onChange({ fontSize: parseFloat(e.target.value || "0") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Weight
          <input value={item.weight} onChange={(e)=>onChange({ weight: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Letter spacing (px)
          <input type="number" step="0.1" value={item.letterSpacing} onChange={(e)=>onChange({ letterSpacing: parseFloat(e.target.value || "0") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Max width (px)
          <input type="number" value={item.maxWidth} onChange={(e)=>onChange({ maxWidth: parseFloat(e.target.value || "0") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Align
          <select value={item.align} onChange={(e)=>onChange({ align: e.target.value })} className="border rounded p-2 bg-transparent text-white">
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={item.italic} onChange={(e)=>onChange({ italic: e.target.checked })} /> Italic</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={item.allCaps} onChange={(e)=>onChange({ allCaps: e.target.checked })} /> All caps</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={item.shadow.enabled} onChange={(e)=>onChange({ shadow: { ...item.shadow, enabled: e.target.checked } })} /> Shadow</label>
        <label className="inline-flex items-center gap-2">Color <input type="color" value={item.fill} onChange={(e)=>onChange({ fill: e.target.value })} /></label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="grid gap-1">X (px)
          <input type="number" value={Math.round(item.x)} onChange={(e)=>onChange({ x: parseFloat(e.target.value || "0") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Y (px)
          <input type="number" value={Math.round(item.y)} onChange={(e)=>onChange({ y: parseFloat(e.target.value || "0") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
        <label className="grid gap-1">Line height (em)
          <input type="number" step="0.05" value={item.lineHeight} onChange={(e)=>onChange({ lineHeight: parseFloat(e.target.value || "1.2") })} className="border rounded p-2 bg-transparent text-white" />
        </label>
      </div>

      {item.shadow?.enabled && (
        <div className="grid grid-cols-4 gap-3">
          <label className="grid gap-1">Shadow X
            <input type="number" value={item.shadow.offsetX} onChange={(e)=>onChange({ shadow: { ...item.shadow, offsetX: parseFloat(e.target.value || "0") } })} className="border rounded p-2 bg-transparent text-white" />
          </label>
          <label className="grid gap-1">Shadow Y
            <input type="number" value={item.shadow.offsetY} onChange={(e)=>onChange({ shadow: { ...item.shadow, offsetY: parseFloat(e.target.value || "0") } })} className="border rounded p-2 bg-transparent text-white" />
          </label>
          <label className="grid gap-1">Shadow blur
            <input type="number" value={item.shadow.blur} onChange={(e)=>onChange({ shadow: { ...item.shadow, blur: parseFloat(e.target.value || "0") } })} className="border rounded p-2 bg-transparent text-white" />
          </label>
          <label className="grid gap-1">Shadow color
            <input type="color" value={item.shadow.color} onChange={(e)=>onChange({ shadow: { ...item.shadow, color: e.target.value } })} className="border rounded p-2 bg-transparent text-white" />
          </label>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button onClick={()=>onChange({ visible: !item.visible })} className="btn">{item.visible?"Hide":"Show"} field</button>
        <button onClick={()=>onChange({ text: "" })} className="btn">Clear text</button>
      </div>
    </div>
  );
}
