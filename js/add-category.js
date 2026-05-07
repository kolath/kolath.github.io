// Add/Edit Category — Page Takeover + Table interactions
document.addEventListener('DOMContentLoaded', function() {

  // ── Takeover Elements ──
  var takeover      = document.getElementById('cat-takeover');
  var takeoverClose = document.getElementById('cat-takeover-close');
  var takeoverSave  = document.getElementById('cat-takeover-save');
  var takeoverSavePub = document.getElementById('cat-takeover-save-publish');
  var takeoverNavTitle = document.getElementById('cat-takeover-nav-title');
  var appShell      = document.querySelector('.app');

  // ── Form Fields ──
  var fieldDisplayName  = document.getElementById('cat-field-display-name');
  var fieldInternalName = document.getElementById('cat-field-internal-name');
  var fieldDescription  = document.getElementById('cat-field-description');
  var fieldDescCount    = document.getElementById('cat-field-description-count');
  var fieldFeatured     = document.getElementById('cat-field-featured');
  var featuredLabel     = document.getElementById('cat-featured-label');

  // ── Menu items section ──
  var menuItemsEmpty      = document.getElementById('cat-menu-items-empty');
  var menuItemsFilled     = document.getElementById('cat-menu-items-filled');
  var menuItemsFilledHeader = document.getElementById('cat-menu-items-filled-header');
  var menuItemsFilledList = document.getElementById('cat-menu-items-filled-list');
  var menuItemsAddAction  = document.getElementById('cat-menu-items-add-action');
  var menuItemsAddBtn     = document.getElementById('cat-menu-items-add-btn');
  var menuItemsAddMoreBtn = document.getElementById('cat-menu-items-add-more-btn');

  // ── Table & Bulk Actions ──
  var catTable    = document.getElementById('cat-data-table');
  var selectAll   = document.getElementById('cat-select-all');
  var bulkBar     = document.getElementById('cat-bulk-action-bar');
  var bulkCount   = document.getElementById('cat-bulk-action-count');
  var bulkDismiss = document.getElementById('cat-bulk-action-dismiss');

  // ── Menu items data (categories → menu items mapping) ──
  var CATEGORY_ITEMS = {
    'Drinks':           ['Coke Can', 'Pepsi Can', 'Water Bottle'],
    'Desserts':         ['Cake Slice'],
    'Sides':            ['Hash Brown', 'Extra Toast', 'Extra Egg', 'Bacon Two', 'Ham', 'Sausage', 'Extra Pancake', 'Extra Waffle'],
    'Breakfast plate':  ['The Regular', 'Hammy Sunrise Plate', 'Eggy Taco', 'Hammy Eggy Taco', 'Porky Eggy Taco'],
    'Breakfast tacos':  ['Eggy Taco', 'Hammy Eggy Taco', 'Porky Eggy Taco', 'Cheesy Taco', 'Loaded Sunrise Taco', 'Veggie Morning Wrap']
  };

  // ── Category → Menus / Locations / Channels mapping ──
  var CATEGORY_MENUS = {
    'Drinks':           ['All Day Menu', 'Drink Menu'],
    'Desserts':         ['All Day Menu'],
    'Sides':            ['All Day Menu'],
    'Breakfast plate':  ['All Day Menu'],
    'Breakfast tacos':  ['All Day Menu']
  };
  var CATEGORY_LOCATIONS = {
    'Drinks':           ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Desserts':         ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Sides':            ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Breakfast plate':  ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Breakfast tacos':  ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St']
  };
  var CATEGORY_CHANNELS = {
    'Drinks':           ['Doordash', 'UberEats', 'Grubhub', 'Otter POS'],
    'Desserts':         ['Doordash', 'UberEats', 'Otter POS'],
    'Sides':            ['Doordash', 'UberEats', 'Grubhub', 'Otter POS', 'Otter Direct Orders'],
    'Breakfast plate':  ['Doordash', 'UberEats', 'Grubhub', 'Otter POS', 'Otter Direct Orders'],
    'Breakfast tacos':  ['Doordash', 'UberEats', 'Grubhub', 'Otter POS', 'Otter Direct Orders']
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ══════════════════════════════════════════════
  // ── Takeover Open / Close / Reset ──
  // ══════════════════════════════════════════════

  function openTakeover(itemData) {
    resetForm();
    if (itemData) {
      prefillFromItem(itemData);
      if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit category';
    }
    appShell.style.display = 'none';
    takeover.classList.add('takeover--visible');
    if (window.lucide) lucide.createIcons();
  }

  function closeTakeover() {
    takeover.classList.remove('takeover--visible');
    appShell.style.display = '';
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add category';
  }

  function resetForm() {
    fieldDisplayName.value = '';
    fieldInternalName.value = '';
    fieldDescription.value = '';
    fieldFeatured.checked = false;
    featuredLabel.textContent = 'Off';
    updateCharCount();

    // Reset menu items section
    menuItemsEmpty.style.display = '';
    menuItemsFilled.style.display = 'none';
    menuItemsFilledList.textContent = '';
    menuItemsAddAction.style.display = 'none';

    // Reset multiselects
    takeover.querySelectorAll('.multiselect').forEach(function(ms) {
      var pills = ms.querySelector('.multiselect__pills');
      pills.innerHTML = '<span class="multiselect__placeholder">' + (ms.dataset.field === 'cat-menus' ? 'Select menus' : 'Select') + '</span>';
      ms.querySelectorAll('.multiselect__checkbox').forEach(function(cb) { cb.checked = false; });
    });
  }

  function prefillFromItem(data) {
    fieldDisplayName.value = data.name || '';
    fieldInternalName.value = data.internalName || data.name || '';

    // Pre-fill menu items
    var items = CATEGORY_ITEMS[data.name];
    if (items && items.length > 0) {
      menuItemsEmpty.style.display = 'none';
      menuItemsFilled.style.display = '';
      menuItemsAddAction.style.display = '';
      var count = items.length;
      menuItemsFilledHeader.textContent = count + (count === 1 ? ' menu item' : ' menu items');
      menuItemsFilledList.textContent = items.join(', ');
    }

    // Pre-fill multiselects (menus, locations, channels)
    if (window.multiselectSetValues) {
      var menus = CATEGORY_MENUS[data.name] || [];
      var locs  = CATEGORY_LOCATIONS[data.name] || [];
      var chans = CATEGORY_CHANNELS[data.name] || [];
      window.multiselectSetValues('cat-menus', menus);
      window.multiselectSetValues('cat-locations', locs);
      window.multiselectSetValues('cat-channels', chans);
    }
  }

  takeoverClose.addEventListener('click', closeTakeover);
  takeoverSave.addEventListener('click', closeTakeover);
  takeoverSavePub.addEventListener('click', closeTakeover);

  // ── Character count ──
  fieldDescription.addEventListener('input', updateCharCount);

  function updateCharCount() {
    var len = fieldDescription.value.length;
    fieldDescCount.textContent = len + ' / 200 Characters Remaining';
  }

  // ── Featured category toggle ──
  fieldFeatured.addEventListener('change', function() {
    featuredLabel.textContent = fieldFeatured.checked ? 'On' : 'Off';
  });

  // ── Escape key (handled at the bottom after modal setup) ──

  // ══════════════════════════════════════════════
  // ── Section header Add button ──
  // ══════════════════════════════════════════════

  var sectionAddBtn = document.querySelector('.section-header__actions .btn');
  if (sectionAddBtn) {
    sectionAddBtn.addEventListener('click', function(e) {
      var activeTab = document.querySelector('.pill-tab--selected');
      if (activeTab && activeTab.getAttribute('data-tab') === 'categories') {
        e.preventDefault();
        if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add category';
        openTakeover(null);
      }
    });
  }

  // ══════════════════════════════════════════════
  // ── Row click → Edit category ──
  // ══════════════════════════════════════════════

  if (catTable) {
    catTable.querySelector('tbody').addEventListener('click', function(e) {
      if (e.target.closest('.table-checkbox') ||
          e.target.closest('.row-action')) return;

      var row = e.target.closest('tr');
      if (!row) return;

      var cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      var nameEl = row.querySelector('.cell-name-text');
      var data = {
        name: nameEl ? nameEl.textContent.trim() : '',
        internalName: cells[2] ? cells[2].textContent.trim() : '',
        usedIn: cells[3] ? cells[3].textContent.trim() : '',
        contains: cells[4] ? cells[4].textContent.trim() : ''
      };

      if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit category';
      openTakeover(data);
    });
  }

  // ══════════════════════════════════════════════
  // ── Select-all checkbox + Bulk Actions ──
  // ══════════════════════════════════════════════

  function rowCheckboxes() {
    return catTable ? catTable.querySelectorAll('tbody .cat-table-checkbox') : [];
  }

  function updateBulkActionBar() {
    var checked = Array.from(rowCheckboxes()).filter(function(c) { return c.checked; }).length;
    if (bulkBar) bulkBar.style.display = checked > 0 ? 'flex' : 'none';
    if (bulkCount) bulkCount.textContent = checked + ' selected';
  }

  function clearAllSelections() {
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
    rowCheckboxes().forEach(function(cb) {
      cb.checked = false;
      var tr = cb.closest('tr');
      if (tr) tr.classList.remove('table-row--selected');
    });
    updateBulkActionBar();
  }

  if (selectAll && catTable) {
    selectAll.addEventListener('change', function() {
      rowCheckboxes().forEach(function(cb) {
        cb.checked = selectAll.checked;
        var tr = cb.closest('tr');
        if (tr) tr.classList.toggle('table-row--selected', cb.checked);
      });
      updateBulkActionBar();
    });

    catTable.querySelector('tbody').addEventListener('change', function(e) {
      if (!e.target.classList.contains('cat-table-checkbox')) return;
      var tr = e.target.closest('tr');
      if (tr) tr.classList.toggle('table-row--selected', e.target.checked);

      var cbs = rowCheckboxes();
      var allChecked = Array.from(cbs).every(function(c) { return c.checked; });
      var someChecked = Array.from(cbs).some(function(c) { return c.checked; });
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
      updateBulkActionBar();
    });
  }

  if (bulkDismiss) {
    bulkDismiss.addEventListener('click', clearAllSelections);
  }

  // ══════════════════════════════════════════════
  // ── Add Menu Items Modal ──
  // ══════════════════════════════════════════════

  var miOverlay     = document.getElementById('cat-mi-modal-overlay');
  var miCloseBtn    = document.getElementById('cat-mi-modal-close');
  var miSearchInput = document.getElementById('cat-mi-search-input');
  var miListEl      = document.getElementById('cat-mi-modal-list');
  var miEmptyMsg    = document.getElementById('cat-mi-modal-empty');
  var miConfirmBtn  = document.getElementById('cat-mi-modal-confirm');
  var miCancelBtn   = document.getElementById('cat-mi-modal-cancel');
  var miSelectAllCb = miOverlay.querySelector('.cat-modal__select-all .cat-modal__checkbox');
  var miModalTitle  = document.getElementById('cat-mi-modal-title');

  var selectedMenuItems = [];

  // Scrape menu items from the menu-items table (first .data-table in the page)
  function scrapeMenuItems() {
    var items = [];
    var tables = document.querySelectorAll('.data-table');
    // The menu items table is the first one (no ID)
    var table = null;
    for (var i = 0; i < tables.length; i++) {
      if (!tables[i].id) { table = tables[i]; break; }
    }
    if (!table) return items;
    table.querySelectorAll('tbody tr').forEach(function(row) {
      var nameEl = row.querySelector('.cell-name-text');
      var cells = row.querySelectorAll('td');
      if (!nameEl || cells.length < 5) return;
      items.push({
        displayName: nameEl.textContent.trim(),
        internalName: cells[2] ? cells[2].textContent.trim() : '',
        price: cells[4] ? cells[4].textContent.trim() : ''
      });
    });
    return items;
  }

  var ALL_MENU_ITEMS = [];

  function buildMiList() {
    ALL_MENU_ITEMS = scrapeMenuItems();
    miListEl.innerHTML = '';
    ALL_MENU_ITEMS.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'cat-modal__option';
      el.dataset.value = item.displayName;
      el.innerHTML =
        '<input type="checkbox" class="cat-modal__checkbox" data-value="' + escapeHtml(item.displayName) + '">' +
        '<div class="cat-modal__option-info">' +
          '<span class="cat-modal__option-name">' + escapeHtml(item.displayName) + '</span>' +
          '<span class="cat-modal__option-desc">' + escapeHtml(item.internalName) + '</span>' +
        '</div>' +
        '<span class="cat-modal__option-count">' + escapeHtml(item.price) + '</span>';
      miListEl.appendChild(el);
    });
  }

  function openMiModal() {
    buildMiList();
    miSearchInput.value = '';
    miEmptyMsg.classList.remove('cat-modal__empty--visible');
    miSelectAllCb.checked = false;

    // Dynamic title: "Edit menu items" if items already selected, "Add menu items" otherwise
    if (miModalTitle) {
      miModalTitle.textContent = selectedMenuItems.length > 0 ? 'Edit menu items' : 'Add menu items';
    }

    // Pre-check already selected items
    selectedMenuItems.forEach(function(name) {
      var opt = miListEl.querySelector('.cat-modal__option[data-value="' + name + '"]');
      if (opt) opt.querySelector('.cat-modal__checkbox').checked = true;
    });
    syncMiSelectAll();

    miOverlay.classList.add('cat-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { miSearchInput.focus(); }, 100);
  }

  function closeMiModal() {
    miOverlay.classList.remove('cat-modal-overlay--visible');
  }

  function syncMiSelectAll() {
    var allChecked = true;
    var visibleOpts = miListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.cat-modal__checkbox').checked) allChecked = false;
    });
    miSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Option click
  miListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.cat-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.cat-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncMiSelectAll();
  });

  // Select all click
  miOverlay.querySelector('.cat-modal__select-all .cat-modal__option').addEventListener('click', function(e) {
    if (e.target !== miSelectAllCb) miSelectAllCb.checked = !miSelectAllCb.checked;
    var checked = miSelectAllCb.checked;
    miListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"]) .cat-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
  });

  // Search filter
  miSearchInput.addEventListener('input', function() {
    var query = miSearchInput.value.toLowerCase();
    var visibleCount = 0;
    miListEl.querySelectorAll('.cat-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.cat-modal__option-name').textContent.toLowerCase();
      var desc = opt.querySelector('.cat-modal__option-desc').textContent.toLowerCase();
      var match = name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      miEmptyMsg.classList.add('cat-modal__empty--visible');
    } else {
      miEmptyMsg.classList.remove('cat-modal__empty--visible');
    }
    syncMiSelectAll();
  });

  // Close / Cancel
  miCloseBtn.addEventListener('click', closeMiModal);
  miCancelBtn.addEventListener('click', closeMiModal);
  miOverlay.addEventListener('click', function(e) {
    if (e.target === miOverlay) closeMiModal();
  });

  // Confirm — apply selected items
  miConfirmBtn.addEventListener('click', function() {
    selectedMenuItems = [];
    miListEl.querySelectorAll('.cat-modal__checkbox').forEach(function(cb) {
      if (cb.checked) selectedMenuItems.push(cb.dataset.value);
    });
    closeMiModal();
    applyMiSelection();
  });

  function applyMiSelection() {
    if (selectedMenuItems.length > 0) {
      menuItemsEmpty.style.display = 'none';
      menuItemsFilled.style.display = '';
      menuItemsAddAction.style.display = '';
      var count = selectedMenuItems.length;
      menuItemsFilledHeader.textContent = count + (count === 1 ? ' menu item' : ' menu items');
      menuItemsFilledList.textContent = selectedMenuItems.join(', ');
    } else {
      menuItemsEmpty.style.display = '';
      menuItemsFilled.style.display = 'none';
      menuItemsFilledList.textContent = '';
      menuItemsAddAction.style.display = 'none';
    }
  }

  // Wire up Add buttons
  if (menuItemsAddBtn) {
    menuItemsAddBtn.addEventListener('click', openMiModal);
  }
  if (menuItemsAddMoreBtn) {
    menuItemsAddMoreBtn.addEventListener('click', openMiModal);
  }

  // Patch resetForm to also reset selected menu items
  var _origResetForm = resetForm;
  resetForm = function() {
    _origResetForm();
    selectedMenuItems = [];
  };

  // Patch prefillFromItem to also set selectedMenuItems
  var _origPrefill = prefillFromItem;
  prefillFromItem = function(data) {
    _origPrefill(data);
    var items = CATEGORY_ITEMS[data.name];
    if (items && items.length > 0) {
      selectedMenuItems = items.slice();
    }
  };

  // ── Escape key — close modal first, then takeover ──
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (miOverlay.classList.contains('cat-modal-overlay--visible')) {
      closeMiModal();
    } else if (takeover.classList.contains('takeover--visible')) {
      closeTakeover();
    }
  });

  // Expose for use by edit-menu.js
  window.openCatTakeover = openTakeover;
});
