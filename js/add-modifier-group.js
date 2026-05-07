// Add/Edit Modifier Group — Page Takeover
document.addEventListener('DOMContentLoaded', function() {

  // ── Takeover Elements ──
  var takeover      = document.getElementById('mg-takeover');
  var takeoverClose = document.getElementById('mg-takeover-close');
  var takeoverSave  = document.getElementById('mg-takeover-save');
  var takeoverSavePub = document.getElementById('mg-takeover-cancel');
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

  // ── Editing state ──
  var editingRow = null; // null = creating new; TR = editing existing row

  // ── Preview ──
  var mgPreviewTitle = document.getElementById('mg-preview-title');

  // ── Data maps from modifier-groups.md ──
  var MG_ITEMS_DATA = {
    'Choice of Cake': [
      { name: 'Banana Pudding Chess', price: '0.00', sku: 'BPC-001', skuId: 'SKU-1042' },
      { name: 'Oreo', price: '0.00', sku: 'ORE-001', skuId: 'SKU-1043' },
      { name: 'Lemon', price: '0.00', sku: 'LEM-001', skuId: 'SKU-1044' }
    ],
    'Egg Style': [
      { name: 'Scrambled Eggs', price: '0.00', sku: 'EGG-SCR', skuId: 'SKU-2011' },
      { name: 'Over Hard', price: '0.00', sku: 'EGG-OVH', skuId: 'SKU-2012' }
    ],
    'Plate Add Ons': [
      { name: 'Extra Syrup', price: '0.49', sku: 'SYR-EXT', skuId: 'SKU-3001' },
      { name: 'Extra Butter', price: '0.49', sku: 'BUT-EXT', skuId: 'SKU-3002' },
      { name: 'White American Cheese', price: '0.99', sku: 'CHE-WHT', skuId: 'SKU-3003' },
      { name: 'Yellow American Cheese', price: '0.99', sku: 'CHE-YEL', skuId: 'SKU-3004' },
      { name: 'Hash Brown', price: '1.49', sku: 'HSH-BRN', skuId: 'SKU-3005' },
      { name: 'Extra Toast', price: '1.49', sku: 'TST-EXT', skuId: 'SKU-3006' },
      { name: 'Extra Egg', price: '1.99', sku: 'EGG-EXT', skuId: 'SKU-3007' },
      { name: 'Bacon Two', price: '1.99', sku: 'BCN-TWO', skuId: 'SKU-3008' },
      { name: 'Ham', price: '1.99', sku: 'HAM-001', skuId: 'SKU-3009' },
      { name: 'Sausage', price: '1.99', sku: 'SAU-001', skuId: 'SKU-3010' },
      { name: 'Extra Pancake', price: '2.49', sku: 'PAN-EXT', skuId: 'SKU-3011' },
      { name: 'Extra Waffle', price: '2.49', sku: 'WAF-EXT', skuId: 'SKU-3012' }
    ],
    'Choice of American Cheese': [
      { name: 'White Cheese', price: '0.00', sku: 'CHE-WHT', skuId: 'SKU-3003' },
      { name: 'Yellow Cheese', price: '0.00', sku: 'CHE-YEL', skuId: 'SKU-3004' }
    ],
    'Choice of Add Ons': [
      { name: 'Onions', price: '0.49', sku: 'ONI-001', skuId: 'SKU-4001' },
      { name: 'White American Cheese', price: '0.99', sku: 'CHE-WHT', skuId: 'SKU-3003' },
      { name: 'Yellow American Cheese', price: '0.99', sku: 'CHE-YEL', skuId: 'SKU-3004' },
      { name: 'Hash Brown', price: '1.49', sku: 'HSH-BRN', skuId: 'SKU-3005' },
      { name: 'Extra Egg', price: '1.99', sku: 'EGG-EXT', skuId: 'SKU-3007' },
      { name: 'Bacon Two', price: '1.99', sku: 'BCN-TWO', skuId: 'SKU-3008' },
      { name: 'Ham', price: '1.99', sku: 'HAM-001', skuId: 'SKU-3009' },
      { name: 'Sausage', price: '1.99', sku: 'SAU-001', skuId: 'SKU-3010' }
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
    if (maxPer) maxPer.value = defaults.each;
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
    if (!maxPer || !maxPerHint) return;
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
  if (maxPer) maxPer.addEventListener('change', updateMaxPerHint);

  // ══════════════════════════════════════════════
  // ── Modifier items inline table ──
  // ══════════════════════════════════════════════

  /**
   * makeRow — build a table row for a modifier item.
   *
   * isShared = true  → item came from the search (existing shared modifier).
   *                    Name + price shown as READ-ONLY text. Only a remove
   *                    button is available (editing would affect other products).
   *
   * isShared = false → item was created inline ("Create X as new modifier").
   *                    Name + price shown as editable INPUTS. Full ⋮ menu.
   */
  function makeRow(item, isFirst, isShared) {
    var row = document.createElement('div');

    if (isShared) {
      // ── Shared / read-only row ──────────────────────────────────────────
      row.className = 'mgc-items-table__row mgc-items-table__row--shared';
      var priceDisplay = (item.price && item.price !== '0.00') ? '$' + item.price : '$0.00';
      var skuHtml = item.sku
        ? '<div class="mgc-row-sku"><span class="mgc-row-sku__link">' + escapeHtml(item.sku) + '</span><span class="mgc-row-sku__id">' + escapeHtml(item.skuId || '') + '</span></div>'
        : '';
      row.innerHTML =
        // No drag handle — spacer keeps column alignment
        '<span class="mgc-row-drag-spacer"></span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--name">' +
          '<span class="mgc-row-name-text">' + escapeHtml(item.name) + '</span>' +
        '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--price">' +
          '<span class="mgc-row-price-text">' + priceDisplay + '</span>' +
        '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--sku">' + skuHtml + '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--default"></span>' +
        // Only a remove (✕) button — no edit possible because item is shared
        '<button class="mgc-row-remove" title="Remove">' +
          '<i data-lucide="x" class="lucide-icon" style="width:16px;height:16px"></i>' +
        '</button>';

      // Remove handler
      row.querySelector('.mgc-row-remove').addEventListener('click', function() {
        row.parentNode && row.parentNode.removeChild(row);
      });

    } else {
      // ── Editable / locally-created row ─────────────────────────────────
      row.className = 'mgc-items-table__row';
      var priceVal = item.price || '0.00';
      row.innerHTML =
        '<button class="mgc-row-drag">' +
          '<i data-lucide="grip-vertical" class="lucide-icon" style="width:16px;height:16px"></i>' +
        '</button>' +
        '<span class="mgc-items-table__col mgc-items-table__col--name">' +
          '<input type="text" class="mgc-input mgc-input--sm mgc-row-name-input" value="' + escapeHtml(item.name) + '" placeholder="Modifier name">' +
        '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--price" style="display:flex;align-items:center;gap:4px">' +
          '<span class="mgc-price-prefix">$</span>' +
          '<input type="text" class="mgc-input mgc-input--sm mgc-price-input" value="' + escapeHtml(priceVal) + '">' +
        '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--sku"></span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--default">' +
          '<input type="checkbox" class="mgc-default-cb"' + (isFirst ? ' checked' : '') + '>' +
        '</span>' +
        '<button class="mgc-row-more">' +
          '<i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i>' +
        '</button>';
    }

    return row;
  }

  function renderItemsTable(items) {
    itemsBody.innerHTML = '';
    if (!items || items.length === 0) return;
    items.forEach(function(item, idx) {
      // Prefilled items from data are existing shared items → read-only
      itemsBody.appendChild(makeRow(item, idx === 0, true));
    });
    if (window.lucide) lucide.createIcons();
  }

  function addRowToTable(item, isShared) {
    var isFirst = itemsBody.children.length === 0;
    var row = makeRow(item, isFirst, isShared || false);
    itemsBody.appendChild(row);
    if (window.lucide) lucide.createIcons({ nodes: [row] });
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
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Create new modifier group';
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
    if (maxPer) maxPer.value = 'Unlimited';
    updateTotalHint();
    updateMaxPerHint();
    updateMaxPerVisibility();

    // Reset items table
    itemsBody.innerHTML = '';

    // Reset menu items section
    if (menuItemsEmpty) menuItemsEmpty.style.display = '';
    if (menuItemsFilled) menuItemsFilled.style.display = 'none';
    if (menuItemsFilledList) menuItemsFilledList.textContent = '';
    if (menuItemsAddAction) menuItemsAddAction.style.display = 'none';
    selectedMenuItems = [];

    // Reset multiselects
    takeover.querySelectorAll('.multiselect').forEach(function(ms) {
      var pills = ms.querySelector('.multiselect__pills');
      var placeholder = ms.getAttribute('data-field') === 'mg-menu-items' ? 'Select menu items' : 'Select';
      pills.innerHTML = '<span class="multiselect__placeholder">' + placeholder + '</span>';
      ms.querySelectorAll('.multiselect__checkbox').forEach(function(cb) { cb.checked = false; });
    });

    // Reset preview title
    if (mgPreviewTitle) mgPreviewTitle.textContent = 'Side Choice';
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
      if (maxPer) maxPer.value = rule.each;
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
      if (menuItemsEmpty) menuItemsEmpty.style.display = 'none';
      if (menuItemsFilled) menuItemsFilled.style.display = '';
      if (menuItemsAddAction) menuItemsAddAction.style.display = '';
      var cnt = usedBy.length;
      if (menuItemsFilledHeader) menuItemsFilledHeader.textContent = cnt + (cnt === 1 ? ' menu item' : ' menu items');
      if (menuItemsFilledList) menuItemsFilledList.textContent = usedBy.join(', ');
    }

    // Multiselects (locations, channels, menu items)
    if (window.multiselectSetValues) {
      var locs      = MG_LOCATIONS[data.name] || [];
      var chans     = MG_CHANNELS[data.name] || [];
      var usedByMs  = MG_USED_BY[data.name] || [];
      window.multiselectSetValues('mg-locations', locs, takeover);
      window.multiselectSetValues('mg-channels', chans, takeover);
      window.multiselectSetValues('mg-menu-items', usedByMs, takeover);
    }

    // Sync preview title
    if (mgPreviewTitle) mgPreviewTitle.textContent = data.name || 'Side Choice';
  }

  // ══════════════════════════════════════════════
  // ── Save helpers ──
  // ══════════════════════════════════════════════

  function getSelectedType() {
    if (!typeGrid) return '';
    var selected = typeGrid.querySelector('.mgc-type-card--selected .mgc-type-card__name');
    return selected ? selected.textContent.trim() : '';
  }

  function formatSelectionRule(min, max, each) {
    var required = (min && min !== '0') ? 'Required' : 'Optional';
    var totalPart;
    if (max === 'Unlimited' || max === '') {
      totalPart = 'Total ' + (min || '0') + '–any';
    } else if (min === max) {
      totalPart = 'Total ' + min;
    } else {
      totalPart = 'Total ' + (min || '0') + '–' + max;
    }
    var eachPart = (each === 'Unlimited' || each === '') ? 'Each unlimited' : 'Each ' + each;
    return required + ' · ' + totalPart + ' · ' + eachPart;
  }

  function countMultiselect(field) {
    var ms = takeover.querySelector('.multiselect[data-field="' + field + '"]');
    if (!ms) return 0;
    return ms.querySelectorAll('.multiselect__pill').length;
  }

  function buildTableRow(data) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="col-checkbox"><input type="checkbox" class="table-checkbox mg-table-checkbox"></td>' +
      '<td>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span class="cell-name-text">' + escapeHtml(data.displayName) + '</span>' +
          '<span class="status-badge status-badge--warning" style="flex-shrink:0">' +
            '<span class="status-badge__text">Unpublished changes</span>' +
          '</span>' +
        '</div>' +
      '</td>' +
      '<td>' + escapeHtml(data.internalName) + '</td>' +
      '<td>' + escapeHtml(data.type) + '</td>' +
      '<td>' + escapeHtml(data.selectionRule) + '</td>' +
      '<td>' + data.itemCount + ' modifier item' + (data.itemCount === 1 ? '' : 's') + '</td>' +
      '<td>' + data.usedByCount + ' menu item' + (data.usedByCount === 1 ? '' : 's') + '</td>' +
      '<td>' + data.locationCount + ' location' + (data.locationCount === 1 ? '' : 's') + '</td>' +
      '<td>' + data.channelCount + ' channel' + (data.channelCount === 1 ? '' : 's') + '</td>' +
      '<td class="col-mg-actions">' +
        '<div class="row-action">' +
          '<button class="row-action__trigger" aria-label="Row actions">' +
            '<i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px;color:var(--color-text-weak)"></i>' +
          '</button>' +
          '<div class="row-action__menu">' +
            '<button class="row-action__item"><i data-lucide="copy" class="lucide-icon" style="width:14px;height:14px"></i><span>Duplicate modifier group</span></button>' +
            '<button class="row-action__item row-action__item--danger"><i data-lucide="trash-2" class="lucide-icon" style="width:14px;height:14px"></i><span>Delete modifier group</span></button>' +
          '</div>' +
        '</div>' +
      '</td>';
    return tr;
  }

  function saveAndClose(publish) {
    // Collect form data
    var displayName  = fieldDisplayName.value.trim() || 'Untitled modifier group';
    var internalName = fieldInternalName.value.trim() || displayName;
    var type         = getSelectedType();
    var selectionRule = formatSelectionRule(totalMin.value, totalMax.value, maxPer ? maxPer.value : '1');
    var itemCount    = itemsBody.querySelectorAll('.mgc-items-table__row').length;
    var usedByCount  = selectedMenuItems.length;
    var locationCount = countMultiselect('mg-locations');
    var channelCount  = countMultiselect('mg-channels');

    var data = {
      displayName:   displayName,
      internalName:  internalName,
      type:          type,
      selectionRule: selectionRule,
      itemCount:     itemCount,
      usedByCount:   usedByCount,
      locationCount: locationCount,
      channelCount:  channelCount
    };

    if (mgTable) {
      var tbody = mgTable.querySelector('tbody');
      if (editingRow && editingRow.parentNode === tbody) {
        // Update existing row in place
        var newRow = buildTableRow(data);
        tbody.replaceChild(newRow, editingRow);
        editingRow = newRow;
        if (window.lucide) lucide.createIcons({ nodes: [newRow] });
      } else {
        // Prepend new row at top of table
        var newRow = buildTableRow(data);
        tbody.insertBefore(newRow, tbody.firstChild);
        if (window.lucide) lucide.createIcons({ nodes: [newRow] });
      }
    }

    if (window.showToast) {
      showToast(publish ? 'Modifier group published' : 'Modifier group saved with unpublished changes');
    }
    editingRow = null;
    closeTakeover();
  }

  takeoverClose.addEventListener('click', closeTakeover);
  takeoverSave.addEventListener('click', function() { saveAndClose(false); });
  takeoverSavePub.addEventListener('click', closeTakeover); // Cancel — discard changes

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
        editingRow = null;
        if (takeoverNavTitle) takeoverNavTitle.textContent = 'Create new modifier group';
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

      editingRow = row;
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
      if (menuItemsEmpty) menuItemsEmpty.style.display = 'none';
      if (menuItemsFilled) menuItemsFilled.style.display = '';
      if (menuItemsAddAction) menuItemsAddAction.style.display = '';
      var count = selectedMenuItems.length;
      if (menuItemsFilledHeader) menuItemsFilledHeader.textContent = count + (count === 1 ? ' menu item' : ' menu items');
      if (menuItemsFilledList) menuItemsFilledList.textContent = selectedMenuItems.join(', ');
    } else {
      if (menuItemsEmpty) menuItemsEmpty.style.display = '';
      if (menuItemsFilled) menuItemsFilled.style.display = 'none';
      if (menuItemsFilledList) menuItemsFilledList.textContent = '';
      if (menuItemsAddAction) menuItemsAddAction.style.display = 'none';
    }
  }

  if (menuItemsAddBtn) menuItemsAddBtn.addEventListener('click', openMenuModal);
  if (menuItemsEditBtn) menuItemsEditBtn.addEventListener('click', openMenuModal);

  // ══════════════════════════════════════════════
  // ── Row context menu (three-dot) ──
  // ══════════════════════════════════════════════

  var ROW_MENU_ACTIONS = [
    { label: 'Edit in modifier item',      icon: 'pencil' },
    { label: 'Edit modifier price',        icon: 'tag' },
    { label: 'Unlink item SKU',            icon: 'link-2-off' },
    { label: 'Add nested modifier groups', icon: 'plus' },
    { label: 'Remove modifier item',       icon: 'trash-2', danger: true, action: 'remove' },
  ];

  var rowContextMenu = null;

  function buildRowContextMenu(targetRow) {
    var menu = document.createElement('div');
    menu.className = 'mgc-row-context-menu';
    ROW_MENU_ACTIONS.forEach(function(action) {
      var btn = document.createElement('button');
      btn.className = 'mgc-row-context-menu__item' + (action.danger ? ' mgc-row-context-menu__item--danger' : '');
      btn.innerHTML = '<i data-lucide="' + action.icon + '" class="lucide-icon" style="width:14px;height:14px;flex-shrink:0"></i><span>' + action.label + '</span>';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (action.action === 'remove' && targetRow && targetRow.parentNode) {
          targetRow.parentNode.removeChild(targetRow);
        }
        closeRowContextMenu();
      });
      menu.appendChild(btn);
    });
    return menu;
  }

  function closeRowContextMenu() {
    if (rowContextMenu && rowContextMenu.parentNode) {
      rowContextMenu.parentNode.removeChild(rowContextMenu);
    }
    rowContextMenu = null;
  }

  itemsBody.addEventListener('click', function(e) {
    var moreBtn = e.target.closest('.mgc-row-more');
    if (!moreBtn) { closeRowContextMenu(); return; }
    e.stopPropagation();

    if (rowContextMenu && rowContextMenu._anchor === moreBtn) {
      closeRowContextMenu();
      return;
    }
    closeRowContextMenu();

    var targetRow = moreBtn.closest('.mgc-items-table__row');
    rowContextMenu = buildRowContextMenu(targetRow);
    rowContextMenu._anchor = moreBtn;
    document.body.appendChild(rowContextMenu);
    if (window.lucide) lucide.createIcons({ nodes: [rowContextMenu] });

    var rect = moreBtn.getBoundingClientRect();
    rowContextMenu.style.position = 'fixed';
    rowContextMenu.style.zIndex = '9995';
    var menuW = 220;
    var left = rect.right - menuW;
    if (left < 8) left = rect.left;
    rowContextMenu.style.left = left + 'px';
    rowContextMenu.style.top = (rect.bottom + 4) + 'px';
    rowContextMenu.style.width = menuW + 'px';
  });

  document.addEventListener('click', function(e) {
    if (rowContextMenu && !rowContextMenu.contains(e.target)) {
      closeRowContextMenu();
    }
  });

  // ══════════════════════════════════════════════
  // ── Search to add modifier items ──
  // ══════════════════════════════════════════════

  var searchInput       = document.getElementById('mg-search-modifier');
  var searchDropdown    = document.getElementById('mg-search-dropdown');
  var searchResultsList = document.getElementById('mg-search-dropdown-results');
  var searchCreateRow   = document.getElementById('mg-search-dropdown-create');
  var searchCreateLabel = document.getElementById('mg-search-create-label');

  // Flatten all items from MG_ITEMS_DATA into a searchable list
  var ALL_MODIFIER_ITEMS = (function() {
    var seen = {};
    var list = [];
    Object.keys(MG_ITEMS_DATA).forEach(function(key) {
      MG_ITEMS_DATA[key].forEach(function(item) {
        if (!seen[item.name]) {
          seen[item.name] = true;
          list.push(item);
        }
      });
    });
    return list;
  })();

  function positionDropdown() {
    var rect = searchInput.getBoundingClientRect();
    searchDropdown.style.position = 'fixed';
    searchDropdown.style.left = rect.left + 'px';
    searchDropdown.style.top = (rect.bottom + 2) + 'px';
    searchDropdown.style.width = Math.max(rect.width, 320) + 'px';
    searchDropdown.style.zIndex = '9990';
  }

  function showSearchResults(query) {
    searchResultsList.innerHTML = '';
    if (!query) { hideSearchResults(); return; }

    var lower = query.toLowerCase();
    var matches = ALL_MODIFIER_ITEMS.filter(function(item) {
      return item.name.toLowerCase().indexOf(lower) !== -1;
    });

    matches.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'mgc-search-dropdown__item';
      var priceDisplay = item.price && item.price !== '0.00' ? '$' + item.price : '$0.00';
      el.innerHTML =
        '<div class="mgc-search-dropdown__item-info">' +
          '<div class="mgc-search-dropdown__item-name">' +
            escapeHtml(item.name) +
            '<span class="mgc-item-type-badge"><i data-lucide="utensils" class="lucide-icon" style="width:10px;height:10px"></i> Menu item</span>' +
          '</div>' +
          '<div class="mgc-search-dropdown__item-sub">' + escapeHtml(item.sku || item.name) + '</div>' +
        '</div>' +
        '<div class="mgc-search-dropdown__item-price">' + priceDisplay + '</div>';
      el.addEventListener('mousedown', function(e) {
        e.preventDefault();
        addRowToTable(item, true); // shared — read-only row
        searchInput.value = '';
        hideSearchResults();
      });
      searchResultsList.appendChild(el);
    });

    // Update & show "Create" row
    var trimmed = query.trim();
    searchCreateLabel.textContent = 'Create “' + trimmed + '” as a new modifier';
    searchCreateRow.style.display = '';

    positionDropdown();
    searchDropdown.classList.add('mgc-search-dropdown--visible');

    if (window.lucide) lucide.createIcons({ nodes: [searchResultsList] });
  }

  function hideSearchResults() {
    searchDropdown.classList.remove('mgc-search-dropdown--visible');
    searchResultsList.innerHTML = '';
    searchCreateRow.style.display = 'none';
  }

  if (searchCreateRow) {
    searchCreateRow.addEventListener('mousedown', function(e) {
      e.preventDefault();
      var name = searchInput.value.trim();
      if (name) {
        addRowToTable({ name: name, price: '0.00' }, false); // local — editable row
        searchInput.value = '';
        hideSearchResults();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      showSearchResults(searchInput.value.trim());
    });
    searchInput.addEventListener('blur', function() {
      setTimeout(hideSearchResults, 150);
    });
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var first = searchResultsList.querySelector('.mgc-search-dropdown__item');
        if (first) first.dispatchEvent(new MouseEvent('mousedown'));
        else if (searchInput.value.trim()) {
          addRowToTable({ name: searchInput.value.trim(), price: '0.00' }, false); // local — editable
          searchInput.value = '';
          hideSearchResults();
        }
        e.preventDefault();
      }
    });
  }

  // ══════════════════════════════════════════════
  // ── Preview: sync display name + items ──
  // ══════════════════════════════════════════════

  if (fieldDisplayName && mgPreviewTitle) {
    fieldDisplayName.addEventListener('input', function() {
      var val = fieldDisplayName.value.trim();
      mgPreviewTitle.textContent = val || 'Side Choice';
    });
  }

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
