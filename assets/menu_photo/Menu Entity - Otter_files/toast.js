/* ===== TOAST NOTIFICATION SYSTEM ===== */
(function () {
  'use strict';

  function showToast(message, duration) {
    duration = duration || 3000;

    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<span class="toast__icon">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '</span>' +
      '<span class="toast__message">' + message + '</span>' +
      '<button class="toast__close" aria-label="Dismiss">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '</button>';

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('toast--visible');
      });
    });

    var timer = setTimeout(function () { dismiss(toast); }, duration);

    toast.querySelector('.toast__close').addEventListener('click', function () {
      clearTimeout(timer);
      dismiss(toast);
    });
  }

  function dismiss(toast) {
    toast.classList.remove('toast--visible');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }

  // Expose globally
  window.showToast = showToast;

  // Wire up Save buttons on all takeovers
  document.addEventListener('DOMContentLoaded', function () {
    var saves = [
      { id: 'mg-takeover-save',  msg: 'Modifier group saved successfully' },
      { id: 'mg-takeover-cancel', msg: null },
      { id: 'takeover-save',     msg: 'Menu item saved successfully' },
      { id: 'mi-takeover-save',  msg: 'Modifier item saved successfully' },
      { id: 'cat-takeover-save', msg: 'Category saved successfully' },
      { id: 'menu-takeover-save', msg: 'Menu saved successfully' },
    ];

    saves.forEach(function (s) {
      if (!s.msg) return;
      var btn = document.getElementById(s.id);
      if (!btn) return;
      btn.dataset.toastWired = '1';
      btn.addEventListener('click', function () {
        showToast(s.msg, 3000);
      });
    });

    // Fallback: any .btn--primary inside a .takeover that says "Save"
    document.querySelectorAll('.takeover .takeover__nav-right .btn--primary').forEach(function (btn) {
      if (btn.textContent.trim() === 'Save' && !btn.dataset.toastWired) {
        btn.dataset.toastWired = '1';
        var nav = btn.closest('.takeover__nav');
        var titleEl = nav ? nav.querySelector('.takeover__nav-title') : null;
        btn.addEventListener('click', function () {
          var title = titleEl ? titleEl.textContent.trim() : 'Item';
          showToast(title.replace(/^(Create new|Add)\s+/i, '') + ' saved successfully', 3000);
        });
      }
    });
  });
})();
