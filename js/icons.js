/**
 * icons.js — CSDS custom icon shim
 *
 * Lucide handles all standard icons via CDN.
 * This file handles only the two CSDS-specific arrows that Lucide doesn't have,
 * using inline SVG (no font, no ligatures = 100% reliable).
 *
 * arrow-drop-down  → filled ▾ triangle (CSDS arrow_drop_down)
 * arrow-drop-up    → filled ▴ triangle (CSDS arrow_drop_up)
 */
(function () {
  'use strict';

  var SVG = {
    'arrow-drop-down':
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
        '<path d="M5 7l5 6 5-6H5z"/>' +
      '</svg>',
    'arrow-drop-up':
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
        '<path d="M15 13l-5-6-5 6h10z"/>' +
      '</svg>',
  };

  function injectCustomIcons(root) {
    root = root || document;
    Object.keys(SVG).forEach(function (name) {
      var els = root.querySelectorAll ? root.querySelectorAll('[data-lucide="' + name + '"]') : [];
      Array.prototype.forEach.call(els, function (el) {
        var style = el.getAttribute('style') || '';
        var sizeM = style.match(/width\s*:\s*(\d+)px/);
        var size  = sizeM ? parseInt(sizeM[1]) : 20;
        var colorM = style.match(/color\s*:\s*([^;]+)/);

        var wrapper = document.createElement('span');
        wrapper.className = 'csds-icon';
        wrapper.style.width  = size + 'px';
        wrapper.style.height = size + 'px';
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.flexShrink = '0';
        wrapper.style.verticalAlign = 'middle';
        if (colorM) wrapper.style.color = colorM[1].trim();

        wrapper.innerHTML = SVG[name];
        var svg = wrapper.querySelector('svg');
        if (svg) {
          svg.setAttribute('width',  size);
          svg.setAttribute('height', size);
        }

        if (el.parentNode) el.parentNode.replaceChild(wrapper, el);
      });
    });
  }

  // Run after Lucide so we don't double-process
  function init() {
    // Lucide handles everything with data-lucide that it knows about
    if (window.lucide) window.lucide.createIcons();
    // We handle the two custom CSDS arrows
    injectCustomIcons(document);
  }

  // Expose a createIcons shim so JS files that call lucide.createIcons({nodes:[el]}) still work
  var _origLucide = window.lucide;
  window.lucide = {
    createIcons: function (opts) {
      if (_origLucide) _origLucide.createIcons(opts);
      // Also inject custom icons in any provided node scope
      if (opts && opts.nodes) {
        opts.nodes.forEach(function (node) { injectCustomIcons(node); });
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
