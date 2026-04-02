/* === PRESENTATION STATE === */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".deck-track");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".deck-dot"));
  const currentSlideNode = document.querySelector("[data-current-slide]");
  const totalSlidesNode = document.querySelector("[data-total-slides]");
  const slideTitleNode = document.querySelector("[data-slide-title]");
  const caseSwitcher = document.querySelector("[data-case-switcher]");

  if (!track || !slides.length) {
    return;
  }

  if (caseSwitcher instanceof HTMLSelectElement) {
    const navigateToCaseStudy = () => {
      const target = caseSwitcher.value;

      if (target) {
        window.location.assign(target);
      }
    };

    caseSwitcher.addEventListener("change", navigateToCaseStudy);
    caseSwitcher.addEventListener("input", navigateToCaseStudy);
  }

  let activeIndex = 0;
  let wheelLocked = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let rafId = 0;

  if (totalSlidesNode) {
    totalSlidesNode.textContent = String(slides.length).padStart(2, "0");
  }

  /* === UI SYNCHRONIZATION === */
  const syncUi = (index) => {
    const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));
    activeIndex = boundedIndex;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-current", slideIndex === boundedIndex);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === boundedIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (currentSlideNode) {
      currentSlideNode.textContent = String(boundedIndex + 1).padStart(2, "0");
    }

    if (slideTitleNode) {
      slideTitleNode.textContent = slides[boundedIndex].dataset.slideTitle ?? `Slide ${boundedIndex + 1}`;
    }
  };

  /* === ACTIVE SLIDE DETECTION === */
  const getClosestSlideIndex = () => {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.top + rect.height / 2;
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateFromViewport = () => {
    rafId = 0;
    syncUi(getClosestSlideIndex());
  };

  const queueViewportUpdate = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(updateFromViewport);
  };

  /* === SLIDE MOVEMENT === */
  const goToSlide = (index, behavior = "smooth") => {
    const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides[boundedIndex].scrollIntoView({
      behavior,
      block: "start"
    });
    syncUi(boundedIndex);
  };

  syncUi(0);
  window.setTimeout(queueViewportUpdate, 120);

  /* === DOT NAVIGATION === */
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slideTarget || 0);
      goToSlide(targetIndex);
    });
  });

  /* === KEYBOARD NAVIGATION === */
  const nextKeys = new Set(["ArrowDown", "ArrowRight", "PageDown", " "]);
  const previousKeys = new Set(["ArrowUp", "ArrowLeft", "PageUp"]);

  document.addEventListener("keydown", (event) => {
    const isEditingField =
      event.target instanceof HTMLElement &&
      (event.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName));

    if (isEditingField) {
      return;
    }

    if (nextKeys.has(event.key)) {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }

    if (previousKeys.has(event.key)) {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goToSlide(slides.length - 1);
    }
  });

  /* === SCROLL TRACKING === */
  track.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("resize", queueViewportUpdate, { passive: true });

  /* === WHEEL NAVIGATION === */
  track.addEventListener(
    "wheel",
    (event) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        queueViewportUpdate();
        return;
      }

      if (wheelLocked || Math.abs(event.deltaY) < 18 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        return;
      }

      wheelLocked = true;
      window.setTimeout(() => {
        wheelLocked = false;
      }, 600);

      if (event.deltaY > 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    },
    { passive: true }
  );

  /* === TOUCH NAVIGATION === */
  track.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const deltaY = touch.clientY - touchStartY;
      const deltaX = touch.clientX - touchStartX;

      if (Math.abs(deltaY) < 48 || Math.abs(deltaY) < Math.abs(deltaX)) {
        queueViewportUpdate();
        return;
      }

      if (deltaY < 0) {
        goToSlide(activeIndex + 1);
      } else {
        goToSlide(activeIndex - 1);
      }
    },
    { passive: true }
  );
});
