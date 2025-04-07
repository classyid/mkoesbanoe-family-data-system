# System Data Keluarga M.Koesbanoe

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

Sistem pendataan silsilah keluarga berbasis Google Apps Script, terdiri dari formulir pendataan dan API untuk akses data keluarga M.Koesbanoe. Proyek ini memudahkan anggota keluarga untuk menambahkan data diri ke dalam database silsilah dan mengakses informasi silsilah keluarga secara terstruktur.

## 📋 Fitur Utama

![Form Data](https://blog.classy.id/upload/gambar_berita/75dc267299716ea87d51178d7bf9c46c_20250407141238.png)

### Form Data Keluarga
- Formulir multi-step untuk memudahkan pendataan
- Validasi data di sisi client dan server
- Notifikasi via email, Telegram, dan WhatsApp
- Desain responsif menggunakan Tailwind CSS
- Mode debug untuk memudahkan pengembangan

![API Data](https://blog.classy.id/upload/gambar_berita/585d8ae9d51555c899ba0ac3a1dd81cc_20250407142106.jpeg)

### API Data Keluarga
- Sistem autentikasi dengan API key
- Endpoint pencarian dan pengambilan data keluarga
- Endpoint untuk melihat struktur silsilah keluarga
- Logging akses API yang detail
- Caching untuk meningkatkan performa

## 🚀 Akses Aplikasi

### Form Pendataan Keluarga
Form dapat diakses melalui URL web app yang di-deploy dari Google Apps Script:
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
```

### API Silsilah Keluarga
API dapat diakses melalui URL web app yang di-deploy dari Google Apps Script:
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=[ENDPOINT]&apikey=[API_KEY]
```

## 🛠️ Teknologi yang Digunakan

- **Google Apps Script** - Platform server-side untuk mengakses layanan Google
- **Google Sheets** - Database untuk menyimpan data keluarga
- **Tailwind CSS** - Framework CSS untuk UI form
- **SweetAlert2** - Library untuk notifikasi interaktif
- **Font Awesome** - Icon library

## 📂 Struktur Repositori

```
mkoesbanoe-family-data-system/
├── Code.gs
├── Index.html
├── api.gs
├── tutorial-form-keluarga.md
├── panduan-api.md
└── README.md
```

## 🌐 Panduan Penggunaan

### Pengisian Form Keluarga
Lihat panduan lengkap [di sini](tutorial-form-keluarga.md) untuk instruksi pengisian form langkah demi langkah.

### Penggunaan API
Lihat dokumentasi API lengkap [di sini](panduan-api.md) untuk informasi endpoint, parameter, dan contoh penggunaan.

## ⚙️ Instalasi dan Setup

### Setup Form Data Keluarga
1. Buat spreadsheet baru di Google Sheets
2. Buat sheet dengan nama:
   - `dataKeluarga` (untuk data utama)
   - `Generasi` (untuk daftar generasi)
   - Sheet tambahan untuk setiap generasi dengan format `[Nama Generasi] Orang Tua`
3. Buka Apps Script editor dari menu Extensions > Apps Script
4. Copy-paste kode dari file `Code.gs` dan `Index.html`
5. Deploy sebagai web app

### Setup API Data Keluarga
1. Menggunakan spreadsheet yang sama dengan form
2. Buka Apps Script editor dan buat file script baru
3. Copy-paste kode dari file `api.gs`
4. Deploy sebagai web app terpisah

## 👥 Kontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi:

1. Fork repositori ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📝 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

## 🙏 Penghargaan

- Seluruh keluarga besar M.Koesbanoe yang berpartisipasi dalam pendataan
- Google untuk platform Google Apps Script dan Google Sheets
- Komunitas open source untuk library dan framework yang digunakan
