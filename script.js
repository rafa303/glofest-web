function updateLayout() {
  const isMobile = window.innerWidth <= 768;

  const bg = isMobile 
    ? document.getElementById("bgMobile") 
    : document.getElementById("bgDesktop");

  const logo = document.getElementById("logo");
  const info = document.getElementById("infoArea");

  if (!bg.complete) return;

  // ukuran poster asli
  const ORIGINAL_WIDTH = isMobile ? 1080 : 1920;

  // === TUNING POSTER (INI YANG KITA UBAH) ===
  const LOGO_TOP_ORIGINAL = isMobile ? 170 : 180;   // LOGO LEBIH NAIK
  const LOGO_WIDTH_ORIGINAL = isMobile ? 600 : 800; // LOGO DIPERBESAR
  const GAP_ORIGINAL = isMobile ? 40 : 50;          // JARAK LOGO ↔ INFO DIPERKECIL

  // skala poster
  const displayedWidth = bg.clientWidth;
  const scale = displayedWidth / ORIGINAL_WIDTH;

  // hitung posisi & ukuran
  const logoTop = LOGO_TOP_ORIGINAL * scale;
  const logoWidth = LOGO_WIDTH_ORIGINAL * scale;
  const gap = GAP_ORIGINAL * scale;

  logo.style.top = logoTop + "px";
  logo.style.width = logoWidth + "px";

  info.style.top = (logoTop + logoWidth * 0.75 + gap) + "px";
}

window.addEventListener("load", updateLayout);
window.addEventListener("resize", updateLayout);
