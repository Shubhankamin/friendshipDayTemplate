gsap.registerPlugin(ScrollTrigger);

/* ================= Lenis smooth scroll ================= */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute("href"));
    if (target) lenis.scrollTo(target, { offset: -40 });
  });
});

/* ================= Three.js twinkling starfield ================= */
const canvas = document.getElementById("stars-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.z = 8;

const starCount = 700;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xf8c76a,
  size: 0.06,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

const clock = new THREE.Clock();
function animateStars() {
  const t = clock.getElapsedTime();
  starMat.opacity = 0.55 + Math.sin(t * 1.2) * 0.25;
  stars.rotation.y = t * 0.008;
  renderer.render(scene, camera);
  requestAnimationFrame(animateStars);
}
animateStars();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ================= scroll progress bar ================= */
const progressBar = document.getElementById("progressBar");
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + "%";
}
lenis.on("scroll", updateProgress);
updateProgress();

/* ================= custom cursor ================= */
const isTouch = window.matchMedia("(hover:none), (pointer:coarse)").matches;
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
if (!isTouch && cursorDot && cursorRing) {
  let mouseX = window.innerWidth / 2,
    mouseY = window.innerHeight / 2;
  let ringX = mouseX,
    ringY = mouseY;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });
  function ringLoop() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    gsap.set(cursorRing, { x: ringX, y: ringY });
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  const hoverTargets =
    "a, button, .polaroid, .film-card, .jar, .heart-frame, .sticky-note, li";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) cursorRing.classList.add("hovering");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) cursorRing.classList.remove("hovering");
  });
}

/* ================= magnetic buttons ================= */
if (!isTouch) {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: relX * 0.25,
        y: relY * 0.35,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
    });
  });
}

/* ================= ripple effect on .cta click ================= */
document.querySelectorAll(".cta").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

/* ================= tilt effect on polaroids & film cards ================= */
if (!isTouch) {
  document.querySelectorAll(".polaroid, .film-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: py * -10,
        rotateY: px * 10,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 600,
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  });
}

/* ================= moon float ================= */
gsap.to(".moon", {
  y: -14,
  duration: 3.2,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

/* ================= generic reveal on scroll ================= */
document.querySelectorAll(".reveal").forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

/* hero reveal immediately on load */
gsap
  .timeline({ defaults: { ease: "power3.out" } })
  .to(".hero .reveal", { opacity: 1, y: 0, duration: 1, stagger: 0.15 });

/* ================= handwritten ink-draw effect ================= */
/* elements with .script-reveal get a left-to-right "written by hand" reveal */
document.querySelectorAll(".script-reveal").forEach((el) => {
  gsap.fromTo(
    el,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.3,
      ease: "power2.inOut",
      scrollTrigger: { trigger: el, start: "top 85%" },
    },
  );
});

/* underline stroke draw beneath "for life." in hero */
const underlinePath = document.getElementById("underlinePath");
if (underlinePath) {
  const ulen = underlinePath.getTotalLength();
  underlinePath.style.strokeDasharray = ulen;
  underlinePath.style.strokeDashoffset = ulen;
  gsap.to(underlinePath, {
    strokeDashoffset: 0,
    duration: 1,
    delay: 1.1,
    ease: "power2.inOut",
  });
}

/* ================= polaroid gentle swing ================= */
gsap.to("#heroPolaroid", {
  rotate: "+=4",
  duration: 3.4,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
  transformOrigin: "top center",
});
document.querySelectorAll(".memory-grid .polaroid").forEach((p, i) => {
  gsap.to(p, {
    rotate: "+=3",
    duration: 3 + (i % 3),
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    transformOrigin: "top center",
  });
});

/* ================= jar glow pulse (chapter 2) ================= */
gsap.to("#jarEl", {
  filter: "drop-shadow(0 0 65px rgba(248,199,106,.75))",
  duration: 2,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

/* ================= heart frame draw + glow (finale) ================= */
const heartPath = document.getElementById("heartPath");
if (heartPath) {
  const len = heartPath.getTotalLength();
  heartPath.style.strokeDasharray = len;
  heartPath.style.strokeDashoffset = len;
  ScrollTrigger.create({
    trigger: "#heartFrame",
    start: "top 80%",
    onEnter: () => {
      gsap.to(heartPath, {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.inOut",
      });
      gsap.to(heartPath, {
        delay: 2,
        filter: "drop-shadow(0 0 10px rgba(248,199,106,.9))",
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
  });
}

/* ================= lanterns floating in finale ================= */
const finale = document.getElementById("chapter6");
const lanternCount = window.innerWidth < 560 ? 3 : 5;
for (let i = 0; i < lanternCount; i++) {
  const l = document.createElement("div");
  l.className = "lantern";
  l.textContent = "🏮";
  l.style.left = 8 + i * (80 / lanternCount) + Math.random() * 6 + "%";
  l.style.bottom = "-40px";
  finale.appendChild(l);
  gsap.to(l, {
    y: -600 - Math.random() * 200,
    x: `+=${(Math.random() - 0.5) * 80}`,
    opacity: 0.9,
    duration: 10 + Math.random() * 6,
    delay: i * 1.3,
    repeat: -1,
    ease: "sine.inOut",
    onRepeat: () => {
      gsap.set(l, { y: 0, opacity: 0.9 });
    },
  });
}

/* ================= confetti + glow finale button ================= */
const celebrateBtn = document.getElementById("celebrateBtn");
if (celebrateBtn) {
  celebrateBtn.addEventListener("click", () => {
    const duration = 2200;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: ["#F8C76A", "#e8a2b0", "#ffffff"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: ["#F8C76A", "#e8a2b0", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    gsap.fromTo(
      "#heartFrame",
      { scale: 1 },
      {
        scale: 1.08,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      },
    );
  });
}

/* ================= envelope modal ================= */
const envelopeFab = document.getElementById("envelopeFab");
const envelopeModal = document.getElementById("envelopeModal");
const letterPaper = document.getElementById("letterPaper");
const closeModal = document.getElementById("closeModal");

if (envelopeFab) {
  envelopeFab.addEventListener("click", () => {
    envelopeModal.classList.add("open");
    gsap.fromTo(
      letterPaper,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
    );
  });
  function closeEnvelope() {
    gsap.to(letterPaper, {
      y: 30,
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      onComplete: () => {
        envelopeModal.classList.remove("open");
      },
    });
  }
  closeModal.addEventListener("click", closeEnvelope);
  envelopeModal.addEventListener("click", (e) => {
    if (e.target === envelopeModal) closeEnvelope();
  });
}

/* ================= background music toggle ================= */
const bgAudio = document.getElementById("bgAudio");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");
let playing = false;
if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (!playing) {
      bgAudio.volume = 0.35;
      bgAudio.play().catch(() => {});
      musicBtn.classList.remove("paused");
      musicLabel.textContent = "Playing Our Song";
      playing = true;
    } else {
      bgAudio.pause();
      musicBtn.classList.add("paused");
      musicLabel.textContent = "Play Our Song";
      playing = false;
    }
  });
}

/* ================= lightbox for memory grid + film cards ================= */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxInner = document.getElementById("lightboxInner");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(imgSrc, caption) {
  lightboxImg.src = imgSrc;
  lightboxCaption.textContent = caption || "";
  lightbox.classList.add("open");
  gsap.fromTo(
    lightboxInner,
    { scale: 0.9, rotate: -2, opacity: 0 },
    { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" },
  );
}
function closeLightbox() {
  gsap.to(lightboxInner, {
    scale: 0.9,
    opacity: 0,
    duration: 0.25,
    onComplete: () => {
      lightbox.classList.remove("open");
    },
  });
}
if (lightbox) {
  document
    .querySelectorAll(".memory-grid .polaroid, .film-card")
    .forEach((el) => {
      el.addEventListener("click", () => {
        const img = el.querySelector("img");
        if (img) openLightbox(img.src, el.getAttribute("data-caption"));
      });
    });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ================= jar click sparkle burst ================= */
const jarEl = document.getElementById("jarEl");
if (jarEl) {
  jarEl.addEventListener("click", () => {
    gsap.fromTo(
      jarEl,
      { scale: 1 },
      {
        scale: 1.15,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      },
    );
    const wrap = jarEl.parentElement;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("div");
      s.className = "spark";
      s.textContent = ["✨", "♡", "⭐"][i % 3];
      s.style.left = "50%";
      s.style.top = "50%";
      wrap.appendChild(s);
      const angle = (Math.PI * 2 * i) / 10;
      const dist = 60 + Math.random() * 40;
      gsap.fromTo(
        s,
        { opacity: 1, x: 0, y: 0, scale: 0.6 },
        {
          opacity: 0,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 20,
          scale: 1.2,
          duration: 0.9,
          ease: "power2.out",
          onComplete: () => s.remove(),
        },
      );
    }
  });
}

/* memory hint pulse */
const memoryHint = document.getElementById("memoryHint");
if (memoryHint) {
  gsap.to(memoryHint, {
    scale: 1.04,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}
