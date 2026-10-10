export type Campus = {
  id: string;
  name: string;
  city: string;
  type: string;
  ownership: string;
  address: string;
  website: string;
  verification: string;
};

export const initialCampuses: Campus[] = [
  { id: "kalbar-001", name: "Universitas Tanjungpura", city: "Kota Pontianak", type: "Universitas", ownership: "Negeri", address: "Pontianak, Kalimantan Barat", website: "https://untan.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-002", name: "Politeknik Negeri Pontianak", city: "Kota Pontianak", type: "Politeknik", ownership: "Negeri", address: "Pontianak, Kalimantan Barat", website: "https://www.polnep.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-003", name: "IAIN Pontianak", city: "Kota Pontianak", type: "Perguruan Tinggi Keagamaan", ownership: "Negeri", address: "Pontianak, Kalimantan Barat", website: "https://iainptk.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-004", name: "Universitas Muhammadiyah Pontianak", city: "Kota Pontianak", type: "Universitas", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "https://unmuhpnk.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-005", name: "Universitas Panca Bhakti", city: "Kota Pontianak", type: "Universitas", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "https://upb.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-006", name: "Universitas OSO", city: "Kota Pontianak", type: "Universitas", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "https://universitasoso.ac.id/", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-007", name: "Universitas Nahdlatul Ulama Kalimantan Barat", city: "Kabupaten Kubu Raya", type: "Universitas", ownership: "Swasta", address: "Kubu Raya, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-008", name: "Universitas Kapuas", city: "Kabupaten Sintang", type: "Universitas", ownership: "Swasta", address: "Sintang, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-009", name: "Universitas Katolik Santo Agustinus Hippo", city: "Kabupaten Landak", type: "Universitas", ownership: "Swasta", address: "Landak, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-010", name: "Politeknik Tonggak Equator", city: "Kota Pontianak", type: "Politeknik", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-011", name: "Sekolah Tinggi Ilmu Ekonomi Indonesia Pontianak", city: "Kota Pontianak", type: "Sekolah Tinggi", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" },
  { id: "kalbar-012", name: "Sekolah Tinggi Manajemen Informatika dan Komputer Pontianak", city: "Kota Pontianak", type: "Sekolah Tinggi", ownership: "Swasta", address: "Pontianak, Kalimantan Barat", website: "", verification: "Seed - perlu verifikasi" }
];
