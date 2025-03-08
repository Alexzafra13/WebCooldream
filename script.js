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

// Imprimir videos a cargar para depurar
console.log("Videos a cargar:", videoUrls);

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

// Función mejorada para dividir texto en letras individuales con espacios correctos
function splitTextIntoLetters(element) {
  // No procesar si ya está procesado y tiene letras
  if (element.querySelectorAll(".letter").length > 0) return;

  const text = element.textContent.trim();
  element.innerHTML = "";

  // Crear contenedor para las letras
  const lettersContainer = document.createElement("div");
  lettersContainer.className = "letters-container";

  // Dividir primero en palabras, luego en letras
  const words = text.split(" ");

  words.forEach((word, wordIndex) => {
    // Dividir cada palabra en letras
    word.split("").forEach((letter) => {
      const letterSpan = document.createElement("span");
      letterSpan.className = "letter";
      letterSpan.textContent = letter;
      letterSpan.style.display = "inline-block";
      letterSpan.style.transition =
        "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease";
      lettersContainer.appendChild(letterSpan);
    });

    // Añadir espacio entre palabras (excepto después de la última palabra)
    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.className = "letter space"; // Marcar como espacio
      spaceSpan.innerHTML = "&nbsp;"; // Espacio no separable
      spaceSpan.style.display = "inline-block";
      lettersContainer.appendChild(spaceSpan);
    }
  });

  element.appendChild(lettersContainer);
}

// Función actualizada para evitar cortes en la animación de letras
function handleMouseMove(e) {
  const mouseX = e.clientX;
  const projectNames = document.querySelectorAll(".project-name");

  projectNames.forEach((name) => {
    const letters = name.querySelectorAll(".letter");
    if (letters.length === 0) return;

    const rect = name.getBoundingClientRect();

    letters.forEach((letter) => {
      const letterRect = letter.getBoundingClientRect();
      const letterCenter = letterRect.left + letterRect.width / 2;
      const distance = Math.abs(mouseX - letterCenter);
      const maxDistance = 100;

      if (distance < maxDistance && !letter.classList.contains("space")) {
        // Calcular efectos con límites más seguros
        const effect = 1 - distance / maxDistance;

        // Limitar escala y rotación para evitar desbordamientos
        const scale = 1 + 0.5 * effect; // Reducido de 0.8 a 0.5
        const yOffset = -10 * effect; // Reducido de -15 a -10
        const rotation = 5 * effect * (mouseX > letterCenter ? -1 : 1); // Reducido de 10 a 5

        // Aplicar transformaciones
        letter.style.transform = `translateY(${yOffset}px) scale(${scale}) rotate(${rotation}deg)`;
        letter.style.color = "#0d98ba";
        letter.style.textShadow = `0 0 8px rgba(13, 152, 186, 0.8)`;
        letter.style.zIndex = "2"; // Asegurar que las letras activas estén por encima
        letter.classList.add("active");
      } else {
        // Restaurar estado normal
        letter.style.transform = "translateY(0) scale(1) rotate(0)";
        letter.style.color = "";
        letter.style.textShadow = "";
        letter.style.zIndex = "1";
        letter.classList.remove("active");
      }
    });
  });
}

// Restablecer letras al salir del marquee
function handleMouseLeave() {
  const letters = document.querySelectorAll(".letter");
  letters.forEach((letter) => {
    letter.style.transform = "translateY(0) scale(1) rotate(0)";
    letter.style.color = "";
    letter.style.textShadow = "";
    letter.style.zIndex = "1";
    letter.classList.remove("active");
  });
}

// Preparar el marquee para la animación
function prepareMarquee() {
  if (!marqueeContent) return;

  // Añadir un separador extra al final si no existe
  const lastChild = marqueeContent.lastElementChild;
  if (!lastChild || !lastChild.classList.contains("separator")) {
    const endSpacer = document.createElement("span");
    endSpacer.className = "separator";
    endSpacer.textContent = "|";
    marqueeContent.appendChild(endSpacer);
  }
}

// Animar el marquee - VERSIÓN MEJORADA SIN ESPACIOS VACÍOS
function animateMarquee() {
  if (!marqueeContent) return;

  // Preparar el marquee
  prepareMarquee();

  // Procesar texto en letras
  const projectNames = marqueeContent.querySelectorAll(".project-name");
  projectNames.forEach((name) => {
    splitTextIntoLetters(name);
  });

  // Crear contenedor principal
  const marqueeWrapper = document.createElement("div");
  marqueeWrapper.className = "marquee-wrapper";
  marqueeWrapper.style.position = "relative";
  marqueeWrapper.style.width = "100%";
  marqueeWrapper.style.height = "100%";
  marqueeWrapper.style.overflow = "hidden";

  // Crear dos tracks idénticos
  const trackContainer = document.createElement("div");
  trackContainer.className = "marquee-track-container";
  trackContainer.style.display = "flex";
  trackContainer.style.width = "200%"; // El doble de ancho para contener ambos tracks
  trackContainer.style.height = "100%";

  const originalTrack = document.createElement("div");
  originalTrack.className = "marquee-track original";
  originalTrack.style.display = "inline-flex";
  originalTrack.style.height = "100%";
  originalTrack.style.alignItems = "center";
  originalTrack.style.whiteSpace = "nowrap";
  originalTrack.style.flexShrink = "0"; // Importante para que mantenga su tamaño

  // Mover el contenido al track original
  while (marquee.firstChild) {
    originalTrack.appendChild(marquee.firstChild);
  }

  // Clonar el track para la segunda mitad
  const cloneTrack = originalTrack.cloneNode(true);
  cloneTrack.className = "marquee-track clone";

  // Procesar letras en el clon también
  const cloneNames = cloneTrack.querySelectorAll(".project-name");
  cloneNames.forEach((name) => {
    splitTextIntoLetters(name);
  });

  // Agregar tracks al contenedor
  trackContainer.appendChild(originalTrack);
  trackContainer.appendChild(cloneTrack);
  marqueeWrapper.appendChild(trackContainer);
  marquee.appendChild(marqueeWrapper);

  // Medir el ancho de un solo track
  const trackWidth = originalTrack.offsetWidth;

  // Configurar la animación con GSAP
  // La clave es usar porcentajes en lugar de valores absolutos
  // para que la animación sea realmente fluida
  const marqueeAnimation = gsap.timeline({ repeat: -1 });

  marqueeAnimation.to(trackContainer, {
    x: -trackWidth, // Mover exactamente el ancho de un track
    duration: 50, // Duración en segundos (ajustar según necesidad)
    ease: "none", // Sin aceleración para movimiento constante

    // Esta función es clave para el scroll infinito sin saltos
    onRepeat: function () {
      // Inmediatamente reposicionar al inicio sin animación
      gsap.set(trackContainer, { x: 0 });
    },
  });

  // Controles para la animación
  return {
    pause: function () {
      marqueeAnimation.pause();
    },
    play: function () {
      marqueeAnimation.play();
    },
  };
}

// Eventos de video simplificados
function addVideoEvents(elements, marqueeAnimation) {
  elements.forEach((project) => {
    // Evitar añadir eventos múltiples veces
    if (project.hasAttribute("data-events-added")) return;
    project.setAttribute("data-events-added", "true");

    // Simplificar el manejo de video
    const showVideo = () => {
      marqueeAnimation.pause();
      const videoSrc = project.getAttribute("data-video");
      console.log("Mostrando video:", videoSrc);

      if (videoSrc) {
        // Crear un video nuevo cada vez
        const video = document.createElement("video");
        video.src = videoSrc;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;

        // Limpiar y mostrar el contenedor
        videoContainer.innerHTML = "";
        videoContainer.appendChild(video);
        videoContainer.style.display = "block";

        // Forzar reproducción
        setTimeout(() => {
          video.play().catch((e) => console.error("Error reproduciendo:", e));
        }, 50);
      }
    };

    const hideVideo = () => {
      videoContainer.style.display = "none";
      videoContainer.innerHTML = "";
      marqueeAnimation.play();
    };

    // Detectar si es un dispositivo táctil
    const isTouchDevice =
      "ontouchstart" in window || navigator.msMaxTouchPoints > 0;

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

// Detectar si estamos en index.html
const isIndexPage = () => {
  return document.querySelector(".marquee") !== null;
};

// Iniciar la aplicación con un solo evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Establecer un tiempo máximo para mostrar el cargador
  const loaderTimeout = setTimeout(() => {
    document.body.classList.add("loaded");
    if (loader) loader.style.display = "none";
    if (navbar) navbar.style.top = "0";
  }, 2000); // Máximo 2 segundos

  // Verificar si estamos en index.html (si existe .marquee)
  if (isIndexPage()) {
    const marqueeAnimation = animateMarquee();

    if (marquee) {
      marquee.addEventListener("mousemove", handleMouseMove);
      marquee.addEventListener("mouseleave", handleMouseLeave);

      // Esperar un momento para que se estabilice el DOM
      setTimeout(() => {
        // Añadir eventos a todos los nombres de proyecto
        const allProjectNames = document.querySelectorAll(".project-name");
        addVideoEvents(allProjectNames, marqueeAnimation);
      }, 200);
    }

    // Cargar videos después de configurar el marquee (para mejor rendimiento)
    preloadVideos(videoUrls, () => {
      clearTimeout(loaderTimeout); // Limpiar el timeout si la carga termina antes

      setTimeout(() => {
        document.body.classList.add("loaded");
        if (loader) loader.style.display = "none";
        if (navbar) navbar.style.top = "0"; // Mostrar navbar
      }, 500);
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
