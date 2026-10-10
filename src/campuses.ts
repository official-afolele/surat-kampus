export type InstitutionType =
  | "Universitas"
  | "Institut"
  | "Sekolah Tinggi"
  | "Politeknik"
  | "Akademi"
  | "Perguruan Tinggi Keagamaan";

export type Ownership = "Negeri" | "Swasta";

export type EducationLevel = "D3" | "D4" | "S1" | "S2" | "S3" | "Profesi" | "Spesialis";

export type VerificationStatus = "BELUM DIVERIFIKASI" | "Terverifikasi";

export type StudyProgram = {
  id: string;
  name: string;
  level: EducationLevel;
  accreditation?: string;
};

export type Faculty = {
  id: string;
  name: string;
  studyPrograms: StudyProgram[];
};

export type Campus = {
  id: string;
  officialCode?: string;
  name: string;
  province: string;
  regency: string;
  institutionType: InstitutionType;
  ownership: Ownership;
  officialAddress?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  faculties: Faculty[];
  educationLevels: EducationLevel[];
  sourceUrl?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const PROVINCE_DEFAULT = "Kalimantan Barat";

export const REGENCIES = [
  "Kota Pontianak",
  "Kota Singkawang",
  "Kabupaten Kubu Raya",
  "Kabupaten Mempawah",
  "Kabupaten Sambas",
  "Kabupaten Bengkayang",
  "Kabupaten Landak",
  "Kabupaten Sanggau",
  "Kabupaten Sekadau",
  "Kabupaten Sintang",
  "Kabupaten Melawi",
  "Kabupaten Kapuas Hulu",
  "Kabupaten Ketapang",
  "Kabupaten Kayong Utara",
] as const;

export const INSTITUTION_TYPES: InstitutionType[] = [
  "Universitas",
  "Institut",
  "Sekolah Tinggi",
  "Politeknik",
  "Akademi",
  "Perguruan Tinggi Keagamaan",
];

export const OWNERSHIPS: Ownership[] = ["Negeri", "Swasta"];

export const EDUCATION_LEVELS: EducationLevel[] = ["D3", "D4", "S1", "S2", "S3", "Profesi", "Spesialis"];

const now = "2026-10-10T00:00:00.000Z";

export const initialCampuses: Campus[] = [
  {
    id: "kalbar-untan",
    officialCode: "",
    name: "Universitas Tanjungpura",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Universitas",
    ownership: "Negeri",
    officialAddress: "Jalan Prof. Dr. H. Hadari Nawawi, Pontianak",
    postalCode: "78124",
    phone: "",
    email: "",
    website: "https://untan.ac.id/",
    logoUrl: "",
    faculties: [
      {
        id: "untan-f-hukum",
        name: "Fakultas Hukum",
        studyPrograms: [
          { id: "untan-fh-s1", name: "Ilmu Hukum", level: "S1" },
        ],
      },
      {
        id: "untan-f-ekonomi",
        name: "Fakultas Ekonomi dan Bisnis",
        studyPrograms: [
          { id: "untan-feb-s1-ak", name: "Akuntansi", level: "S1" },
          { id: "untan-feb-s1-mj", name: "Manajemen", level: "S1" },
          { id: "untan-feb-s1-ep", name: "Ekonomi Pembangunan", level: "S1" },
        ],
      },
      {
        id: "untan-f-teknik",
        name: "Fakultas Teknik",
        studyPrograms: [
          { id: "untan-ft-s1-ts", name: "Teknik Sipil", level: "S1" },
          { id: "untan-ft-s1-tm", name: "Teknik Mesin", level: "S1" },
          { id: "untan-ft-s1-te", name: "Teknik Elektro", level: "S1" },
          { id: "untan-ft-s1-ti", name: "Teknik Informatika", level: "S1" },
        ],
      },
      {
        id: "untan-f-keguruan",
        name: "Fakultas Keguruan dan Ilmu Pendidikan",
        studyPrograms: [
          { id: "untan-fkip-s1-pgsd", name: "Pendidikan Guru Sekolah Dasar", level: "S1" },
          { id: "untan-fkip-s1-pbi", name: "Pendidikan Bahasa Inggris", level: "S1" },
        ],
      },
    ],
    educationLevels: ["S1", "S2", "S3", "Profesi"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-polnep",
    name: "Politeknik Negeri Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Politeknik",
    ownership: "Negeri",
    officialAddress: "Jalan Jenderal Ahmad Yani, Pontianak",
    postalCode: "",
    phone: "",
    email: "",
    website: "https://www.polnep.ac.id/",
    logoUrl: "",
    faculties: [],
    educationLevels: ["D3", "D4"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-iain-ptk",
    name: "UIN Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Perguruan Tinggi Keagamaan",
    ownership: "Negeri",
    officialAddress: "Jalan Letnan Jenderal Soeprapto, Pontianak",
    postalCode: "",
    phone: "",
    email: "",
    website: "https://iainptk.ac.id/",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1", "S2", "S3"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-unmuh-ptk",
    name: "Universitas Muhammadiyah Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "Jalan Jenderal Ahmad Yani, Pontianak",
    postalCode: "",
    phone: "",
    email: "",
    website: "https://unmuhpnk.ac.id/",
    logoUrl: "",
    faculties: [],
    educationLevels: ["D3", "S1", "S2"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-upb",
    name: "Universitas Panca Bhakti",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "Jalan Jenderal Ahmad Yani, Pontianak",
    postalCode: "",
    phone: "",
    email: "",
    website: "https://upb.ac.id/",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1", "S2"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-uwd",
    name: "Universitas Widya Dharma Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "Jalan Hos Cokroaminoto, Pontianak",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-unu-kr",
    name: "Universitas Nahdlatul Ulama Kalimantan Barat",
    province: PROVINCE_DEFAULT,
    regency: "Kabupaten Kubu Raya",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-unka",
    name: "Universitas Kapuas",
    province: PROVINCE_DEFAULT,
    regency: "Kabupaten Sintang",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-usta",
    name: "Universitas Katolik Santo Agustinus Hippo",
    province: PROVINCE_DEFAULT,
    regency: "Kabupaten Landak",
    institutionType: "Universitas",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-politek-tonggak",
    name: "Politeknik Tonggak Equator",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Politeknik",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["D3"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-stie-ptk",
    name: "STIE Indonesia Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Sekolah Tinggi",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "kalbar-stmik-ptk",
    name: "STMIK Pontianak",
    province: PROVINCE_DEFAULT,
    regency: "Kota Pontianak",
    institutionType: "Sekolah Tinggi",
    ownership: "Swasta",
    officialAddress: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    faculties: [],
    educationLevels: ["S1"],
    sourceUrl: "https://pddikti.kemdikbud.go.id/",
    verificationStatus: "BELUM DIVERIFIKASI",
    lastVerifiedAt: "",
    createdAt: now,
    updatedAt: now,
  },
];
