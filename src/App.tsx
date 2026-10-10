import { useEffect, useMemo, useRef, useState } from "react";
import {
  GraduationCap, Users, Grid2X2, AlignHorizontalJustifyCenter, Download,
  FileText, Search, Plus, RotateCcw, Upload, ChevronDown,
  ZoomIn, ZoomOut, Maximize, Printer, Save, Settings2, Menu, X, Building2,
  CheckCircle2, AlertCircle, Eye, Trash2, FileJson, FileSpreadsheet
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { initialCampuses, type Campus } from "./campuses";

type Mode = "Student" | "Teacher" | "Custom";
type Doc = { id: string; title: string; category: string; subtitle: string };
type FormState = {
  campusId: string; campusName: string; campusAddress: string; campusWebsite: string;
  personName: string; personId: string; program: string; department: string;
  email: string; issueDate: string; note: string;
};
const docsByMode: Record<Mode, Doc[]> = {
  Student: [
    { id: "admission", title: "Admission Letter", category: "Core", subtitle: "Sample admission document" },
    { id: "enrollment", title: "Enrollment Confirmation", category: "Core", subtitle: "Sample enrollment record" },
    { id: "tuition", title: "Tuition Statement", category: "Core", subtitle: "Sample fee statement" },
    { id: "transcript", title: "Academic Transcript", category: "Extra", subtitle: "Sample academic record" },
    { id: "status", title: "Student Status Letter", category: "Extra", subtitle: "Sample status document" },
    { id: "idcard", title: "Sample Student ID Card", category: "ID", subtitle: "Demo card preview" }
  ],
  Teacher: [
    { id: "employment", title: "Employment Confirmation", category: "Core", subtitle: "Sample employment record" },
    { id: "certificate", title: "Teaching Certificate Template", category: "Core", subtitle: "Sample certificate template" },
    { id: "salary", title: "Salary Statement Template", category: "Core", subtitle: "Sample salary statement" },
    { id: "staff", title: "Staff Information Sheet", category: "Extra", subtitle: "Sample staff sheet" },
    { id: "idcard", title: "Sample Faculty ID Card", category: "ID", subtitle: "Demo card preview" }
  ],
  Custom: [
    { id: "letter", title: "Administrative Letter", category: "Core", subtitle: "Internal document template" },
    { id: "report", title: "Administrative Report", category: "Extra", subtitle: "Internal report template" },
    { id: "idcard", title: "Sample Organization Card", category: "ID", subtitle: "Demo card preview" }
  ]
};
const blankForm: FormState = {
  campusId: "", campusName: "Contoh Perguruan Tinggi", campusAddress: "Kalimantan Barat, Indonesia",
  campusWebsite: "", personName: "Nama Contoh", personId: "DEMO-0001",
  program: "Program Contoh", department: "Fakultas Contoh", email: "contoh@example.test",
  issueDate: new Date().toISOString().slice(0, 10), note: "Dokumen ini hanya untuk demonstrasi."
};
const STORAGE_KEY = "documentflow-pro-v1";
function readSaved(): { form?: FormState; campuses?: Campus[]; mode?: Mode; selected?: string } | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as { form?: FormState; campuses?: Campus[]; mode?: Mode; selected?: string } | null; }
  catch { return null; }
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}
function App() {
  const saved = useMemo(readSaved, []);
  const [mode, setMode] = useState<Mode>(saved?.mode || "Student");
  const [form, setForm] = useState<FormState>({ ...blankForm, ...(saved?.form || {}) });
  const [campuses, setCampuses] = useState<Campus[]>(saved?.campuses || initialCampuses);
  const [selectedDoc, setSelectedDoc] = useState(saved?.selected || "admission");
  const [tab, setTab] = useState<"Core" | "Extra" | "ID">("Core");
  const [layout, setLayout] = useState<"Grid" | "Horizontal">("Grid");
  const [zoom, setZoom] = useState(70);
  const [paper, setPaper] = useState<"A4" | "Letter">("A4");
  const [orientation, setOrientation] = useState<"Portrait" | "Landscape">("Portrait");
  const [accent, setAccent] = useState("#2563eb");
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Semua Kabupaten/Kota");
  const [showCampusManager, setShowCampusManager] = useState(false);
  const [newCampusName, setNewCampusName] = useState("");
  const [newCampusCity, setNewCampusCity] = useState("Kota Pontianak");
  const [newCampusType, setNewCampusType] = useState("Universitas");
  const [newCampusOwnership, setNewCampusOwnership] = useState("Swasta");
  const [newCampusWebsite, setNewCampusWebsite] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const docs = docsByMode[mode];
  const activeDoc = docs.find(d => d.id === selectedDoc) || docs[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, campuses, mode, selected: selectedDoc }));
  }, [form, campuses, mode, selectedDoc]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredCampuses = campuses.filter(c =>
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase())) &&
    (cityFilter === "Semua Kabupaten/Kota" || c.city === cityFilter)
  );
  const cities = ["Semua Kabupaten/Kota", ...Array.from(new Set(campuses.map(c => c.city))).sort()];
  const update = (key: keyof FormState, value: string) => setForm(old => ({ ...old, [key]: value }));
  const changeMode = (value: Mode) => {
    setMode(value);
    setSelectedDoc(docsByMode[value][0].id);
    setTab("Core");
  };
  const chooseCampus = (id: string) => {
    const c = campuses.find(item => item.id === id);
    if (!c) { update("campusId", ""); return; }
    setForm(old => ({ ...old, campusId: c.id, campusName: c.name, campusAddress: c.address, campusWebsite: c.website }));
    setToast("Data kampus diterapkan ke form");
  };
  const randomize = () => {
    const names = ["Nadia Pratama", "Raka Mahendra", "Sinta Permata", "Bima Saputra", "Ayu Lestari"];
    const personName = names[Math.floor(Math.random() * names.length)];
    setForm(old => ({ ...old, personName, personId: `DEMO-${Math.floor(1000 + Math.random() * 8999)}`, email: "contoh@example.test", note: "DATA SINTETIS — BUKAN DOKUMEN RESMI" }));
    setToast("Data sintetis diperbarui");
  };
  const addCampus = () => {
    const name = newCampusName.trim();
    if (!name) { setToast("Nama kampus wajib diisi"); return; }
    if (campuses.some(c => c.name.toLowerCase() === name.toLowerCase())) { setToast("Nama kampus sudah ada"); return; }
    const campus: Campus = {
      id: `custom-${Date.now()}`, name, city: newCampusCity, type: newCampusType,
      ownership: newCampusOwnership, address: `${newCampusCity}, Kalimantan Barat`,
      website: newCampusWebsite.trim(), verification: "Seed - perlu verifikasi"
    };
    setCampuses(old => [...old, campus]);
    setNewCampusName(""); setNewCampusWebsite("");
    chooseCampus(campus.id);
    setToast("Kampus ditambahkan; verifikasi data sebelum penggunaan resmi");
  };
  const documentHtml = (doc: Doc) => {
    const title = doc.title.toUpperCase();
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      @page { size: ${paper} ${orientation.toLowerCase()}; margin: 18mm; }
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1d2433;margin:0;padding:28px;font-size:12px}
      .mark{position:fixed;top:43%;left:4%;width:92%;text-align:center;transform:rotate(-25deg);font-size:38px;font-weight:800;letter-spacing:5px;color:rgba(220,38,38,.13);z-index:0}
      .content{position:relative;z-index:1}.top{text-align:center;border-bottom:2px solid ${accent};padding-bottom:15px;margin-bottom:24px}
      .top h2{font-size:17px;margin:0 0 7px}.top p{margin:4px 0;color:#4b5563}.badge{display:inline-block;border:1px solid #dc2626;color:#b91c1c;padding:5px 9px;font-weight:bold;font-size:10px;letter-spacing:1px}
      h1{text-align:center;font-size:18px;margin:20px 0;color:${accent}}.line{height:1px;background:#d1d5db;margin:14px 0}
      table{width:100%;border-collapse:collapse;margin-top:20px}td{border:1px solid #d1d5db;padding:9px}td:first-child{width:34%;background:#f3f4f6;font-weight:bold}
      .foot{margin-top:42px;border-top:1px solid #d1d5db;padding-top:10px;font-size:10px;color:#6b7280}
      </style></head><body><div class="mark">DEMO • SAMPLE</div><div class="content">
      <div class="top"><h2>${escapeHtml(form.campusName || "Contoh Organisasi")}</h2><p>${escapeHtml(form.campusAddress)}</p><p>${escapeHtml(form.campusWebsite)}</p><div class="badge">DOKUMEN CONTOH — BUKAN DOKUMEN RESMI</div></div>
      <h1>${escapeHtml(title)}</h1><p style="text-align:center">${escapeHtml(doc.subtitle)}</p><div class="line"></div>
      <p>Dokumen ini dibuat untuk keperluan demonstrasi antarmuka dan pengujian template.</p>
      <table><tr><td>Nama</td><td>${escapeHtml(form.personName)}</td></tr><tr><td>ID Demo</td><td>${escapeHtml(form.personId)}</td></tr><tr><td>Program / Posisi</td><td>${escapeHtml(form.program)}</td></tr><tr><td>Fakultas / Unit</td><td>${escapeHtml(form.department)}</td></tr><tr><td>Email</td><td>${escapeHtml(form.email)}</td></tr><tr><td>Tanggal</td><td>${escapeHtml(form.issueDate)}</td></tr><tr><td>Catatan</td><td>${escapeHtml(form.note)}</td></tr></table>
      <div class="foot">DEMO / SAMPLE • Data contoh sintetis • Tidak membuktikan status mahasiswa, pegawai, atau kelayakan resmi.</div></div></body></html>`;
  };
  const downloadPdf = async (doc: Doc) => {
    const pdf = new jsPDF({ orientation: orientation.toLowerCase() as "portrait" | "landscape", unit: "mm", format: paper.toLowerCase() });
    const margin = 18; const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setTextColor(190, 30, 45); pdf.setFontSize(11); pdf.text("DEMO / SAMPLE — BUKAN DOKUMEN RESMI", pageWidth / 2, 12, { align: "center" });
    pdf.setTextColor(30, 40, 60); pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
    const campusLines = pdf.splitTextToSize(form.campusName || "Contoh Organisasi", pageWidth - margin * 2);
    pdf.text(campusLines, pageWidth / 2, 28, { align: "center" });
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(form.campusAddress, pageWidth - margin * 2), pageWidth / 2, 38, { align: "center" });
    pdf.setDrawColor(37, 99, 235); pdf.line(margin, 47, pageWidth - margin, 47);
    pdf.setTextColor(37, 99, 235); pdf.setFont("helvetica", "bold"); pdf.setFontSize(14);
    pdf.text(doc.title.toUpperCase(), pageWidth / 2, 61, { align: "center" });
    pdf.setTextColor(50, 60, 75); pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
    const rows = [["Nama", form.personName], ["ID Demo", form.personId], ["Program / Posisi", form.program], ["Fakultas / Unit", form.department], ["Email", form.email], ["Tanggal", form.issueDate], ["Catatan", form.note]];
    let y = 80;
    rows.forEach(([label, value]) => {
      pdf.setFont("helvetica", "bold"); pdf.text(label, margin, y);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(value || "-", pageWidth - margin * 2 - 48);
      pdf.text(lines, margin + 48, y);
      y += Math.max(9, lines.length * 5) + 3;
      pdf.setDrawColor(220, 224, 230); pdf.line(margin, y - 2, pageWidth - margin, y - 2);
    });
    pdf.setTextColor(190, 30, 45); pdf.setFontSize(9);
    pdf.text("Data sintetis untuk demo. Tidak membuktikan status atau kelayakan resmi.", pageWidth / 2, pdf.internal.pageSize.getHeight() - 12, { align: "center" });
    pdf.save(`${doc.id}-sample.pdf`);
    setToast("PDF berhasil dibuat");
  };
  const downloadZip = async () => {
    const zip = new JSZip();
    docs.forEach(doc => zip.file(`${doc.id}-sample.html`, documentHtml(doc)));
    zip.file("workspace.json", JSON.stringify({ mode, form, paper, orientation, exportedAt: new Date().toISOString(), label: "DEMO / SAMPLE" }, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "documentflow-samples.zip");
    setToast("ZIP dokumen contoh berhasil dibuat");
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ mode, form, campuses, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    saveAs(blob, "documentflow-workspace.json");
  };
  const exportCsv = () => {
    const rows = [["id", "name", "city", "type", "ownership", "address", "website", "verification"], ...campuses.map(c => [c.id, c.name, c.city, c.type, c.ownership, c.address, c.website, c.verification])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    saveAs(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), "kampus-kalimantan-barat.csv");
  };
  const importCsv = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parse = (line: string) => line.split(",").map(v => v.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    const headers = parse(lines[0]).map(h => h.toLowerCase());
    const required = ["name", "city"];
    if (!required.every(k => headers.includes(k))) { setToast("CSV wajib memiliki kolom name dan city"); return; }
   const imported: Campus[] = lines.slice(1).map((line, i): Campus => {
  const values = parse(line); const get = (key: string) => values[headers.indexOf(key)] || "";
  return { id: get("id") || `import-${Date.now()}-${i}`, name: get("name"), city: get("city"), type: get("type") || "Belum ditentukan", ownership: get("ownership") || "Belum ditentukan", address: get("address") || get("city"), website: get("website"), verification: "Seed - perlu verifikasi" as const };
}).filter(c => c.name && c.city);
    setCampuses(old => {
      const names = new Set(old.map(c => c.name.toLowerCase()));
      return [...old, ...imported.filter(c => !names.has(c.name.toLowerCase()))];
    });
    setToast(`${imported.length} baris CSV diperiksa; duplikat dilewati`);
  };
  const deleteCampus = (id: string) => {
    if (!window.confirm("Hapus kampus ini dari daftar lokal?")) return;
    setCampuses(old => old.filter(c => c.id !== id));
    if (form.campusId === id) setForm(old => ({ ...old, campusId: "" }));
  };
  const visibleDocs = docs.filter(d => d.category === tab);
  const selectedVisible = visibleDocs.some(d => d.id === selectedDoc) ? selectedDoc : (visibleDocs[0]?.id || docs[0].id);
  useEffect(() => {
    if (selectedVisible !== selectedDoc) setSelectedDoc(selectedVisible);
  }, [selectedVisible, selectedDoc]);

  return <div className="app-shell">
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">{sidebarOpen ? <X size={17}/> : <Menu size={17}/>}</button>
      <div className="toolbar-group"><span className="toolbar-label">Mode:</span>
        {(["Student", "Teacher", "Custom"] as Mode[]).map(m => <button key={m} className={`toolbar-btn ${mode === m ? "active" : ""}`} onClick={() => changeMode(m)}>{m}</button>)}
      </div>
      <span className="toolbar-divider"/>
      <div className="toolbar-group"><span className="toolbar-label">Stitch:</span>
        <button className={`toolbar-btn ${layout === "Grid" ? "selected" : ""}`} onClick={() => setLayout("Grid")}><Grid2X2 size={14}/> Grid</button>
        <button className={`toolbar-btn ${layout === "Horizontal" ? "selected" : ""}`} onClick={() => setLayout("Horizontal")}><AlignHorizontalJustifyCenter size={14}/> Horizontal</button>
      </div>
      <span className="toolbar-divider"/>
      <button className="download-btn" onClick={downloadZip}><Download size={15}/> Download ZIP</button>
      <span className="toolbar-divider"/>
      <div className="toolbar-group singles"><span className="toolbar-label">Single:</span>
        {docs.map(doc => <button key={doc.id} className={`toolbar-btn ${selectedDoc === doc.id ? "active" : ""}`} onClick={() => { setSelectedDoc(doc.id); setTab(doc.category as "Core" | "Extra" | "ID"); }}>{doc.title.split(" ")[0]}</button>)}
      </div>
      <button className="icon-btn" title="Ekspor workspace JSON" onClick={exportJson}><FileJson size={17}/></button>
    </header>

    <div className="main-layout">
      {sidebarOpen && <aside className="sidebar">
        <div className="sidebar-heading"><h2>Input Data</h2><button className="small-purple" onClick={randomize}><RotateCcw size={13}/> Randomize</button></div>
        <div className="upload-row">
          <button className="upload-tile" onClick={() => logoInput.current?.click()}><Upload size={17}/><span>Logo Kampus</span><small>Opsional</small></button>
          <button className="upload-tile" onClick={() => fileInput.current?.click()}><Users size={17}/><span>Foto Profil</span><small>Opsional</small></button>
          <input ref={logoInput} type="file" accept="image/*" hidden onChange={() => setToast("Logo dipilih untuk sesi ini; fitur penyematan logo dapat ditambahkan berikutnya")}/>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={() => setToast("Foto dipilih untuk sesi ini; fitur penyematan foto dapat ditambahkan berikutnya")}/>
        </div>

        <section className="form-section">
          <div className="section-title"><Building2 size={15}/> University / Campus Info</div>
          <label className="field"><span>Cari kampus</span><div className="search-wrap"><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama atau kabupaten/kota"/></div></label>
          <label className="field"><span>Filter Kabupaten/Kota</span><select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>{cities.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="field"><span>Pilih kampus</span><select value={form.campusId} onChange={e => chooseCampus(e.target.value)}><option value="">Pilih dari database</option>{filteredCampuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          {form.campusId && <div className="verify-note"><AlertCircle size={13}/> Data seed perlu diverifikasi melalui sumber resmi.</div>}
          <label className="field"><span>Nama Perguruan Tinggi</span><input value={form.campusName} onChange={e => update("campusName", e.target.value)}/></label>
          <label className="field"><span>Alamat Kampus</span><input value={form.campusAddress} onChange={e => update("campusAddress", e.target.value)}/></label>
          <label className="field"><span>Website Resmi</span><input value={form.campusWebsite} onChange={e => update("campusWebsite", e.target.value)} placeholder="https://"/></label>
          <button className="outline-btn full" onClick={() => setShowCampusManager(v => !v)}><Plus size={14}/> Kelola Database Kampus <ChevronDown size={14}/></button>
          {showCampusManager && <div className="campus-manager">
            <h3>Tambah Kampus</h3>
            <label className="field"><span>Nama Kampus</span><input value={newCampusName} onChange={e => setNewCampusName(e.target.value)} placeholder="Nama perguruan tinggi"/></label>
            <label className="field"><span>Kabupaten/Kota</span><select value={newCampusCity} onChange={e => setNewCampusCity(e.target.value)}>{cities.filter(c => c !== "Semua Kabupaten/Kota").map(c => <option key={c}>{c}</option>)}{!cities.includes("Kota Singkawang") && <option>Kota Singkawang</option>}{!cities.includes("Kabupaten Landak") && <option>Kabupaten Landak</option>}</select></label>
            <label className="field"><span>Jenis</span><select value={newCampusType} onChange={e => setNewCampusType(e.target.value)}>{["Universitas","Institut","Sekolah Tinggi","Politeknik","Akademi","Perguruan Tinggi Keagamaan"].map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="field"><span>Status</span><select value={newCampusOwnership} onChange={e => setNewCampusOwnership(e.target.value)}><option>Negeri</option><option>Swasta</option><option>Belum diketahui</option></select></label>
            <label className="field"><span>Website</span><input value={newCampusWebsite} onChange={e => setNewCampusWebsite(e.target.value)} placeholder="https://"/></label>
            <button className="primary-btn full" onClick={addCampus}><Plus size={14}/> Tambahkan</button>
            <div className="campus-list-head"><b>Data lokal ({filteredCampuses.length})</b><button className="text-btn" onClick={exportCsv}><FileSpreadsheet size={13}/> CSV</button></div>
            <div className="campus-list">{filteredCampuses.map(c => <div className="campus-item" key={c.id}><div><strong>{c.name}</strong><small>{c.city} · {c.verification}</small></div><button className="icon-btn danger" onClick={() => deleteCampus(c.id)} title="Hapus kampus"><Trash2 size={14}/></button></div>)}</div>
            <label className="outline-btn full import-btn"><Upload size={14}/> Import CSV<input type="file" accept=".csv,text/csv" onChange={e => void importCsv(e.target.files?.[0])}/></label>
          </div>}
        </section>

        <section className="form-section">
          <div className="section-title"><Users size={15}/>{mode === "Teacher" ? "Teacher Info" : mode === "Student" ? "Student Info" : "Document Owner"}</div>
          <label className="field"><span>Nama Lengkap</span><input value={form.personName} onChange={e => update("personName", e.target.value)}/></label>
          <label className="field"><span>{mode === "Teacher" ? "Employee ID (demo)" : "Student ID (demo)"}</span><input value={form.personId} onChange={e => update("personId", e.target.value)}/></label>
          <label className="field"><span>Program / Posisi</span><input value={form.program} onChange={e => update("program", e.target.value)}/></label>
          <label className="field"><span>Fakultas / Unit</span><input value={form.department} onChange={e => update("department", e.target.value)}/></label>
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={e => update("email", e.target.value)}/></label>
          <label className="field"><span>Tanggal Dokumen</span><input type="date" value={form.issueDate} onChange={e => update("issueDate", e.target.value)}/></label>
          <label className="field"><span>Catatan</span><textarea value={form.note} onChange={e => update("note", e.target.value)} rows={3}/></label>
        </section>

        <section className="form-section">
          <div className="section-title"><Settings2 size={15}/> Document Settings</div>
          <label className="field"><span>Warna Aksen</span><div className="color-row"><input type="color" value={accent} onChange={e => setAccent(e.target.value)}/><code>{accent}</code></div></label>
          <label className="field"><span>Ukuran Kertas</span><select value={paper} onChange={e => setPaper(e.target.value as "A4" | "Letter")}><option>A4</option><option>Letter</option></select></label>
          <label className="field"><span>Orientasi</span><select value={orientation} onChange={e => setOrientation(e.target.value as "Portrait" | "Landscape")}><option>Portrait</option><option>Landscape</option></select></label>
          <div className="settings-actions"><button className="outline-btn" onClick={() => { setForm({ ...blankForm }); setToast("Form dikembalikan ke data contoh"); }}><RotateCcw size={14}/> Reset</button><button className="primary-btn" onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, campuses, mode, selected: selectedDoc })); setToast("Workspace tersimpan di browser"); }}><Save size={14}/> Simpan</button></div>
          <div className="export-actions"><button onClick={exportJson}><FileJson size={14}/> JSON</button><button onClick={exportCsv}><FileSpreadsheet size={14}/> CSV Kampus</button></div>
        </section>
        <div className="sidebar-footer"><CheckCircle2 size={14}/> Autosave aktif · Penyimpanan lokal</div>
      </aside>}

      <main className="workspace">
        <div className="workspace-top">
          <div className="document-tabs">
            {(["Core", "Extra", "ID"] as const).map(t => <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>{t === "Core" ? `Core Documents (${docs.filter(d => d.category === "Core").length})` : t === "Extra" ? `Extra Documents (${docs.filter(d => d.category === "Extra").length})` : "ID Card Preview"}</button>)}
          </div>
          <div className="workspace-actions"><span className="demo-pill">DEMO WORKSPACE</span><button className="icon-btn" onClick={() => window.print()} title="Print"><Printer size={16}/></button><button className="icon-btn" onClick={() => void downloadPdf(activeDoc)} title="Download PDF"><Download size={16}/></button></div>
        </div>
        <div className={`canvas ${layout === "Horizontal" ? "horizontal" : "grid"} ${orientation === "Landscape" ? "landscape-mode" : ""}`}>
          {visibleDocs.map(doc => <article className={`paper-wrap ${selectedDoc === doc.id ? "chosen" : ""}`} key={doc.id} onClick={() => setSelectedDoc(doc.id)}>
            <div className="paper-label">{doc.title}</div>
            <div className="paper-zoom" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              <div className={`paper ${orientation.toLowerCase()} ${doc.category === "ID" ? "id-paper" : ""}`} style={{ "--accent": accent } as React.CSSProperties}>
                {doc.category === "ID" ? <div className="id-card-content">
                  <div className="id-card-band"></div><div className="sample-stamp">DEMO ID</div>
                  <div className="id-campus">{form.campusName}</div><div className="id-subtitle">SAMPLE IDENTIFICATION CARD</div>
                  <div className="id-avatar"><Users size={32}/></div><h3>{form.personName}</h3><p>{form.program}</p><p>{form.personId}</p><div className="id-watermark">SAMPLE • NOT VALID FOR IDENTIFICATION</div>
                </div> : <div className="paper-content">
                  <div className="paper-header"><div className="paper-logo"><GraduationCap size={25}/></div><h2>{form.campusName || "Contoh Organisasi"}</h2><p>{form.campusAddress}</p>{form.campusWebsite && <p>{form.campusWebsite}</p>}<span className="sample-stamp">DEMO / SAMPLE</span></div>
                  <div className="paper-title"><h1>{doc.title}</h1><p>{doc.subtitle}</p></div>
                  <p className="paper-intro">Dokumen contoh untuk demonstrasi aplikasi dan pengujian template. Data di bawah ini bersifat sintetis.</p>
                  <div className="paper-table">
                    {[["Nama",form.personName],["ID Demo",form.personId],["Program / Posisi",form.program],["Fakultas / Unit",form.department],["Email",form.email],["Tanggal",form.issueDate],["Catatan",form.note]].map(([k,v]) => <div className="paper-row" key={k}><b>{k}</b><span>{v}</span></div>)}
                  </div>
                  {doc.id === "tuition" && <div className="sample-total"><span>CONTOH TOTAL</span><b>Rp 0</b><small>Angka simulasi</small></div>}
                  {doc.id === "transcript" && <table className="sample-table"><thead><tr><th>Kode</th><th>Mata Kuliah Contoh</th><th>Nilai</th></tr></thead><tbody><tr><td>DEMO01</td><td>Contoh Mata Kuliah</td><td>—</td></tr><tr><td>DEMO02</td><td>Contoh Praktikum</td><td>—</td></tr></tbody></table>}
                  <div className="paper-footer"><span>DEMO / SAMPLE — BUKAN DOKUMEN RESMI</span><span>Halaman 1</span></div>
                </div>}
              </div>
            </div>
          </article>)}
          {visibleDocs.length === 0 && <div className="empty-state"><FileText
