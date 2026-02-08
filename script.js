// ==========================================
// 1. CONFIG (SUDAH DIPERBAIKI)
// ==========================================
// Perhatikan: URL harus berakhiran .supabase.co (Bukan supabase.com/dashboard/...)
const SUPABASE_URL = "https://doipusobdhpoatpaxikt.supabase.co"; 

// Key ini sudah benar (Anon Public Key)
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXB1c29iZGhwb2F0cGF4aWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM1NDEsImV4cCI6MjA4NjEzOTU0MX0.b-ol2RBbkKR5OHqKNhxD-nPpyrPEKEDp-Vl7IWdvgCE";

// Inisialisasi
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = null;
let html5QrcodeScanner = null;
let qrTimer = null;

// ==========================================
// 2. NAVIGASI
// ==========================================
window.navTo = (id) => {
    document.querySelectorAll('.card-section, #landing-page').forEach(el => el.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    // Matikan scanner kalau pindah halaman
    if(id !== 'dashboard-panitia' && html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.log(e));
    }
};

window.setTab = (type) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if(type === 'alumni') {
        document.getElementById('field-alumni').classList.remove('hidden');
        document.getElementById('field-non-alumni').classList.add('hidden');
    } else {
        document.getElementById('field-alumni').classList.add('hidden');
        document.getElementById('field-non-alumni').classList.remove('hidden');
    }
};

// ==========================================
// 3. REGISTRASI
// ==========================================
document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Memproses..."; btn.disabled = true;

    // Ambil Data
    const nama = document.getElementById('reg-nama').value;
    const email = document.getElementById('reg-email').value;
    const wa = document.getElementById('reg-wa').value;
    const nominal = document.getElementById('reg-nominal').value;
    
    // Password & Undian Auto
    const password = "GLOFEST-" + Math.floor(1000 + Math.random() * 9000);
    const undian = Math.floor(100000 + Math.random() * 900000).toString();

    // Data Tambahan
    let detail = "";
    let kategori = "Non-Alumni";
    if(!document.getElementById('field-alumni').classList.contains('hidden')){
        kategori = "Alumni";
        detail = `Angkatan ${document.getElementById('reg-angkatan').value}`;
    } else {
        detail = document.getElementById('reg-asal').value;
    }

    try {
        // 1. Sign Up Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email, password: password
        });
        if(error) throw error;

        // 2. Masukkan ke Tabel Database
        const { error: dbError } = await supabase.from('profiles').insert([{
            id: data.user.id,
            email: email,
            nama: nama,
            role: 'peserta', // Default
            kategori: kategori,
            detail_info: detail,
            wa: wa,
            kode_undian: undian,
            status_hadir: false,
            // Simpan info bayar di detail text aja biar simpel
            detail_info: `${detail} | Bayar: ${nominal}`
        }]);

        if(dbError) throw dbError;

        alert(`SUKSES!\nEmail: ${email}\nPassword: ${password}\n\nSilakan Screenshot!`);
        window.navTo('login-section');

    } catch (err) {
        alert("Gagal: " + err.message);
    } finally {
        btn.innerText = "KIRIM DATA"; btn.disabled = false;
    }
});

// ==========================================
// 4. LOGIN
// ==========================================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email, password: pass
        });
        if(error) throw error;

        // Ambil Profil User
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        currentUser = profile;
        
        if(profile.role === 'panitia') {
            initPanitia();
        } else {
            initPeserta();
        }

    } catch (err) {
        alert("Login Gagal: " + err.message);
    }
});

window.doLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

// ==========================================
// 5. FITUR PESERTA (QR)
// ==========================================
function initPeserta() {
    window.navTo('dashboard-peserta');
    document.getElementById('u-nama').innerText = currentUser.nama;
    document.getElementById('u-undian').innerText = currentUser.kode_undian;
    
    // Generate QR
    const container = document.getElementById('qrcode');
    container.innerHTML = "";
    
    // QR Data JSON
    const payload = {
        uid: currentUser.id,
        exp: Date.now() + (15 * 60 * 1000) // 15 menit
    };

    new QRCode(container, {
        text: JSON.stringify(payload),
        width: 180, height: 180
    });

    // Timer
    clearInterval(qrTimer);
    const display = document.getElementById('qr-timer');
    qrTimer = setInterval(() => {
        const sisa = payload.exp - Date.now();
        if(sisa < 0) {
            display.innerText = "EXPIRED - REFRESH HALAMAN";
            clearInterval(qrTimer);
        } else {
            const m = Math.floor(sisa / 60000);
            const s = Math.floor((sisa % 60000) / 1000);
            display.innerText = `Refresh dalam ${m}:${s}`;
        }
    }, 1000);
}

// ==========================================
// 6. FITUR PANITIA (SCANNER)
// ==========================================
function initPanitia() {
    window.navTo('dashboard-panitia');
    
    if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render(onScanSuccess);
    }
}

async function onScanSuccess(decodedText) {
    html5QrcodeScanner.pause();
    const resBox = document.getElementById('scan-result');
    const title = document.getElementById('res-title');
    const body = document.getElementById('res-body');
    
    resBox.classList.remove('hidden');
    resBox.className = "result-box"; // Reset class

    try {
        const data = JSON.parse(decodedText);
        
        // 1. Cek Expired
        if(Date.now() > data.exp) throw new Error("QR Code Kadaluwarsa");

        // 2. Cek DB
        const { data: user, error } = await supabase
            .from('profiles').select('*').eq('id', data.uid).single();
            
        if(!user) throw new Error("User Tidak Ditemukan");

        // 3. Logic Absen
        if(user.status_hadir) {
            title.innerText = "⚠️ SUDAH HADIR";
            body.innerText = `${user.nama} sudah scan sebelumnya.`;
            resBox.classList.add('invalid');
        } else {
            // Update Hadir
            await supabase.from('profiles').update({ status_hadir: true }).eq('id', data.uid);
            title.innerText = "✅ VALID";
            body.innerText = `Selamat Datang, ${user.nama} (${user.kategori})`;
            resBox.classList.add('valid');
        }

    } catch (err) {
        title.innerText = "❌ GAGAL";
        body.innerText = err.message;
        resBox.classList.add('invalid');
    }
}

window.resetScanner = () => {
    document.getElementById('scan-result').classList.add('hidden');
    html5QrcodeScanner.resume();
};
