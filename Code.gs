// Konfigurasi
const CONFIG = {
  SPREADSHEET_ID: '<id-spreadsheet>',
  SHEETS: {
    GENERASI: 'Generasi',
    UTAMA: 'dataKeluarga'
  },
  NOTIFICATIONS: {
    TELEGRAM: {
      ACTIVE: true,
      TOKEN: '<id-token>',
      CHAT_ID: '<id-chat>'
    },
    WHATSAPP: {
      ACTIVE: true,
      API_KEY: '<apikey-mpedia>',
      SENDER: '<sender>',
      NUMBER: '<number>',
      ENDPOINT: 'https://m-pedia/send-message'
    },
    EMAIL: {
      ACTIVE: true,
      TO: '<email-anda>',
      SENDER_NAME: 'Form Keluarga'
    }
  }
};

// Fungsi wajib untuk web app
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Form Data Keluarga')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi untuk include file HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Fungsi untuk mendapatkan daftar generasi
function getGenerasiList() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.GENERASI);
    
    // Periksa apakah sheet ditemukan
    if (!sheet) {
      Logger.log(`Sheet ${CONFIG.SHEETS.GENERASI} tidak ditemukan!`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Asumsikan kolom pertama berisi nama generasi
    // Lewati baris header jika ada
    return data.slice(1).map(row => row[0]).filter(generasi => generasi);
  } catch (error) {
    Logger.log('Error getting generasi list:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan daftar orang tua berdasarkan generasi
function getParentsList(generasi) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Cari sheet dengan nama spesifik berdasarkan generasi
    const sheetName = generasi ? generasi + ' Orang Tua' : 'Orang Tua';
    Logger.log(`Mencari sheet: ${sheetName}`);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Sheet ${sheetName} tidak ditemukan`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Asumsikan kolom pertama berisi nama orang tua
    // Lewati baris header jika ada
    return data.slice(1).map(row => ({
      nama: row[0],
      hp: row[1] || '',
      alamat: row[2] || ''
    })).filter(parent => parent.nama);
  } catch (error) {
    Logger.log('Error getting parents list:', error);
    return [];
  }
}

// Fungsi utama untuk memproses form
function processForm(data) {
  try {
    Logger.log('Received data:', JSON.stringify(data));
    
    // Verifikasi data yang diterima
    if (!data || typeof data !== 'object') {
      Logger.log('Invalid data received: ', data);
      return { success: false, error: 'Data tidak valid' };
    }
    
    // Pastikan spreadsheet dapat diakses
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch (e) {
      Logger.log('Error opening spreadsheet: ', e);
      return { success: false, error: 'Tidak dapat membuka spreadsheet. Periksa ID dan hak akses.' };
    }
    
    // Pastikan sheet dapat diakses
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.UTAMA);
    if (!sheet) {
      Logger.log(`Sheet '${CONFIG.SHEETS.UTAMA}' tidak ditemukan!`);
      return { success: false, error: `Sheet '${CONFIG.SHEETS.UTAMA}' tidak ditemukan!` };
    }
    
    const lastRow = Math.max(1, sheet.getLastRow());
    
    // Header hanya jika sheet kosong
    if (lastRow === 1) {
      sheet.getRange(1, 1, 1, 10).setValues([['ID', 'Generasi', 'Nama', 'Status', 'Pasangan', 'StatusPasangan', 'OrangTua', 'Alamat', 'HP', 'Anak']]);
    }
    
    // Validasi data
    if (!data.nama) {
      return { success: false, error: 'Nama harus diisi' };
    }
    
    const id = Utilities.getUuid();
    
    // Format nama dengan huruf pertama kapital
    let formattedNama = '';
    if (data.nama) {
      formattedNama = data.nama.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Format nama pasangan dengan huruf pertama kapital
    let formattedPasangan = '';
    if (data.pasangan) {
      formattedPasangan = data.pasangan.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Perbaikan parsing statusPasangan
    let statusPasangan = '';
    if (data.statusPasangan === 'on' || data.statusPasangan === true) {
      statusPasangan = 'almarhum';
    } else {
      statusPasangan = data.statusPasangan || '';
    }
    
    // Format nomor HP dari 08xx menjadi 628xx
    let formattedHP = '';
    if (data.hp) {
      // Jika dimulai dengan 0, ganti dengan 62
      if (data.hp.startsWith('0')) {
        formattedHP = '62' + data.hp.substring(1);
      } else if (data.hp.startsWith('+62')) {
        // Jika dimulai dengan +62, hapus + nya
        formattedHP = data.hp.substring(1);
      } else if (!data.hp.startsWith('62')) {
        // Jika belum diawali 62, tambahkan 62
        formattedHP = '62' + data.hp;
      } else {
        formattedHP = data.hp;
      }
      
      // Hapus semua non-digit
      formattedHP = formattedHP.replace(/\D/g, '');
    }
    
    // Format array anak dengan huruf pertama kapital
    let formattedAnak = [];
    if (data.anak && Array.isArray(data.anak)) {
      formattedAnak = data.anak.map(nama => {
        if (nama) {
          return nama.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        return nama;
      });
    }
    
    // Prepare row data with safer defaults
    const rowData = [
      id,
      data.generasi || '',
      formattedNama,
      data.status || 'hidup',
      formattedPasangan,
      statusPasangan,
      data.orangTua || '',
      data.alamat || '',
      formattedHP,
      JSON.stringify(formattedAnak)
    ];
    
    Logger.log('Akan menyimpan data:', rowData);
    
    // Simpan data ke spreadsheet
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    Logger.log('Data berhasil disimpan di baris:', lastRow + 1);

    // Get tanggal dan waktu saat ini
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, 'Asia/Jakarta', 'dd MMMM yyyy');
    const formattedTime = Utilities.formatDate(now, 'Asia/Jakarta', 'HH:mm:ss');
    
    // Prepare notification message yang lebih informatif
    const message = `
<b>🆕 PEMBERITAHUAN: DATA KELUARGA BARU</b>
<i>Terkirim pada ${formattedDate} pukul ${formattedTime} WIB</i>

<b>Detail Data Keluarga:</b>
Generasi: <b>${data.generasi || '-'}</b>
Nama: <b>${formattedNama}</b> ${data.status === 'almarhum' ? '(Alm)' : ''}
Orang Tua: <b>${data.orangTua || '-'}</b>
Pasangan: <b>${formattedPasangan || '-'}</b> ${statusPasangan === 'almarhum' ? '(Alm)' : ''}
Alamat: <b>${data.alamat || '-'}</b>
Kontak: <b>${formattedHP || '-'}</b>

<b>Anak-anak:</b>
${formattedAnak && formattedAnak.length > 0 
  ? formattedAnak.map((nama, index) => `${index + 1}. ${nama}`).join('\n') 
  : '- Tidak ada data anak -'}

<i>Data telah berhasil disimpan dalam database keluarga.</i>
`;

    // Send notifications
    try {
      if (CONFIG.NOTIFICATIONS.TELEGRAM.ACTIVE) {
        sendTelegramNotification(message);
      }
      if (CONFIG.NOTIFICATIONS.WHATSAPP.ACTIVE) {
        // Format khusus untuk WhatsApp (tanpa HTML tag)
        const whatsappMessage = `
🆕 *PEMBERITAHUAN: DATA KELUARGA BARU*
_Terkirim pada ${formattedDate} pukul ${formattedTime} WIB_

*Detail Data Keluarga:*
Generasi: *${data.generasi || '-'}*
Nama: *${formattedNama}* ${data.status === 'almarhum' ? '(Alm)' : ''}
Orang Tua: *${data.orangTua || '-'}*
Pasangan: *${formattedPasangan || '-'}* ${statusPasangan === 'almarhum' ? '(Alm)' : ''}
Alamat: *${data.alamat || '-'}*
Kontak: *${formattedHP || '-'}*

*Anak-anak:*
${formattedAnak && formattedAnak.length > 0 
  ? formattedAnak.map((nama, index) => `${index + 1}. ${nama}`).join('\n') 
  : '- Tidak ada data anak -'}

_Data telah berhasil disimpan dalam database keluarga._
`;
        sendWhatsAppNotification(whatsappMessage);
      }
      if (CONFIG.NOTIFICATIONS.EMAIL.ACTIVE) {
        sendEmailNotification(message);
      }
    } catch (notificationError) {
      // Jangan gagalkan proses jika notifikasi gagal
      Logger.log('Notification error:', notificationError);
    }

    return { success: true };
  } catch (error) {
    Logger.log('Error in processForm:', error);
    return { success: false, error: error.toString() };
  }
}

// Fungsi untuk kirim notifikasi Telegram
function sendTelegramNotification(message) {
  if (!CONFIG.NOTIFICATIONS.TELEGRAM.ACTIVE) return;
  
  try {
    const telegramUrl = `https://api.telegram.org/bot${CONFIG.NOTIFICATIONS.TELEGRAM.TOKEN}/sendMessage`;
    const payload = {
      chat_id: CONFIG.NOTIFICATIONS.TELEGRAM.CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    };

    UrlFetchApp.fetch(telegramUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
    Logger.log('Telegram notification sent');
  } catch (error) {
    Logger.log('Telegram notification error:', error);
  }
}

// Fungsi untuk kirim notifikasi WhatsApp
function sendWhatsAppNotification(message) {
  if (!CONFIG.NOTIFICATIONS.WHATSAPP.ACTIVE) return;
  
  try {
    const payload = {
      api_key: CONFIG.NOTIFICATIONS.WHATSAPP.API_KEY,
      sender: CONFIG.NOTIFICATIONS.WHATSAPP.SENDER,
      number: CONFIG.NOTIFICATIONS.WHATSAPP.NUMBER,
      message: message
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };

    UrlFetchApp.fetch(CONFIG.NOTIFICATIONS.WHATSAPP.ENDPOINT, options);
    Logger.log('WhatsApp notification sent');
  } catch (error) {
    Logger.log('WhatsApp notification error:', error);
  }
}

// Fungsi untuk kirim email
function sendEmailNotification(message) {
  if (!CONFIG.NOTIFICATIONS.EMAIL.ACTIVE) return;
  
  try {
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, 'Asia/Jakarta', 'dd MMMM yyyy');
    const formattedTime = Utilities.formatDate(now, 'Asia/Jakarta', 'HH:mm:ss');
    const subject = `Notifikasi: Data Keluarga Baru [${formattedDate} ${formattedTime}]`;
    
    GmailApp.sendEmail(
      CONFIG.NOTIFICATIONS.EMAIL.TO,
      subject,
      message.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      {
        name: CONFIG.NOTIFICATIONS.EMAIL.SENDER_NAME,
        htmlBody: message.replace(/\n/g, '<br>')
      }
    );
    Logger.log('Email notification sent');
  } catch (error) {
    Logger.log('Email notification error:', error);
  }
}

// Fungsi debugging untuk memeriksa akses spreadsheet
function checkSpreadsheetAccess() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets().map(sheet => sheet.getName());
    return {
      success: true,
      spreadsheetName: spreadsheet.getName(),
      sheets: sheets,
      url: spreadsheet.getUrl()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
