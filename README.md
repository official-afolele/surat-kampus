# DocumentFlow Pro — Afolele

Aplikasi editor dokumen berbasis React + TypeScript + Vite yang dapat dipasang di Vercel.

## Fitur
- Layout editor: toolbar, sidebar input, preview dokumen, zoom, dan pilihan mode Student/Teacher/Custom.
- Data kampus Kalimantan Barat sebagai seed awal (contoh yang perlu diverifikasi).
- Auto-fill informasi kampus ke editor.
- Template dokumen contoh dengan watermark DEMO / SAMPLE.
- Edit metadata, tema, orientasi, dan ukuran kertas.
- Simpan workspace di browser melalui localStorage.
- Export PDF, ZIP, JSON, dan CSV.
- Print, pencarian kampus, filter kabupaten/kota, dan tambah kampus.
- Responsive desktop/tablet/mobile.

## Jalankan lokal
1. Pasang Node.js 20 atau versi LTS yang kompatibel.
2. Ekstrak ZIP.
3. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Buka URL lokal yang ditampilkan Vite.

## Build
```bash
npm run build
npm run preview
```

## Deploy ke Vercel
1. Unggah folder proyek ke repository GitHub.
2. Buka https://vercel.com/new dan impor repository.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

File `vercel.json` sudah disertakan.

## Catatan penting
- Data kampus dalam seed merupakan titik awal, bukan direktori resmi yang lengkap. Periksa situs kampus/PDDikti sebelum menggunakan data sebagai sumber resmi.
- Penyimpanan saat ini berada di browser pengguna. Data tidak otomatis tersinkron ke perangkat lain.
- Export dokumen contoh selalu menyertakan watermark DEMO / SAMPLE. Jangan gunakan template ini untuk menyamar sebagai dokumen resmi atau bukti kelayakan dari institusi.
- Untuk penggunaan multi-user, tambahkan backend/database dan autentikasi yang aman.
