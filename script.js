// Crear el contenedor para los videos
const videoContainer = document.createElement("div");
videoContainer.classList.add("video-container");
document.body.appendChild(videoContainer);

// Seleccionar todos los nombres de proyectos
const projectNames = document.querySelectorAll(".project-name");

// Añadir eventos a cada nombre
projectNames.forEach((project) => {
  project.addEventListener("mouseover", (e) => {
    const videoSrc = project.getAttribute("data-video");
    const video = document.createElement("video");
    video.src = videoSrc;
    video.muted = true; // Sin audio, como en Field Day Sound
    video.autoplay = true;
    videoContainer.innerHTML = "";
    videoContainer.appendChild(video);
    videoContainer.style.display = "block";
  });

  project.addEventListener("mouseout", () => {
    videoContainer.style.display = "none";
    videoContainer.innerHTML = "";
  });
});

// Animar el marquee con GSAP
const marqueeContent = document.querySelector(".marquee-content");
const marqueeWidth = marqueeContent.scrollWidth;

const cloneContent = marqueeContent.cloneNode(true);
marqueeContent.parentNode.appendChild(cloneContent);

marqueeContent.style.display = "inline-block";
cloneContent.style.display = "inline-block";

gsap.to([marqueeContent, cloneContent], {
  x: -marqueeWidth,
  duration: 20,
  ease: "linear",
  repeat: -1,
  modifiers: {
    x: (x) => `${parseFloat(x) % marqueeWidth}px`,
  },
});
