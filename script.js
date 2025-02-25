// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar el contenido del marquee
const marquee = document.querySelector(".marquee");
const marqueeContent = document.querySelector(".marquee-content");
const marqueeWidth = marqueeContent.scrollWidth;

// Clonar el contenido para el bucle continuo
const cloneContent = marqueeContent.cloneNode(true);
marquee.appendChild(cloneContent);

// Ajustar estilos para que estén en línea sin espacios
marqueeContent.style.display = "inline-block";
cloneContent.style.display = "inline-block";

// Ajustar la posición inicial para evitar saltos
marqueeContent.style.position = "absolute";
marqueeContent.style.left = "0";
cloneContent.style.position = "absolute";
cloneContent.style.left = `${marqueeWidth}px`;

// Calcular duración dinámica según el ancho de la pantalla
const baseDuration = 20; // Duración base en segundos
const screenWidth = window.innerWidth;
const duration = baseDuration * (marqueeWidth / screenWidth); // Ajuste proporcional

// Animar con GSAP para un bucle infinito continuo
gsap.to([marqueeContent, cloneContent], {
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

// Función para añadir eventos de video a los elementos
function addVideoEvents(elements) {
  elements.forEach((project) => {
    project.addEventListener("mouseover", (e) => {
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
      videoContainer.style.display = "none";
      videoContainer.innerHTML = "";
    });
  });
}

// Aplicar eventos a los nombres originales y clonados
const originalProjects = marqueeContent.querySelectorAll(".project-name");
const clonedProjects = cloneContent.querySelectorAll(".project-name");
addVideoEvents(originalProjects);
addVideoEvents(clonedProjects);
