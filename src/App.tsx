import { useEffect, useMemo, useRef, useState } from "react";
import {
  GraduationCap, Users, Grid2X2, AlignHorizontalJustifyCenter, Download,
  FileText, Search, Plus, RotateCcw, Upload, ChevronDown,
  ZoomIn, ZoomOut, Maximize, Printer, Save, Settings2, Menu, X, Building2,
  CheckCircle2, AlertCircle, Eye, Trash2, FileJson, FileSpreadsheet,
  Edit3, RefreshCw, Info
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import {
  initialCampuses,
  PROVINCE_DEFAULT,
  REGENCIES,
  INSTITUTION_TYPES,
  OWNERSHIPS,
  EDUCATION_LEVELS,
  type Campus,
  type Faculty,
  type StudyProgram,
  type EducationLevel,
  type InstitutionType,
  type Ownership,
} from "./campuses";

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

const STORAGE_KEY = "documentflow-pro-v2";

function readSaved(): { form?: FormState; campuses?: Campus[]; mode?: Mode; selected?: string } | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");

  // campus selector state
  const [selProvince] = useState(PROVINCE_DEFAULT);
  const [selRegency, setSelRegency] = useState<string>("");
  const [selCampusId, setSelCampusId] = useState<string>("");
  const [selFacultyId, setSelFacultyId] = useState<string>("");
  const [selProgramId, setSelProgramId] = useState<string>("");

  // form info
  const [formFaculty, setFormFaculty] = useState<string>("");
  const [formProgram, setFormProgram] = useState<string>("");

  // campus management
  const [showManager, setShowManager] = useState(false);
  const [managerQuery, setManagerQuery] = useState("");
  const [managerRegency, setManagerRegency] = useState<string>("Semua");
  const [managerOwnership, setManagerOwnership] = useState<string>("Semua");
  const [managerType, setManagerType] = useState<string>("Semua");
  const [managerSort, setManagerSort] = useState<"az" | "za">("az");
  const [managerPage, setManagerPage] = useState(1);
  const [showDetail, setShowDetail] = useState<Campus | null>(null);
  const [editCampus, setEditCampus] = useState<Campus | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);

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

  const pushHistory = (msg: string) => {
    setHistory(h => [`${new Date().toISOString()} — ${msg}`, ...h].slice(0, 50));
  };

  const update = (key: keyof FormState, value: string) => setForm(old => ({ ...old, [key]: value }));

  const changeMode = (value: Mode) => {
    setMode(value);
    setSelectedDoc(docsByMode[value][0].id);
    setTab("Core");
  };

  // dropdown bertingkat
  const campusesInRegency = campuses.filter(c => !selRegency || c.regency === selRegency);
  const selectedCampus = campuses.find(c => c.id === selCampusId) || null;
  const faculties = selectedCampus?.faculties || [];
  const studyPrograms = faculties.find(f => f.id === selFacultyId)?.studyPrograms || [];
  const selectedProgram = studyPrograms.find(p => p.id === selProgramId) || null;

  const chooseCampus = (id: string) => {
    setSelCampusId(id);
    setSelFacultyId("");
    setSelProgramId("");
    setFormFaculty("");
    setFormProgram("");
    const c = campuses.find(item => item.id === id);
    if (!c) {
      setForm(old => ({ ...old, campusId: "", campusName: "", campusAddress: "", campusWebsite: "" }));
      return;
    }
    setForm(old => ({
      ...old,
      campusId: c.id,
      campusName: c.name,
      campusAddress: c.officialAddress || `${c.regency}, ${c.province}`,
      campusWebsite: c.website || "",
    }));
    pushHistory(`Pilih kampus: ${c.name}`);
    setToast("Data kampus diterapkan ke form");
  };

  const chooseFaculty = (id: string) => {
    setSelFacultyId(id);
    setSelProgramId("");
    const f = faculties.find(x => x.id === id);
    if (f) {
      setFormFaculty(f.name);
      update("department", f.name);
    }
    setFormProgram("");
    update("program", "");
  };

  const chooseProgram = (id: string) => {
    setSelProgramId(id);
    const p = studyPrograms.find(x => x.id === id);
    if (p) {
      setFormProgram(p.name);
      update("program", p.name);
    }
  };

  const resetSelection = () => {
    setSelRegency("");
    setSelCampusId("");
    setSelFacultyId("");
    setSelProgramId("");
    setFormFaculty("");
    setFormProgram("");
    setForm(old => ({ ...old, campusId: "", campusName: "", campusAddress: "", campusWebsite: "" }));
    setToast("Pilihan kampus direset");
  };

  const syncCampus = () => {
    if (!selectedCampus) { setToast("Pilih kampus dulu"); return; }
    setForm(old => ({
      ...old,
      campusName: selectedCampus.name,
      campusAddress: selectedCampus.officialAddress || `${selectedCampus.regency}, ${selectedCampus.province}`,
      campusWebsite: selectedCampus.website || "",
    }));
    pushHistory(`Sinkron data kampus: ${selectedCampus.name}`);
    setToast("Data kampus disinkronkan dari sumber");
  };

  const addCampusToDb = (c: Campus) => {
    setCampuses(old => [...old, c]);
    pushHistory(`Tambah kampus: ${c.name}`);
  };

  const updateCampusInDb = (c: Campus) => {
    setCampuses(old => old.map(x => x.id === c.id ? { ...c, updatedAt: new Date().toISOString() } : x));
    pushHistory(`Edit kampus: ${c.name}`);
  };

  const deleteCampusFromDb = (id: string) => {
    if (!window.confirm("Hapus kampus ini dari database lokal?")) return;
    setCampuses(old => old.filter(c => c.id !== id));
    if (selCampusId === id) resetSelection();
    pushHistory(`Hapus kampus id: ${id}`);
  };

  const filteredManagerCampuses = useMemo(() => {
    let list = campuses.filter(c =>
      (managerQuery === "" || c.name.toLowerCase().includes(managerQuery.toLowerCase())) &&
      (managerRegency === "Semua" || c.regency === managerRegency) &&
      (managerOwnership === "Semua" || c.ownership === managerOwnership) &&
      (managerType === "Semua" || c.institutionType === managerType)
    );
    list = [...list].sort((a, b) => managerSort === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [campuses, managerQuery, managerRegency, managerOwnership, managerType, managerSort]);

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredManagerCampuses.length / PAGE_SIZE));
  const pagedManagerCampuses = filteredManagerCampuses.slice((managerPage - 1) * PAGE_SIZE, managerPage * PAGE_SIZE);
  useEffect(() => { setManagerPage(1); }, [managerQuery, managerRegency, managerOwnership, managerType, managerSort]);

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
    pdf.text(pdf.splitTextToSize(form.campusName || "Contoh Organisasi", pageWidth - margin * 2), pageWidth / 2, 28, { align: "center" });
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
    const header = ["id", "officialCode", "name", "province", "regency", "institutionType", "ownership", "officialAddress", "postalCode", "phone", "email", "website", "educationLevels", "verificationStatus", "lastVerifiedAt", "sourceUrl"];
    const rows = [header, ...campuses.map(c => [
      c.id, c.officialCode || "", c.name, c.province, c.regency, c.institutionType, c.ownership,
      c.officialAddress || "", c.postalCode || "", c.phone || "", c.email || "", c.website || "",
      c.educationLevels.join("|"), c.verificationStatus, c.lastVerifiedAt || "", c.sourceUrl || ""
    ])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    saveAs(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), "kampus-kalimantan-barat.csv");
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parse = (line: string) => {
      const out: string[] = [];
      let cur = ""; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
        else if (ch === "," && !inQ) { out.push(cur); cur = ""; }
        else cur += ch;
      }
      out.push(cur);
      return out.map(v => v.trim());
    };
    const header = parse(lines[0]).map(h => h.toLowerCase());
    const required = ["name", "regency", "institutiontype", "ownership"];
    if (!required.every(k => header.includes(k))) { setToast("CSV wajib memiliki kolom name, regency, institutionType, ownership"); return; }
    const imported: Campus[] = [];
    for (let i = 1; i < lines.length; i++) {
      const v = parse(lines[i]);
      const get = (k: string) => v[header.indexOf(k)] || "";
      const name = get("name");
      const regency = get("regency");
      const institutionType = get("institutiontype") as InstitutionType;
      const ownership = get("ownership") as Ownership;
      if (!name || !regency || !institutionType || !ownership) continue;
      if (campuses.some(c => c.name.toLowerCase() === name.toLowerCase())) continue;
      imported.push({
        id: get("id") || `import-${Date.now()}-${i}`,
        officialCode: get("officialcode"),
        name, regency,
        province: get("province") || PROVINCE_DEFAULT,
        institutionType, ownership,
        officialAddress: get("officialaddress"),
        postalCode: get("postalcode"),
        phone: get("phone"),
        email: get("email"),
        website: get("website"),
        logoUrl: "",
        faculties: [],
        educationLevels: (get("educationlevels").split("|").filter(Boolean) as EducationLevel[]) || [],
        sourceUrl: get("sourceurl"),
        verificationStatus: "BELUM DIVERIFIKASI",
        lastVerifiedAt: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    if (imported.length === 0) { setToast("Tidak ada baris baru yang valid"); return; }
    setCampuses(old => [...old, ...imported]);
    pushHistory(`Import CSV: ${imported.length} kampus`);
    setToast(`${imported.length} kampus diimport`);
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
      <button className="toolbar-btn" onClick={() => setShowManager(v => !v)}><Building2 size={14}/> Campus Database</button>
      <button className="icon-btn" title="Ekspor workspace JSON" onClick={exportJson}><FileJson size={17}/></button>
    </header>

    <div className="main-layout">
      {sidebarOpen && <aside className="sidebar">
        <div className="sidebar-heading"><h2>Input Data</h2></div>

        <section className="form-section">
          <div className="section-title"><Building2 size={15}/> University / Campus Info</div>

          <label className="field"><span>Provinsi</span>
            <input value={selProvince} readOnly />
          </label>

          <label className="field"><span>Kabupaten/Kota</span>
            <select value={selRegency} onChange={e => { setSelRegency(e.target.value); setSelCampusId(""); setSelFacultyId(""); setSelProgramId(""); }}>
              <option value="">Pilih kabupaten/kota</option>
              {REGENCIES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

          <label className="field"><span>Perguruan Tinggi</span>
            <select value={selCampusId} onChange={e => chooseCampus(e.target.value)}>
              <option value="">Pilih kampus</option>
              {campusesInRegency.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          {selectedCampus && <label className="field"><span>Fakultas</span>
            <select value={selFacultyId} onChange={e => chooseFaculty(e.target.value)} disabled={faculties.length === 0}>
              <option value="">{faculties.length === 0 ? "Belum ada data fakultas" : "Pilih fakultas"}</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>}

          {selectedCampus && selFacultyId && <label className="field"><span>Program Studi</span>
            <select value={selProgramId} onChange={e => chooseProgram(e.target.value)} disabled={studyPrograms.length === 0}>
              <option value="">{studyPrograms.length === 0 ? "Belum ada data prodi" : "Pilih program studi"}</option>
              {studyPrograms.map(p => <option key={p.id} value={p.id}>{p.name} ({p.level})</option>)}
            </select>
          </label>}

          {selectedCampus && <div className="verify-note"><AlertCircle size={13}/> Status data: {selectedCampus.verificationStatus}. Periksa ke sumber resmi sebelum digunakan.</div>}

          <label className="field"><span>Nama Perguruan Tinggi</span><input value={form.campusName} onChange={e => update("campusName", e.target.value)}/></label>
          <label className="field"><span>Alamat Kampus</span><input value={form.campusAddress} onChange={e => update("campusAddress", e.target.value)}/></label>
          <label className="field"><span>Website Resmi</span><input value={form.campusWebsite} onChange={e => update("campusWebsite", e.target.value)} placeholder="https://"/></label>

          <div className="settings-actions">
            <button className="outline-btn" onClick={() => setShowManager(v => !v)}><Building2 size={14}/> {showManager ? "Tutup" : "Buka"} DB</button>
            <button className="outline-btn" onClick={resetSelection}><RotateCcw size={14}/> Reset Pilihan</button>
          </div>
          <div className="settings-actions" style={{ marginTop: 6 }}>
            <button className="outline-btn" onClick={() => selectedCampus ? setShowDetail(selectedCampus) : setToast("Pilih kampus dulu")}><Info size={14}/> Lihat Detail</button>
            <button className="outline-btn" onClick={syncCampus}><RefreshCw size={14}/> Sinkronkan</button>
          </div>
          <div className="settings-actions" style={{ marginTop: 6 }}>
            <button className="outline-btn" onClick={() => selectedCampus ? setEditCampus(selectedCampus) : setToast("Pilih kampus dulu")}><Edit3 size={14}/> Edit Kampus</button>
            <button className="outline-btn" onClick={() => setEditCampus({
              id: "", name: "", province: PROVINCE_DEFAULT, regency: selRegency || REGENCIES[0],
              institutionType: "Universitas", ownership: "Swasta", officialAddress: "", postalCode: "",
              phone: "", email: "", website: "", logoUrl: "", faculties: [], educationLevels: [],
              sourceUrl: "", verificationStatus: "BELUM DIVERIFIKASI", lastVerifiedAt: "",
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            })}><Plus size={14}/> Tambah Kampus</button>
          </div>
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
          <div className="settings-actions">
            <button className="outline-btn" onClick={() => { setForm({ ...blankForm }); setToast("Form dikembalikan ke data contoh"); }}><RotateCcw size={14}/> Reset</button>
            <button className="primary-btn" onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, campuses, mode, selected: selectedDoc })); setToast("Workspace tersimpan"); }}><Save size={14}/> Simpan</button>
          </div>
          <div className="export-actions">
            <button onClick={exportJson}><FileJson size={14}/> JSON</button>
            <button onClick={exportCsv}><FileSpreadsheet size={14}/> CSV Kampus</button>
          </div>
        </section>
        <div className="sidebar-footer"><CheckCircle2 size={14}/> Autosave aktif · Penyimpanan lokal</div>
      </aside>}

      <main className="workspace">
        {showManager ? (
          <div className="manager-page">
            <div className="manager-header">
              <h2>Campus Database — Kalimantan Barat</h2>
              <div className="manager-actions">
                <button className="outline-btn" onClick={() => csvInput.current?.click()}><Upload size={14}/> Import CSV</button>
                <button className="outline-btn" onClick={exportCsv}><FileSpreadsheet size={14}/> Export CSV</button>
                <button className="outline-btn" onClick={exportJson}><FileJson size={14}/> Export JSON</button>
                <input ref={csvInput} type="file" accept=".csv,text/csv" hidden onChange={e => void importCsv(e.target.files?.[0])}/>
              </div>
            </div>

            <div className="manager-filters">
              <div className="search-wrap"><Search size={14}/><input value={managerQuery} onChange={e => setManagerQuery(e.target.value)} placeholder="Cari nama kampus"/></div>
              <select value={managerRegency} onChange={e => setManagerRegency(e.target.value)}>
                <option value="Semua">Semua Kabupaten/Kota</option>
                {REGENCIES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={managerOwnership} onChange={e => setManagerOwnership(e.target.value)}>
                <option value="Semua">Semua Status</option>
                {OWNERSHIPS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={managerType} onChange={e => setManagerType(e.target.value)}>
                <option value="Semua">Semua Jenis</option>
                {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={managerSort} onChange={e => setManagerSort(e.target.value as "az" | "za")}>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>

            <div className="manager-table">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kab/Kota</th>
                    <th>Jenis</th>
                    <th>Status</th>
                    <th>Verifikasi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedManagerCampuses.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.regency}</td>
                      <td>{c.institutionType}</td>
                      <td>{c.ownership}</td>
                      <td><span className={`badge-verif ${c.verificationStatus === "Terverifikasi" ? "ok" : "pending"}`}>{c.verificationStatus}</span></td>
                      <td className="row-actions">
                        <button className="icon-btn" onClick={() => setShowDetail(c)} title="Detail"><Eye size={14}/></button>
                        <button className="icon-btn" onClick={() => setEditCampus(c)} title="Edit"><Edit3 size={14}/></button>
                        <button className="icon-btn danger" onClick={() => deleteCampusFromDb(c.id)} title="Hapus"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                  {pagedManagerCampuses.length === 0 && <tr><td colSpan={6} className="empty">Tidak ada data yang cocok</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="manager-pagination">
              <button className="outline-btn" disabled={managerPage <= 1} onClick={() => setManagerPage(p => Math.max(1, p - 1))}>‹ Prev</button>
              <span>Halaman {managerPage} / {totalPages}</span>
              <button className="outline-btn" disabled={managerPage >= totalPages} onClick={() => setManagerPage(p => Math.min(totalPages, p + 1))}>Next ›</button>
            </div>

            {history.length > 0 && <details className="history-panel">
              <summary>Riwayat Perubahan ({history.length})</summary>
              <ul>{history.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </details>}

            <p className="source-note">Sumber utama: PDDikti (https://pddikti.kemdikbud.go.id/). Data awal ditandai BELUM DIVERIFIKASI sampai diperiksa manual.</p>
          </div>
        ) : <>
          <div className="workspace-top">
            <div className="document-tabs">
              {(["Core", "Extra", "ID"] as const).map(t => <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>{t === "Core" ? `Core Documents (${docs.filter(d => d.category === "Core").length})` : t === "Extra" ? `Extra Documents (${docs.filter(d => d.category === "Extra").length})` : "ID Card Preview"}</button>)}
            </div>
            <div className="workspace-actions"><span className="demo-pill">DEMO WORKSPACE</span><button className="icon-btn" onClick={() => window.print()} title="Print"><Printer size={16}/></button><button className="icon-btn" onClick={() => void downloadPdf(activeDoc)} title="Download PDF"><Download size={16}/></button></div>
          </div>
          <div className={`canvas ${layout === "Horizontal" ? "horizontal" : "grid"}`}>
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
                    <div className="paper-footer"><span>DEMO / SAMPLE — BUKAN DOKUMEN RESMI</span><span>Halaman 1</span></div>
                  </div>}
                </div>
              </div>
            </article>)}
            {visibleDocs.length === 0 && <div className="empty-state"><FileText size={32}/><h3>Belum ada dokumen</h3><p>Pilih kategori lain atau ubah mode.</p></div>}
          </div>
          <div className="zoom-controls"><button onClick={() => setZoom(z => Math.max(25, z - 5))} aria-label="Zoom out"><ZoomOut size={15}/></button><span>{zoom}%</span><button onClick={() => setZoom(z => Math.min(200, z + 5))} aria-label="Zoom in"><ZoomIn size={15}/></button><i/><button onClick={() => setZoom(70)} title="Fit to screen"><Maximize size={15}/></button></div>
          <div className="canvas-footer"><span><Eye size={13}/> {activeDoc.title}</span><span>{paper} · {orientation} · {layout}</span><span>{visibleDocs.length} dokumen dalam kategori</span></div>
        </>}
      </main>
    </div>

    {showDetail && <div className="modal-backdrop" onClick={() => setShowDetail(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>{showDetail.name}</h3><button className="icon-btn" onClick={() => setShowDetail(null)}><X size={16}/></button></div>
        <div className="modal-body">
          <p><b>Kabupaten/Kota:</b> {showDetail.regency}</p>
          <p><b>Provinsi:</b> {showDetail.province}</p>
          <p><b>Jenis:</b> {showDetail.institutionType}</p>
          <p><b>Status:</b> {showDetail.ownership}</p>
          <p><b>Alamat:</b> {showDetail.officialAddress || "—"}</p>
          <p><b>Kode Pos:</b> {showDetail.postalCode || "—"}</p>
          <p><b>Telepon:</b> {showDetail.phone || "—"}</p>
          <p><b>Email:</b> {showDetail.email || "—"}</p>
          <p><b>Website:</b> {showDetail.website || "—"}</p>
          <p><b>Jenjang:</b> {showDetail.educationLevels.join(", ") || "—"}</p>
          <p><b>Status Verifikasi:</b> {showDetail.verificationStatus}</p>
          <p><b>Terakhir Diverifikasi:</b> {showDetail.lastVerifiedAt || "—"}</p>
          <p><b>Sumber:</b> {showDetail.sourceUrl || "—"}</p>
          <p><b>Fakultas:</b> {showDetail.faculties.length === 0 ? "Belum ada data" : ""}</p>
          {showDetail.faculties.length > 0 && <ul>{showDetail.faculties.map(f => <li key={f.id}>{f.name} ({f.studyPrograms.length} prodi)</li>)}</ul>}
        </div>
      </div>
    </div>}

    {editCampus && <div className="modal-backdrop" onClick={() => setEditCampus(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>{editCampus.id ? "Edit Kampus" : "Tambah Kampus"}</h3><button className="icon-btn" onClick={() => setEditCampus(null)}><X size={16}/></button></div>
        <div className="modal-body">
          <label className="field"><span>Nama</span><input value={editCampus.name} onChange={e => setEditCampus({ ...editCampus, name: e.target.value })}/></label>
          <label className="field"><span>Kabupaten/Kota</span><select value={editCampus.regency} onChange={e => setEditCampus({ ...editCampus, regency: e.target.value })}>{REGENCIES.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
          <label className="field"><span>Jenis</span><select value={editCampus.institutionType} onChange={e => setEditCampus({ ...editCampus, institutionType: e.target.value as InstitutionType })}>{INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
          <label className="field"><span>Status</span><select value={editCampus.ownership} onChange={e => setEditCampus({ ...editCampus, ownership: e.target.value as Ownership })}>{OWNERSHIPS.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
          <label className="field"><span>Alamat</span><input value={editCampus.officialAddress || ""} onChange={e => setEditCampus({ ...editCampus, officialAddress: e.target.value })}/></label>
          <label className="field"><span>Website</span><input value={editCampus.website || ""} onChange={e => setEditCampus({ ...editCampus, website: e.target.value })}/></label>
          <label className="field"><span>Email</span><input value={editCampus.email || ""} onChange={e => setEditCampus({ ...editCampus, email: e.target.value })}/></label>
          <label className="field"><span>Telepon</span><input value={editCampus.phone || ""} onChange={e => setEditCampus({ ...editCampus, phone: e.target.value })}/></label>
          <label className="field"><span>Kode Pos</span><input value={editCampus.postalCode || ""} onChange={e => setEditCampus({ ...editCampus, postalCode: e.target.value })}/></label>
          <label className="field"><span>Jenjang (pisah dengan koma)</span><input value={editCampus.educationLevels.join(",")} onChange={e => setEditCampus({ ...editCampus, educationLevels: e.target.value.split(",").map(s => s.trim()).filter(Boolean) as EducationLevel[] })}/></label>
          <label className="field"><span>Sumber URL</span><input value={editCampus.sourceUrl || ""} onChange={e => setEditCampus({ ...editCampus, sourceUrl: e.target.value })}/></label>
          <label className="field"><span>Status Verifikasi</span><select value={editCampus.verificationStatus} onChange={e => setEditCampus({ ...editCampus, verificationStatus: e.target.value as "BELUM DIVERIFIKASI" | "Terverifikasi" })}><option value="BELUM DIVERIFIKASI">BELUM DIVERIFIKASI</option><option value="Terverifikasi">Terverifikasi</option></select></label>
        </div>
        <div className="modal-foot">
          <button className="outline-btn" onClick={() => setEditCampus(null)}>Batal</button>
          <button className="primary-btn" onClick={() => {
            if (!editCampus.name.trim()) { setToast("Nama kampus wajib"); return; }
            if (editCampus.id) {
              updateCampusInDb(editCampus);
            } else {
              const c: Campus = { ...editCampus, id: `custom-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
              addCampusToDb(c);
              chooseCampus(c.id);
            }
            setEditCampus(null);
            setToast("Perubahan disimpan");
          }}>Simpan</button>
        </div>
      </div>
    </div>}

    {toast && <div className="toast"><CheckCircle2 size={16}/>{toast}</div>}
  </div>;
}

export default App;
