document.addEventListener("DOMContentLoaded", () => {
  const fullscreenVideoContainer = document.getElementById(
    "fullscreen-video-container"
  );
  const fullscreenVideo = document.getElementById("fullscreen-video");
  const videoSource = document.getElementById("video-source");
  const marqueeContent = document.querySelector(".marquee-content");
  const header = document.querySelector(".navbar");

  // Duplica el contenido original para un loop continuo
  const originalContent = marqueeContent.innerHTML.trim();
  marqueeContent.innerHTML = originalContent + originalContent;

  // Espera al layout para medir el ancho de la primera copia y asignarlo a una variable CSS
  setTimeout(() => {
    const originalWidth = marqueeContent.scrollWidth / 2;
    marqueeContent.style.setProperty("--marquee-width", `${originalWidth}px`);
  }, 0);

  // Separa el texto de cada .project-name en letras individuales, respetando los espacios
  document.querySelectorAll(".project-name").forEach((item) => {
    const text = item.textContent;
    item.innerHTML = "";
    for (let char of text) {
      const span = document.createElement("span");
      span.classList.add("letter");
      span.textContent = char === " " ? "\u00A0" : char;
      item.appendChild(span);
    }
  });

  // Agrega eventos de hover a cada .project-name
  document.querySelectorAll(".project-name").forEach((item) => {
    let hoverTimer = null;
    item.addEventListener("mouseenter", () => {
      const videoFile = item.getAttribute("data-video");
      console.log("mouseenter:", videoFile);
      if (videoFile && videoFile.trim() !== "") {
        hoverTimer = setTimeout(() => {
          videoSource.src = videoFile;
          fullscreenVideo.load();
          fullscreenVideo.play().catch((error) => {
            console.error("Error al reproducir el video:", error);
          });
          // Activa el efecto de fundido (fade in) añadiendo la clase "active"
          fullscreenVideoContainer.classList.add("active");
          marqueeContent.style.animationPlayState = "paused";
          header.classList.add("with-video");

          // Efecto "lift" letra a letra en el título
          const letters = item.querySelectorAll(".letter");
          letters.forEach((letter, index) => {
            setTimeout(() => {
              letter.classList.add("lift");
            }, index * 50);
          });
        }, 300);
      }
    });

    item.addEventListener("mouseleave", () => {
      console.log("mouseleave");
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      // Quita el efecto "lift" letra a letra
      const letters = item.querySelectorAll(".letter");
      letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.classList.remove("lift");
        }, index * 50);
      });
      fullscreenVideo.pause();
      fullscreenVideo.currentTime = 0;
      fullscreenVideoContainer.classList.remove("active");
      marqueeContent.style.animationPlayState = "running";
      header.classList.remove("with-video");
    });

    // Fin de eventos hover
  });

  // Listener para el evento "resize" que oculta el video y reanuda el marquee
  window.addEventListener("resize", () => {
    fullscreenVideo.pause();
    fullscreenVideo.currentTime = 0;
    fullscreenVideoContainer.classList.remove("active");
    marqueeContent.style.animationPlayState = "running";
    header.classList.remove("with-video");
  });
});
