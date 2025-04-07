# Panduan Implementasi dan Penggunaan API Data Keluarga M.Koesbanoe

## Persiapan Implementasi

1. **Buka Google Apps Script**
   - Buka spreadsheet Anda di Google Sheets
   - Klik `Extensions` > `Apps Script`
   - Buat file script baru dan beri nama misalnya `api.gs`
   - Salin seluruh kode dari artifact "API untuk Data Keluarga" ke dalam editor script

2. **Sesuaikan Konfigurasi**
   - Pastikan `SPREADSHEET_ID` sudah sesuai dengan ID spreadsheet Anda
   - Sesuaikan nama sheet di bagian `SHEETS` jika diperlukan
   - Sesuaikan konfigurasi API key admin (`ADMIN_KEY`) jika diinginkan

3. **Deploy Sebagai Web App**
   - Klik icon 🔄 (Deploy) di pojok kanan atas
   - Pilih "New deployment"
   - Pilih type "Web App"
   - Isi Description (misalnya "API Data Keluarga v1.0")
   - Di bagian "Execute as", pilih "Me" (atau akun yang memiliki akses ke spreadsheet)
   - Di bagian "Who has access", pilih "Anyone" untuk API publik atau "Anyone with Google account" untuk membatasi akses
   - Klik "Deploy"
   - Salin URL yang muncul - ini adalah URL API Anda

## Struktur API dan Endpoint

API ini menyediakan beberapa endpoint untuk mengakses dan mengelola data keluarga:

### 1. Halaman Beranda API (`endpoint=home`)

Endpoint ini menampilkan dokumentasi API dalam format HTML.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=home
```

### 2. Pencarian Data (`endpoint=search`)

Mencari data keluarga berdasarkan kata kunci.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=search&apikey=[YOUR_API_KEY]&query=[KEYWORD]&field=[FIELD_OPTIONAL]
```
Parameter:
- `query`: Kata kunci pencarian (wajib)
- `field`: Field spesifik yang ingin dicari (opsional - default: semua field)

### 3. Ambil Data Berdasarkan ID (`endpoint=get`)

Mengambil data lengkap berdasarkan ID.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=get&apikey=[YOUR_API_KEY]&id=[ID]
```
Parameter:
- `id`: ID unik dari data yang ingin diambil (wajib)

### 4. Silsilah Keluarga (`endpoint=family-tree`)

Membuat silsilah keluarga berdasarkan nama seseorang.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=family-tree&apikey=[YOUR_API_KEY]&name=[NAME]&generations=[NUMBER]
```
Parameter:
- `name`: Nama orang yang menjadi pusat silsilah (wajib)
- `generations`: Jumlah generasi yang ingin ditampilkan (opsional - default: 3)

### 5. Daftar Generasi (`endpoint=generations`)

Menampilkan daftar semua generasi yang tersedia.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=generations&apikey=[YOUR_API_KEY]
```

### 6. Data Berdasarkan Generasi (`endpoint=generasi`)

Mengambil data keluarga berdasarkan nama generasi.
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=generasi&apikey=[YOUR_API_KEY]&name=[GENERASI_NAME]
```
Parameter:
- `name`: Nama generasi yang ingin diambil datanya (wajib)

### 7. Generate API Key (`endpoint=generate-api-key`)

Membuat API key baru (hanya admin).
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=generate-api-key&admin_key=[ADMIN_KEY]&name=[USER_NAME]&email=[USER_EMAIL]
```
Parameter:
- `admin_key`: Admin API key (wajib)
- `name`: Nama pengguna API key (wajib)
- `email`: Email pengguna API key (wajib)

## Menggunakan API Key

### Membuat API Key Admin

API key admin sudah terdefinisi di kode (`ADMIN_KEY`). Secara default, nilainya adalah:
```
admin_2025
```

Anda bisa mengubah nilai ini di bagian konfigurasi kode sebelum deploy.

### Membuat API Key untuk Pengguna

1. Gunakan endpoint `generate-api-key` dengan admin key:
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=generate-api-key&admin_key=admin_2025&name=Nama Pengguna&email=email@example.com
```

2. API akan mengembalikan API key baru yang dapat digunakan oleh pengguna.

3. API key akan disimpan di sheet "apiKeys" untuk referensi di masa mendatang.

## Contoh Penggunaan API

### Contoh: Pencarian Anggota Keluarga

**Request:**
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=search&apikey=mk_abcdef123456&query=Budi&field=Nama
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "ID": "a951a2a9-c0b6-4",
      "Generasi": "Cucu",
      "Nama": "Budi Santoso",
      "Status": "hidup",
      "Pasangan": "Siti Rahayu",
      "StatusPasangan": "",
      "OrangTua": "Ahmad Santoso",
      "Alamat": "Jl. Contoh No. 123, Jakarta",
      "HP": "628123456789",
      "Anak": "[\"Rina Santoso\",\"Rudi Santoso\"]"
    }
  ],
  "message": "Ditemukan 1 hasil"
}
```

### Contoh: Mengambil Silsilah Keluarga

**Request:**
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?endpoint=family-tree&apikey=mk_abcdef123456&name=Budi Santoso
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "name": "Budi Santoso",
    "id": "a951a2a9-c0b6-4",
    "data": {
      "status": "hidup",
      "pasangan": {
        "name": "Siti Rahayu",
        "status": "hidup"
      },
      "alamat": "Jl. Contoh No. 123, Jakarta",
      "hp": "628123456789",
      "generasi": "Cucu"
    },
    "children": [
      {
        "name": "Rina Santoso",
        "id": "b511ee4e-36a8-4",
        "data": {
          "status": "hidup",
          "pasangan": null
        },
        "children": []
      },
      {
        "name": "Rudi Santoso",
        "id": "95d5c1d4-e528-4",
        "data": {
          "status": "hidup",
          "pasangan": null
        },
        "children": []
      }
    ],
    "parents": {
      "name": "Ahmad Santoso",
      "id": "0a47e7b-3b78-4",
      "data": {
        "status": "hidup",
        "pasangan": {
          "name": "Siti Aminah",
          "status": "hidup"
        }
      },
      "children": []
    }
  },
  "message": "Silsilah keluarga berhasil dibuat"
}
```

## Log API

Semua akses ke API dicatat dalam sheet "logAPI" dengan informasi berikut:

- Timestamp
- API Key
- Endpoint
- IP Address
- Query Parameters
- Status (SUCCESS/FAILED/ERROR)

Ini memungkinkan Anda untuk melacak penggunaan API dan mengidentifikasi potensi masalah.

## Fitur Caching

API ini mengimplementasikan caching untuk meningkatkan performa. Hasil pencarian dan permintaan data di-cache selama 5 menit (300 detik) secara default.

Anda dapat mengubah waktu cache dengan memodifikasi konstanta `CACHE_TTL` di kode.

## Keamanan

1. **API Key**: Semua endpoint memerlukan API key yang valid (kecuali halaman beranda).
2. **Izin Akses**: Admin API key diperlukan untuk membuat API key baru.
3. **Log Akses**: Semua akses ke API dicatat dalam log untuk audit keamanan.

## Troubleshooting

### API Key Tidak Valid
- Pastikan API key dimasukkan dengan benar
- Periksa sheet "apiKeys" untuk melihat status API key
- Coba gunakan admin API key untuk verifikasi

### Sheet Tidak Ditemukan
- Pastikan nama sheet ("dataKeluarga", "logAPI", "apiKeys") sudah benar
- Pastikan spreadsheet ID sudah benar

### Data Tidak Dapat Diakses
- Pastikan akun yang menjalankan script memiliki akses ke spreadsheet
- Periksa log execution di Google Apps Script untuk melihat error detail
