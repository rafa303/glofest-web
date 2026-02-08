// ==========================================
// 1. CONFIGURATION (SUDAH DIPERBAIKI)
// ==========================================
// URL API yang benar (bukan dashboard)
const SUPABASE_URL = "https://doipusobdhpoatpaxikt.supabase.co"; 

// Key Anon Public yang benar
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXB1c29iZGhwb2F0cGF4aWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM1NDEsImV4cCI6MjA4NjEzOTU0MX0.b-ol2RBbkKR5OHqKNhxD-nPpyrPEKEDp-Vl7IWdvgCE";

// Inisialisasi Client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Global Variables
let currentUser = null;
let html5QrcodeScanner = null;
let qrTimer = null;

// ==========================================
// 2. NAVIGASI (Fungsi navTo ada di sini!)
// ==========================================
window.navTo = (id) => {
    // Sembunyikan semua halaman
    document.querySelectorAll('.card-section, #landing-page').forEach(el => el.classList.add('hidden'));
    
    // Munculkan halaman yang dipilih
    const target = document.getElementById(id);
    if(target) {
        target.classList.remove('hidden');
    } else {
        console.error("Halaman tidak ditemukan: " + id);
    }
    
    // Matikan scanner kalau pindah halaman (biar kamera mati)
    if(id !== 'dashboard-panitia' && html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.log("Scanner clear error:", e));
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
const regForm = document.getElementById('reg-form');
if(regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "Memproses..."; btn.disabled = true;

        // Ambil Data Input
        const nama = document.getElementById('reg-nama').value;
        const email = document.getElementById('reg-email').value;
        const wa = document.getElementById('reg-wa').value;
        const nominal = document.getElementById('reg-nominal').value;
        
        // Generate Password & Undian
        const password = "GLOFEST-" + Math.floor(1000 + Math.random() * 9000);
        const undian = Math.floor(100000 + Math.random() * 900000).toString();

        // Cek Kategori
        let detail = "";
        let kategori = "Non-Alumni";
        if(!document.getElementById('field-alumni').classList.contains('hidden')){
            kategori = "Alumni";
            detail = `Angkatan ${document.getElementById('reg-angkatan').value} - ${document.getElementById('reg-kelas').value}`;
        } else {
            detail = document.getElementById('reg-asal').value;
        }

        try {
            // 1. Daftar Akun (Auth)
            const { data, error } = await supabase.auth.signUp({
                email: email, password: password
            });
            if(error) throw error;

            // 2. Simpan Data Profil (Database)
            const { error: dbError } = await supabase.from('profiles').insert([{
                id: data.user.id,
                email: email,
                nama: nama,
                role: 'peserta', 
                kategori: kategori,
                wa: wa,
                kode_undian: undian,
                status_hadir: false,
                detail_info: `${detail} | Bayar: ${nominal}`
            }]);

            if(dbError) throw dbError;

            alert(`SUKSES!\n\nEmail: ${email}\nPassword: ${password}\n\nSilakan Screenshot password ini!`);
            window.navTo('login-section');

        } catch (err) {
            console.error(err);
            alert("Gagal: " + err.message);
        } finally {
            btn.innerText = originalText; btn.disabled = false;
        }
    });
}

// ==========================================
// 4. LOGIN
// ==========================================
const loginForm = document.getElementById('login-form');
if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const btn = e.target.querySelector('button');
        btn.innerText = "Loading...";

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email, password: pass
            });
            if(error) throw error;

            // Ambil Profil User
            const { data: profile, error: profError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if(profError) throw profError;

            currentUser = profile;
            
            if(profile.role === 'panitia') {
                initPanitia();
            } else {
                initPeserta();
            }

        } catch (err) {
            alert("Login Gagal: " + err.message);
        } finally {
            btn.innerText = "MASUK";
        }
    });
}

window.doLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

// ==========================================
// 5. FITUR PESERTA (QR CODE)
// ==========================================
function initPeserta() {
    window.navTo('dashboard-peserta');
    document.getElementById('u-nama').innerText = currentUser.nama;
    document.getElementById('u-undian').innerText = currentUser.kode_undian || '-';
    
    const container = document.getElementById('qrcode');
    container.innerHTML = "";
    
    // QR Data
    const payload = {
        uid: currentUser.id,
        exp: Date.now() + (15 * 60 * 1000) // 15 menit valid
    };

    new QRCode(container, {
        text: JSON.stringify(payload),
        width: 180, height: 180
    });

    // Timer Mundur
    clearInterval(qrTimer);
    const display = document.getElementById('qr-timer');
    
    qrTimer = setInterval(() => {
        const sisa = payload.exp - Date.now();
        if(sisa < 0) {
            display.innerText = "QR EXPIRED - REFRESH HALAMAN";
            container.style.opacity = "0.2";
            clearInterval(qrTimer);
        } else {
            const m = Math.floor(sisa / 60000);
            const s = Math.floor((sisa % 60000) / 1000);
            display.innerText = `Refresh dalam ${m}:${s < 10 ? '0'+s : s}`;
        }
    }, 1000);
}

// ==========================================
// 6. FITUR PANITIA (SCANNER)
// ==========================================
function initPanitia() {
    window.navTo('dashboard-panitia');
    
    // Inisialisasi Scanner (hanya jika belum aktif)
    if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render(onScanSuccess, (err) => { /* ignore errors */ });
    }
}

async function onScanSuccess(decodedText) {
    html5QrcodeScanner.pause(); // Stop scanning sejenak
    
    const resBox = document.getElementById('scan-result');
    const title = document.getElementById('res-title');
    const body = document.getElementById('res-body');
    
    resBox.classList.remove('hidden');
    resBox.className = "result-box"; // Reset warna

    try {
        const data = JSON.parse(decodedText);
        
        // 1. Cek Waktu Expired
        if(Date.now() > data.exp) throw new Error("QR Code Kedaluwarsa!");

        // 2. Cek Database
        const { data: user, error } = await supabase
            .from('profiles').select('*').eq('id', data.uid).single();
            
        if(!user) throw new Error("User Tidak Ditemukan di Database");

        // 3. Cek Status Hadir
        if(user.status_hadir) {
            title.innerText = "⚠️ SUDAH HADIR";
            body.innerText = `${user.nama} sudah scan sebelumnya.`;
            resBox.classList.add('invalid');
        } else {
            // Update jadi Hadir
            await supabase.from('profiles').update({ status_hadir: true }).eq('id', data.uid);
            
            title.innerText = "✅ VALID - SILAKAN MASUK";
            body.innerText = `Nama: ${user.nama}\nKategori: ${user.kategori}`;
            resBox.classList.add('valid');
        }

    } catch (err) {
        title.innerText = "❌ GAGAL / INVALID";
        body.innerText = err.message;
        resBox.classList.add('invalid');
    }
}

window.resetScanner = () => {
    document.getElementById('scan-result').classList.add('hidden');
    html5QrcodeScanner.resume();
};
