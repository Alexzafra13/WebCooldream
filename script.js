// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar elementos con verificación
const marquee = document.querySelector(".marquee");
const marqueeContent = document.querySelector(".marquee-content");
const loader = document.querySelector(".loader");
const navbar = document.querySelector(".navbar");

// Lista de videos a precargar (solo para index.html)
const videoUrls = [
  "video/Invierno.mp4",
  "video/El_Desayuno.mp4",
  "video/Huellas.mp4",
  "video/Loco_Maravilloso.mp4",
  "video/Orbita_Lunar.mp4",
  "video/Momentos_Dificiles_De_Olvidar.mp4",
];

// Precargar videos y almacenarlos en caché
const preloadVideosCache = {};
function preloadVideos(urls, callback) {
  let loadedCount = 0;
  urls.forEach((url) => {
    if (!preloadVideosCache[url]) {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "auto";
      video.load();
      video.onloadeddata = () => {
        preloadVideosCache[url] = video;
        video.muted = true;
        loadedCount++;
        if (loadedCount === urls.length) callback();
      };
      video.onerror = () => {
        console.error(`Error cargando video: ${url}`);
        preloadVideosCache[url] = null;
        loadedCount++;
        if (loadedCount === urls.length) callback();
      };
    } else {
      loadedCount++;
      if (loadedCount === urls.length) callback();
    }
  });
}

// Dividir texto en letras individuales (solo para index.html)
function splitTextIntoLetters(element) {
  const text = element.textContent.trim();
  element.innerHTML = "";
  let currentWord = "";
  text.split("").forEach((char, index) => {
    if (char === " ") {
      if (currentWord) {
        const wordSpan = document.createElement("span");
        wordSpan.className = "word";
        wordSpan.innerHTML = currentWord
          .split("")
          .map((letter) => `<span class="letter">${letter}</span>`)
          .join("");
        element.appendChild(wordSpan);
        currentWord = "";
      }
      const spaceSpan = document.createElement("span");
      spaceSpan.className = "space";
      spaceSpan.innerHTML = " ";
      element.appendChild(spaceSpan);
    } else {
      currentWord += char;
      if (index === text.length - 1 && currentWord) {
        const wordSpan = document.createElement("span");
        wordSpan.className = "word";
        wordSpan.innerHTML = currentWord
          .split("")
          .map((letter) => `<span class="letter">${letter}</span>`)
          .join("");
        element.appendChild(wordSpan);
      }
    }
  });
}

// Efecto dinámico por letra al mover el ratón (solo para index.html)
function handleMouseMove(e) {
  const mouseX = e.clientX;
  const projectNames = document.querySelectorAll(".project-name");
  projectNames.forEach((name) => {
    const letters = name.querySelectorAll(".letter");
    const rect = name.getBoundingClientRect();
    const nameLeft = rect.left;
    const nameWidth = rect.width;
    letters.forEach((letter, index) => {
      const letterCenter =
        nameLeft + (index + 0.5) * (nameWidth / letters.length);
      const distance = Math.abs(mouseX - letterCenter);
      const maxDistance = 100;
      if (distance < maxDistance) {
        const scale = 1 + (1 - distance / maxDistance) * 0.5;
        gsap.to(letter, { scale: scale, duration: 0.1, ease: "power2.out" });
      } else {
        gsap.to(letter, { scale: 1, duration: 0.1, ease: "power2.out" });
      }
    });
  });
}

// Restablecer letras al salir del marquee (solo para index.html)
function handleMouseLeave() {
  const letters = document.querySelectorAll(".letter");
  letters.forEach((letter) => {
    gsap.to(letter, { scale: 1, duration: 0.1, ease: "power2.out" });
  });
}

// Animar el marquee infinito (solo para index.html)
function animateMarquee() {
  if (!marqueeContent) return;
  const marqueeWidth = marqueeContent.scrollWidth;
  const cloneContent = marqueeContent.cloneNode(true);
  marquee.appendChild(cloneContent);
  marqueeContent.style.display = "inline-block";
  cloneContent.style.display = "inline-block";
  marqueeContent.style.position = "absolute";
  marqueeContent.style.left = "0";
  cloneContent.style.position = "absolute";
  cloneContent.style.left = `${marqueeWidth}px`;
  const baseDuration = 5;
  const screenWidth = window.innerWidth;
  const duration = baseDuration * (marqueeWidth / screenWidth);
  return gsap.to([marqueeContent, cloneContent], {
    x: `-=${marqueeWidth}`,
    duration: duration,
    ease: "linear",
    repeat: -1,
    modifiers: {
      x: (x) => `${parseFloat(x) % marqueeWidth}px`,
    },
  });
}

// Detectar si es un dispositivo táctil
const isTouchDevice = "ontouchstart" in window || navigator.msMaxTouchPoints;

// Eventos de video (solo para index.html)
function addVideoEvents(elements, marqueeAnimation) {
  elements.forEach((project) => {
    let currentVideo = null;

    const showVideo = () => {
      marqueeAnimation.pause();
      const videoSrc = project.getAttribute("data-video");
      if (videoSrc) {
        videoContainer.innerHTML = "";
        videoContainer.style.display = "block";
        currentVideo =
          preloadVideosCache[videoSrc] || document.createElement("video");
        if (!preloadVideosCache[videoSrc]) {
          currentVideo.src = videoSrc;
          currentVideo.muted = true;
          currentVideo.preload = "auto";
          currentVideo.load();
        }
        videoContainer.appendChild(currentVideo);
        currentVideo.autoplay = true;
        if (currentVideo.readyState >= 2) {
          currentVideo
            .play()
            .catch((err) => console.error("Error al reproducir:", err));
        } else {
          currentVideo.onloadeddata = () =>
            currentVideo
              .play()
              .catch((err) => console.error("Error tras carga:", err));
        }
      }
    };

    const hideVideo = () => {
      if (currentVideo) {
        currentVideo.pause();
        videoContainer.style.display = "none";
      }
      marqueeAnimation.play();
    };

    if (isTouchDevice) {
      project.addEventListener("click", (e) => {
        e.preventDefault();
        if (videoContainer.style.display === "block") {
          hideVideo();
        } else {
          showVideo();
        }
      });
    } else {
      project.addEventListener("mouseenter", showVideo);
      project.addEventListener("mouseleave", hideVideo);
    }
  });
}

// Iniciar la aplicación con un solo evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si estamos en index.html (si existe .marquee)
  if (document.querySelector(".marquee")) {
    const projectNames = document.querySelectorAll(".project-name");
    projectNames.forEach((name) => splitTextIntoLetters(name));
    preloadVideos(videoUrls, () => {
      setTimeout(() => {
        document.body.classList.add("loaded");
        if (loader) loader.style.display = "none";
        if (navbar) navbar.style.top = "0"; // Mostrar navbar después de 500ms
      }, 500);
      const marqueeAnimation = animateMarquee();
      if (marquee) {
        marquee.addEventListener("mousemove", handleMouseMove);
        marquee.addEventListener("mouseleave", handleMouseLeave);
        addVideoEvents(projectNames, marqueeAnimation);
        const clonedProjects = document.querySelectorAll(
          ".marquee .marquee-content:last-child .project-name"
        );
        addVideoEvents(clonedProjects, marqueeAnimation);
      }
    });
  } else {
    // Para otras páginas como contacto.html
    document.body.classList.add("loaded");
    if (loader) loader.style.display = "none";
    if (navbar) navbar.style.top = "0"; // Mostrar navbar inmediatamente
  }

  // Funcionalidad específica para contacto.html
  if (document.querySelector(".contacto-content")) {
    gsap.from(".contacto-content", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
    });
  }

  const form = document.querySelector(".contacto-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Formulario enviado");
    });
  }
});

// Lógica para ocultar y mostrar la navbar al hacer scroll
let lastScrollTop = 0;
window.addEventListener("scroll", function () {
  if (!navbar) return;
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 0) {
    // Ocultar la navbar al hacer scroll hacia abajo
    navbar.style.top = `-${navbar.offsetHeight}px`;
  } else if (scrollTop === 0) {
    // Mostrar la navbar solo cuando estamos en el tope
    navbar.style.top = "0";
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});