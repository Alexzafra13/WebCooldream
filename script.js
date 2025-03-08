// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar elementos con verificación
const marquee = document.querySelector(".marquee");
const marqueeContent = document.querySelector(".marquee-content");
const loader = document.querySelector(".loader");
const loaderProgress = document.querySelector(".loader-progress");
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

// Precargar videos y almacenarlos en caché con progreso
const preloadVideosCache = {};
function preloadVideos(urls, callback) {
  let loadedCount = 0;
  let totalVideos = urls.length;

  // Actualizar progreso inicial
  if (loaderProgress) {
    loaderProgress.textContent = "0%";
  }

  urls.forEach((url) => {
    if (!preloadVideosCache[url]) {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "auto";
      video.load();

      // Evento para seguir el progreso de carga
      video.addEventListener("progress", () => {
        if (video.buffered.length > 0) {
          const percentLoaded = Math.round(
            (video.buffered.end(0) / video.duration) * 100
          );
          const totalPercent = Math.round(
            ((loadedCount + percentLoaded / 100) / totalVideos) * 100
          );

          if (loaderProgress) {
            loaderProgress.textContent = `${totalPercent}%`;
          }
        }
      });

      video.onloadeddata = () => {
        preloadVideosCache[url] = video;
        video.muted = true;
        loadedCount++;

        // Actualizar progreso
        const totalPercent = Math.round((loadedCount / totalVideos) * 100);
        if (loaderProgress) {
          loaderProgress.textContent = `${totalPercent}%`;
        }

        if (loadedCount === totalVideos) callback();
      };

      video.onerror = () => {
        console.error(`Error cargando video: ${url}`);
        preloadVideosCache[url] = null;
        loadedCount++;

        // Actualizar progreso incluso en error
        const totalPercent = Math.round((loadedCount / totalVideos) * 100);
        if (loaderProgress) {
          loaderProgress.textContent = `${totalPercent}%`;
        }

        if (loadedCount === totalVideos) callback();
      };
    } else {
      loadedCount++;

      // Actualizar progreso para videos ya cacheados
      const totalPercent = Math.round((loadedCount / totalVideos) * 100);
      if (loaderProgress) {
        loaderProgress.textContent = `${totalPercent}%`;
      }

      if (loadedCount === totalVideos) callback();
    }
  });
}

// Dividir texto en letras individuales (solo para index.html)
function splitTextIntoLetters(element) {
  // No procesar si ya está procesado y tiene letras
  if (element.querySelectorAll(".letter").length > 0) return;

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
    if (letters.length === 0) return; // Saltar si no tiene letras procesadas

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

// Preparar el marquee para la animación
function prepareMarquee() {
  if (!marqueeContent) return;

  // Añadir un separador extra al final si no existe
  const lastChild = marqueeContent.lastElementChild;
  if (!lastChild || !lastChild.classList.contains("marquee-spacer")) {
    const endSpacer = document.createElement("span");
    endSpacer.className = "marquee-spacer";
    endSpacer.style.display = "inline-block";
    endSpacer.style.width = "50px";
    marqueeContent.appendChild(endSpacer);
  }
}

// Animar el marquee infinito (solo para index.html)
function animateMarquee() {
  if (!marqueeContent) return;

  // Preparar el marquee primero
  prepareMarquee();

  // Asegúrate que el contenido original esté procesado correctamente
  const projectNames = marqueeContent.querySelectorAll(".project-name");
  projectNames.forEach((name) => {
    splitTextIntoLetters(name);
  });

  // Crea un clon del contenido
  const cloneContent = marqueeContent.cloneNode(true);

  // Asegúrate que el contenido clonado está procesado también
  const clonedProjectNames = cloneContent.querySelectorAll(".project-name");
  clonedProjectNames.forEach((name) => {
    splitTextIntoLetters(name);
  });

  // Añadir al marquee
  marquee.appendChild(cloneContent);

  // Configurar para la animación
  const marqueeWidth = marqueeContent.scrollWidth;

  marqueeContent.style.display = "inline-block";
  cloneContent.style.display = "inline-block";
  marqueeContent.style.position = "absolute";
  marqueeContent.style.left = "0";
  cloneContent.style.position = "absolute";
  cloneContent.style.left = `${marqueeWidth}px`;

  // Calcular duración basada en el ancho
  const baseDuration = 5;
  const screenWidth = window.innerWidth;
  const duration = baseDuration * (marqueeWidth / screenWidth);

  // Animar con GSAP
  return gsap.to([marqueeContent, cloneContent], {
    x: `-=${marqueeWidth}`,
    duration: duration,
    ease: "linear",
    repeat: -1,
    modifiers: {
      x: (x) => `${parseFloat(x) % marqueeWidth}px`,
    },
    onRepeat: function () {
      // Asegurarse de que todos los elementos estén procesados después de cada ciclo
      document.querySelectorAll(".project-name").forEach((name) => {
        if (name.querySelectorAll(".letter").length === 0) {
          splitTextIntoLetters(name);
        }
      });
    },
  });
}

// Detectar si es un dispositivo táctil
const isTouchDevice = "ontouchstart" in window || navigator.msMaxTouchPoints;

// Eventos de video (solo para index.html)
function addVideoEvents(elements, marqueeAnimation) {
  elements.forEach((project) => {
    // Evitar añadir eventos múltiples veces
    if (project.hasAttribute("data-events-added")) return;
    project.setAttribute("data-events-added", "true");

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
          currentVideo.muted = true; // Mantener video silenciado como en original
          currentVideo.controls = false; // Sin controles como en el original
          currentVideo.preload = "auto";
          currentVideo.load();
        } else {
          currentVideo.muted = true;
          currentVideo.controls = false;
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
      // Comportamiento original: mostrar al pasar el ratón, ocultar al salir
      project.addEventListener("mouseenter", showVideo);
      project.addEventListener("mouseleave", hideVideo);
    }
  });
}

// Iniciar la aplicación con un solo evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Establecer un tiempo máximo para mostrar el cargador
  const loaderTimeout = setTimeout(() => {
    document.body.classList.add("loaded");
    if (loader) loader.style.display = "none";
    if (navbar) navbar.style.top = "0";
  }, 2000); // Máximo 2 segundos

  // Verificar si estamos en index.html (si existe .marquee)
  if (document.querySelector(".marquee")) {
    const projectNames = document.querySelectorAll(".project-name");
    projectNames.forEach((name) => splitTextIntoLetters(name));

    preloadVideos(videoUrls, () => {
      clearTimeout(loaderTimeout); // Limpiar el timeout si la carga termina antes

      setTimeout(() => {
        document.body.classList.add("loaded");
        if (loader) loader.style.display = "none";
        if (navbar) navbar.style.top = "0"; // Mostrar navbar
      }, 500);

      const marqueeAnimation = animateMarquee();

      if (marquee) {
        marquee.addEventListener("mousemove", handleMouseMove);
        marquee.addEventListener("mouseleave", handleMouseLeave);

        // Añadir eventos a todos los nombres de proyecto
        const allProjectNames = document.querySelectorAll(".project-name");
        addVideoEvents(allProjectNames, marqueeAnimation);

        // Añadir eventos también a los clonados
        setTimeout(() => {
          const clonedNames = document.querySelectorAll(
            ".marquee .marquee-content:last-child .project-name"
          );
          addVideoEvents(clonedNames, marqueeAnimation);
        }, 100); // Pequeño retraso para asegurar que los clones estén listos
      }
    });
  } else {
    // Para otras páginas como contacto.html, tienda.html, etc.
    clearTimeout(loaderTimeout);
    document.body.classList.add("loaded");
    if (loader) loader.style.display = "none";
    if (navbar) navbar.style.top = "0"; // Mostrar navbar inmediatamente

    // Animaciones específicas para cada página
    if (document.querySelector(".contacto-content")) {
      gsap.from(".contacto-content", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out",
      });
    }

    if (document.querySelector(".conciertos-content")) {
      gsap.from(".conciertos-content h2", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".conciertos-filtros", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from(".concierto-item", {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out",
      });
    }
  }

  const form = document.querySelector(".contacto-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Formulario enviado");
    });
  }

  // Asegúrate de que el botón hamburguesa funcione con Bootstrap
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navbarNav = document.querySelector("#navbarNav");

  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      hamburgerMenu.classList.toggle("active");
      navbarNav.classList.toggle("collapse");
    });
  }
});

// Lógica para ocultar y mostrar la navbar al hacer scroll
let lastScrollTop = 0;
window.addEventListener("scroll", function () {
  if (!navbar) return;
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Ocultar la navbar al hacer scroll hacia abajo después de 100px
    navbar.style.top = `-${navbar.offsetHeight}px`;
  } else {
    // Mostrar la navbar al hacer scroll hacia arriba
    navbar.style.top = "0";
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
