document.addEventListener("DOMContentLoaded", () => {
  // 1) Navbar que desaparece al hacer scroll
  let lastScroll = 0;
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll) {
      // Se oculta al bajar
      navbar.style.top = "-100px";
    } else {
      // Aparece al subir
      navbar.style.top = "0";
    }
    lastScroll = currentScroll;
  });

  // 2) Marquee + Video en Hover
  const fullscreenVideoContainer = document.getElementById(
    "fullscreen-video-container"
  );
  const fullscreenVideo = document.getElementById("fullscreen-video");
  const videoSource = document.getElementById("video-source");
  const marqueeContent = document.querySelector(".marquee-content");

  // Duplica el contenido original para un loop continuo
  const originalContent = marqueeContent.innerHTML.trim();
  marqueeContent.innerHTML = originalContent + originalContent;

  // Espera al layout para medir el ancho de la primera copia y asignarlo a una variable CSS
  setTimeout(() => {
    const originalWidth = marqueeContent.scrollWidth / 2;
    marqueeContent.style.setProperty("--marquee-width", `${originalWidth}px`);
  }, 0);

  // Separa el texto de cada .project-name en letras individuales
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

  // Efecto de hover en cada .project-name
  document.querySelectorAll(".project-name").forEach((item) => {
    let hoverTimer = null;

    item.addEventListener("mouseenter", () => {
      const videoFile = item.getAttribute("data-video");
      if (videoFile && videoFile.trim() !== "") {
        hoverTimer = setTimeout(() => {
          videoSource.src = videoFile;
          fullscreenVideo.load();
          fullscreenVideo
            .play()
            .catch((error) => console.error("Error al reproducir el video:", error));

          // Activa el contenedor del video (fade in)
          fullscreenVideoContainer.classList.add("active");
          // Pausa el marquee
          marqueeContent.style.animationPlayState = "paused";
          // Oscurece la navbar
          navbar.classList.add("with-video");

          // Efecto "lift" en las letras
          const letters = item.querySelectorAll(".letter");
          letters.forEach((letter, index) => {
            setTimeout(() => letter.classList.add("lift"), index * 50);
          });
        }, 300);
      }
    });

    item.addEventListener("mouseleave", () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      // Quita el efecto "lift"
      const letters = item.querySelectorAll(".letter");
      letters.forEach((letter, index) => {
        setTimeout(() => letter.classList.remove("lift"), index * 50);
      });

      // Detiene el video
      fullscreenVideo.pause();
      fullscreenVideo.currentTime = 0;
      fullscreenVideoContainer.classList.remove("active");
      // Reactiva el marquee
      marqueeContent.style.animationPlayState = "running";
      navbar.classList.remove("with-video");
    });
  });

  // Ajuste al cambiar tamaño de ventana
  window.addEventListener("resize", () => {
    fullscreenVideo.pause();
    fullscreenVideo.currentTime = 0;
    fullscreenVideoContainer.classList.remove("active");
    marqueeContent.style.animationPlayState = "running";
    navbar.classList.remove("with-video");
  });
});
