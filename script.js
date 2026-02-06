function updateLayout() {
  const isMobile = window.innerWidth <= 768;

  const bg = isMobile 
    ? document.getElementById("bgMobile") 
    : document.getElementById("bgDesktop");

  const logo = document.getElementById("logo");
  const info = document.getElementById("infoArea");

  if (!bg.complete) return;

  // ukuran poster asli (DESKTOP)
  const ORIGINAL_WIDTH = isMobile ? 1080 : 1920;
  const ORIGINAL_HEIGHT = 3000;

  // posisi di poster asli (EDIT SESUAI POSTERMU)
  const LOGO_TOP_ORIGINAL = isMobile ? 360 : 420;   // posisi logo dari atas (px)
  const LOGO_WIDTH_ORIGINAL = isMobile ? 420 : 520; // ukuran logo (px)
  const GAP_ORIGINAL = isMobile ? 120 : 140;        // jarak logo ke info (px)

  // skala poster di layar
  const displayedWidth = bg.clientWidth;
  const scale = displayedWidth / ORIGINAL_WIDTH;

  // hitung posisi & ukuran
  const logoTop = LOGO_TOP_ORIGINAL * scale;
  const logoWidth = LOGO_WIDTH_ORIGINAL * scale;
  const gap = GAP_ORIGINAL * scale;

  logo.style.top = logoTop + "px";
  logo.style.width = logoWidth + "px";

  info.style.top = (logoTop + logoWidth * 0.8 + gap) + "px";
}

// jalankan saat load & resize
window.addEventListener("load", updateLayout);
window.addEventListener("resize", updateLayout);
