document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // Модальне вікно запису на масаж
  // ============================================================
  const modal = document.getElementById("bookingModal");
  const openButtons = document.querySelectorAll(".open-modal-btn");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("massageForm");
  const formMessage = document.getElementById("formMessage");
  const phoneInput = document.getElementById("phone");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const PHONE_TEMPLATE = "__ ___ __ __";
  const DEFAULT_MESSAGE_TEXT = "Доброго дня, хочу записатись на масаж";

  const TELEGRAM_BOT_TOKEN = "8977054136:AAEyw5YkqnPq_MdOvpJyJUVTLSCGvPj9l1s";
  const TELEGRAM_CHAT_ID = "5997199497";

  function closeModal() {
    if (!modal || !modal.classList.contains("show")) return;
    modal.classList.remove("show");
    modal.classList.add("hide");
    setTimeout(() => {
      modal.classList.remove("hide");
    }, 1200);
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (modal) modal.classList.add("show");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  function formatPhoneValue(digits) {
    let result = "";
    let di = 0;
    for (let i = 0; i < PHONE_TEMPLATE.length; i++) {
      if (PHONE_TEMPLATE[i] === "_") {
        result += digits[di] !== undefined ? digits[di] : "_";
        di++;
      } else {
        result += PHONE_TEMPLATE[i];
      }
    }
    return result;
  }

  function cursorPosForDigits(count) {
    let di = 0;
    for (let i = 0; i < PHONE_TEMPLATE.length; i++) {
      if (PHONE_TEMPLATE[i] === "_") {
        di++;
        if (di === count) return i + 1;
      }
    }
    return 0;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 9);
      phoneInput.value = formatPhoneValue(digits);
      const pos = cursorPosForDigits(digits.length);
      phoneInput.setSelectionRange(pos, pos);
    });

    phoneInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") return;
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    phoneInput.addEventListener("focus", () => {
      const digits = phoneInput.value.replace(/\D/g, "").length;
      const pos = digits === 0 ? 0 : cursorPosForDigits(digits);
      phoneInput.setSelectionRange(pos, pos);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const phoneDigits = phoneInput.value.replace(/\D/g, "");
      const messageText = messageInput.value.trim();

      if (!name) {
        showFormMessage("Будь ласка, вкажіть ваше ім'я.", "error");
        return;
      }

      if (phoneDigits.length !== 9) {
        showFormMessage("Перевірте номер телефону — має бути 9 цифр після +380.", "error");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Надсилаємо...";
      }

      const fullPhone = "+380 " + phoneInput.value;
      const text =
        "📩 Нова заявка на масаж!\n\n" +
        "👤 Ім'я: " + name + "\n" +
        "📞 Телефон: " + fullPhone + "\n" +
        "💬 Повідомлення: " + messageText;

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            showFormMessage("Дякуємо! Ваша заявка прийнята, ми зв'яжемося з вами найближчим часом.", "success");
          } else {
            showFormMessage("Заявку не вдалось надіслати. Зателефонуйте нам, будь ласка.", "error");
          }
        })
        .catch(() => {
          showFormMessage("Заявку не вдалось надіслати. Зателефонуйте нам, будь ласка.", "error");
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Надіслати";
          }

          setTimeout(() => {
            closeModal();
            if (formMessage) {
              formMessage.style.opacity = "0";
              formMessage.style.maxHeight = "0";
            }
            form.reset();
            phoneInput.value = PHONE_TEMPLATE;
            messageInput.value = DEFAULT_MESSAGE_TEXT;
          }, 4500);
        });
    });
  }

  function showFormMessage(text, type) {
    if (!formMessage) {
      alert(text);
      return;
    }

    formMessage.textContent = text;
    formMessage.style.display = "block";
    formMessage.style.opacity = "1";
    formMessage.style.maxHeight = "80px";
    formMessage.style.padding = "8px 12px";
    formMessage.style.marginTop = "8px";
    formMessage.style.borderRadius = "8px";
    formMessage.style.fontWeight = "600";
    formMessage.style.textAlign = "center";

    if (type === "success") {
      formMessage.style.background = "#e6f4ea";
      formMessage.style.color = "#2e7d32";
    } else {
      formMessage.style.background = "#fdecea";
      formMessage.style.color = "#c62828";
    }
  }







  
     // ============================================================
  // Топбар + футер (працюють однаково на всіх сторінках)
  // ============================================================
  const topbarContainer = document.getElementById("topbar");
  const footerContainer = document.getElementById("footer");

  let topbarReady = !topbarContainer;
  let footerReady = !footerContainer;

  function checkAllReadyAndRestoreScroll() {
    if (topbarReady && footerReady) {
      setTimeout(restoreScrollPosition, 50);
    }
  }

  if (topbarContainer) {
      fetch("/top-bar.html")
      .then((res) => res.text())
      .then((html) => {
        topbarContainer.innerHTML = html;

        const links = topbarContainer.querySelectorAll(".topbar-nav a");
        links.forEach((link) => {
          if (link.href === window.location.href) {
            link.classList.add("active");
          }
        });

        // --- Мобільне бургер-меню ---
        const burger = topbarContainer.querySelector("#topbarBurger");
        const nav = topbarContainer.querySelector("#topbarNav");
        const overlay =
          topbarContainer.querySelector("#topbarOverlay") ||
          document.getElementById("topbarOverlay");

        if (burger && nav && overlay) {
          const openMenu = () => {
            burger.classList.add("active");
            burger.setAttribute("aria-expanded", "true");
            nav.classList.add("active");
            overlay.classList.add("active");
            document.body.style.overflow = "hidden";
          };
          const closeMenu = () => {
            burger.classList.remove("active");
            burger.setAttribute("aria-expanded", "false");
            nav.classList.remove("active");
            overlay.classList.remove("active");
            document.body.style.overflow = "";
          };

          burger.addEventListener("click", () => {
            if (nav.classList.contains("active")) {
              closeMenu();
            } else {
              openMenu();
            }
          });

          overlay.addEventListener("click", closeMenu);

          nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
          });

          window.addEventListener("resize", () => {
            if (window.innerWidth > 1140) {
              closeMenu();
            }
          });

          window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMenu();
          });
        }

        topbarReady = true;
        checkAllReadyAndRestoreScroll();
      });
  }

  if (footerContainer) {
      fetch("/footer.html")
      .then((res) => res.text())
      .then((html) => {
        footerContainer.innerHTML = html;

        footerReady = true;
        checkAllReadyAndRestoreScroll();
      });
  }

  // ============================================================
  // Збереження та відновлення позиції скролу при оновленні сторінки
  // ============================================================
  const scrollKey = "scrollPos:" + window.location.pathname;

  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem(scrollKey, window.scrollY);
  });

  function restoreScrollPosition() {
    const savedPos = sessionStorage.getItem(scrollKey);
    if (savedPos !== null) {
      window.scrollTo(0, parseInt(savedPos, 10));
    }
  }
});

  // ============================================================
  // Fade-in анімація секцій при скролі
  // ============================================================
  const fadeElements = document.querySelectorAll(".fade-in");

  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeElements.forEach((el) => fadeObserver.observe(el));
  }

  // ============================================================
  // Лічильники цифр у статистиці
  // ============================================================
  const statNumbers = document.querySelectorAll(".stat-number");

  if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  function animateCounter(el) { 
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 2900;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================================
  // Слайдер відгуків на сторінці "Про нас"
  // ============================================================
  const testimonialSwiperEl = document.querySelector(".testimonialSwiper");

  if (testimonialSwiperEl && typeof Swiper !== "undefined") {
    new Swiper(".testimonialSwiper", {
      slidesPerView: 2,
      spaceBetween: 24,
      loop: true,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },

      pagination: {
        el: ".testimonialSwiper .swiper-pagination",
        clickable: true
      },

      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
      }
    });
  }




   // ============================================================
  // Універсальний lightbox (сертифікати + фото кабінету)
  // ============================================================
  const certLightbox = document.getElementById("certLightbox");
  const certLightboxImg = document.getElementById("certLightboxImg");
  const certLightboxCaption = document.getElementById("certLightboxCaption");
  const certLightboxClose = document.getElementById("certLightboxClose");
  const certLightboxPrev = document.getElementById("certLightboxPrev");
  const certLightboxNext = document.getElementById("certLightboxNext");

  let activeGalleryCards = [];
  let currentGalleryIndex = 0;

  function openLightboxItem(cards, index) {
    const card = cards[index];
    if (!card) return;

    const img = card.querySelector("img");
    const label = card.querySelector(".certificate-label");

    certLightboxImg.src = img.src;
    certLightboxImg.alt = img.alt;
    certLightboxCaption.textContent = label ? label.textContent : img.alt || "";

    activeGalleryCards = cards;
    currentGalleryIndex = index;
    certLightbox.classList.add("show");
  }

  function closeLightbox() {
    certLightbox.classList.remove("show");
  }

  function showNextInGallery() {
    if (activeGalleryCards.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + 1) % activeGalleryCards.length;
    openLightboxItem(activeGalleryCards, currentGalleryIndex);
  }

  function showPrevInGallery() {
    if (activeGalleryCards.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex - 1 + activeGalleryCards.length) % activeGalleryCards.length;
    openLightboxItem(activeGalleryCards, currentGalleryIndex);
  }

  function setupLightboxGallery(selector) {
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
      card.addEventListener("click", () => openLightboxItem(cards, index));
    });
  }

  if (certLightbox) {
    setupLightboxGallery(".certificate-card");
    setupLightboxGallery(".about-gallery-item");

    if (certLightboxClose) certLightboxClose.addEventListener("click", closeLightbox);
    if (certLightboxNext) certLightboxNext.addEventListener("click", showNextInGallery);
    if (certLightboxPrev) certLightboxPrev.addEventListener("click", showPrevInGallery);

    certLightbox.addEventListener("click", (e) => {
      if (e.target === certLightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!certLightbox.classList.contains("show")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNextInGallery();
      if (e.key === "ArrowLeft") showPrevInGallery();
    });
  }
  


  // ============================================================
  // Слайдер "Відгуки клієнтів" (Swiper.js) — ті самі фішки, що й у популярних послугах
  // ============================================================
  const reviewSwiperEl = document.querySelector(".reviewSwiper");

  if (reviewSwiperEl && typeof Swiper !== "undefined") {
    const reviewSwiper = new Swiper(".reviewSwiper", {
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 20,
      loop: true,

      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },

      navigation: {
        nextEl: ".review-button-next",
        prevEl: ".review-button-prev"
      },

      pagination: {
        el: ".review-pagination",
        clickable: true
      },

      grabCursor: true,

      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: true
      },

      mousewheel: {
        forceToAxis: true,
        sensitivity: 1
      },

      breakpoints: {
        0: { slidesPerView: 1, slidesPerGroup: 1 },
        576: { slidesPerView: 2, slidesPerGroup: 1 },
        768: { slidesPerView: 3, slidesPerGroup: 1 },
        992: { slidesPerView: 4, slidesPerGroup: 1 }
      }
    });
  }


    // ============================================================
  // Живий статус роботи (відкрито/закрито + розклад)
  // ============================================================
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const statusDetail = document.getElementById("statusDetail");
  const scheduleList = document.getElementById("scheduleList");

  const workingHours = {
    0: { open: 8, close: 13 },  // Неділя
    1: { open: 8, close: 17 },
    2: { open: 8, close: 17 },
    3: { open: 8, close: 17 },
    4: { open: 8, close: 17 },
    5: { open: 8, close: 17 },
    6: { open: 8, close: 16 }   // Субота
  };

  function updateWorkingStatus() {
    if (!statusDot || !statusText || !statusDetail) return;

    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours() + now.getMinutes() / 60;
    const todaySchedule = workingHours[day];

    const isOpen = hours >= todaySchedule.open && hours < todaySchedule.close;

    if (isOpen) {
      statusDot.classList.remove("closed");
      statusText.textContent = "Зараз відкрито";

      const closeIn = todaySchedule.close - hours;
      const closeHours = Math.floor(closeIn);
      const closeMinutes = Math.round((closeIn - closeHours) * 60);

      statusDetail.textContent = `До закриття: ${closeHours} год ${closeMinutes} хв — встигаєте на сеанс!`;
    } else {
      statusDot.classList.add("closed");
      statusText.textContent = "Зараз закрито";

      let nextOpenText = "";
      if (hours < todaySchedule.open) {
        const untilOpen = todaySchedule.open - hours;
        const untilHours = Math.floor(untilOpen);
        const untilMinutes = Math.round((untilOpen - untilHours) * 60);
        nextOpenText = `Відкриємось через ${untilHours} год ${untilMinutes} хв`;
      } else {
        const nextDay = (day + 1) % 7;
        const nextSchedule = workingHours[nextDay];
        nextOpenText = `Відкриємось завтра о ${nextSchedule.open}:00`;
      }

      statusDetail.textContent = nextOpenText;
    }

    if (scheduleList) {
      const items = scheduleList.querySelectorAll("li");
      items.forEach((li) => {
        const liDay = parseInt(li.getAttribute("data-day"), 10);
        li.classList.toggle("today", liDay === day);
      });
    }
  }

  updateWorkingStatus();
  setInterval(updateWorkingStatus, 60000);





  // ============================================================
  // Фільтрація послуг на сторінці "Наші послуги"
  // ============================================================
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");
  const noResultsMsg = document.querySelector(".no-results");

  if (filterButtons.length > 0 && serviceCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");
        let visibleCount = 0;

        serviceCards.forEach((card) => {
          const category = card.getAttribute("data-category");

          if (filter === "all" || category === filter) {
            card.classList.remove("hidden");
            visibleCount++;
          } else {
            card.classList.add("hidden");
          }
        });

        if (noResultsMsg) {
          noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
        }
      });
    });
  }



  
    // ============================================================
  // Підбір чаю за симптомом на сторінці "Лікувальні трави"
  // ============================================================
  const finderButtons = document.querySelectorAll(".finder-btn");
  const finderResult = document.getElementById("finderResult");

  const herbRecommendations = {
    sleep: [
      { icon: "fa-moon", title: "Валеріана з ромашкою", text: "Заспокоює нервову систему і допомагає швидше заснути. Пийте за годину до сну." },
      { icon: "fa-leaf", title: "Меліса", text: "Знімає тривожність і легку збудливість, готує тіло до спокійного відпочинку." },
      { icon: "fa-spa", title: "Лаванда з м'ятою", text: "Ароматне поєднання, яке розслабляє і допомагає відключитись від думок перед сном." },
      { icon: "fa-cloud-moon", title: "Хміль з валеріаною", text: "Традиційна пара для глибокого й спокійного сну без частих пробуджень." },
      { icon: "fa-water", title: "Меліса з м'ятою", text: "Легке освіжаюче поєднання, яке заспокоює розум перед відпочинком." }
    ],
    cold: [
      { icon: "fa-mug-hot", title: "Липа з чебрецем", text: "Зігріваюче поєднання, знижує температуру і підтримує імунітет." },
      { icon: "fa-lemon", title: "Шипшина з медом", text: "Багате джерело вітаміну С, зміцнює організм і допомагає швидше одужати." },
      { icon: "fa-fire", title: "Імбир з чебрецем", text: "Зігріває зсередини і полегшує перші симптоми застуди чи переохолодження." },
      { icon: "fa-pepper-hot", title: "Чебрець з медом", text: "Природний антисептик, пом'якшує горло і полегшує кашель." },
      { icon: "fa-mug-saucer", title: "Липовий цвіт з малиною", text: "Потогінна дія допомагає збити температуру." }
    ],
    stress: [
      { icon: "fa-sun", title: "Звіробій", text: "Природний антидепресант, який допомагає впоратись зі стресом і покращити настрій." },
      { icon: "fa-water", title: "Меліса з ромашкою", text: "Заспокійливий дует, що знімає внутрішню напругу протягом дня." },
      { icon: "fa-wind", title: "Лаванда", text: "Класичний засіб для заспокоєння нервової системи й зняття тривожності." },
      { icon: "fa-spa", title: "Валеріана з материнкою", text: "Допомагає розслабитись і відновити рівновагу." },
      { icon: "fa-leaf", title: "М'ята з мелісою", text: "М'яке освіжаюче поєднання, що знімає дратівливість і заспокоює думки." }
    ],
        headache: [
      { icon: "fa-seedling", title: "М'ята перцева", text: "Класичний засіб від головного болю — знімає напругу і освіжає одразу після кількох ковтків." },
      { icon: "fa-mug-saucer", title: "Чебрець з м'ятою", text: "Знімає м'язову напругу в скронях і допомагає при головному болю від втоми." },
      { icon: "fa-leaf", title: "Меліса з м'ятою", text: "М'яко знімає напругу в скронях і допомагає розслабитись." },
      { icon: "fa-spa", title: "Лаванда з м'ятою", text: "Заспокоює нервову систему і полегшує біль, спричинений стресом чи втомою очей." },
      { icon: "fa-water", title: "Ромашка з мелісою", text: "Знімає спазм судин і допомагає розслабитись при головному болю напруги." }
    ],
        digestion: [
      { icon: "fa-fire", title: "Материнка з м'ятою", text: "Знімає спазми і покращує травлення, особливо приємно пити після їжі." },
      { icon: "fa-lemon", title: "Ромашка з полином", text: "Заспокоює слизову шлунка і стимулює травлення після важкої їжі." },
      { icon: "fa-water", title: "М'ята", text: "Заспокоює травну систему і м'яко знімає здуття, підходить навіть дітям." },
      { icon: "fa-leaf", title: "М'ята з ромашкою", text: "Заспокоює шлунок і допомагає при легкому дискомфорті після їжі." },
      { icon: "fa-seedling", title: "Кмин", text: "Класичний засіб проти здуття і дискомфорту в животі." }
    ]
  };

  if (finderButtons.length > 0 && finderResult) {
    finderButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        finderButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.getAttribute("data-herb");
        const options = herbRecommendations[key];
        if (!options) return;

        finderResult.style.opacity = "0";

        setTimeout(() => {
          const cardsHtml = options
            .map(
              (herb) => `
            <div class="finder-result-card">
              <div class="finder-result-icon"><i class="fa-solid ${herb.icon}"></i></div>
              <div class="finder-result-text">
                <h3>${herb.title}</h3>
                <p>${herb.text}</p>
              </div>
            </div>
          `
            )
            .join("");

          finderResult.innerHTML = `<div class="finder-result-grid">${cardsHtml}</div>`;
          finderResult.style.opacity = "1";
        }, 250);
      });
    });
  }


  // ============================================================
  // FAQ-акордеон (працює на всіх сторінках, де є .faq-item)
  // ============================================================
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      faqItems.forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  }); 





// ============================================================
// Обгортка для плаваючих кнопок
// ============================================================
const floatingWrapper = document.createElement("div");
floatingWrapper.className = "floating-buttons";
document.body.appendChild(floatingWrapper);

// ------------------------------------------------------------
// Кнопка повідомлення (відкриває вашу існуючу форму)
// ------------------------------------------------------------
const openFormBtn = document.createElement("button");
openFormBtn.id = "openFormBtn";
openFormBtn.className = "fab-btn";
openFormBtn.setAttribute("aria-label", "Написати повідомлення");
openFormBtn.innerHTML = `<img src="/screenshots/icons/chats.png" alt="Написати повідомлення" class="fab-icon"> `;
floatingWrapper.appendChild(openFormBtn);

openFormBtn.addEventListener("click", () => {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("hide");
    modal.classList.add("show");
  }
});

// ============================================================
// Кнопка "Догори" з кільцем прогресу прокрутки (логіка без змін)
// ============================================================
const backToTopBtn = document.createElement("button");
backToTopBtn.id = "backToTopBtn";
backToTopBtn.className = "fab-btn";
backToTopBtn.setAttribute("aria-label", "Повернутись догори");
backToTopBtn.innerHTML = `
  <svg class="back-to-top-ring" viewBox="0 0 48 48">
    <circle class="ring-track" cx="24" cy="24" r="21"></circle>
    <circle class="ring-progress" cx="24" cy="24" r="21"></circle>
  </svg>
  <span class="back-to-top-arrow">
    <svg viewBox="0 0 24 24">
      <polyline points="6 15 12 9 18 15"></polyline>
    </svg>
  </span>
`;
floatingWrapper.appendChild(backToTopBtn);

const ringProgress = backToTopBtn.querySelector(".ring-progress");
const ringRadius = 21;
const ringCircumference = 2 * Math.PI * ringRadius;
ringProgress.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
ringProgress.style.strokeDashoffset = ringCircumference;

let hasAppeared = false;

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  ringProgress.style.strokeDashoffset = ringCircumference - progress * ringCircumference;

  if (scrollTop > 400) {
    backToTopBtn.classList.add("show");

    if (!hasAppeared) {
      backToTopBtn.classList.add("attention");
      hasAppeared = true;
      setTimeout(() => backToTopBtn.classList.remove("attention"), 2000);
    }
  } else {
    backToTopBtn.classList.remove("show");
    hasAppeared = false;
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ============================================================
// Анімація появи колонок "Наш підхід до роботи"
// ============================================================
const valueCols = document.querySelectorAll(".value-col");

const valueObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        valueObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

valueCols.forEach((col) => valueObserver.observe(col));
  

// ============================================================
  // Каталог трав: drag-to-scroll мишкою + лайтбокс перегляду фото
  // (сторінка "Лікувальні трави")
  // ============================================================
  const herbScrollRow = document.querySelector(".herb-scroll-row");
  const herbLightbox = document.getElementById("herbLightbox");
  const herbCards = document.querySelectorAll(".herb-card");

  if (herbLightbox && herbCards.length > 0) {
    const herbLightboxImg = document.getElementById("herbLightboxImg");
    const herbLightboxCaption = document.getElementById("herbLightboxCaption");
    const herbLightboxClose = document.getElementById("herbLightboxClose");

    // Переносимо лайтбокс в кінець <body>, щоб position:fixed
    // гарантовано не ламався через transform на батьківських блоках
    document.body.appendChild(herbLightbox);

    // ---- Drag-to-scroll мишкою ----
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let didDrag = false;

    if (herbScrollRow) {
      herbScrollRow.addEventListener("mousedown", (e) => {
        isDown = true;
        didDrag = false;
        herbScrollRow.classList.add("dragging");
        startX = e.pageX - herbScrollRow.offsetLeft;
        scrollLeftStart = herbScrollRow.scrollLeft;
      });

      window.addEventListener("mouseup", () => {
        isDown = false;
        herbScrollRow.classList.remove("dragging");
      });

      herbScrollRow.addEventListener("mouseleave", () => {
        isDown = false;
        herbScrollRow.classList.remove("dragging");
      });

      herbScrollRow.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - herbScrollRow.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) didDrag = true;
        herbScrollRow.scrollLeft = scrollLeftStart - walk;
      });
    }

    // ---- Лайтбокс ----
    function openHerbLightbox(imgSrc, title) {
      herbLightboxImg.src = imgSrc;
      herbLightboxCaption.textContent = title;
      herbLightbox.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closeHerbLightbox() {
      herbLightbox.classList.remove("show");
      document.body.style.overflow = "";
    }

    herbCards.forEach((card) => {
      const icon = card.querySelector(".herb-icon");
      const img = card.querySelector(".herb-icon img");
      const title = card.querySelector("h3");
      if (!icon || !img) return;

      // Клік ловимо на .herb-icon (не на img — в img стоїть
      // pointer-events:none в CSS, щоб клік завжди долітав сюди)
      icon.addEventListener("click", () => {
        // Якщо це був drag (перетягування стрічки), а не клік — ігноруємо
        if (didDrag) {
          didDrag = false;
          return;
        }
        openHerbLightbox(img.src, title ? title.textContent : "");
      });
    });

    herbLightboxClose.addEventListener("click", closeHerbLightbox);

    herbLightbox.addEventListener("click", (e) => {
      if (e.target === herbLightbox) closeHerbLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (herbLightbox.classList.contains("show") && e.key === "Escape") {
        closeHerbLightbox();
      }
    });
  }







document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. АВТО-СТВОРЕННЯ ЕКРАНУ ЗАГРУЗКИ + СМУЖКА
  // ==========================================
  const phrases = [
    "Створюємо атмосферу спокою...",
    "Запалюємо аромасвічки...",
    "Ваш ідеальний відпочинок починається...",
    "Готуємо простір для вашого релаксу...",
    "Додаємо трохи тепла та затишку...",
    "Створюємо момент лише для вас...",
    "Налаштовуємося на хвилю спокою...",
    "Готуємо все для вашого відпочинку...",
    "Даруємо простору атмосферу гармонії...",
    "Час видихнути та розслабитися...",
    "Готуємо місце для вашого перезавантаження...",
    "Вмикаємо режим повного релаксу...",
    "Трохи тиші. Трохи тепла. Багато турботи...",
    "Готуємо атмосферу для особливого моменту...",
    "Створюємо простір для внутрішнього спокою...",
    "Останні штрихи перед вашим відпочинком...",
    "Все готово для моменту релаксу...",
    "Ще кілька секунд - і можна розслабитися...",
    "Ваш простір спокою вже готовий...",
    "Залишилося лише розслабитися...",
    "Відкриваємо двері у світ релаксу...",
    "Запрошуємо вас у атмосферу спокою...",
    "Ваш час для себе настав...",
    "Нехай цей момент буде тільки вашим...",
    "Дозвольте собі просто відпочити...",
    "Зробіть паузу. Ви її заслужили...",
    "Ваш релакс починається просто зараз..."
  ];

  let loader = document.getElementById('loader');
  
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
      <div id="loader-text"></div>
      <div class="progress-container"><div class="progress-bar"></div></div>
    `;
    document.body.prepend(loader);
  } else if (!loader.querySelector('.progress-container')) {
    loader.innerHTML = `
      <div id="loader-text"></div>
      <div class="progress-container"><div class="progress-bar"></div></div>
    `;
  }

  const loaderText = document.getElementById('loader-text');
  
  if (loaderText) {
    loaderText.innerText = phrases[Math.floor(Math.random() * phrases.length)];
  }

  // ХОВАЄМО ЧОРНИЙ ЕКРАН ТІЛЬКИ ПІСЛЯ ЗАВЕРШЕННЯ АНІМАЦІЇ СМУЖКИ (800мс)
  setTimeout(() => {
    document.body.classList.add('loaded'); // Ховає CSS-фон
    loader.style.opacity = '0'; // Ховає текст і смужку
    setTimeout(() => {
      loader.style.display = 'none';
    }, 600);
  }, 800);

  // ==========================================
  // 2. АНІМАЦІЇ ТА ПАРАЛАКС
  // ==========================================
  const observers = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  
  document.querySelectorAll('.reveal-trigger').forEach(el => observers.observe(el));

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.parallax-img img').forEach(img => {
      img.style.transform = `translateY(${scrolled * 0.1}px) scale(1.1)`;
    });
  });

// ==========================================
  // 3. АВТО-СТВОРЕННЯ ТА РОБОТА КУРСОРУ
  // ==========================================
  if (window.innerWidth > 992) {
    let cursor = document.querySelector('.custom-cursor');
    
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
    }
    
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      if (cursor.style.opacity !== "1" && !cursor.classList.contains('is-hidden')) {
        cursor.style.opacity = "1";
      }
    });

    document.querySelectorAll('a, button, input, textarea, select, label, .hover-target, [role="button"], .tab, .close, svg').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
    
    // Логіка для приховування курсора над картою
    const mapContainer = document.querySelector('.map-container') || document.querySelector('iframe');
    if (mapContainer) {
      mapContainer.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hidden');
      });
      mapContainer.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hidden');
      });
    }

    window.addEventListener('mouseleave', () => cursor.style.opacity = "0");
    window.addEventListener('mouseenter', () => {
      if (!cursor.classList.contains('is-hidden')) cursor.style.opacity = "1";
    });
  }

  // ==========================================
  // 4. ПЕРЕХІД МІЖ СТОРІНКАМИ (ПЛАВНИЙ ВИХІД)
  // ==========================================
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetUrl = this.getAttribute('href');
      
      if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('http') || this.getAttribute('target') === '_blank') return;
      
      e.preventDefault();
      
      // Плавно покриваємо сторінку темрявою, а смужку з текстом запустить уже нова сторінка
      document.body.classList.remove('loaded');
      
      setTimeout(() => { window.location.href = targetUrl; }, 200);
    });
  });
});


// =========================================
// Анімація BG головна
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");
    const heroWrapper = document.querySelector(".hero-wrapper");

    if (!hero || !heroWrapper) return;

    let lastState = false;

    const updateHero = () => {

        const state = window.scrollY > 80;

        if (state === lastState) return;

        hero.classList.toggle("hero-scrolled", state);
        heroWrapper.classList.toggle("hero-scrolled", state);

        lastState = state;
    };

    window.addEventListener("scroll", updateHero, {
        passive: true
    });

    updateHero();
});