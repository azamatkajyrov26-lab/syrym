/* ==============================================
   SYRYM — App logic
   Render service cards, modal, deep links to messengers
   ============================================== */

(function () {
  'use strict';

  const cfg = window.SYRYM_CONFIG;
  const services = window.SYRYM_SERVICES;
  const icons = window.SYRYM_ICONS;

  // ---------- Render service cards ----------
  const grid = document.querySelector('.services__grid');
  if (grid && services) {
    const html = services.map(s => {
      const isLink = !!s.link;
      const tag = isLink ? 'a' : 'button';
      const linkAttrs = isLink
        ? `href="${s.link}" aria-label="Открыть конструктор: ${escapeAttr(s.title)}"`
        : `type="button" data-service-id="${s.id}" data-service-title="${escapeAttr(s.title)}" aria-label="Заказать услугу: ${escapeAttr(s.title)}"`;
      const badge = s.badge
        ? `<span class="service-card__badge">${s.badge}</span>`
        : '';
      const ctaText = isLink ? 'Открыть конструктор' : 'Связаться';

      return `
        <${tag} class="service-card${isLink ? ' service-card--featured' : ''}" role="listitem" ${linkAttrs}>
          ${badge}
          <span class="service-card__icon" aria-hidden="true">${icons[s.icon] || ''}</span>
          <h3 class="service-card__title">${s.title}</h3>
          <p class="service-card__text">${s.text}</p>
          <span class="service-card__cta">
            ${ctaText}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </${tag}>
      `;
    }).join('');
    grid.innerHTML = html;
  }

  // ---------- Replace contact placeholders ----------
  const phoneIntl = cfg.phone.replace(/[^0-9+]/g, '');
  const waNumber  = cfg.whatsapp.replace(/[^0-9]/g, '');

  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.setAttribute('href', `tel:${phoneIntl}`));
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => {
    a.setAttribute('href', `https://wa.me/${waNumber}`);
  });
  document.querySelectorAll('a[href^="https://t.me/"]').forEach(a => {
    if (a.getAttribute('href').includes('syrym_bot')) {
      a.setAttribute('href', `https://t.me/${cfg.telegram}`);
    }
  });

  // ---------- Modal logic ----------
  const modal = document.getElementById('contact-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalWA = document.getElementById('modal-whatsapp');
  const modalTG = document.getElementById('modal-telegram');
  const modalCall = document.getElementById('modal-call');

  let lastFocused = null;

  function openModal(serviceTitle) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modalTitle.textContent = serviceTitle;

    const message = encodeURIComponent(
      `Здравствуйте! Меня интересует услуга: «${serviceTitle}». Подскажите, пожалуйста, по подробностям.`
    );

    modalWA.href = `https://wa.me/${waNumber}?text=${message}`;
    modalTG.href = `https://t.me/${cfg.telegram}?text=${message}`;
    modalCall.href = `tel:${phoneIntl}`;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // focus close button for keyboard users
    setTimeout(() => modal.querySelector('.modal__close')?.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  // Service card click — open modal (только для button-карточек, не для ссылок-конструкторов)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('button.service-card');
    if (card) {
      const title = card.dataset.serviceTitle;
      openModal(title);
      return;
    }
    if (e.target.closest('[data-close]')) {
      closeModal();
    }
  });

  // ESC closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // Focus trap inside modal
  modal?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Smooth scroll for nav links ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (target.length > 1) {
        const el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  // ---------- Helpers ----------
  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
})();
