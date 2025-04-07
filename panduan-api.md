API Data Keluarga M. Koesbanoe
Selamat datang di API Data Keluarga M. Koesbanoe. API ini menyediakan akses ke data keluarga dari silsilah M. Koesbanoe.

Autentikasi
Semua endpoint API memerlukan API key. Tambahkan parameter apikey pada setiap request.

Contoh: ?apikey=YOUR_API_KEY&endpoint=search&query=nama

Endpoint yang Tersedia
1. Pencarian
?endpoint=search&query=KATA_KUNCI&field=FIELD_PENCARIAN
Parameter:

query: Kata kunci pencarian
field (opsional): Field spesifik untuk pencarian (nama, alamat, orangTua, dll)
2. Ambil Data Berdasarkan ID
?endpoint=get&id=ID_DATA
Parameter:

id: ID unik dari data yang ingin diambil
3. Silsilah Keluarga
?endpoint=family-tree&name=NAMA_ORANG
Parameter:

name: Nama orang yang menjadi pusat silsilah
generations (opsional): Jumlah generasi yang ingin ditampilkan (default: 3)
4. Daftar Generasi
?endpoint=generations
Menampilkan daftar semua generasi yang tersedia.

5. Data Berdasarkan Generasi
?endpoint=generasi&name=NAMA_GENERASI
Parameter:

name: Nama generasi yang ingin diambil datanya
6. Generate API Key (Admin Only)
?endpoint=generate-api-key&admin_key=ADMIN_KEY&name=NAMA_PENGGUNA&email=EMAIL
Parameter:

admin_key: Admin API key
name: Nama pengguna API key
email: Email pengguna API key
Format Respon
Semua API akan mengembalikan respons dalam format JSON dengan struktur sebagai berikut:

{
  "status": "success|error",
  "data": [...] | {...} | null,
  "message": "Pesan sukses atau error"
}
Kode Status HTTP
Kode	Deskripsi
200	Sukses
400	Parameter yang dibutuhkan tidak valid
401	API key dibutuhkan
403	API key tidak valid
404	Data tidak ditemukan
500	Error internal server
© 2025 Silsilah Keluarga M. Koesbanoe
