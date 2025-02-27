// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar elementos con verificación
const marquee = document.querySelector(".marquee");
const marqueeContent = document.querySelector(".marquee-content");
const loader = document.querySelector(".loader");
if (!marquee || !marqueeContent || !loader) {
  console.error(
    "Faltan elementos en el HTML: .marquee, .marquee-content o .loader"
  );
}

// Lista de videos a precargar
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

// Dividir texto en letras individuales
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

// Efecto dinámico por letra al mover el ratón
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

// Restablecer letras al salir del marquee
function handleMouseLeave() {
  const letters = document.querySelectorAll(".letter");
  letters.forEach((letter) => {
    gsap.to(letter, { scale: 1, duration: 0.1, ease: "power2.out" });
  });
}

// Animar el marquee infinito
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
  const baseDuration = 5; // Ajustado para un scroll más lento
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

// Eventos de video
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
        e.preventDefault(); // Evita comportamientos no deseados
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

// Iniciar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  const projectNames = document.querySelectorAll(".project-name");
  projectNames.forEach((name) => splitTextIntoLetters(name));
  preloadVideos(videoUrls, () => {
    setTimeout(() => {
      document.body.classList.add("loaded");
      if (loader) loader.style.display = "none";
    }, 500); // Retraso de 500ms para asegurar una transición suave
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
});
document.addEventListener("DOMContentLoaded", function () {
  // Animación de entrada para la sección de contacto
  gsap.from(".contacto-content", {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out",
  });

  // Lógica para el envío del formulario (ejemplo con Netlify)
  const form = document.querySelector(".contacto-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log("Formulario enviado");
  });
});