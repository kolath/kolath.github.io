// Add Modifier Item — SKU Modal + Page Takeover + Live Preview
document.addEventListener('DOMContentLoaded', () => {

  // ── Modal Elements ──
  const overlay      = document.getElementById('mi-sku-modal-overlay');
  const closeBtn     = document.getElementById('mi-sku-modal-close');
  const searchInput  = document.getElementById('mi-sku-search-input');
  const listEl       = document.getElementById('mi-sku-modal-list');
  const emptyMsg     = document.getElementById('mi-sku-modal-empty');
  const continueBtn  = document.getElementById('mi-sku-modal-continue');
  const createNewBtn = document.getElementById('mi-sku-modal-create-new');
  const unlinkBtn    = document.getElementById('mi-sku-modal-unlink');
  const modalTitle   = document.getElementById('mi-sku-modal-title');

  // ── Takeover Elements ──
  const takeover      = document.getElementById('mi-takeover');
  const takeoverClose = document.getElementById('mi-takeover-close');
  const takeoverSave  = document.getElementById('mi-takeover-save');
  const takeoverSavePub = document.getElementById('mi-takeover-save-publish');
  const takeoverNavTitle = document.getElementById('mi-takeover-nav-title');
  const appShell      = document.querySelector('.app');

  // ── Form Fields ──
  const fieldDisplayName  = document.getElementById('mi-field-display-name');
  const fieldInternalName = document.getElementById('mi-field-internal-name');
  const fieldDescription  = document.getElementById('mi-field-description');
  const fieldDescCount    = document.getElementById('mi-field-description-count');
  const fieldSkuCode      = document.getElementById('mi-field-sku-code');
  const fieldAlcohol      = document.getElementById('mi-field-alcohol');

  // ── SKU section states ──
  const skuEmptyState     = document.getElementById('mi-sku-empty-state');
  const skuPrefilledState = document.getElementById('mi-sku-prefilled-state');
  const skuPrefilledName  = document.getElementById('mi-sku-prefilled-name');
  const skuPrefilledMeta  = document.getElementById('mi-sku-prefilled-meta');
  const skuPrefilledImg   = document.getElementById('mi-sku-prefilled-img');

  // ── Pricing section states ──
  const miPricingEmpty     = document.getElementById('mi-pricing-empty');
  const miPricingPrefilled = document.getElementById('mi-pricing-prefilled');
  const miPricingAmount    = document.getElementById('mi-pricing-amount');
  const miPricingAction    = document.getElementById('mi-pricing-action');

  // ── State ──
  let selectedItem = null;
  let tableItems = [];
  let modalMode = 'add';

  // ── Scrape modifier items table data ──
  function scrapeTableItems() {
    const items = [];
    const table = document.getElementById('mi-data-table');
    if (!table) return items;
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      const nameEl = row.querySelector('.cell-name-text');
      const skuLinkEl = row.querySelector('.cell-sku-link');
      const skuIdEl = row.querySelector('.cell-sku-id');

      items.push({
        name: nameEl ? nameEl.textContent.trim() : '',
        skuLink: skuLinkEl ? skuLinkEl.textContent.trim() : '',
        skuId: skuIdEl ? skuIdEl.textContent.trim() : '',
        internalName: nameEl ? nameEl.textContent.trim() : '',
        description: ''
      });
    });
    return items;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Build modal list ──
  function buildModalList(items) {
    listEl.innerHTML = '';
    items.forEach(function(item, idx) {
      var el = document.createElement('div');
      el.className = 'sku-modal__item';
      el.dataset.index = idx;
      el.innerHTML =
        '<input type="radio" name="mi-sku-selection" class="sku-modal__item-radio" data-index="' + idx + '">' +
        '<div class="sku-modal__item-info">' +
          '<span class="sku-modal__item-name">' + escapeHtml(item.skuLink || item.name) + '</span>' +
          '<span class="sku-modal__item-sku">' + escapeHtml(item.skuId) + '</span>' +
        '</div>';
      listEl.appendChild(el);
    });
  }

  // ── Open SKU Modal ──
  function openSkuModal(mode) {
    modalMode = mode || 'add';
    tableItems = scrapeTableItems();
    buildModalList(tableItems);
    selectedItem = null;
    continueBtn.disabled = true;
    searchInput.value = '';
    emptyMsg.classList.remove('sku-modal__empty--visible');

    if (modalMode === 'link') {
      modalTitle.textContent = 'Link SKU item';
      continueBtn.textContent = 'Apply';
      createNewBtn.style.display = 'none';
      unlinkBtn.style.display = 'none';
    } else if (modalMode === 'edit') {
      modalTitle.textContent = 'Edit SKU item';
      continueBtn.textContent = 'Apply';
      createNewBtn.style.display = 'none';
      unlinkBtn.style.display = '';
      preselectCurrentItem();
    } else {
      modalTitle.textContent = 'Add modifier item';
      continueBtn.textContent = 'Continue';
      createNewBtn.style.display = '';
      unlinkBtn.style.display = 'none';
    }

    overlay.classList.add('sku-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { searchInput.focus(); }, 100);
  }

  // ── Close SKU Modal ──
  function closeSkuModal() {
    overlay.classList.remove('sku-modal-overlay--visible');
    selectedItem = null;
  }

  // ── Pre-select currently linked item ──
  function preselectCurrentItem() {
    var currentName = skuPrefilledName.textContent.split('·')[0].trim();
    var items = listEl.querySelectorAll('.sku-modal__item');
    items.forEach(function(el) {
      var itemName = el.querySelector('.sku-modal__item-name').textContent.trim();
      if (itemName === currentName) {
        el.classList.add('sku-modal__item--selected');
        el.querySelector('.sku-modal__item-radio').checked = true;
        selectedItem = tableItems[parseInt(el.dataset.index, 10)];
        continueBtn.disabled = false;
      }
    });
  }

  // ── Modal item selection ──
  listEl.addEventListener('click', function(e) {
    var item = e.target.closest('.sku-modal__item');
    if (!item) return;

    var idx = parseInt(item.dataset.index, 10);
    var checkbox = item.querySelector('.sku-modal__item-radio');

    listEl.querySelectorAll('.sku-modal__item').forEach(function(el) {
      el.classList.remove('sku-modal__item--selected');
      el.querySelector('.sku-modal__item-radio').checked = false;
    });

    item.classList.add('sku-modal__item--selected');
    checkbox.checked = true;
    selectedItem = tableItems[idx];
    continueBtn.disabled = false;
  });

  // ── Modal search filter ──
  searchInput.addEventListener('input', function() {
    var query = searchInput.value.toLowerCase();
    var visibleCount = 0;

    listEl.querySelectorAll('.sku-modal__item').forEach(function(el) {
      var name = el.querySelector('.sku-modal__item-name').textContent.toLowerCase();
      var sku = el.querySelector('.sku-modal__item-sku').textContent.toLowerCase();
      var match = name.indexOf(query) !== -1 || sku.indexOf(query) !== -1;
      el.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    if (visibleCount === 0) {
      emptyMsg.classList.add('sku-modal__empty--visible');
    } else {
      emptyMsg.classList.remove('sku-modal__empty--visible');
    }
  });

  // ── Modal buttons ──
  closeBtn.addEventListener('click', closeSkuModal);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSkuModal();
  });

  continueBtn.addEventListener('click', function() {
    if (!selectedItem) return;
    var item = selectedItem;
    closeSkuModal();

    if (modalMode === 'link' || modalMode === 'edit') {
      prefillFromItem(item);
    } else {
      openTakeover(item);
    }
  });

  createNewBtn.addEventListener('click', function() {
    closeSkuModal();
    openTakeover(null);
  });

  // ── Unlink button ──
  unlinkBtn.addEventListener('click', function() {
    closeSkuModal();
    skuEmptyState.style.display = '';
    skuPrefilledState.style.display = 'none';
    fieldSkuCode.disabled = false;
    fieldAlcohol.disabled = false;
    fieldSkuCode.value = '';
  });

  // ── Prefill form from item data ──
  function prefillFromItem(itemData) {
    fieldDisplayName.value = itemData.name;
    fieldInternalName.value = itemData.internalName || itemData.name;
    fieldSkuCode.value = itemData.skuId || '';

    fieldSkuCode.disabled = true;
    fieldAlcohol.disabled = true;
    fieldAlcohol.value = 'none';

    // SKU section
    skuEmptyState.style.display = 'none';
    skuPrefilledState.style.display = 'flex';
    skuPrefilledName.textContent = (itemData.skuLink || itemData.name) + ' · ' + (itemData.skuId || '');
    skuPrefilledMeta.textContent = 'Item SKU';

    // Pricing section
    if (itemData.price && itemData.price !== '') {
      miPricingEmpty.style.display = 'none';
      miPricingPrefilled.style.display = '';
      miPricingAmount.textContent = itemData.price;
      miPricingAction.style.display = '';
    }
  }

  // ── Open Takeover ──
  function openTakeover(itemData) {
    resetForm();

    if (itemData) {
      prefillFromItem(itemData);
    } else {
      skuEmptyState.style.display = '';
      skuPrefilledState.style.display = 'none';
    }

    appShell.style.display = 'none';
    takeover.classList.add('takeover--visible');
    if (window.lucide) lucide.createIcons();
  }

  // ── Close Takeover ──
  function closeTakeover() {
    takeover.classList.remove('takeover--visible');
    appShell.style.display = '';
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add modifier item';
  }

  takeoverClose.addEventListener('click', closeTakeover);
  takeoverSave.addEventListener('click', closeTakeover);
  takeoverSavePub.addEventListener('click', closeTakeover);

  // ── Reset Form ──
  function resetForm() {
    fieldDisplayName.value = '';
    fieldInternalName.value = '';
    fieldDescription.value = '';
    fieldSkuCode.value = '';
    fieldAlcohol.value = '';
    fieldSkuCode.disabled = false;
    fieldAlcohol.disabled = false;
    updateCharCount();

    skuEmptyState.style.display = '';
    skuPrefilledState.style.display = 'none';

    // Reset pricing
    miPricingEmpty.style.display = '';
    miPricingPrefilled.style.display = 'none';
    miPricingAction.style.display = 'none';
  }

  // ── Character count update on input ──
  fieldDescription.addEventListener('input', function() {
    updateCharCount();
  });

  function updateCharCount() {
    var len = fieldDescription.value.length;
    fieldDescCount.textContent = len + ' / 200 Characters Remaining';
  }

  // ── Wire up the "+ Add modifier item" button ──
  // When on the modifier-items tab, clicking the section header Add button opens our modal
  var sectionAddBtn = document.querySelector('.section-header__actions .btn');
  if (sectionAddBtn) {
    sectionAddBtn.addEventListener('click', function(e) {
      var activeTab = document.querySelector('.pill-tab--selected');
      if (activeTab && activeTab.getAttribute('data-tab') === 'modifier-items') {
        e.preventDefault();
        openSkuModal('add');
      }
    });
  }

  // ── SKU Link button inside takeover ──
  var skuLinkBtn = document.getElementById('mi-sku-link-btn');
  if (skuLinkBtn) {
    skuLinkBtn.addEventListener('click', function() {
      openSkuModal('link');
    });
  }

  // ── SKU Edit button inside takeover ──
  var skuEditBtn = document.getElementById('mi-sku-edit-btn');
  if (skuEditBtn) {
    skuEditBtn.addEventListener('click', function() {
      openSkuModal('edit');
    });
  }

  // ── SKU Remove button ──
  var skuRemoveBtn = document.getElementById('mi-sku-remove-btn');
  if (skuRemoveBtn) {
    skuRemoveBtn.addEventListener('click', function() {
      skuEmptyState.style.display = '';
      skuPrefilledState.style.display = 'none';
      fieldSkuCode.disabled = false;
      fieldAlcohol.disabled = false;
      fieldSkuCode.value = '';
    });
  }

  // ── Row click → Edit modifier item ──
  var miTable = document.getElementById('mi-data-table');
  if (miTable) {
    miTable.querySelector('tbody').addEventListener('click', function(e) {
      // Ignore clicks on checkboxes, action buttons, SKU links, and menu item links
      if (e.target.closest('.table-checkbox') ||
          e.target.closest('.row-action') ||
          e.target.closest('.cell-sku-link') ||
          e.target.closest('.cell-menu-item-link')) return;

      var row = e.target.closest('tr');
      if (!row) return;

      var cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      var nameEl = row.querySelector('.cell-name-text') || row.querySelector('.cell-menu-item-link');
      var skuLinkEl = row.querySelector('.cell-sku-link');
      var skuIdEl = row.querySelector('.cell-sku-id');

      // Price is at cell index 4 (after checkbox, display name, internal name, SKU)
      var priceText = cells[4] ? cells[4].textContent.trim() : '';

      var item = {
        name: nameEl ? nameEl.textContent.trim() : '',
        skuLink: skuLinkEl ? skuLinkEl.textContent.trim() : '',
        skuId: skuIdEl ? skuIdEl.textContent.trim() : '',
        internalName: nameEl ? nameEl.textContent.trim() : '',
        description: '',
        price: priceText
      };

      if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit modifier item';
      openTakeover(item);

      // Pre-populate modifier group assignments based on MG_DATA
      var itemName = item.name;
      var assignedGroups = [];
      MG_DATA.forEach(function(mg) {
        mg.items.forEach(function(it) {
          if (it.name === itemName) {
            assignedGroups.push(mg.name);
          }
        });
      });

      if (assignedGroups.length > 0) {
        // Populate "Assign to modifier group" section (which groups this item is IN)
        selectedModifierGroups = assignedGroups.slice();
        applyMgSelection();
      }

      // Pre-fill locations, station profiles, channels from tooltip data
      if (window.multiselectSetValues && window._tooltipMiData) {
        var tipData = window._tooltipMiData[item.name];
        if (tipData) {
          window.multiselectSetValues('locations', tipData.locations || [], takeover);
          window.multiselectSetValues('stations', tipData.stations || [], takeover);
          window.multiselectSetValues('channels', tipData.channels || [], takeover);
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // ── ASSIGN MODIFIER GROUP MODAL ──
  // ══════════════════════════════════════════════════════════

  var mgOverlay      = document.getElementById('mi-mg-modal-overlay');
  var mgCloseBtn     = document.getElementById('mi-mg-modal-close');
  var mgSearchInput  = document.getElementById('mi-mg-search-input');
  var mgListEl       = document.getElementById('mi-mg-modal-list');
  var mgEmptyMsg     = document.getElementById('mi-mg-modal-empty');
  var mgConfirmBtn   = document.getElementById('mi-mg-modal-confirm');
  var mgCreateNewBtn = document.getElementById('mi-mg-modal-create-new');
  var mgSelectAllCb  = mgOverlay.querySelector('.cat-modal__select-all .cat-modal__checkbox');

  // Section states
  var mgAssignEmpty      = document.getElementById('mi-mg-assign-empty');
  var mgAssignFilled     = document.getElementById('mi-mg-assign-filled');
  var mgAssignFilledList = document.getElementById('mi-mg-assign-filled-list');
  var mgAssignFilledHeader = document.getElementById('mi-mg-assign-filled-header');
  var mgAssignEditAction = document.getElementById('mi-mg-assign-edit-action');
  var mgAssignBtn        = document.getElementById('mi-mg-assign-btn');
  var mgAssignEditBtn    = document.getElementById('mi-mg-assign-edit-btn');

  // Modifier group data (from existing modifier groups table)
  var MODIFIER_GROUPS = [
    { name: 'Choice of Cake',            desc: 'Product variation', count: '3 modifier items' },
    { name: 'Egg Style',                  desc: 'Product variation', count: '2 modifier items' },
    { name: 'Plate Add Ons',             desc: 'Add-on',            count: '13 modifier items' },
    { name: 'Choice of American Cheese', desc: 'Product variation', count: '2 modifier items' },
    { name: 'Choice of Add Ons',         desc: 'Add-on',            count: '8 modifier items' }
  ];

  var selectedModifierGroups = [];

  // Build modifier group list in modal
  function buildMgList() {
    mgListEl.innerHTML = '';
    MODIFIER_GROUPS.forEach(function(mg) {
      var el = document.createElement('div');
      el.className = 'cat-modal__option';
      el.dataset.value = mg.name;
      el.innerHTML =
        '<input type="checkbox" class="cat-modal__checkbox" data-value="' + escapeHtml(mg.name) + '">' +
        '<div class="cat-modal__option-info">' +
          '<span class="cat-modal__option-name">' + escapeHtml(mg.name) + '</span>' +
          '<span class="cat-modal__option-desc">' + escapeHtml(mg.desc) + '</span>' +
        '</div>' +
        '<span class="cat-modal__option-count">' + escapeHtml(mg.count) + '</span>';
      mgListEl.appendChild(el);
    });
  }

  // Open modifier group assign modal
  function openMgModal() {
    buildMgList();
    mgSearchInput.value = '';
    mgEmptyMsg.classList.remove('cat-modal__empty--visible');

    // Pre-check already selected groups
    selectedModifierGroups.forEach(function(mgName) {
      var opt = mgListEl.querySelector('.cat-modal__option[data-value="' + mgName + '"]');
      if (opt) opt.querySelector('.cat-modal__checkbox').checked = true;
    });
    syncMgSelectAll();
    mgConfirmBtn.disabled = false;

    mgOverlay.classList.add('cat-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { mgSearchInput.focus(); }, 100);
  }

  // Close modifier group modal
  function closeMgModal() {
    mgOverlay.classList.remove('cat-modal-overlay--visible');
  }

  // Sync select all checkbox
  function syncMgSelectAll() {
    var allChecked = true;
    var visibleOpts = mgListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.cat-modal__checkbox').checked) allChecked = false;
    });
    mgSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Option click
  mgListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.cat-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.cat-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncMgSelectAll();
  });

  // Select all click
  mgOverlay.querySelector('.cat-modal__select-all .cat-modal__option').addEventListener('click', function(e) {
    if (e.target !== mgSelectAllCb) mgSelectAllCb.checked = !mgSelectAllCb.checked;
    var checked = mgSelectAllCb.checked;
    mgListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"]) .cat-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
  });

  // Search filter
  mgSearchInput.addEventListener('input', function() {
    var query = mgSearchInput.value.toLowerCase();
    var visibleCount = 0;
    mgListEl.querySelectorAll('.cat-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.cat-modal__option-name').textContent.toLowerCase();
      var match = name.indexOf(query) !== -1;
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      mgEmptyMsg.classList.add('cat-modal__empty--visible');
    } else {
      mgEmptyMsg.classList.remove('cat-modal__empty--visible');
    }
    syncMgSelectAll();
  });

  // Close button
  mgCloseBtn.addEventListener('click', closeMgModal);
  mgOverlay.addEventListener('click', function(e) {
    if (e.target === mgOverlay) closeMgModal();
  });

  // Confirm button — apply selected modifier groups
  mgConfirmBtn.addEventListener('click', function() {
    selectedModifierGroups = [];
    mgListEl.querySelectorAll('.cat-modal__checkbox').forEach(function(cb) {
      if (cb.checked) selectedModifierGroups.push(cb.dataset.value);
    });
    closeMgModal();
    applyMgSelection();
  });

  // Create new — just close for prototype
  mgCreateNewBtn.addEventListener('click', function() {
    closeMgModal();
  });

  // Apply modifier group selection to the takeover form
  function applyMgSelection() {
    if (selectedModifierGroups.length > 0) {
      mgAssignEmpty.style.display = 'none';
      mgAssignFilled.style.display = '';
      var count = selectedModifierGroups.length;
      mgAssignFilledHeader.textContent = count + (count === 1 ? ' modifier group' : ' modifier groups');
      mgAssignFilledList.textContent = selectedModifierGroups.join(', ');
      mgAssignEditAction.style.display = '';
    } else {
      mgAssignEmpty.style.display = '';
      mgAssignFilled.style.display = 'none';
      mgAssignFilledHeader.textContent = 'Modifier groups';
      mgAssignFilledList.textContent = '';
      mgAssignEditAction.style.display = 'none';
    }
    if (window.lucide) lucide.createIcons();
  }

  // Assign modifier group button (empty state)
  if (mgAssignBtn) {
    mgAssignBtn.addEventListener('click', openMgModal);
  }

  // Edit modifier group button (filled state header)
  if (mgAssignEditBtn) {
    mgAssignEditBtn.addEventListener('click', openMgModal);
  }

  // Patch resetForm to also reset modifier group assignment
  var _origResetFormMg = resetForm;
  resetForm = function() {
    _origResetFormMg();
    selectedModifierGroups = [];
    mgAssignEmpty.style.display = '';
    mgAssignFilled.style.display = 'none';
    mgAssignFilledList.textContent = '';
    mgAssignEditAction.style.display = 'none';
    // Also reset "Add modifier groups" section
    selectedAddMgs = [];
    miModifiersEmpty.style.display = '';
    miModifiersFilled.style.display = 'none';
    miModifiersFilled.innerHTML = '';
    miModifiersAddAction.style.display = 'none';
  };

  // ══════════════════════════════════════════════════════════
  // ── ADD MODIFIER GROUPS (expandable cards, same as Add Menu Item) ──
  // ══════════════════════════════════════════════════════════

  var addmgOverlay      = document.getElementById('mi-addmg-modal-overlay');
  var addmgCloseBtn     = document.getElementById('mi-addmg-modal-close');
  var addmgSearchInput  = document.getElementById('mi-addmg-search-input');
  var addmgListEl       = document.getElementById('mi-addmg-modal-list');
  var addmgEmptyMsg     = document.getElementById('mi-addmg-modal-empty');
  var addmgConfirmBtn   = document.getElementById('mi-addmg-modal-confirm');
  var addmgCreateNewBtn = document.getElementById('mi-addmg-modal-create-new');
  var addmgSelectAllCb  = addmgOverlay.querySelector('.mg-modal__select-all .mg-modal__checkbox');
  var addmgCountEl      = document.getElementById('mi-addmg-modal-count');

  // Modifier groups section states
  var miModifiersAddAction = document.getElementById('mi-modifiers-add-action');
  var miModifiersAddBtn    = document.getElementById('mi-modifiers-add-btn');
  var miModifiersAddMoreBtn = document.getElementById('mi-modifiers-add-more-btn');
  var miModifiersFilled    = document.getElementById('mi-modifiers-filled');
  var miModifiersEmpty     = document.getElementById('mi-modifiers-empty');

  // Full modifier group data with items (same as add-item.js)
  var MG_DATA = [
    {
      name: 'Choice of Cake',
      type: 'Product variation',
      rule: 'Required · Total 1 · Each 1',
      ruleShort: 'Total 1 · Each ≤ 1',
      items: [
        { name: 'Banana Pudding Chess', price: '$0.00' },
        { name: 'Oreo', price: '$0.00' },
        { name: 'Lemon', price: '$0.00' }
      ]
    },
    {
      name: 'Egg Style',
      type: 'Product variation',
      rule: 'Required · Total 1 · Each 1',
      ruleShort: 'Total 1 · Each ≤ 1',
      items: [
        { name: 'Scrambled Eggs', price: '$0.00' },
        { name: 'Over Hard', price: '$0.00' }
      ]
    },
    {
      name: 'Plate Add Ons',
      type: 'Add-on',
      rule: 'Optional · Total 0–any · Each 1',
      ruleShort: 'Total 0–any · Each ≤ 1',
      items: [
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
        { name: 'Extra Waffle', price: '$2.49' },
        { name: 'Coke Can', price: '$1.99', isMenuItem: true }
      ]
    },
    {
      name: 'Choice of American Cheese',
      type: 'Product variation',
      rule: 'Required · Total 1 · Each 1',
      ruleShort: 'Total 1 · Each ≤ 1',
      items: [
        { name: 'White Cheese', price: '$0.00' },
        { name: 'Yellow Cheese', price: '$0.00' }
      ]
    },
    {
      name: 'Choice of Add Ons',
      type: 'Add-on',
      rule: 'Optional · Total 0–any · Each 1',
      ruleShort: 'Total 0–any · Each ≤ 1',
      items: [
        { name: 'Onions', price: '$0.49' },
        { name: 'White American Cheese', price: '$0.99' },
        { name: 'Yellow American Cheese', price: '$0.99' },
        { name: 'Hash Brown', price: '$1.49' },
        { name: 'Extra Egg', price: '$1.99' },
        { name: 'Bacon Two', price: '$1.99' },
        { name: 'Ham', price: '$1.99' },
        { name: 'Sausage', price: '$1.99' }
      ]
    }
  ];

  var selectedAddMgs = []; // track currently assigned modifier group names

  // Build modifier group list in modal
  function buildAddMgList() {
    addmgListEl.innerHTML = '';
    MG_DATA.forEach(function(mg) {
      var el = document.createElement('div');
      el.className = 'mg-modal__option';
      el.dataset.value = mg.name;

      var itemNames = mg.items.map(function(it) { return it.name; }).join(', ');
      el.innerHTML =
        '<input type="checkbox" class="mg-modal__checkbox" data-value="' + escapeHtml(mg.name) + '">' +
        '<div class="mg-modal__option-info">' +
          '<span class="mg-modal__option-name">' + escapeHtml(mg.name) + '</span>' +
          '<span class="mg-modal__option-desc">' + escapeHtml(itemNames) + '</span>' +
        '</div>' +
        '<span class="mg-modal__option-count">' + escapeHtml(mg.ruleShort) + '</span>';
      addmgListEl.appendChild(el);
    });
    addmgCountEl.textContent = MG_DATA.length;
  }

  // Open add modifier groups modal
  function openAddMgModal() {
    buildAddMgList();
    addmgSearchInput.value = '';
    addmgEmptyMsg.classList.remove('mg-modal__empty--visible');
    addmgSelectAllCb.checked = false;
    addmgConfirmBtn.disabled = false;

    addmgOverlay.classList.add('mg-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { addmgSearchInput.focus(); }, 100);
  }

  // Close add modifier groups modal
  function closeAddMgModal() {
    addmgOverlay.classList.remove('mg-modal-overlay--visible');
  }

  // Sync select all checkbox
  function syncAddMgSelectAll() {
    var allChecked = true;
    var visibleOpts = addmgListEl.querySelectorAll('.mg-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.mg-modal__checkbox').checked) allChecked = false;
    });
    addmgSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Option click
  addmgListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.mg-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.mg-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncAddMgSelectAll();
  });

  // Select all click
  addmgOverlay.querySelector('.mg-modal__select-all .mg-modal__option').addEventListener('click', function(e) {
    if (e.target !== addmgSelectAllCb) addmgSelectAllCb.checked = !addmgSelectAllCb.checked;
    var checked = addmgSelectAllCb.checked;
    addmgListEl.querySelectorAll('.mg-modal__option:not([style*="display: none"]) .mg-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
  });

  // Search filter
  addmgSearchInput.addEventListener('input', function() {
    var query = addmgSearchInput.value.toLowerCase();
    var visibleCount = 0;
    addmgListEl.querySelectorAll('.mg-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.mg-modal__option-name').textContent.toLowerCase();
      var desc = opt.querySelector('.mg-modal__option-desc').textContent.toLowerCase();
      var match = name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      addmgEmptyMsg.classList.add('mg-modal__empty--visible');
    } else {
      addmgEmptyMsg.classList.remove('mg-modal__empty--visible');
    }
    syncAddMgSelectAll();
  });

  // Close button
  addmgCloseBtn.addEventListener('click', closeAddMgModal);
  addmgOverlay.addEventListener('click', function(e) {
    if (e.target === addmgOverlay) closeAddMgModal();
  });

  // Confirm button — append newly selected modifier groups
  addmgConfirmBtn.addEventListener('click', function() {
    addmgListEl.querySelectorAll('.mg-modal__checkbox').forEach(function(cb) {
      if (cb.checked && selectedAddMgs.indexOf(cb.dataset.value) === -1) {
        selectedAddMgs.push(cb.dataset.value);
      }
    });
    closeAddMgModal();
    applyAddMgSelection();
  });

  // Create new — just close for prototype
  addmgCreateNewBtn.addEventListener('click', function() {
    closeAddMgModal();
  });

  // Apply modifier group selection — render expandable cards
  function applyAddMgSelection() {
    if (selectedAddMgs.length > 0) {
      miModifiersEmpty.style.display = 'none';
      miModifiersFilled.style.display = '';
      miModifiersAddAction.style.display = '';
      renderMiMgCards();
    } else {
      miModifiersEmpty.style.display = '';
      miModifiersFilled.style.display = 'none';
      miModifiersFilled.innerHTML = '';
      miModifiersAddAction.style.display = 'none';
    }
    if (window.lucide) lucide.createIcons();
  }

  // Render modifier group cards (same as Add Menu Item)
  function renderMiMgCards() {
    miModifiersFilled.innerHTML = '';
    selectedAddMgs.forEach(function(mgName) {
      var mgData = MG_DATA.find(function(g) { return g.name === mgName; });
      if (!mgData) return;

      var card = document.createElement('div');
      card.className = 'mg-card';
      card.dataset.mgName = mgName;

      var itemNames = mgData.items.map(function(it) { return it.name; }).join(', ');

      // Header
      var header = document.createElement('div');
      header.className = 'mg-card__header';
      header.innerHTML =
        '<div class="mg-card__drag"><i data-lucide="grip-horizontal" class="lucide-icon" style="width:16px;height:16px"></i></div>' +
        '<div class="mg-card__info">' +
          '<div class="mg-card__name">' + escapeHtml(mgData.name) + '</div>' +
          '<div class="mg-card__items-summary">' + escapeHtml(itemNames) + '</div>' +
        '</div>' +
        '<div class="mg-card__right">' +
          '<span class="mg-card__rule">' + escapeHtml(mgData.ruleShort) + '</span>' +
          '<div class="mg-card__chevron"><i data-lucide="chevron-down" class="lucide-icon" style="width:20px;height:20px"></i></div>' +
        '</div>' +
        '<button class="mg-card__more"><i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>' +
        '<div class="mg-card__dropdown" data-mg-name="' + escapeHtml(mgName) + '">' +
          '<button class="mg-card__dropdown-item mg-card__dropdown-delete" data-mg-name="' + escapeHtml(mgName) + '">' +
            '<i data-lucide="trash-2" class="lucide-icon" style="width:16px;height:16px"></i>' +
            '<span>Remove modifier group</span>' +
          '</button>' +
        '</div>';
      card.appendChild(header);

      // Body (expanded list of modifier items)
      var body = document.createElement('div');
      body.className = 'mg-card__body';
      mgData.items.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'mg-card__item-row';
        row.innerHTML =
          '<span class="mg-card__item-name">' + escapeHtml(item.name) + '</span>' +
          '<span class="mg-card__item-price">' + escapeHtml(item.price) + '</span>' +
          '<span class="mg-card__item-trailing"></span>';
        body.appendChild(row);
      });
      card.appendChild(body);

      // Toggle expand/collapse
      header.addEventListener('click', function(e) {
        if (e.target.closest('.mg-card__more') || e.target.closest('.mg-card__dropdown')) return;
        card.classList.toggle('mg-card--expanded');
      });

      // Three-dots more button
      var moreBtn = header.querySelector('.mg-card__more');
      var dropdown = header.querySelector('.mg-card__dropdown');
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Close any other open dropdowns in mi-modifiers-filled
        miModifiersFilled.querySelectorAll('.mg-card__dropdown--open').forEach(function(d) {
          d.classList.remove('mg-card__dropdown--open');
        });
        var rect = moreBtn.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.classList.add('mg-card__dropdown--open');
      });

      // Delete/remove button
      dropdown.querySelector('.mg-card__dropdown-delete').addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.remove('mg-card__dropdown--open');
        var idx = selectedAddMgs.indexOf(mgName);
        if (idx !== -1) selectedAddMgs.splice(idx, 1);
        applyAddMgSelection();
      });

      miModifiersFilled.appendChild(card);
    });
  }

  // Wire up Add modifier group buttons
  if (miModifiersAddBtn) {
    miModifiersAddBtn.addEventListener('click', openAddMgModal);
  }
  if (miModifiersAddMoreBtn) {
    miModifiersAddMoreBtn.addEventListener('click', openAddMgModal);
  }

  // ── Keyboard: Escape to close modal/takeover ──
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (addmgOverlay.classList.contains('mg-modal-overlay--visible')) {
        closeAddMgModal();
      } else if (mgOverlay.classList.contains('cat-modal-overlay--visible')) {
        closeMgModal();
      } else if (overlay.classList.contains('sku-modal-overlay--visible')) {
        closeSkuModal();
      } else if (takeover.classList.contains('takeover--visible')) {
        closeTakeover();
      }
    }
  });
});
