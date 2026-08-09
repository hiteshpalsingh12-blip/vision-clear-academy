// ============================================
// VISION CLEAR ACADEMY - Main JavaScript
// ============================================

// --- Mobile Menu Toggle ---
function toggleMenu() {
  var navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

// --- Navbar scroll effect ---
window.addEventListener("scroll", function () {
  var navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(251, 251, 253, 0.98)";
  } else {
    navbar.style.background = "rgba(251, 251, 253, 0.8)";
  }
});

// --- Close mobile menu on link click ---
document.querySelectorAll(".nav-links a").forEach(function (link) {
  link.addEventListener("click", function () {
    var navLinks = document.getElementById("navLinks");
    if (navLinks) navLinks.classList.remove("active");
  });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
function addScrollAnimations() {
  var elements = document.querySelectorAll(
    ".feature-card, .course-card, .testimonial-card, .section-header, .stat, .cta, .dashboard-card, .faq-item",
  );

  elements.forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

// ============================================
// ANIMATED COUNTERS
// ============================================
function animateCounters() {
  var counters = document.querySelectorAll(".stat-number");

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var text = el.textContent;
          var hasPlus = text.includes("+");
          var hasPercent = text.includes("%");
          var num = parseInt(text.replace(/[^0-9]/g, ""));

          if (isNaN(num)) return;

          var current = 0;
          var increment = Math.ceil(num / 60);
          var suffix = hasPlus ? "+" : hasPercent ? "%" : "";

          var timer = setInterval(function () {
            current += increment;
            if (current >= num) {
              current = num;
              clearInterval(timer);
            }
            el.textContent = current.toLocaleString() + suffix;
          }, 30);

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}

// ============================================
// WHATSAPP FLOATING BUTTON
// ============================================
function addWhatsAppButton() {
  var btn = document.createElement("a");
  btn.href =
    "https://wa.me/919779145245?text=Hi! I am interested in your Forex Trading courses.";
  btn.target = "_blank";
  btn.innerHTML = "💬";
  btn.style.cssText =
    "position:fixed;bottom:24px;right:24px;width:56px;height:56px;background:#25D366;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,0.4);z-index:999;transition:all 0.3s ease;text-decoration:none;";
  btn.onmouseover = function () {
    this.style.transform = "scale(1.1)";
  };
  btn.onmouseout = function () {
    this.style.transform = "scale(1)";
  };
  document.body.appendChild(btn);
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function addBackToTop() {
  var btn = document.createElement("button");
  btn.innerHTML = "↑";
  btn.style.cssText =
    "position:fixed;bottom:90px;right:24px;width:44px;height:44px;background:#1d1d1f;color:white;border:none;border-radius:50%;font-size:1.2rem;cursor:pointer;z-index:999;opacity:0;transition:all 0.3s ease;box-shadow:0 2px 12px rgba(0,0,0,0.15);";
  btn.onclick = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  document.body.appendChild(btn);

  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      btn.style.opacity = "1";
    } else {
      btn.style.opacity = "0";
    }
  });
}

// ============================================
// LOADING SCREEN
// ============================================
function addLoadingScreen() {
  var loader = document.createElement("div");
  loader.id = "page-loader";
  loader.innerHTML =
    '<div style="width:40px;height:40px;border:3px solid #f5f5f7;border-top:3px solid #2563EB;border-radius:50%;animation:spin 0.8s linear infinite;"></div>';
  loader.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:#fbfbfd;display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity 0.5s ease;";
  document.body.appendChild(loader);

  var style = document.createElement("style");
  style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);

  window.addEventListener("load", function () {
    setTimeout(function () {
      loader.style.opacity = "0";
      setTimeout(function () {
        loader.remove();
      }, 500);
    }, 800);
  });
}

// ============================================
// FAQ TOGGLE
// ============================================
function toggleFaq(item) {
  var allItems = document.querySelectorAll(".faq-item");
  allItems.forEach(function (faq) {
    if (faq !== item) faq.classList.remove("active");
  });
  item.classList.toggle("active");
}

// ============================================
// INITIALIZE ALL FEATURES
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  addLoadingScreen();
  addScrollAnimations();
  animateCounters();
  addWhatsAppButton();
  addBackToTop();
});
