/* ── NAV: scroll effect ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── NAV: mobile toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── FADE-IN on scroll ── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll(
  '.service-card, .staff-card, .gallery-item, .why__text, .why__visual, .contact__info, .contact__form'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

/* ── GALLERY LIGHTBOX ── */
const galleryItems = document.querySelectorAll('.gallery-item img');
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
let currentIndex   = 0;

function openLightbox(index) {
  if (!galleryItems.length) return;
  currentIndex = index;
  lightboxImg.src = galleryItems[currentIndex].src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function prevImage() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  lightboxImg.src = galleryItems[currentIndex].src;
}
function nextImage() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  lightboxImg.src = galleryItems[currentIndex].src;
}

galleryItems.forEach((img, i) => img.parentElement.addEventListener('click', () => openLightbox(i)));
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', prevImage);
document.getElementById('lightboxNext').addEventListener('click', nextImage);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

/* ── CONTACT FORM ── */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}
function clearErrors() {
  ['nameError', 'emailError', 'problemError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const problem = form.problem.value.trim();
  let valid = true;

  if (!name) { showError('nameError', 'Please enter your name.'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('emailError', 'Please enter a valid email address.'); valid = false;
  }
  if (!problem) { showError('problemError', 'Please describe your problem.'); valid = false; }

  if (!valid) return;

  /* ─ Replace this section with a real form backend (Formspree, EmailJS, etc.) ─ */
  const subject  = encodeURIComponent('Vehicle Service Request – Z Expert');
  const body     = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${form.phone.value}\nVehicle: ${form.vehicle.value}\n\nProblem:\n${problem}`
  );
  window.location.href = `mailto:zexpertautomotive@gmail.com?subject=${subject}&body=${body}`;
  /* ─────────────────────────────────────────────────────────────────────────── */

  formSuccess.classList.add('show');
  form.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});
