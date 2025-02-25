// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar elementos
const marquee = document.querySelector(".marquee");
const marqueeContent = document.querySelector(".marquee-content");
const marqueeWidth = marqueeContent.scrollWidth;
const loader = document.querySelector(".loader");

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
      video.load(); // Asegurar carga completa
      video.onloadeddata = () => {
        preloadVideosCache[url] = video;
        video.muted = true; // Asegurar que esté mutado para autoplay
        loadedCount++;
        if (loadedCount === urls.length) callback();
      };
      video.onerror = () => {
        preloadVideosCache[url] = null; // Manejo de errores
        loadedCount++;
        if (loadedCount === urls.length) callback();
      };
    } else {
      loadedCount++;
      if (loadedCount === urls.length) callback();
    }
  });
}

// Dividir texto en letras individuales, preservando espacios y layout
function splitTextIntoLetters(element) {
  const text = element.textContent.trim();
  element.innerHTML = ""; // Limpiar el contenido antes de agregar las letras

  let currentWord = "";
  let isSpace = false;

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
      spaceSpan.innerHTML = " "; // Espacio no rompible
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
      const maxDistance = 100; // Rango del efecto por letra

      if (distance < maxDistance) {
        const scale = 1 + (1 - distance / maxDistance) * 0.5; // Escala de 1 a 1.5
        gsap.to(letter, { scale: scale, duration: 0.1, ease: "power2.out" });
      } else {
        gsap.to(letter, { scale: 1, duration: 0.1, ease: "power2.out" });
      }
    });
  });
}

// Restablecer letras cuando el ratón sale del marquee
function handleMouseLeave() {
  const letters = document.querySelectorAll(".letter");
  letters.forEach((letter) => {
    gsap.to(letter, { scale: 1, duration: 0.1, ease: "power2.out" });
  });
}

// Animar el marquee infinito
function animateMarquee() {
  const marqueeWidth = marqueeContent.scrollWidth;
  const cloneContent = marqueeContent.cloneNode(true);
  marquee.appendChild(cloneContent);

  marqueeContent.style.display = "inline-block";
  cloneContent.style.display = "inline-block";

  marqueeContent.style.position = "absolute";
  marqueeContent.style.left = "0";
  cloneContent.style.position = "absolute";
  cloneContent.style.left = `${marqueeWidth}px`;

  const baseDuration = 15;
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

// Eventos de video con gestión continua y reproducción asegurada
function addVideoEvents(elements, marqueeAnimation) {
  elements.forEach((project) => {
    let currentVideo = null; // Video actual para este proyecto

    project.addEventListener("mouseenter", () => {
      marqueeAnimation.pause(); // Pausar el marquee al entrar
      const videoSrc = project.getAttribute("data-video");
      if (videoSrc) {
        // Limpiar contenedor antes de añadir un nuevo video
        videoContainer.innerHTML = ""; // Limpiar explícitamente
        videoContainer.style.display = "block";

        // Usar video precargado si existe, o crear uno nuevo
        currentVideo =
          preloadVideosCache[videoSrc] || document.createElement("video");
        if (!preloadVideosCache[videoSrc]) {
          currentVideo.src = videoSrc;
          currentVideo.muted = true;
          currentVideo.preload = "auto";
          currentVideo.load(); // Asegurar carga completa
        }

        // Añadir o reemplazar el video en el contenedor
        videoContainer.appendChild(currentVideo);
        currentVideo.autoplay = true;

        // Asegurar reproducción continua con manejo de errores
        try {
          if (currentVideo.readyState >= 2) {
            // Video cargado o casi cargado
            currentVideo.play();
          } else {
            currentVideo.onloadeddata = () => {
              currentVideo.play().catch((error) => {
                console.error(
                  "Error al reproducir el video tras carga:",
                  error
                );
                currentVideo.currentTime = 0; // Reiniciar si falla
                currentVideo
                  .play()
                  .catch((err) => console.error("Reintento fallido:", err));
              });
            };
          }
        } catch (error) {
          console.error("Error al reproducir el video:", error);
          currentVideo.currentTime = 0; // Reiniciar si falla
          currentVideo
            .play()
            .catch((err) => console.error("Reintento fallido:", err));
        }

        // Detectar pausas automáticas y reanudar
        currentVideo.onpause = () => {
          if (videoContainer.style.display === "block") {
            try {
              currentVideo.play();
            } catch (err) {
              console.error("Error al reanudar el video:", err);
              currentVideo.currentTime = 0; // Reiniciar si falla
              currentVideo
                .play()
                .catch((e) =>
                  console.error("Reintento fallido al reanudar:", e)
                );
            }
          }
        };

        // Detectar fin del video y reiniciar si es necesario
        currentVideo.onended = () => {
          if (videoContainer.style.display === "block") {
            currentVideo.currentTime = 0;
            currentVideo
              .play()
              .catch((error) =>
                console.error("Error al reiniciar el video:", error)
              );
          }
        };
      }
    });

    project.addEventListener("mouseleave", () => {
      if (currentVideo) {
        currentVideo.pause(); // Pausar pero no eliminar
        videoContainer.style.display = "none";
      }
      marqueeAnimation.play(); // Reanudar el marquee al salir
    });
  });
}

// Iniciar la aplicación cuando cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Dividir nombres en letras
  const projectNames = document.querySelectorAll(".project-name");
  projectNames.forEach((name) => splitTextIntoLetters(name));

  // Iniciar precarga de videos y animación
  preloadVideos(videoUrls, () => {
    document.body.classList.add("loaded");
    loader.style.display = "none";

    // Animar el marquee
    const marqueeAnimation = animateMarquee();

    // Agregar eventos de movimiento y salida al marquee
    marquee.addEventListener("mousemove", handleMouseMove);
    marquee.addEventListener("mouseleave", handleMouseLeave);

    // Aplicar eventos de video a los nombres originales y clonados
    addVideoEvents(projectNames, marqueeAnimation);
    const clonedProjects = document.querySelectorAll(
      ".marquee .marquee-content:last-child .project-name"
    );
    addVideoEvents(clonedProjects, marqueeAnimation);
  });
});
