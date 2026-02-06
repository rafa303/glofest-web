// ===== COUNTDOWN GLOFEST =====
const eventDate = new Date("2026-03-08T16:00:00").getTime();
const countdownEl = document.getElementById("countdown");

function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance <= 0) {
    countdownEl.innerHTML = "<span>🔥 Acara Dimulai!</span>";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownEl.innerHTML = `
    <span>${days} Hari</span>
    <span>${hours} Jam</span>
    <span>${minutes} Menit</span>
    <span>${seconds} Detik</span>
  `;
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ===== SCROLL REVEAL ANIMATION =====
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < windowHeight - 80) {
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ===== PARALLAX BACKGROUND =====
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.querySelector(".bg").style.transform = `translateY(${scrollY * 0.2}px)`;
});


// ===== HERO GLOW ANIMATION =====
const glowText = document.querySelector(".glow");
let glow = 0;

setInterval(() => {
  glow = (glow + 1) % 100;
  glowText.style.textShadow = `
    0 0 ${10 + glow * 0.1}px rgba(255,215,160,0.4),
    0 0 ${30 + glow * 0.2}px rgba(255,215,160,0.2)
  `;
}, 100);
