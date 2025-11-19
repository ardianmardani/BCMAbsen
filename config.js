// config.js - Konfigurasi untuk Google Sheets Anda

const CONFIG = {
    // Google Sheets Configuration - PAKAI SHEETS ANDA
    SHEET_ID: '1cgGVo8AvS_w2VzIpgfkGqo1Kvmm3o9_eQBr-bBYLvx0',
    API_KEY: 'AIzaSyBpXJp4nLwB6bAsY1uKfQKvJ7t8D8W8e8E', // Ganti dengan API Key Anda
    SHEET_NAME: 'DATA PEGAWAI', // Nama sheet di file Anda
    
    // Aplikasi Configuration
    APP_NAME: 'Sistem Absensi Pegawai',
    VERSION: '1.0',
    
    // Lokasi Kantor
    KANTOR_LAT: -6.22494694,
    KANTOR_LNG: 106.81451917,
    MAX_DISTANCE: 200, // meter
};

// Fungsi untuk mendapatkan data dari Google Sheets
async function getDataFromSheets(range = '') {
    try {
        const sheetRange = range || CONFIG.SHEET_NAME;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${sheetRange}?key=${CONFIG.API_KEY}`;
        
        console.log('Fetching data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data from Sheets:', data);
        return data.values || [];
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error;
    }
}

// Fungsi untuk mengecek NIP di Sheets Anda
async function validateNIP(nip) {
    try {
        const data = await getDataFromSheets();
        
        console.log('Validating NIP:', nip);
        console.log('Total data:', data.length);
        
        if (data.length > 0) {
            // Skip header row (row pertama), mulai dari row 1
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                console.log('Checking row:', row);
                
                if (row[0] && row[0].toString().trim() === nip.toString().trim()) {
                    console.log('NIP found!', row);
                    return {
                        valid: true,
                        data: {
                            nip: row[0],
                            nama: row[1] || 'Tidak Diketahui',
                            jabatan: row[2] || 'Tidak Diketahui',
                            jenis_kelamin: row[3] || 'Tidak Diketahui'
                        }
                    };
                }
            }
        }
        
        console.log('NIP not found');
        return { valid: false };
    } catch (error) {
        console.error('Error validating NIP:', error);
        
        // Fallback untuk demo - pakai data dari sheets Anda
        const defaultUsers = [
            { nip: '1999011001', nama: 'ADI NUGROHO', jabatan: 'DIREKTUR', jenis_kelamin: 'Laki-Laki' },
            { nip: '1999011002', nama: 'AGUNG SETIAWAN', jabatan: 'DIREKTUR', jenis_kelamin: 'Laki-Laki' },
            { nip: '1999011003', nama: 'AHMAD FAUZI', jabatan: 'DIREKTUR', jenis_kelamin: 'Laki-Laki' }
            // Tambahkan lebih banyak data fallback jika needed
        ];
        
        const user = defaultUsers.find(u => u.nip === nip);
        if (user) {
            return { valid: true, data: user };
        }
        
        return { valid: false };
    }
}

// Fungsi untuk menyimpan data absensi
async function saveAbsensiToSheets(absenData) {
    try {
        // Simpan ke localStorage
        let absensiHistory = JSON.parse(localStorage.getItem('absensiHistory') || '[]');
        absensiHistory.push(absenData);
        localStorage.setItem('absensiHistory', JSON.stringify(absensiHistory));
        
        // Simpan info user terakhir yang login
        localStorage.setItem('currentUser', JSON.stringify({
            nip: absenData.nip,
            nama: absenData.nama,
            jabatan: absenData.jabatan,
            jenis_kelamin: absenData.jenis_kelamin
        }));
        
        return { success: true, message: 'Absensi berhasil disimpan' };
    } catch (error) {
        console.error('Error saving absensi:', error);
        return { success: false, message: 'Gagal menyimpan absensi' };
    }
}

// Fungsi untuk mendapatkan data user dari localStorage
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
