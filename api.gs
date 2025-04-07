// Konfigurasi API
const CONFIG = {
  SPREADSHEET_ID: '<id-spreadsheet>', // Gunakan spreadsheet ID yang sama
  SHEETS: {
    DATA_KELUARGA: 'dataKeluarga',
    LOG_API: 'logAPI',
    API_KEYS: 'apiKeys' // Sheet untuk menyimpan API key yang valid
  },
  AUTH: {
    REQUIRE_API_KEY: true, // Set false jika ingin menonaktifkan autentikasi API key
    ADMIN_KEY: '<apikey-admin>' // API key khusus untuk admin (bisa mengakses semua endpoint)
  }
};

// Cache untuk performa yang lebih baik
const CACHE_TTL = 300; // dalam detik (5 menit)

/**
 * Fungsi wajib untuk web app - ini menangani semua request HTTP
 */
function doGet(e) {
  try {
    // Membuat spreadsheet Log API jika belum ada
    ensureLogSheet();
    
    // Cek apakah apiKeys sheet sudah ada, jika belum, buat
    ensureApiKeysSheet();
    
    // Log akses API
    const userIp = e.parameter.userip || 'unknown';
    const endpoint = e.parameter.endpoint || 'home';
    const apiKey = e.parameter.apikey || '';
    const queryParams = JSON.stringify(e.parameters);
    
    // Validasi API key jika diperlukan
    if (CONFIG.AUTH.REQUIRE_API_KEY && endpoint !== 'home') {
      if (!apiKey) {
        return sendJSON({ 
          status: 'error', 
          message: 'API key dibutuhkan' 
        }, 401);
      }
      
      const isValidKey = apiKey === CONFIG.AUTH.ADMIN_KEY || validateApiKey(apiKey);
      
      if (!isValidKey) {
        logAPIAccess(apiKey, endpoint, userIp, queryParams, 'FAILED - INVALID KEY');
        return sendJSON({ 
          status: 'error', 
          message: 'API key tidak valid' 
        }, 403);
      }
    }
    
    // Log akses berhasil
    logAPIAccess(apiKey, endpoint, userIp, queryParams, 'SUCCESS');
    
    // Route ke fungsi yang sesuai berdasarkan endpoint
    switch (endpoint) {
      case 'home':
        return handleHome();
      case 'search':
        return handleSearch(e.parameters);
      case 'get':
        return handleGet(e.parameters);
      case 'family-tree':
        return handleFamilyTree(e.parameters);
      case 'generate-api-key':
        return handleGenerateApiKey(e.parameters);
      case 'generations':
        return handleGetGenerations();
      case 'generasi':
        return handleGetByGenerasi(e.parameters);
      default:
        return sendJSON({ 
          status: 'error', 
          message: 'Endpoint tidak ditemukan' 
        }, 404);
    }
  } catch (error) {
    // Log error
    if (e && e.parameter) {
      const userIp = e.parameter.userip || 'unknown';
      const endpoint = e.parameter.endpoint || 'unknown';
      const apiKey = e.parameter.apikey || '';
      logAPIAccess(apiKey, endpoint, userIp, JSON.stringify(e.parameters), 'ERROR: ' + error.toString());
    }
    
    // Kirim respon error
    return sendJSON({ 
      status: 'error', 
      message: 'Terjadi kesalahan internal: ' + error.toString() 
    }, 500);
  }
}

/**
 * Halaman beranda API
 */
function handleHome() {
  const html = HtmlService.createHtmlOutput(`
  <!DOCTYPE html>
  <html>
    <head>
      <base target="_top">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>API Data Keluarga M. Koesbanoe</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #4F46E5;
        }
        code {
          background-color: #f7f7f7;
          padding: 2px 5px;
          border-radius: 4px;
          font-family: monospace;
        }
        pre {
          background-color: #f7f7f7;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>API Data Keluarga M. Koesbanoe</h1>
      <p>Selamat datang di API Data Keluarga M. Koesbanoe. API ini menyediakan akses ke data keluarga dari silsilah M. Koesbanoe.</p>
      
      <h2>Autentikasi</h2>
      <p>Semua endpoint API memerlukan API key. Tambahkan parameter <code>apikey</code> pada setiap request.</p>
      <p>Contoh: <code>?apikey=YOUR_API_KEY&endpoint=search&query=nama</code></p>
      
      <h2>Endpoint yang Tersedia</h2>
      
      <h3>1. Pencarian</h3>
      <pre>?endpoint=search&query=KATA_KUNCI&field=FIELD_PENCARIAN</pre>
      <p>Parameter:</p>
      <ul>
        <li><code>query</code>: Kata kunci pencarian</li>
        <li><code>field</code> (opsional): Field spesifik untuk pencarian (nama, alamat, orangTua, dll)</li>
      </ul>
      
      <h3>2. Ambil Data Berdasarkan ID</h3>
      <pre>?endpoint=get&id=ID_DATA</pre>
      <p>Parameter:</p>
      <ul>
        <li><code>id</code>: ID unik dari data yang ingin diambil</li>
      </ul>
      
      <h3>3. Silsilah Keluarga</h3>
      <pre>?endpoint=family-tree&name=NAMA_ORANG</pre>
      <p>Parameter:</p>
      <ul>
        <li><code>name</code>: Nama orang yang menjadi pusat silsilah</li>
        <li><code>generations</code> (opsional): Jumlah generasi yang ingin ditampilkan (default: 3)</li>
      </ul>
      
      <h3>4. Daftar Generasi</h3>
      <pre>?endpoint=generations</pre>
      <p>Menampilkan daftar semua generasi yang tersedia.</p>
      
      <h3>5. Data Berdasarkan Generasi</h3>
      <pre>?endpoint=generasi&name=NAMA_GENERASI</pre>
      <p>Parameter:</p>
      <ul>
        <li><code>name</code>: Nama generasi yang ingin diambil datanya</li>
      </ul>
      
      <h3>6. Generate API Key (Admin Only)</h3>
      <pre>?endpoint=generate-api-key&admin_key=ADMIN_KEY&name=NAMA_PENGGUNA&email=EMAIL</pre>
      <p>Parameter:</p>
      <ul>
        <li><code>admin_key</code>: Admin API key</li>
        <li><code>name</code>: Nama pengguna API key</li>
        <li><code>email</code>: Email pengguna API key</li>
      </ul>
      
      <h2>Format Respon</h2>
      <p>Semua API akan mengembalikan respons dalam format JSON dengan struktur sebagai berikut:</p>
      <pre>{
  "status": "success|error",
  "data": [...] | {...} | null,
  "message": "Pesan sukses atau error"
}</pre>
      
      <h2>Kode Status HTTP</h2>
      <table>
        <tr>
          <th>Kode</th>
          <th>Deskripsi</th>
        </tr>
        <tr>
          <td>200</td>
          <td>Sukses</td>
        </tr>
        <tr>
          <td>400</td>
          <td>Parameter yang dibutuhkan tidak valid</td>
        </tr>
        <tr>
          <td>401</td>
          <td>API key dibutuhkan</td>
        </tr>
        <tr>
          <td>403</td>
          <td>API key tidak valid</td>
        </tr>
        <tr>
          <td>404</td>
          <td>Data tidak ditemukan</td>
        </tr>
        <tr>
          <td>500</td>
          <td>Error internal server</td>
        </tr>
      </table>
      
      <hr>
      <p><small>&copy; ${new Date().getFullYear()} Silsilah Keluarga M. Koesbanoe</small></p>
    </body>
  </html>
  `);
  
  return html;
}

/**
 * Pencarian data
 */
function handleSearch(params) {
  const query = params.query ? params.query[0] : '';
  const field = params.field ? params.field[0] : '';
  
  if (!query) {
    return sendJSON({ 
      status: 'error', 
      message: 'Parameter query dibutuhkan' 
    }, 400);
  }
  
  try {
    // Gunakan cache jika tersedia
    const cacheKey = `search_${query}_${field}`;
    const cachedData = CacheService.getScriptCache().get(cacheKey);
    
    if (cachedData) {
      return sendJSON({
        status: 'success',
        data: JSON.parse(cachedData),
        message: 'Data ditemukan dari cache'
      });
    }
    
    // Ambil semua data
    const data = getKeluargaData();
    
    // Filter berdasarkan query dan field
    let results;
    if (field) {
      results = data.filter(row => {
        if (row[field]) {
          return row[field].toString().toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    } else {
      // Cari di semua field
      results = data.filter(row => {
        return Object.values(row).some(value => {
          if (value) {
            return value.toString().toLowerCase().includes(query.toLowerCase());
          }
          return false;
        });
      });
    }
    
    // Simpan ke cache
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(results), CACHE_TTL);
    
    return sendJSON({
      status: 'success',
      data: results,
      message: results.length > 0 ? `Ditemukan ${results.length} hasil` : 'Tidak ada hasil'
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat melakukan pencarian: ' + error.toString() 
    }, 500);
  }
}

/**
 * Ambil data berdasarkan ID
 */
function handleGet(params) {
  const id = params.id ? params.id[0] : '';
  
  if (!id) {
    return sendJSON({ 
      status: 'error', 
      message: 'Parameter id dibutuhkan' 
    }, 400);
  }
  
  try {
    // Gunakan cache jika tersedia
    const cacheKey = `get_${id}`;
    const cachedData = CacheService.getScriptCache().get(cacheKey);
    
    if (cachedData) {
      return sendJSON({
        status: 'success',
        data: JSON.parse(cachedData),
        message: 'Data ditemukan dari cache'
      });
    }
    
    // Ambil semua data
    const data = getKeluargaData();
    
    // Cari data berdasarkan ID
    const result = data.find(row => row.ID === id);
    
    if (!result) {
      return sendJSON({ 
        status: 'error', 
        message: 'Data dengan ID tersebut tidak ditemukan' 
      }, 404);
    }
    
    // Simpan ke cache
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(result), CACHE_TTL);
    
    return sendJSON({
      status: 'success',
      data: result,
      message: 'Data ditemukan'
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat mengambil data: ' + error.toString() 
    }, 500);
  }
}

/**
 * Silsilah keluarga
 */
function handleFamilyTree(params) {
  const name = params.name ? params.name[0] : '';
  const generations = params.generations ? parseInt(params.generations[0]) : 3;
  
  if (!name) {
    return sendJSON({ 
      status: 'error', 
      message: 'Parameter name dibutuhkan' 
    }, 400);
  }
  
  try {
    // Gunakan cache jika tersedia
    const cacheKey = `family_tree_${name}_${generations}`;
    const cachedData = CacheService.getScriptCache().get(cacheKey);
    
    if (cachedData) {
      return sendJSON({
        status: 'success',
        data: JSON.parse(cachedData),
        message: 'Silsilah keluarga ditemukan dari cache'
      });
    }
    
    // Ambil semua data
    const data = getKeluargaData();
    
    // Cari orang berdasarkan nama
    const person = data.find(row => row.Nama.toLowerCase() === name.toLowerCase());
    
    if (!person) {
      return sendJSON({ 
        status: 'error', 
        message: 'Orang dengan nama tersebut tidak ditemukan' 
      }, 404);
    }
    
    // Buat struktur silsilah
    const familyTree = buildFamilyTree(person, data, generations);
    
    // Simpan ke cache
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(familyTree), CACHE_TTL);
    
    return sendJSON({
      status: 'success',
      data: familyTree,
      message: 'Silsilah keluarga berhasil dibuat'
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat membuat silsilah keluarga: ' + error.toString() 
    }, 500);
  }
}

/**
 * Daftar semua generasi
 */
function handleGetGenerations() {
  try {
    // Gunakan cache jika tersedia
    const cacheKey = 'generations_list';
    const cachedData = CacheService.getScriptCache().get(cacheKey);
    
    if (cachedData) {
      return sendJSON({
        status: 'success',
        data: JSON.parse(cachedData),
        message: 'Daftar generasi ditemukan dari cache'
      });
    }
    
    // Ambil semua data
    const data = getKeluargaData();
    
    // Ekstrak data generasi unik
    const generations = [...new Set(data.map(row => row.Generasi))].filter(Boolean);
    
    // Simpan ke cache
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(generations), CACHE_TTL);
    
    return sendJSON({
      status: 'success',
      data: generations,
      message: 'Daftar generasi berhasil diambil'
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat mengambil daftar generasi: ' + error.toString() 
    }, 500);
  }
}

/**
 * Ambil data berdasarkan generasi
 */
function handleGetByGenerasi(params) {
  const name = params.name ? params.name[0] : '';
  
  if (!name) {
    return sendJSON({ 
      status: 'error', 
      message: 'Parameter name generasi dibutuhkan' 
    }, 400);
  }
  
  try {
    // Gunakan cache jika tersedia
    const cacheKey = `generasi_${name}`;
    const cachedData = CacheService.getScriptCache().get(cacheKey);
    
    if (cachedData) {
      return sendJSON({
        status: 'success',
        data: JSON.parse(cachedData),
        message: 'Data generasi ditemukan dari cache'
      });
    }
    
    // Ambil semua data
    const data = getKeluargaData();
    
    // Filter berdasarkan generasi
    const results = data.filter(row => row.Generasi && row.Generasi.toLowerCase() === name.toLowerCase());
    
    if (results.length === 0) {
      return sendJSON({ 
        status: 'error', 
        message: 'Tidak ada data untuk generasi tersebut' 
      }, 404);
    }
    
    // Simpan ke cache
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(results), CACHE_TTL);
    
    return sendJSON({
      status: 'success',
      data: results,
      message: `Ditemukan ${results.length} data untuk generasi ${name}`
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat mengambil data generasi: ' + error.toString() 
    }, 500);
  }
}

/**
 * Generate API key (hanya admin)
 */
function handleGenerateApiKey(params) {
  const adminKey = params.admin_key ? params.admin_key[0] : '';
  const name = params.name ? params.name[0] : '';
  const email = params.email ? params.email[0] : '';
  
  if (adminKey !== CONFIG.AUTH.ADMIN_KEY) {
    return sendJSON({ 
      status: 'error', 
      message: 'Anda tidak memiliki izin untuk membuat API key' 
    }, 403);
  }
  
  if (!name || !email) {
    return sendJSON({ 
      status: 'error', 
      message: 'Parameter name dan email dibutuhkan' 
    }, 400);
  }
  
  try {
    // Generate API key baru
    const newApiKey = generateUniqueApiKey();
    
    // Simpan ke sheet API keys
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.API_KEYS);
    
    // Timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    
    // Tambahkan ke sheet
    sheet.appendRow([newApiKey, name, email, timestamp, 'Active']);
    
    return sendJSON({
      status: 'success',
      data: { apiKey: newApiKey, name, email, created: timestamp },
      message: 'API key berhasil dibuat'
    });
  } catch (error) {
    return sendJSON({ 
      status: 'error', 
      message: 'Error saat membuat API key: ' + error.toString() 
    }, 500);
  }
}

/**
 * Fungsi untuk membangun struktur silsilah keluarga
 */
function buildFamilyTree(person, allData, maxGenerations = 3, currentGen = 0) {
  if (!person || currentGen >= maxGenerations) {
    return null;
  }
  
  try {
    // Parse data anak jika ada
    let children = [];
    if (person.Anak && person.Anak.startsWith('[') && person.Anak.endsWith(']')) {
      try {
        // Coba parse data anak
        const anakNames = JSON.parse(person.Anak);
        
        // Cari data anak berdasarkan nama
        for (const anakName of anakNames) {
          const child = allData.find(row => row.Nama === anakName);
          if (child) {
            children.push(buildFamilyTree(child, allData, maxGenerations, currentGen + 1));
          } else {
            // Jika data anak tidak ditemukan, buat data minimal
            children.push({
              name: anakName,
              id: null,
              data: {
                status: 'Tidak ada data lengkap',
                pasangan: null
              },
              children: []
            });
          }
        }
      } catch (e) {
        // Jika gagal parsing, kemungkinan format lama
        Logger.log('Error parsing anak:', e);
      }
    }
    
    // Cari pasangan
    let spouse = null;
    if (person.Pasangan) {
      spouse = {
        name: person.Pasangan,
        status: person.StatusPasangan || 'hidup'
      };
    }
    
    // Cari orang tua
    let parents = null;
    if (person.OrangTua) {
      const parent = allData.find(row => row.Nama === person.OrangTua);
      if (parent) {
        parents = buildFamilyTree(parent, allData, maxGenerations, currentGen + 1);
      } else {
        parents = {
          name: person.OrangTua,
          id: null,
          data: {
            status: 'Tidak ada data lengkap',
            pasangan: null
          },
          children: []
        };
      }
    }
    
    // Buat struktur node untuk orang ini
    return {
      name: person.Nama,
      id: person.ID,
      data: {
        status: person.Status || 'hidup',
        pasangan: spouse,
        alamat: person.Alamat,
        hp: person.HP,
        generasi: person.Generasi
      },
      children: children,
      parents: parents
    };
  } catch (error) {
    Logger.log('Error building family tree:', error);
    return {
      name: person.Nama,
      id: person.ID,
      data: {
        status: person.Status || 'hidup',
        error: error.toString()
      },
      children: []
    };
  }
}

/**
 * Ambil semua data keluarga dari spreadsheet
 */
function getKeluargaData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.DATA_KELUARGA);
    
    if (!sheet) {
      throw new Error(`Sheet ${CONFIG.SHEETS.DATA_KELUARGA} tidak ditemukan`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Konversi ke array of objects
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Error getting data:', error);
    throw error;
  }
}

/**
 * Kirim JSON response
 */
function sendJSON(data, statusCode = 200) {
  const jsonOutput = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  return jsonOutput;
}

/**
 * Pastikan sheet log API ada
 */
function ensureLogSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.LOG_API);
    
    if (!sheet) {
      // Buat sheet baru
      sheet = spreadsheet.insertSheet(CONFIG.SHEETS.LOG_API);
      
      // Tambahkan header
      sheet.appendRow(['Timestamp', 'API Key', 'Endpoint', 'IP', 'Query Parameters', 'Status']);
      
      // Format header
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      sheet.setFrozenRows(1);
      
      // Resize kolom
      sheet.autoResizeColumns(1, 6);
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error creating log sheet:', error);
    throw error;
  }
}

/**
 * Pastikan sheet API keys ada
 */
function ensureApiKeysSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.API_KEYS);
    
    if (!sheet) {
      // Buat sheet baru
      sheet = spreadsheet.insertSheet(CONFIG.SHEETS.API_KEYS);
      
      // Tambahkan header
      sheet.appendRow(['API Key', 'Name', 'Email', 'Created', 'Status']);
      
      // Format header
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      sheet.setFrozenRows(1);
      
      // Resize kolom
      sheet.autoResizeColumns(1, 5);
      
      // Tambahkan API key admin secara default
      sheet.appendRow([
        CONFIG.AUTH.ADMIN_KEY,
        'Admin',
        'admin@silsilah.koesbanoe.id',
        Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
        'Active'
      ]);
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error creating API keys sheet:', error);
    throw error;
  }
}

/**
 * Validasi API key
 */
function validateApiKey(apiKey) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.API_KEYS);
    
    if (!sheet) {
      return false;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Skip header
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === apiKey && data[i][4] === 'Active') {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    Logger.log('Error validating API key:', error);
    return false;
  }
}

/**
 * Generate API key unik
 */
function generateUniqueApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'mk_'; // Prefix untuk API key
  let key = prefix;
  
  // Generate 32 karakter random
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return key;
}

/**
 * Log akses API
 */
function logAPIAccess(apiKey, endpoint, ip, queryParams, status) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.LOG_API);
    
    if (!sheet) {
      Logger.log('Log sheet not found');
      return;
    }
    
    // Timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    
    // Tambahkan log ke sheet
    sheet.appendRow([timestamp, apiKey, endpoint, ip, queryParams, status]);
  } catch (error) {
    Logger.log('Error logging API access:', error);
  }
}
