// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar el contenido del marquee y la pantalla de carga
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

// Función para precargar videos
function preloadVideos(urls, callback) {
  let loadedCount = 0;
  urls.forEach((url) => {
    const video = document.createElement("video");
    video.src = url;
    video.preload = "auto";
    video.onloadeddata = () => {
      loadedCount++;
      if (loadedCount === urls.length) {
        callback();
      }
    };
    video.onerror = () => {
      loadedCount++;
      if (loadedCount === urls.length) {
        callback();
      }
    };
  });
}

// Precargar videos y luego mostrar el contenido
preloadVideos(videoUrls, () => {
  document.body.classList.add("loaded");
  loader.style.display = "none";

  const cloneContent = marqueeContent.cloneNode(true);
  marquee.appendChild(cloneContent);

  marqueeContent.style.display = "inline-block";
  cloneContent.style.display = "inline-block";

  marqueeContent.style.position = "absolute";
  marqueeContent.style.left = "0";
  cloneContent.style.position = "absolute";
  cloneContent.style.left = `${marqueeWidth}px`;

  const baseDuration = 15; // Scroll más rápido
  const screenWidth = window.innerWidth;
  const duration = baseDuration * (marqueeWidth / screenWidth);

  const marqueeAnimation = gsap.to([marqueeContent, cloneContent], {
    x: `-=${marqueeWidth}`,
    duration: duration,
    ease: "linear",
    repeat: -1,
    modifiers: {
      x: (x) => {
        const offset = parseFloat(x) % marqueeWidth;
        return `${offset}px`;
      },
    },
  });

  function addVideoEvents(elements) {
    elements.forEach((project) => {
      project.addEventListener("mouseover", (e) => {
        marqueeAnimation.pause();
        const videoSrc = project.getAttribute("data-video");
        if (videoSrc) {
          const video = document.createElement("video");
          video.src = videoSrc;
          video.muted = true;
          video.autoplay = true;
          videoContainer.innerHTML = "";
          videoContainer.appendChild(video);
          videoContainer.style.display = "block";
        }
      });

      project.addEventListener("mouseout", () => {
        marqueeAnimation.play();
        videoContainer.style.display = "none";
        videoContainer.innerHTML = "";
      });
    });
  }

  const originalProjects = marqueeContent.querySelectorAll(".project-name");
  const clonedProjects = cloneContent.querySelectorAll(".project-name");
  addVideoEvents(originalProjects);
  addVideoEvents(clonedProjects);
});
