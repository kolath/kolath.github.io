/* ===== MULTI-SELECT SEARCHABLE DROPDOWN ===== */
(function () {
  'use strict';

  const SHARED_LOCATIONS = [
    'USA - TX - Dallas - Trinity Groves - 921 W Commerce St',
    'USA - TX - Fort Worth - Downtown - 3004 Cullen St',
    "PT's Fried Chicken and Fish - Dallas O",
    "PT's Fried Chicken and Fish - Dallas",
    'USA - TX - Austin - Sixth Street - 512 E 6th St',
    'USA - TX - Houston - Midtown - 2109 Bagby St',
    'USA - TX - San Antonio - Riverwalk - 200 S Alamo St',
  ];

  const SHARED_CHANNELS = [
    'DoorDash',
    'Uber Eats',
    'Grubhub',
    'Otter POS',
    'Otter Direct Orders',
    'Caviar',
    'Postmates',
  ];

  const SHARED_MENU_ITEMS = [
    'Waffle Breakfast Plate',
    'Chicken and Waffles Plate',
    'Pancake Breakfast Plate',
    'Big Breakfast Plate',
    'French Toast Plate',
    'Cakes',
    'Eggy Taco',
    'Hammy Eggy Taco',
    'Porky Eggy Taco',
    'Eggy Sausage Taco',
    'Veggie Eggy Taco',
    'Biggy Eggy Taco',
    'Coke Can',
    'Sprite Can',
    'Kool-Aid',
    'Salsa',
    'Toast (Two)',
  ];

  const MULTISELECT_OPTIONS = {
    locations: SHARED_LOCATIONS,
    stations: [
      'Drink Station',
      'Fried Station',
      'Grill Station',
    ],
    channels: SHARED_CHANNELS,
    'cat-menus': [
      'All Day Menu',
      'Drink Menu',
    ],
    'cat-locations': SHARED_LOCATIONS,
    'cat-channels': SHARED_CHANNELS,
    'mg-locations': SHARED_LOCATIONS,
    'mg-channels': SHARED_CHANNELS,
    'mg-menu-items': SHARED_MENU_ITEMS,
  };

  /** Build option elements inside the .multiselect__options container */
  function buildOptions(multiselect) {
    var field = multiselect.getAttribute('data-field');
    var items = MULTISELECT_OPTIONS[field] || [];
    var container = multiselect.querySelector('.multiselect__options');
    container.innerHTML = '';

    // Update "Select / deselect all" label and count
    var selectAllOption = multiselect.querySelector('.multiselect__option--select-all');
    if (selectAllOption) {
      var labelSpan = selectAllOption.querySelector('span:not(.multiselect__select-all-count)');
      if (labelSpan) labelSpan.textContent = 'Select / deselect all';
      var countSpan = selectAllOption.querySelector('.multiselect__select-all-count');
      if (!countSpan) {
        countSpan = document.createElement('span');
        countSpan.className = 'multiselect__select-all-count';
        selectAllOption.appendChild(countSpan);
      }
      countSpan.textContent = items.length;
    }

    items.forEach(function (label) {
      var opt = document.createElement('div');
      opt.className = 'multiselect__option';
      opt.setAttribute('data-value', label);

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'multiselect__checkbox';

      var span = document.createElement('span');
      span.textContent = label;

      opt.appendChild(cb);
      opt.appendChild(span);
      container.appendChild(opt);
    });

    // No-results message
    var noResults = document.createElement('div');
    noResults.className = 'multiselect__no-results';
    noResults.textContent = 'No results found';
    container.appendChild(noResults);
  }

  /** Refresh the pill display inside the trigger */
  function refreshPills(multiselect) {
    var pillsContainer = multiselect.querySelector('.multiselect__pills');
    var placeholder = multiselect.querySelector('.multiselect__placeholder');

    // Remove existing pills
    var existing = pillsContainer.querySelectorAll('.multiselect__pill');
    existing.forEach(function (p) { p.remove(); });

    // Gather selected values
    var selected = getSelected(multiselect);

    if (selected.length === 0) {
      placeholder.style.display = '';
    } else {
      placeholder.style.display = 'none';
      selected.forEach(function (val) {
        var pill = document.createElement('span');
        pill.className = 'multiselect__pill';
        pill.setAttribute('data-value', val);

        var text = document.createElement('span');
        text.textContent = val;
        pill.appendChild(text);

        var close = document.createElement('span');
        close.className = 'multiselect__pill-close';
        close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        pill.appendChild(close);

        pillsContainer.appendChild(pill);
      });
    }

    // Sync "Select all" checkbox
    syncSelectAll(multiselect);
  }

  /** Get array of currently selected values */
  function getSelected(multiselect) {
    var selected = [];
    var opts = multiselect.querySelectorAll('.multiselect__options .multiselect__option');
    opts.forEach(function (opt) {
      var cb = opt.querySelector('.multiselect__checkbox');
      if (cb && cb.checked) {
        selected.push(opt.getAttribute('data-value'));
      }
    });
    return selected;
  }

  /** Sync the "Select all" checkbox state */
  function syncSelectAll(multiselect) {
    var selectAllCb = multiselect.querySelector('.multiselect__option--select-all .multiselect__checkbox');
    if (!selectAllCb) return;

    var opts = multiselect.querySelectorAll('.multiselect__options .multiselect__option');
    var total = 0;
    var checked = 0;
    opts.forEach(function (opt) {
      var cb = opt.querySelector('.multiselect__checkbox');
      if (cb) {
        total++;
        if (cb.checked) checked++;
      }
    });

    selectAllCb.checked = total > 0 && checked === total;
    selectAllCb.indeterminate = checked > 0 && checked < total;
  }

  /** Position dropdown using fixed coords to escape overflow clipping */
  function positionDropdown(multiselect) {
    var trigger = multiselect.querySelector('.multiselect__trigger');
    var dropdown = multiselect.querySelector('.multiselect__dropdown');
    if (!trigger || !dropdown) return;

    var rect = trigger.getBoundingClientRect();
    var spaceBelow = window.innerHeight - rect.bottom;
    var dropdownHeight = 280; // approximate max height

    dropdown.style.position = 'fixed';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.width = rect.width + 'px';
    dropdown.style.right = 'auto';
    dropdown.style.zIndex = '9990';

    var spaceAbove = rect.top;
    if (spaceBelow >= dropdownHeight) {
      // Enough room below — open downward
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.bottom = 'auto';
    } else if (spaceAbove >= spaceBelow) {
      // More room above — open upward
      dropdown.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      dropdown.style.top = 'auto';
    } else {
      // Default downward, constrain height
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.bottom = 'auto';
      dropdown.style.maxHeight = spaceBelow - 8 + 'px';
    }
  }

  /** Toggle open/close */
  function toggleOpen(multiselect, forceOpen) {
    var isOpen = multiselect.classList.contains('multiselect--open');
    var shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

    // Close all other multiselects first
    document.querySelectorAll('.multiselect--open').forEach(function (other) {
      if (other !== multiselect) {
        other.classList.remove('multiselect--open');
      }
    });

    if (shouldOpen) {
      multiselect.classList.add('multiselect--open');
      positionDropdown(multiselect);
      // Focus search input
      var search = multiselect.querySelector('.multiselect__search');
      if (search) {
        setTimeout(function () { search.focus(); }, 50);
      }
    } else {
      multiselect.classList.remove('multiselect--open');
      // Clear search on close
      var search = multiselect.querySelector('.multiselect__search');
      if (search) {
        search.value = '';
        filterOptions(multiselect, '');
      }
    }
  }

  /** Filter options by search text */
  function filterOptions(multiselect, query) {
    var opts = multiselect.querySelectorAll('.multiselect__options .multiselect__option');
    var lowerQuery = query.toLowerCase();
    var visibleCount = 0;

    opts.forEach(function (opt) {
      var value = (opt.getAttribute('data-value') || '').toLowerCase();
      if (!query || value.indexOf(lowerQuery) !== -1) {
        opt.classList.remove('multiselect__option--hidden');
        visibleCount++;
      } else {
        opt.classList.add('multiselect__option--hidden');
      }
    });

    // Show/hide no-results
    var noResults = multiselect.querySelector('.multiselect__no-results');
    if (noResults) {
      if (visibleCount === 0 && query) {
        noResults.classList.add('multiselect__no-results--visible');
      } else {
        noResults.classList.remove('multiselect__no-results--visible');
      }
    }

    // Show/hide select-all based on search
    var selectAllOption = multiselect.querySelector('.multiselect__option--select-all');
    var divider = multiselect.querySelector('.multiselect__divider');
    if (query) {
      if (selectAllOption) selectAllOption.style.display = 'none';
      if (divider) divider.style.display = 'none';
    } else {
      if (selectAllOption) selectAllOption.style.display = '';
      if (divider) divider.style.display = '';
    }
  }

  /** Initialize a single multiselect */
  function initMultiselect(multiselect) {
    buildOptions(multiselect);

    var trigger = multiselect.querySelector('.multiselect__trigger');
    var search = multiselect.querySelector('.multiselect__search');
    var selectAllOption = multiselect.querySelector('.multiselect__option--select-all');
    var selectAllCb = selectAllOption ? selectAllOption.querySelector('.multiselect__checkbox') : null;
    var optionsContainer = multiselect.querySelector('.multiselect__options');
    var pillsContainer = multiselect.querySelector('.multiselect__pills');

    // Toggle dropdown on trigger click
    trigger.addEventListener('click', function (e) {
      // Don't toggle if clicking a pill close button
      if (e.target.closest('.multiselect__pill-close')) return;
      toggleOpen(multiselect);
    });

    // Prevent dropdown clicks from closing
    multiselect.querySelector('.multiselect__dropdown').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Search filtering
    search.addEventListener('input', function () {
      filterOptions(multiselect, search.value);
    });

    // Prevent search from closing dropdown
    search.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Select all
    if (selectAllOption) {
      selectAllOption.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var newState = !selectAllCb.checked;
        selectAllCb.checked = newState;

        var opts = optionsContainer.querySelectorAll('.multiselect__option .multiselect__checkbox');
        opts.forEach(function (cb) {
          cb.checked = newState;
        });

        refreshPills(multiselect);
      });
    }

    // Individual option click
    optionsContainer.addEventListener('click', function (e) {
      var option = e.target.closest('.multiselect__option');
      if (!option) return;

      e.preventDefault();
      e.stopPropagation();

      var cb = option.querySelector('.multiselect__checkbox');
      if (cb) {
        cb.checked = !cb.checked;
        refreshPills(multiselect);
      }
    });

    // Pill close (X) button — use event delegation on pills container
    pillsContainer.addEventListener('click', function (e) {
      var closeBtn = e.target.closest('.multiselect__pill-close');
      if (!closeBtn) return;

      e.preventDefault();
      e.stopPropagation();

      var pill = closeBtn.closest('.multiselect__pill');
      if (!pill) return;

      var value = pill.getAttribute('data-value');

      // Uncheck the corresponding option
      var opts = optionsContainer.querySelectorAll('.multiselect__option');
      opts.forEach(function (opt) {
        if (opt.getAttribute('data-value') === value) {
          var cb = opt.querySelector('.multiselect__checkbox');
          if (cb) cb.checked = false;
        }
      });

      refreshPills(multiselect);
    });
  }

  /** Close all multiselects when clicking outside */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.multiselect')) {
      document.querySelectorAll('.multiselect--open').forEach(function (ms) {
        ms.classList.remove('multiselect--open');
        var search = ms.querySelector('.multiselect__search');
        if (search) {
          search.value = '';
          filterOptions(ms, '');
        }
      });
    }
  });

  /** Init on DOMContentLoaded */
  function init() {
    var multiselects = document.querySelectorAll('.multiselect');
    multiselects.forEach(initMultiselect);

    // Re-render Lucide icons if available
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /** Programmatically set selected values on a multiselect.
   *  Optional scopeEl limits the search to a specific container. */
  window.multiselectSetValues = function(dataField, values, scopeEl) {
    var root = scopeEl || document;
    var ms = root.querySelector('.multiselect[data-field="' + dataField + '"]');
    if (!ms) return;
    // Uncheck all first
    ms.querySelectorAll('.multiselect__options .multiselect__checkbox').forEach(function(cb) {
      cb.checked = false;
    });
    // Check matching values
    values.forEach(function(val) {
      var opts = ms.querySelectorAll('.multiselect__options .multiselect__option');
      opts.forEach(function(opt) {
        if (opt.getAttribute('data-value') === val) {
          opt.querySelector('.multiselect__checkbox').checked = true;
        }
      });
    });
    refreshPills(ms);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
