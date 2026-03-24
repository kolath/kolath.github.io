// Add/Edit Modifier Group — Page Takeover
document.addEventListener('DOMContentLoaded', function() {

  // ── Takeover Elements ──
  var takeover      = document.getElementById('mg-takeover');
  var takeoverClose = document.getElementById('mg-takeover-close');
  var takeoverSave  = document.getElementById('mg-takeover-save');
  var takeoverSavePub = document.getElementById('mg-takeover-save-publish');
  var takeoverNavTitle = document.getElementById('mg-takeover-nav-title');
  var appShell      = document.querySelector('.app');

  // ── Form Fields ──
  var fieldDisplayName  = document.getElementById('mg-field-display-name');
  var fieldInternalName = document.getElementById('mg-field-internal-name');
  var fieldDescription  = document.getElementById('mg-field-description');
  var fieldDescCount    = document.getElementById('mg-field-description-count');

  // ── Type card grid ──
  var typeGrid = document.getElementById('mg-type-grid');

  // ── Selection rule selects ──
  var totalMin    = document.getElementById('mg-total-min');
  var totalMax    = document.getElementById('mg-total-max');
  var totalHint   = document.getElementById('mg-total-hint');
  var maxPer      = document.getElementById('mg-max-per');
  var maxPerHint  = document.getElementById('mg-maxper-hint');

  // ── Modifier items inline table ──
  var itemsBody = document.getElementById('mg-items-body');

  // ── Assign to menu items section ──
  var menuItemsEmpty       = document.getElementById('mg-menu-items-empty');
  var menuItemsFilled      = document.getElementById('mg-menu-items-filled');
  var menuItemsFilledHeader = document.getElementById('mg-menu-items-filled-header');
  var menuItemsFilledList  = document.getElementById('mg-menu-items-filled-list');
  var menuItemsAddAction   = document.getElementById('mg-menu-items-add-action');
  var menuItemsAddBtn      = document.getElementById('mg-menu-items-add-btn');
  var menuItemsEditBtn     = document.getElementById('mg-menu-items-edit-btn');

  // ── Table ──
  var mgTable = document.getElementById('mg-data-table');

  // ── Data maps from modifier-groups.md ──
  var MG_ITEMS_DATA = {
    'Choice of Cake': [
      { name: 'Banana Pudding Chess', price: '$0.00' },
      { name: 'Oreo', price: '$0.00' },
      { name: 'Lemon', price: '$0.00' }
    ],
    'Egg Style': [
      { name: 'Scrambled Eggs', price: '$0.00' },
      { name: 'Over Hard', price: '$0.00' }
    ],
    'Plate Add Ons': [
      { name: 'Extra Syrup', price: '$0.49' },
      { name: 'Extra Butter', price: '$0.49' },
      { name: 'White American Cheese', price: '$0.99' },
      { name: 'Yellow American Cheese', price: '$0.99' },
      { name: 'Hash Brown', price: '$1.49' },
      { name: 'Extra Toast', price: '$1.49' },
      { name: 'Extra Egg', price: '$1.99' },
      { name: 'Bacon Two', price: '$1.99' },
      { name: 'Ham', price: '$1.99' },
      { name: 'Sausage', price: '$1.99' },
      { name: 'Extra Pancake', price: '$2.49' },
      { name: 'Extra Waffle', price: '$2.49' }
    ],
    'Choice of American Cheese': [
      { name: 'White Cheese', price: '$0.00' },
      { name: 'Yellow Cheese', price: '$0.00' }
    ],
    'Choice of Add Ons': [
      { name: 'Onions', price: '$0.49' },
      { name: 'White American Cheese', price: '$0.99' },
      { name: 'Yellow American Cheese', price: '$0.99' },
      { name: 'Hash Brown', price: '$1.49' },
      { name: 'Extra Egg', price: '$1.99' },
      { name: 'Bacon Two', price: '$1.99' },
      { name: 'Ham', price: '$1.99' },
      { name: 'Sausage', price: '$1.99' }
    ]
  };

  var MG_TYPE = {
    'Choice of Cake':            'Product variation',
    'Egg Style':                 'Product variation',
    'Plate Add Ons':             'Add-on',
    'Choice of American Cheese': 'Product variation',
    'Choice of Add Ons':         'Add-on'
  };

  var MG_RULE = {
    'Choice of Cake':            { min: '1', max: '1', each: '1' },
    'Egg Style':                 { min: '1', max: '1', each: '1' },
    'Plate Add Ons':             { min: '0', max: 'Unlimited', each: '1' },
    'Choice of American Cheese': { min: '1', max: '1', each: '1' },
    'Choice of Add Ons':         { min: '0', max: 'Unlimited', each: '1' }
  };

  var MG_USED_BY = {
    'Choice of Cake':            ['Cakes'],
    'Egg Style':                 ['Waffle Breakfast Plate', 'Chicken and Waffles Plate', 'Pancake Breakfast Plate', 'Big Breakfast Plate', 'French Toast Plate'],
    'Plate Add Ons':             ['Waffle Breakfast Plate', 'Chicken and Waffles Plate', 'Pancake Breakfast Plate', 'Big Breakfast Plate', 'French Toast Plate'],
    'Choice of American Cheese': ['Eggy Taco', 'Hammy Eggy Taco', 'Porky Eggy Taco', 'Eggy Sausage Taco', 'Veggie Eggy Taco', 'Biggy Eggy Taco'],
    'Choice of Add Ons':         ['Eggy Taco', 'Hammy Eggy Taco', 'Porky Eggy Taco', 'Eggy Sausage Taco', 'Veggie Eggy Taco', 'Biggy Eggy Taco']
  };

  var MG_LOCATIONS = {
    'Choice of Cake':            ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Egg Style':                 ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Plate Add Ons':             ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Choice of American Cheese': ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St'],
    'Choice of Add Ons':         ['USA - TX - Dallas - Trinity Groves - 921 W Commerce St']
  };

  var MG_CHANNELS = {
    'Choice of Cake':            ['Doordash', 'UberEats'],
    'Egg Style':                 ['Doordash', 'UberEats'],
    'Plate Add Ons':             ['Doordash', 'UberEats'],
    'Choice of American Cheese': ['Doordash', 'UberEats'],
    'Choice of Add Ons':         ['Doordash', 'UberEats']
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ══════════════════════════════════════════════
  // ── Default selection rules per type ──
  // ══════════════════════════════════════════════

  var TYPE_DEFAULTS = {
    'Size':              { min: '1', max: '1', each: '1' },
    'Product variation': { min: '1', max: '1', each: '1' },
    'Preference':        { min: '0', max: 'Unlimited', each: '1' },
    'Packaging':         { min: '1', max: '1', each: '1' },
    'Add-on':            { min: '0', max: 'Unlimited', each: 'Unlimited' },
    'Removal':           { min: '0', max: 'Unlimited', each: '1' },
    'Condiments':        { min: '0', max: 'Unlimited', each: 'Unlimited' },
    'Combo / Bundle':    { min: '1', max: '1', each: '1' },
    'Upsell':            { min: '0', max: 'Unlimited', each: '1' }
  };

  // ══════════════════════════════════════════════
  // ── Max per field visibility ──
  // ══════════════════════════════════════════════

  var maxPerField = document.getElementById('mg-maxper-field');

  function updateMaxPerVisibility() {
    if (!maxPerField) return;
    maxPerField.style.display = totalMax.value === '1' ? 'none' : '';
  }

  // ══════════════════════════════════════════════
  // ── Type card grid ──
  // ══════════════════════════════════════════════

  function applyTypeDefaults(typeName) {
    var defaults = TYPE_DEFAULTS[typeName];
    if (!defaults) return;
    totalMin.value = defaults.min;
    totalMax.value = defaults.max;
    maxPer.value = defaults.each;
    updateTotalHint();
    updateMaxPerHint();
    updateMaxPerVisibility();
  }

  if (typeGrid) {
    typeGrid.addEventListener('click', function(e) {
      var card = e.target.closest('.mgc-type-card');
      if (!card) return;
      typeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
        c.classList.remove('mgc-type-card--selected');
      });
      card.classList.add('mgc-type-card--selected');

      // Apply default selection rules for this type
      var cardName = card.querySelector('.mgc-type-card__name');
      if (cardName) applyTypeDefaults(cardName.textContent.trim());
    });
  }

  function selectTypeCard(typeName) {
    if (!typeGrid) return;
    typeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
      c.classList.remove('mgc-type-card--selected');
      var cardName = c.querySelector('.mgc-type-card__name');
      if (cardName && cardName.textContent.trim() === typeName) {
        c.classList.add('mgc-type-card--selected');
      }
    });
  }

  // ══════════════════════════════════════════════
  // ── Selection rule hint updates ──
  // ══════════════════════════════════════════════

  function updateTotalHint() {
    var min = totalMin.value;
    var max = totalMax.value;
    if (min === '0' && max === 'Unlimited') {
      totalHint.textContent = 'Optional \u2013 customers can select any number of options.';
    } else if (min === '0') {
      totalHint.textContent = 'Optional \u2013 customers can select up to ' + max + ' option' + (max === '1' ? '' : 's') + '.';
    } else if (min === max) {
      totalHint.textContent = 'Required \u2013 customers must select exactly ' + min + ' option' + (min === '1' ? '' : 's') + '.';
    } else if (max === 'Unlimited') {
      totalHint.textContent = 'Required \u2013 customers must select at least ' + min + ' option' + (min === '1' ? '' : 's') + '.';
    } else {
      totalHint.textContent = 'Required \u2013 customers must select ' + min + ' to ' + max + ' options.';
    }
  }

  function updateMaxPerHint() {
    var val = maxPer.value;
    if (val === 'Unlimited') {
      maxPerHint.textContent = 'Each option can be selected multiple times.';
    } else if (val === '1') {
      maxPerHint.textContent = 'Each option can be selected once.';
    } else {
      maxPerHint.textContent = 'Each option can be selected up to ' + val + ' times.';
    }
  }

  totalMin.addEventListener('change', updateTotalHint);
  totalMax.addEventListener('change', function() {
    updateTotalHint();
    updateMaxPerVisibility();
  });
  maxPer.addEventListener('change', updateMaxPerHint);

  // ══════════════════════════════════════════════
  // ── Modifier items inline table ──
  // ══════════════════════════════════════════════

  function renderItemsTable(items) {
    itemsBody.innerHTML = '';
    if (!items || items.length === 0) return;
    items.forEach(function(item, idx) {
      var row = document.createElement('div');
      row.className = 'mgc-items-table__row';
      row.innerHTML =
        '<button class="mgc-row-drag"><i data-lucide="grip-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>' +
        '<span class="mgc-items-table__col mgc-items-table__col--name"><span class="mgc-row-name-text">' + escapeHtml(item.name) + '</span></span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--price">' + escapeHtml(item.price) + '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--sku"></span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--default">' + (idx === 0 ? '<input type="radio" name="mg-default-item" checked>' : '<input type="radio" name="mg-default-item">') + '</span>' +
        '<button class="mgc-row-more"><i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>';
      itemsBody.appendChild(row);
    });
    if (window.lucide) lucide.createIcons();
  }

  // ══════════════════════════════════════════════
  // ── Takeover Open / Close / Reset ──
  // ══════════════════════════════════════════════

  function openTakeover(itemData) {
    resetForm();
    if (itemData) {
      prefillFromItem(itemData);
    }
    appShell.style.display = 'none';
    takeover.classList.add('takeover--visible');
    if (window.lucide) lucide.createIcons();
  }

  function closeTakeover() {
    takeover.classList.remove('takeover--visible');
    appShell.style.display = '';
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add modifier group';
  }

  function resetForm() {
    fieldDisplayName.value = '';
    fieldInternalName.value = '';
    fieldDescription.value = '';
    updateCharCount();

    // Reset type card grid
    if (typeGrid) {
      typeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
        c.classList.remove('mgc-type-card--selected');
      });
    }

    // Reset selection rule
    totalMin.value = '0';
    totalMax.value = 'Unlimited';
    maxPer.value = 'Unlimited';
    updateTotalHint();
    updateMaxPerHint();
    updateMaxPerVisibility();

    // Reset items table
    itemsBody.innerHTML = '';

    // Reset menu items section
    menuItemsEmpty.style.display = '';
    menuItemsFilled.style.display = 'none';
    menuItemsFilledList.textContent = '';
    menuItemsAddAction.style.display = 'none';
    selectedMenuItems = [];

    // Reset multiselects
    takeover.querySelectorAll('.multiselect').forEach(function(ms) {
      var pills = ms.querySelector('.multiselect__pills');
      pills.innerHTML = '<span class="multiselect__placeholder">Select</span>';
      ms.querySelectorAll('.multiselect__checkbox').forEach(function(cb) { cb.checked = false; });
    });
  }

  function prefillFromItem(data) {
    fieldDisplayName.value = data.name || '';
    fieldInternalName.value = data.internalName || data.name || '';

    // Type card
    var type = MG_TYPE[data.name] || data.type;
    if (type) selectTypeCard(type);

    // Selection rule
    var rule = MG_RULE[data.name];
    if (rule) {
      totalMin.value = rule.min;
      totalMax.value = rule.max;
      maxPer.value = rule.each;
    }
    updateTotalHint();
    updateMaxPerHint();
    updateMaxPerVisibility();

    // Modifier items table
    var items = MG_ITEMS_DATA[data.name];
    if (items) renderItemsTable(items);

    // Menu items (used by)
    var usedBy = MG_USED_BY[data.name];
    if (usedBy && usedBy.length > 0) {
      selectedMenuItems = usedBy.slice();
      menuItemsEmpty.style.display = 'none';
      menuItemsFilled.style.display = '';
      menuItemsAddAction.style.display = '';
      var cnt = usedBy.length;
      menuItemsFilledHeader.textContent = cnt + (cnt === 1 ? ' menu item' : ' menu items');
      menuItemsFilledList.textContent = usedBy.join(', ');
    }

    // Multiselects (locations, channels)
    if (window.multiselectSetValues) {
      var locs  = MG_LOCATIONS[data.name] || [];
      var chans = MG_CHANNELS[data.name] || [];
      window.multiselectSetValues('mg-locations', locs);
      window.multiselectSetValues('mg-channels', chans);
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

  // ══════════════════════════════════════════════
  // ── Section header Add button ──
  // ══════════════════════════════════════════════

  var sectionAddBtn = document.querySelector('.section-header__actions .btn');
  if (sectionAddBtn) {
    sectionAddBtn.addEventListener('click', function(e) {
      var activeTab = document.querySelector('.pill-tab--selected');
      if (activeTab && activeTab.getAttribute('data-tab') === 'modifier-groups') {
        e.preventDefault();
        if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add modifier group';
        openTakeover(null);
      }
    });
  }

  // ══════════════════════════════════════════════
  // ── Row click → Edit modifier group ──
  // ══════════════════════════════════════════════

  if (mgTable) {
    mgTable.querySelector('tbody').addEventListener('click', function(e) {
      if (e.target.closest('.table-checkbox') ||
          e.target.closest('.row-action')) return;

      var row = e.target.closest('tr');
      if (!row) return;

      var cells = row.querySelectorAll('td');
      if (cells.length < 9) return;

      var nameEl = row.querySelector('.cell-name-text');
      var data = {
        name:         nameEl ? nameEl.textContent.trim() : '',
        internalName: cells[2] ? cells[2].textContent.trim() : '',
        type:         cells[3] ? cells[3].textContent.trim() : '',
        rule:         cells[4] ? cells[4].textContent.trim() : ''
      };

      if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit modifier group';
      openTakeover(data);
    });
  }

  // ══════════════════════════════════════════════
  // ── Assign Menu Items Modal ──
  // ══════════════════════════════════════════════

  var menuOverlay     = document.getElementById('mg-menu-items-modal-overlay');
  var menuCloseBtn    = document.getElementById('mg-menu-items-modal-close');
  var menuSearchInput = document.getElementById('mg-menu-items-search-input');
  var menuListEl      = document.getElementById('mg-menu-items-modal-list');
  var menuEmptyMsg    = document.getElementById('mg-menu-items-modal-empty');
  var menuConfirmBtn  = document.getElementById('mg-menu-items-modal-confirm');
  var menuCancelBtn   = document.getElementById('mg-menu-items-modal-cancel');
  var menuSelectAllCb = menuOverlay.querySelector('.cat-modal__select-all .cat-modal__checkbox');
  var menuModalTitle  = document.getElementById('mg-menu-items-modal-title');

  var selectedMenuItems = [];

  function scrapeMenuItems() {
    var items = [];
    var tables = document.querySelectorAll('.data-table');
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

  function buildMenuList() {
    ALL_MENU_ITEMS = scrapeMenuItems();
    menuListEl.innerHTML = '';
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
      menuListEl.appendChild(el);
    });
  }

  function openMenuModal() {
    buildMenuList();
    menuSearchInput.value = '';
    menuEmptyMsg.classList.remove('cat-modal__empty--visible');
    menuSelectAllCb.checked = false;

    if (menuModalTitle) {
      menuModalTitle.textContent = selectedMenuItems.length > 0 ? 'Edit menu items' : 'Assign to menu items';
    }

    selectedMenuItems.forEach(function(name) {
      var opt = menuListEl.querySelector('.cat-modal__option[data-value="' + name + '"]');
      if (opt) opt.querySelector('.cat-modal__checkbox').checked = true;
    });
    syncMenuSelectAll();

    menuOverlay.classList.add('cat-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { menuSearchInput.focus(); }, 100);
  }

  function closeMenuModal() {
    menuOverlay.classList.remove('cat-modal-overlay--visible');
  }

  function syncMenuSelectAll() {
    var allChecked = true;
    var visibleOpts = menuListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.cat-modal__checkbox').checked) allChecked = false;
    });
    menuSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  menuListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.cat-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.cat-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncMenuSelectAll();
  });

  menuOverlay.querySelector('.cat-modal__select-all .cat-modal__option').addEventListener('click', function(e) {
    if (e.target !== menuSelectAllCb) menuSelectAllCb.checked = !menuSelectAllCb.checked;
    var checked = menuSelectAllCb.checked;
    menuListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"]) .cat-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
  });

  menuSearchInput.addEventListener('input', function() {
    var query = menuSearchInput.value.toLowerCase();
    var visibleCount = 0;
    menuListEl.querySelectorAll('.cat-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.cat-modal__option-name').textContent.toLowerCase();
      var match = name.indexOf(query) !== -1;
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    menuEmptyMsg.classList.toggle('cat-modal__empty--visible', visibleCount === 0);
    syncMenuSelectAll();
  });

  menuCloseBtn.addEventListener('click', closeMenuModal);
  menuCancelBtn.addEventListener('click', closeMenuModal);
  menuOverlay.addEventListener('click', function(e) {
    if (e.target === menuOverlay) closeMenuModal();
  });

  menuConfirmBtn.addEventListener('click', function() {
    selectedMenuItems = [];
    menuListEl.querySelectorAll('.cat-modal__checkbox').forEach(function(cb) {
      if (cb.checked) selectedMenuItems.push(cb.dataset.value);
    });
    closeMenuModal();
    applyMenuSelection();
  });

  function applyMenuSelection() {
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

  if (menuItemsAddBtn) menuItemsAddBtn.addEventListener('click', openMenuModal);
  if (menuItemsEditBtn) menuItemsEditBtn.addEventListener('click', openMenuModal);

  // ══════════════════════════════════════════════
  // ── Escape key — close modal first, then takeover ──
  // ══════════════════════════════════════════════

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (menuOverlay.classList.contains('cat-modal-overlay--visible')) {
      closeMenuModal();
    } else if (takeover.classList.contains('takeover--visible')) {
      closeTakeover();
    }
  });
});
