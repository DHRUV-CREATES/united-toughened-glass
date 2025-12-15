/* Improved, performance-friendly version of your script.
   Requirements: jQuery + OwlCarousel (same as before)
*/

$(function () {
  "use strict";

  // Cached selectors
  const $window = $(window);
  const $document = $(document);
  const $header = $(".header");
  const $navbar = $(".navbar");
  const $bars = $(".fa-bars");
  const $backToTop = $(".back-to-top");
  const $accordion = $(".accordion");

  // Toggle mobile nav
  $bars.on("click", function () {
    $(this).toggleClass("fa-times");
    $navbar.toggleClass("nav-toggle");
  });

  // ---------- Scroll handling (throttled with rAF) ----------
  let ticking = false;

  function onScrollHandler() {
    // Remove menu state on scroll/load
    $bars.removeClass("fa-times");
    $navbar.removeClass("nav-toggle");

    const scrollY = $window.scrollTop();
    if (scrollY > 35) {
      $header.css({
        background: "#002e5f",
        "box-shadow": "0 .2rem .5rem rgba(0,0,0,.4)",
      });
    } else {
      $header.css({ background: "none", "box-shadow": "none" });
    }

    // Back to top visibility
    if (scrollY > 100) {
      $backToTop.fadeIn("slow");
    } else {
      $backToTop.fadeOut("slow");
    }

    ticking = false;
  }

  $window.on("scroll", function () {
    if (!ticking) {
      ticking = true;
      // Use rAF to batch scroll updates for smoother performance
      window.requestAnimationFrame(onScrollHandler);
    }
  });

  // Run once on load to set initial state
  onScrollHandler();

  // ---------- Counters: use IntersectionObserver + requestAnimationFrame ----------
  const counters = document.querySelectorAll(".counter");
  const COUNTER_SPEED = 120; // lower = faster (as original)

  if (counters.length && "IntersectionObserver" in window) {
    const startCounter = (el) => {
      const targetAttr = el.getAttribute("data-target");
      const target = targetAttr ? parseFloat(targetAttr) : NaN;
      if (!isFinite(target)) return;

      let start = null;
      const initial = parseFloat(el.innerText) || 0;
      const total = target - initial;
      if (total <= 0) {
        el.innerText = target;
        return;
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        // Calculate progress ratio (cap to 1). Using COUNTER_SPEED to control duration.
        const duration = Math.max(200, COUNTER_SPEED); // ensure not too tiny
        const fraction = Math.min(progress / duration, 1);
        const value = Math.floor(initial + total * fraction);
        el.innerText = value;
        if (fraction < 1) {
          requestAnimationFrame(step);
        } else {
          el.innerText = target; // ensure final exact value
        }
      }
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          observer.unobserve(entry.target); // one-time start
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((c) => io.observe(c));
  } else {
    // Fallback: start counters immediately (older browsers)
    counters.forEach((el) => {
      const t = parseFloat(el.getAttribute("data-target")) || 0;
      el.innerText = t;
    });
  }

  // ---------- Owl Carousels (keep as-is but inside ready) ----------
  if ($.fn.owlCarousel) {
    $(".clients-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      responsive: { 0: { items: 2 }, 768: { items: 4 }, 900: { items: 6 } },
    });

    $(".testimonials-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      responsive: {
        0: { items: 1 },
        576: { items: 2 },
        768: { items: 3 },
        992: { items: 4 },
      },
    });
  }

  // ---------- Back to top click ----------
  $backToTop.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
  });

  // ---------- Accordion (event delegation and accessible toggle) ----------
  $accordion.on("click", ".accordion-header", function () {
    const $thisHeader = $(this);
    const $body = $thisHeader.next(".accordion-body");

    // Close others
    $accordion.find(".accordion .accordion-body").slideUp(500);
    $body.slideDown(500);

    // Update indicator text
    $accordion.find(".accordion-header span").text("+");
    $thisHeader.children("span").text("-");
  });
});
