function initSharecarePage() {
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");
  const scrollLinks = Array.from(document.querySelectorAll("[data-scroll-link]"));
  const scrollTopButton = document.querySelector("[data-scroll-top]");
  const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));

  const setScrolledState = () => {
    const isScrolled = window.scrollY > 24;

    if (header instanceof HTMLElement) {
      header.classList.toggle("is-solid", isScrolled);
    }

    if (scrollTopButton instanceof HTMLElement) {
      scrollTopButton.classList.toggle("is-visible", window.scrollY > 520);
    }
  };

  const closeNav = () => {
    if (navPanel instanceof HTMLElement) {
      navPanel.classList.remove("is-open");
    }

    if (navToggle instanceof HTMLButtonElement) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (navToggle instanceof HTMLButtonElement && navPanel instanceof HTMLElement) {
    navToggle.addEventListener("click", () => {
      const isOpen = navPanel.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target =
        typeof targetId === "string" && targetId.startsWith("#")
          ? document.querySelector(targetId)
          : null;

      if (target instanceof HTMLElement) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      closeNav();
    });
  });

  if (scrollTopButton instanceof HTMLButtonElement) {
    scrollTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if ("IntersectionObserver" in window && revealNodes.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  window.addEventListener("scroll", setScrolledState, { passive: true });
  window.addEventListener("resize", closeNav, { passive: true });
  setScrolledState();
}

function initDeckPresentation() {
  const track = document.querySelector(".deck-track");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".deck-dot"));
  const caseSwitcher = document.querySelector("[data-case-switcher]");
  const mediaSwitchers = Array.from(document.querySelectorAll("[data-media-switcher]"));

  if (!(track instanceof HTMLElement) || !slides.length) {
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

  mediaSwitchers.forEach((switcher) => {
    const buttons = Array.from(switcher.querySelectorAll("[data-media-toggle]"));
    const panels = Array.from(switcher.querySelectorAll("[data-media-panel]"));
    const screenCarousels = Array.from(switcher.querySelectorAll("[data-screen-carousel]"));

    if (!buttons.length || !panels.length) {
      return;
    }

    screenCarousels.forEach((screenCarousel) => {
      const cards = Array.from(screenCarousel.querySelectorAll(".screen-card"));
      const pageSize = 3;
      const totalPages = Math.ceil(cards.length / pageSize);

      if (totalPages <= 1) {
        return;
      }

      const carousel = document.createElement("div");
      carousel.className = "media-carousel";

      const pages = document.createElement("div");
      pages.className = "media-carousel__pages";

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
        const pageCards = cards.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const pageStrip = screenCarousel.cloneNode(false);
        pageStrip.removeAttribute("data-screen-carousel");
        pageStrip.classList.add("media-carousel__page");

        if (pageCards.length === 2) {
          pageStrip.classList.remove("screen-strip--three");
          pageStrip.classList.add("screen-strip--two");
        }

        if (pageCards.length === 1) {
          pageStrip.classList.remove("screen-strip--three");
          pageStrip.classList.add("media-carousel__page--single");
        }

        pageCards.forEach((card) => pageStrip.appendChild(card));
        pages.appendChild(pageStrip);
      }

      const controls = document.createElement("div");
      controls.className = "media-carousel__controls";
      controls.setAttribute("aria-label", "Screen carousel controls");

      const previousButton = document.createElement("button");
      previousButton.type = "button";
      previousButton.className = "media-carousel__nav";
      previousButton.setAttribute("aria-label", "Show previous screens");
      previousButton.textContent = "Previous";

      const dots = document.createElement("div");
      dots.className = "media-carousel__dots";

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "media-carousel__nav";
      nextButton.setAttribute("aria-label", "Show next screens");
      nextButton.textContent = "Next";

      const dotButtons = Array.from({ length: totalPages }, (_, pageIndex) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "media-carousel__dot";
        dot.setAttribute("aria-label", `Show screen set ${pageIndex + 1}`);
        dot.dataset.carouselPage = String(pageIndex);
        dots.appendChild(dot);
        return dot;
      });

      controls.append(previousButton, dots, nextButton);
      carousel.append(pages, controls);
      screenCarousel.replaceWith(carousel);

      const pageNodes = Array.from(pages.children);
      let activePage = 0;

      const setActivePage = (pageIndex) => {
        activePage = Math.max(0, Math.min(pageIndex, totalPages - 1));

        pageNodes.forEach((pageNode, index) => {
          pageNode.hidden = index !== activePage;
        });

        dotButtons.forEach((dotButton, index) => {
          const isActive = index === activePage;
          dotButton.classList.toggle("is-active", isActive);
          dotButton.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        previousButton.disabled = activePage === 0;
        nextButton.disabled = activePage === totalPages - 1;
      };

      previousButton.addEventListener("click", () => {
        setActivePage(activePage - 1);
      });

      nextButton.addEventListener("click", () => {
        setActivePage(activePage + 1);
      });

      dotButtons.forEach((dotButton) => {
        dotButton.addEventListener("click", () => {
          setActivePage(Number(dotButton.dataset.carouselPage || 0));
        });
      });

      setActivePage(0);
    });

    const setActivePanel = (panelName) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.mediaToggle === panelName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.mediaPanel !== panelName;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        setActivePanel(button.dataset.mediaToggle || "screens");
      });
    });

    setActivePanel("screens");
  });

  let activeIndex = 0;
  let wheelLocked = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let rafId = 0;

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
  };

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

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slideTarget || 0);
      goToSlide(targetIndex);
    });
  });

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

  track.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("scroll", queueViewportUpdate, { passive: true });
  window.addEventListener("resize", queueViewportUpdate, { passive: true });

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
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("[data-sharecare-site]")) {
    initSharecarePage();
    return;
  }

  initDeckPresentation();
});
