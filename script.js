function scrollToContent() {
  document.querySelector(".content").scrollIntoView({
    behavior: "smooth"
  });
}

/* efek muncul saat scroll */
const cards = document.querySelectorAll(".card");

window.addEventListener("scroll", () => {
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }
  });
});

/* initial state animation */
cards.forEach(card => {
  card.style.opacity = 0;
  card.style.transform = "translateY(40px)";
});
