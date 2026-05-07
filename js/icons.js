/**
 * icons.js — Material Symbols shim
 *
 * Replaces <i data-lucide="name"> elements with
 * <span class="material-symbols-outlined">material_name</span>.
 * Exposes window.lucide = { createIcons } so all existing JS keeps working.
 */
(function () {
  'use strict';

  // ── Lucide → Material Symbols name map ──────────────────────────────────
  // Values: string = outlined; [string, true] = filled (FILL=1)
  var MAP = {
    'add':                    'add',
    'archive':                'archive',
    'arrow-left':             'arrow_back',
    'arrow-up-from-line':     'upload',
    'book-open':              'menu_book',
    'check':                  'check',
    'arrow-drop-down':        ['arrow_drop_down', true],
    'arrow-drop-up':          ['arrow_drop_up', true],
    'chevron-down':           'expand_more',
    'chevron-left':           'chevron_left',
    'chevron-right':          'chevron_right',
    'chevron-up':             'expand_less',
    'circle-check':           ['check_circle', true],
    'circle-help':            'help',
    'clock':                  'schedule',
    'columns-3':              'view_week',
    'copy':                   'content_copy',
    'dollar-sign':            'attach_money',
    'ellipsis-vertical':      'more_vert',
    'external-link':          'open_in_new',
    'eye':                    'visibility',
    'filter-list':            'filter_list',
    'grip-horizontal':        'drag_indicator',
    'grip-vertical':          'drag_indicator',
    'help-circle':            'help',
    'image':                  'image',
    'info':                   'info',
    'keyboard-arrow-down':    'keyboard_arrow_down',
    'keyboard-arrow-up':      'keyboard_arrow_up',
    'link':                   'link',
    'link-2-off':             'link_off',
    'minus':                  'remove',
    'minus-circle':           'do_not_disturb_on',
    'pencil':                 'edit',
    'percent':                'percent',
    'plus':                   'add',
    'plus-circle':            'add_circle',
    'search':                 'search',
    'settings':               'settings',
    'sliders-horizontal':     'tune',
    'store':                  'store',
    'tag':                    'sell',
    'trash-2':                'delete',
    'upload':                 'upload',
    'utensils':               'restaurant',
    'utensils-crossed':       'no_meals',
    'x':                      'close',
  };

  // ── Size extraction from inline style ───────────────────────────────────
  function parseSize(el) {
    var style = el.getAttribute('style') || '';
    var m = style.match(/width\s*:\s*(\d+(?:\.\d+)?)px/);
    return m ? parseFloat(m[1]) : 20;
  }

  function parseColor(el) {
    var style = el.getAttribute('style') || '';
    var m = style.match(/color\s*:\s*([^;]+)/);
    return m ? m[1].trim() : null;
  }

  // ── Convert one element ──────────────────────────────────────────────────
  function convertEl(el) {
    var lucideName = el.getAttribute('data-lucide');
    if (!lucideName) return;

    var entry = MAP[lucideName];
    var materialName, filled;
    if (Array.isArray(entry)) {
      materialName = entry[0];
      filled = entry[1];
    } else {
      materialName = entry || lucideName; // fallback: use name as-is
      filled = false;
    }

    var size  = parseSize(el);
    var color = parseColor(el);

    var span = document.createElement('span');
    span.className = 'ms-icon'; // base class (sized + positioned in CSS)
    if (filled) span.setAttribute('data-fill', '1');

    // opsz must be within font range 20–48
    var opsz = Math.min(48, Math.max(20, Math.round(size)));
    var fillVal = filled ? 1 : 0;
    span.style.fontVariationSettings =
      "'FILL' " + fillVal + ", 'wght' 400, 'GRAD' 0, 'opsz' " + opsz;
    span.style.fontSize = size + 'px';
    if (color) span.style.color = color;

    span.textContent = materialName;

    if (el.parentNode) {
      el.parentNode.replaceChild(span, el);
    }
  }

  // ── Public API matching Lucide's interface ───────────────────────────────
  function createIcons(options) {
    var roots = (options && options.nodes) ? options.nodes : [document];
    roots.forEach(function (root) {
      var list;
      if (root === document || root.querySelectorAll) {
        list = root.querySelectorAll('[data-lucide]');
      } else {
        // root itself may be the icon element
        list = root.getAttribute && root.getAttribute('data-lucide') ? [root] : [];
        // also check children
        if (root.querySelectorAll) {
          var children = root.querySelectorAll('[data-lucide]');
          list = Array.prototype.slice.call(list).concat(Array.prototype.slice.call(children));
        }
      }
      Array.prototype.forEach.call(list, convertEl);
    });
  }

  // ── Expose as global shim ────────────────────────────────────────────────
  window.lucide = { createIcons: createIcons };

  // Auto-run on DOMContentLoaded (replaces Lucide's self-init)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { createIcons(); });
  } else {
    createIcons();
  }
})();
