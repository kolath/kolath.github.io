/**
 * icons.js — CSDS custom icon shim
 *
 * Lucide handles all standard icons.
 * This file injects inline SVG for CSDS-specific arrows using the
 * exact vector paths exported from the CSDS-Assets Figma file.
 *
 * Critical: the wrapper span inherits ALL classes from the original <i>
 * so that position:absolute, color, etc. from CSS are preserved.
 */
(function () {
  'use strict';

  // Exact paths from CSDS-Assets Figma (1184:38011 / 1184:38034)
  // Glyph is 10×6 in a 24×24 frame, centered at translate(7, 9)
  var PATH_DOWN = 'M 11.029 14.609 L 7.424 11.217 C 6.985 10.804 6.887 10.332 7.130 9.800 C 7.372 9.267 7.805 9.000 8.429 9.000 L 15.571 9.000 C 16.195 9.000 16.628 9.267 16.870 9.800 C 17.113 10.332 17.015 10.804 16.576 11.217 L 12.971 14.609 C 12.832 14.739 12.682 14.837 12.520 14.902 C 12.358 14.967 12.185 15.000 12.000 15.000 C 11.815 15.000 11.642 14.967 11.480 14.902 C 11.318 14.837 11.168 14.739 11.029 14.609 Z';
  var PATH_UP   = 'M 8.429 15.000 C 7.805 15.000 7.372 14.733 7.130 14.200 C 6.887 13.668 6.985 13.196 7.424 12.783 L 11.029 9.391 C 11.168 9.261 11.318 9.163 11.480 9.098 C 11.642 9.033 11.815 9.000 12.000 9.000 C 12.185 9.000 12.358 9.033 12.520 9.098 C 12.682 9.163 12.832 9.261 12.971 9.391 L 16.576 12.783 C 17.015 13.196 17.113 13.668 16.870 14.200 C 16.628 14.733 16.195 15.000 15.571 15.000 L 8.429 15.000 Z';

  var SVG_DEFS = {
    'arrow-drop-down': PATH_DOWN,
    'arrow-drop-up':   PATH_UP,
  };

  function makeSvg(pathData, size) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="' + pathData + '"/>' +
      '</svg>';
  }

  function injectCustomIcons(root) {
    root = root || document;
    Object.keys(SVG_DEFS).forEach(function (name) {
      var selector = '[data-lucide="' + name + '"]';
      var els = (root.querySelectorAll ? root : document).querySelectorAll(
        root === document ? selector : selector
      );
      // If root is a DOM element, search within it
      if (root !== document && root.querySelectorAll) {
        els = root.querySelectorAll(selector);
        // Also check root itself
        if (root.getAttribute && root.getAttribute('data-lucide') === name) {
          els = Array.prototype.slice.call(els);
          els.push(root);
        }
      }

      Array.prototype.forEach.call(els, function (el) {
        var style  = el.getAttribute('style') || '';
        var sizeM  = style.match(/width\s*:\s*(\d+(?:\.\d+)?)px/);
        var size   = sizeM ? parseFloat(sizeM[1]) : 20;

        var wrapper = document.createElement('span');

        // ── Copy ALL original classes so CSS positioning/color rules survive ──
        var origClasses = (el.getAttribute('class') || '')
          .split(/\s+/)
          .filter(function (c) { return c && c !== 'lucide-icon'; });
        wrapper.className = ['csds-icon'].concat(origClasses).join(' ');

        // ── Copy inline style (width/height → own size; keep color) ──
        wrapper.style.cssText = style;   // keep color, position hints etc.
        wrapper.style.width   = size + 'px';
        wrapper.style.height  = size + 'px';
        // display handled by .csds-icon class

        wrapper.innerHTML = makeSvg(SVG_DEFS[name], size);

        if (el.parentNode) el.parentNode.replaceChild(wrapper, el);
      });
    });
  }

  // Wrap window.lucide so createIcons({nodes}) also processes custom icons
  var _orig = window.lucide;
  window.lucide = {
    createIcons: function (opts) {
      if (_orig) _orig.createIcons(opts);
      if (opts && opts.nodes) {
        opts.nodes.forEach(function (n) { injectCustomIcons(n); });
      } else {
        injectCustomIcons(document);
      }
    }
  };

  function init() {
    if (_orig) _orig.createIcons();
    injectCustomIcons(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
