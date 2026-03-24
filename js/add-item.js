// Add Menu Item — Modal + Page Takeover + Live Preview
document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ──
  const overlay      = document.getElementById('sku-modal-overlay');
  const closeBtn     = document.getElementById('sku-modal-close');
  const searchInput  = document.getElementById('sku-search-input');
  const listEl       = document.getElementById('sku-modal-list');
  const emptyMsg     = document.getElementById('sku-modal-empty');
  const continueBtn  = document.getElementById('sku-modal-continue');
  const createNewBtn = document.getElementById('sku-modal-create-new');
  const unlinkBtn    = document.getElementById('sku-modal-unlink');
  const modalTitle   = document.getElementById('sku-modal-title');

  const takeover     = document.getElementById('takeover');
  const takeoverClose = document.getElementById('takeover-close');
  const takeoverSave = document.getElementById('takeover-save');
  const takeoverSavePub = document.getElementById('takeover-save-publish');
  const appShell     = document.querySelector('.app');

  // Form fields
  const fieldDisplayName  = document.getElementById('field-display-name');
  const fieldInternalName = document.getElementById('field-internal-name');
  const fieldDescription  = document.getElementById('field-description');
  const fieldDescCount    = document.getElementById('field-description-count');
  const fieldSkuCode      = document.getElementById('field-sku-code');
  const fieldAlcohol      = document.getElementById('field-alcohol');

  // SKU section states
  const skuEmptyState    = document.getElementById('sku-empty-state');
  const skuPrefilledState = document.getElementById('sku-prefilled-state');
  const skuPrefilledName = document.getElementById('sku-prefilled-name');
  const skuPrefilledMeta = document.getElementById('sku-prefilled-meta');
  const skuPrefilledImg  = document.getElementById('sku-prefilled-img');
  const skuSharedAction  = document.getElementById('sku-shared-action');

  // Pricing states
  const pricingEmpty     = document.getElementById('pricing-empty');
  const pricingPrefilled = document.getElementById('pricing-prefilled');
  const pricingAmount    = document.getElementById('pricing-amount');
  const pricingAction    = document.getElementById('pricing-action');

  // Modifiers states
  const modifiersEmpty     = document.getElementById('modifiers-empty');
  const modifiersPrefilled = document.getElementById('modifiers-filled');

  // Photo states
  const photoPrefilled     = document.getElementById('photo-prefilled');
  const photoPrefilledImg  = document.getElementById('photo-prefilled-img');
  const photoPrefilledName = document.getElementById('photo-prefilled-name');
  const photoPrefilledMeta = document.getElementById('photo-prefilled-meta');
  const photoRemoveBtn     = document.getElementById('photo-prefilled-remove');

  // Preview elements
  const previewName    = document.getElementById('preview-name');
  const previewDesc    = document.getElementById('preview-description');
  const previewPrice   = document.getElementById('preview-price');
  const previewCart    = document.getElementById('preview-add-to-cart');
  const previewImage   = document.getElementById('preview-image');

  // ── State ──
  let selectedItem = null;   // currently selected item in modal
  let tableItems = [];       // scraped from DOM
  let modalMode = 'add';     // 'add' | 'link' | 'edit'

  // ── Scrape table data ──
  function scrapeTableItems() {
    const items = [];
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      const nameEl = row.querySelector('.cell-name-text');
      const thumbEl = row.querySelector('.cell-thumbnail img');
      const skuLinkEl = row.querySelector('.cell-sku-link');
      const skuIdEl = row.querySelector('.cell-sku-id');
      const priceCell = cells[4]; // Price column

      items.push({
        name: nameEl ? nameEl.textContent.trim() : '',
        thumb: thumbEl ? thumbEl.src : '',
        skuLink: skuLinkEl ? skuLinkEl.textContent.trim() : '',
        skuId: skuIdEl ? skuIdEl.textContent.trim() : '',
        price: priceCell ? priceCell.textContent.trim() : '',
        internalName: nameEl ? nameEl.textContent.trim() : '',
        description: ''
      });
    });
    return items;
  }

  // ── Build modal list ──
  function buildModalList(items) {
    listEl.innerHTML = '';
    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'sku-modal__item';
      el.dataset.index = idx;
      el.innerHTML =
        '<input type="radio" name="sku-selection" class="sku-modal__item-radio" data-index="' + idx + '">' +
        '<div class="sku-modal__item-info">' +
          '<span class="sku-modal__item-name">' + escapeHtml(item.skuLink) + '</span>' +
          '<span class="sku-modal__item-sku">' + escapeHtml(item.skuId) + '</span>' +
        '</div>' +
        '<span class="sku-modal__item-price">' + escapeHtml(item.price) + '</span>';
      listEl.appendChild(el);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Open SKU Modal ──
  function openSkuModal(mode) {
    // Guard: only open for menu-items tab (not modifier-items or others)
    const activeTab = document.querySelector('.pill-tab--selected');
    if (activeTab && activeTab.getAttribute('data-tab') !== 'menu-items') return;

    modalMode = mode || 'add';
    tableItems = scrapeTableItems();
    buildModalList(tableItems);
    selectedItem = null;
    continueBtn.disabled = true;
    searchInput.value = '';
    emptyMsg.classList.remove('sku-modal__empty--visible');

    // Configure modal based on mode
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
      // Pre-select the currently linked item
      preselectCurrentItem();
    } else {
      modalTitle.textContent = 'Add menu item';
      continueBtn.textContent = 'Continue';
      createNewBtn.style.display = '';
      unlinkBtn.style.display = 'none';
    }

    overlay.classList.add('sku-modal-overlay--visible');
    // Re-init Lucide icons inside modal
    if (window.lucide) lucide.createIcons();
    // Focus search
    setTimeout(() => searchInput.focus(), 100);
  }

  // ── Close SKU Modal ──
  function closeSkuModal() {
    overlay.classList.remove('sku-modal-overlay--visible');
    selectedItem = null;
  }

  // ── Pre-select currently linked item in edit mode ──
  function preselectCurrentItem() {
    const currentName = skuPrefilledName.textContent.split('·')[0].trim();
    const items = listEl.querySelectorAll('.sku-modal__item');
    items.forEach((el, i) => {
      const itemName = el.querySelector('.sku-modal__item-name').textContent.trim();
      if (itemName === currentName) {
        el.classList.add('sku-modal__item--selected');
        el.querySelector('.sku-modal__item-radio').checked = true;
        selectedItem = tableItems[parseInt(el.dataset.index, 10)];
        continueBtn.disabled = false;
      }
    });
  }

  // ── Modal item selection ──
  listEl.addEventListener('click', (e) => {
    const item = e.target.closest('.sku-modal__item');
    if (!item) return;

    const idx = parseInt(item.dataset.index, 10);
    const checkbox = item.querySelector('.sku-modal__item-radio');

    // Deselect all others
    listEl.querySelectorAll('.sku-modal__item').forEach(el => {
      el.classList.remove('sku-modal__item--selected');
      el.querySelector('.sku-modal__item-radio').checked = false;
    });

    // Select this one
    item.classList.add('sku-modal__item--selected');
    checkbox.checked = true;
    selectedItem = tableItems[idx];
    continueBtn.disabled = false;
  });

  // ── Modal search filter ──
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    let visibleCount = 0;

    listEl.querySelectorAll('.sku-modal__item').forEach(el => {
      const name = el.querySelector('.sku-modal__item-name').textContent.toLowerCase();
      const sku = el.querySelector('.sku-modal__item-sku').textContent.toLowerCase();
      const match = name.includes(query) || sku.includes(query);
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

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSkuModal();
  });

  continueBtn.addEventListener('click', () => {
    if (!selectedItem) return;
    const item = selectedItem; // capture before close resets it
    closeSkuModal();

    if (modalMode === 'link' || modalMode === 'edit') {
      // Update SKU card + prefill form without reopening takeover
      prefillFromItem(item);
    } else {
      openTakeover(item);
    }
  });

  createNewBtn.addEventListener('click', () => {
    closeSkuModal();
    openTakeover(null);
  });

  // ── Prefill form from item data ──
  function prefillFromItem(itemData) {
    fieldDisplayName.value = itemData.name;
    fieldInternalName.value = itemData.internalName || itemData.name;
    fieldSkuCode.value = itemData.skuId || '';

    // SKU linked → disable SKU code & Alcohol, show "Edit in SKU library"
    fieldSkuCode.disabled = true;
    fieldAlcohol.disabled = true;
    fieldAlcohol.value = 'none';
    skuSharedAction.style.display = '';

    // SKU section
    skuEmptyState.style.display = 'none';
    skuPrefilledState.style.display = '';
    skuPrefilledName.textContent = itemData.skuLink || itemData.name;
    skuPrefilledMeta.textContent = itemData.skuId;
    if (itemData.thumb) {
      skuPrefilledImg.src = itemData.thumb;
      skuPrefilledImg.alt = itemData.name;
    }

    // Pricing
    if (itemData.price) {
      pricingEmpty.style.display = 'none';
      pricingPrefilled.style.display = '';
      pricingAmount.textContent = itemData.price;
      pricingAction.style.display = '';
    }

    // Preview
    previewName.textContent = itemData.name;
    previewPrice.textContent = itemData.price;
    previewCart.textContent = 'Add to cart \u00B7 ' + itemData.price;

    // Preview image
    if (itemData.thumb) {
      previewImage.innerHTML = '<img src="' + itemData.thumb + '" alt="' + escapeHtml(itemData.name) + '">';
    }

    // Photo prefilled state
    if (itemData.thumb) {
      photoPrefilled.style.display = '';
      photoPrefilledImg.src = itemData.thumb;
      photoPrefilledImg.alt = itemData.name;
      // Derive a filename from the item name
      var photoFileName = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') + '.png';
      photoPrefilledName.textContent = photoFileName;
      photoPrefilledMeta.textContent = '2000 x 2000px \u00B7 124kb';
    }

    if (window.lucide) lucide.createIcons();
  }

  // ── Open Takeover ──
  function openTakeover(itemData) {
    resetForm();

    if (itemData) {
      prefillFromItem(itemData);
    } else {
      // Empty mode — resetForm() already set defaults for all fields + preview
      skuEmptyState.style.display = '';
      skuPrefilledState.style.display = 'none';
      pricingEmpty.style.display = '';
      pricingPrefilled.style.display = 'none';
      pricingAction.style.display = 'none';
    }

    appShell.style.display = 'none';
    takeover.classList.add('takeover--visible');
    if (window.lucide) lucide.createIcons();
  }

  // ── Nav title element ──
  const takeoverNavTitle = document.getElementById('takeover-nav-title');

  // ── Close Takeover ──
  function closeTakeover() {
    takeover.classList.remove('takeover--visible');
    appShell.style.display = '';
    // Reset title back to default
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Add menu item';
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
    skuSharedAction.style.display = 'none';
    updateCharCount();

    skuEmptyState.style.display = '';
    skuPrefilledState.style.display = 'none';
    pricingEmpty.style.display = '';
    pricingPrefilled.style.display = 'none';
    pricingAction.style.display = 'none';
    modifiersEmpty.style.display = '';
    modifiersPrefilled.style.display = 'none';
    modifiersPrefilled.innerHTML = '';
    if (document.getElementById('modifiers-add-action')) document.getElementById('modifiers-add-action').style.display = 'none';
    photoPrefilled.style.display = 'none';
    photoPrefilledImg.src = '';

    // Reset preview
    previewName.textContent = 'Display name';
    previewDesc.textContent = 'Description';
    previewPrice.textContent = '$00.00';
    previewCart.textContent = 'Add to cart \u00B7 $00.00';
    previewImage.innerHTML = '<i data-lucide="image" class="lucide-icon preview-card__image-placeholder" style="width:48px;height:48px"></i>';
  }

  // ── Live Preview Updates ──
  fieldDisplayName.addEventListener('input', () => {
    const val = fieldDisplayName.value.trim();
    previewName.textContent = val || 'Display name';
  });

  fieldDescription.addEventListener('input', () => {
    const val = fieldDescription.value.trim();
    previewDesc.textContent = val || 'Description';
    updateCharCount();
  });

  function updateCharCount() {
    const len = fieldDescription.value.length;
    fieldDescCount.textContent = len + ' / 200 Characters Remaining';
  }

  // ── Wire up the "+ Add menu item" button ──
  // The button is in .section-header__actions — only fire on the menu-items tab
  const addBtn = document.querySelector('.section-header__actions .btn');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      const activeTab = document.querySelector('.pill-tab--selected');
      if (activeTab && activeTab.getAttribute('data-tab') !== 'menu-items') return;
      e.preventDefault();
      openSkuModal('add');
    });
  }

  // ── Row click → Edit menu item ──
  document.querySelector('.data-table tbody').addEventListener('click', (e) => {
    // Ignore clicks on checkboxes, action buttons, and SKU links
    if (e.target.closest('.table-checkbox') ||
        e.target.closest('.row-action') ||
        e.target.closest('.cell-sku-link')) return;

    const row = e.target.closest('tr');
    if (!row) return;

    const cells = row.querySelectorAll('td');
    if (cells.length < 7) return;

    // Scrape item data from the row
    const nameEl = row.querySelector('.cell-name-text');
    const thumbEl = row.querySelector('.cell-thumbnail img');
    const skuLinkEl = row.querySelector('.cell-sku-link');
    const skuIdEl = row.querySelector('.cell-sku-id');

    const item = {
      name: nameEl ? nameEl.textContent.trim() : '',
      thumb: thumbEl ? thumbEl.src : '',
      skuLink: skuLinkEl ? skuLinkEl.textContent.trim() : '',
      skuId: skuIdEl ? skuIdEl.textContent.trim() : '',
      price: cells[4] ? cells[4].textContent.trim() : '',
      internalName: cells[2] ? cells[2].textContent.trim() : '',
      description: '',
      // Extra fields for edit mode
      usedIn: cells[5] ? cells[5].textContent.trim() : '',
      contains: cells[6] ? cells[6].textContent.trim() : ''
    };

    // Set title to Edit mode and open takeover
    if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit menu item';
    openTakeover(item);

    // Pre-fill categories from row data using actual category names
    const usedInMatch = item.usedIn.match(/(\d+)/);
    const catCount = usedInMatch ? parseInt(usedInMatch[1]) : 0;
    if (catCount > 0) {
      selectedCategories = CATEGORIES.slice(0, catCount).map(function(c) { return c.name; });
      applyCategorySelection();
    }

    // Pre-fill modifier groups from row data using proper card rendering
    const containsMatch = item.contains.match(/(\d+)/);
    const mgCount = containsMatch ? parseInt(containsMatch[1]) : 0;
    if (mgCount > 0) {
      // Assign modifier groups from MODIFIER_GROUPS based on count
      selectedModifierGroups = MODIFIER_GROUPS.slice(0, mgCount).map(function(g) { return g.name; });
      modifiersEmpty.style.display = 'none';
      modifiersPrefilled.style.display = '';
      if (document.getElementById('modifiers-add-action')) document.getElementById('modifiers-add-action').style.display = '';
      renderModifierGroupCards();
      renderPreviewModifiers();
    }

    // Pre-fill locations, station profiles, channels from tooltip data
    if (window.multiselectSetValues && window._tooltipItemData) {
      var tipData = window._tooltipItemData[item.name];
      if (tipData) {
        var locs = tipData.location ? [tipData.location] : [];
        window.multiselectSetValues('locations', locs, takeover);
        window.multiselectSetValues('stations', tipData.stations || [], takeover);
        window.multiselectSetValues('channels', tipData.channels || [], takeover);
      }
    }
  });

  // ── Menu item link click in modifier items table → Edit as menu item ──
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.cell-menu-item-link');
    if (!link) return;
    var menuItemName = link.dataset.menuItem || link.textContent.trim();

    // Find this item in the main menu items table
    var mainTable = document.querySelector('.data-table:not(#mi-data-table)');
    if (!mainTable) return;
    var rows = mainTable.querySelectorAll('tbody tr');
    var itemData = null;
    rows.forEach(function(row) {
      var nameEl = row.querySelector('.cell-name-text');
      if (nameEl && nameEl.textContent.trim() === menuItemName) {
        var cells = row.querySelectorAll('td');
        var thumbEl = row.querySelector('.cell-thumbnail img');
        var skuLinkEl = row.querySelector('.cell-sku-link');
        var skuIdEl = row.querySelector('.cell-sku-id');
        itemData = {
          name: menuItemName,
          thumb: thumbEl ? thumbEl.src : '',
          skuLink: skuLinkEl ? skuLinkEl.textContent.trim() : '',
          skuId: skuIdEl ? skuIdEl.textContent.trim() : '',
          price: cells[4] ? cells[4].textContent.trim() : '',
          internalName: cells[2] ? cells[2].textContent.trim() : '',
          description: '',
          usedIn: cells[5] ? cells[5].textContent.trim() : '',
          contains: cells[6] ? cells[6].textContent.trim() : ''
        };
      }
    });

    if (itemData) {
      if (takeoverNavTitle) takeoverNavTitle.textContent = 'Edit menu item';
      openTakeover(itemData);

      // Pre-fill categories
      var usedInMatch = itemData.usedIn.match(/(\d+)/);
      var catCount = usedInMatch ? parseInt(usedInMatch[1]) : 0;
      if (catCount > 0) {
        selectedCategories = CATEGORIES.slice(0, catCount).map(function(c) { return c.name; });
        applyCategorySelection();
      }

      // Pre-fill modifier groups
      var containsMatch = itemData.contains.match(/(\d+)/);
      var mgCount = containsMatch ? parseInt(containsMatch[1]) : 0;
      if (mgCount > 0) {
        selectedModifierGroups = MODIFIER_GROUPS.slice(0, mgCount).map(function(g) { return g.name; });
        modifiersEmpty.style.display = 'none';
        modifiersPrefilled.style.display = '';
        if (document.getElementById('modifiers-add-action')) document.getElementById('modifiers-add-action').style.display = '';
        renderModifierGroupCards();
        renderPreviewModifiers();
      }

      // Pre-fill locations, station profiles, channels from tooltip data
      if (window.multiselectSetValues && window._tooltipItemData) {
        var tipData = window._tooltipItemData[menuItemName];
        if (tipData) {
          var locs = tipData.location ? [tipData.location] : [];
          window.multiselectSetValues('locations', locs, takeover);
          window.multiselectSetValues('stations', tipData.stations || [], takeover);
          window.multiselectSetValues('channels', tipData.channels || [], takeover);
        }
      }
    }
  });

  // ── Link SKU button (empty state) ──
  const skuLinkBtn = document.getElementById('sku-link-btn');
  if (skuLinkBtn) {
    skuLinkBtn.addEventListener('click', () => openSkuModal('link'));
  }

  // ── Edit SKU button (prefilled state) ──
  const skuEditBtn = document.getElementById('sku-edit-btn');
  if (skuEditBtn) {
    skuEditBtn.addEventListener('click', () => openSkuModal('edit'));
  }

  // ── Unlink SKU (shared logic) ──
  function unlinkSku() {
    // Switch SKU section back to empty state
    skuPrefilledState.style.display = 'none';
    skuEmptyState.style.display = '';

    // Re-enable SKU code & Alcohol
    fieldSkuCode.disabled = false;
    fieldAlcohol.disabled = false;

    // Hide "Edit in SKU library" CTA
    skuSharedAction.style.display = 'none';

    // Clear all prefilled form values
    fieldDisplayName.value = '';
    fieldInternalName.value = '';
    fieldDescription.value = '';
    fieldSkuCode.value = '';
    fieldAlcohol.value = '';
    updateCharCount();

    // Reset pricing to empty
    pricingEmpty.style.display = '';
    pricingPrefilled.style.display = 'none';
    pricingAction.style.display = 'none';

    // Reset modifiers to empty
    modifiersEmpty.style.display = '';
    modifiersPrefilled.style.display = 'none';
    modifiersPrefilled.innerHTML = '';
    if (document.getElementById('modifiers-add-action')) document.getElementById('modifiers-add-action').style.display = 'none';
    selectedModifierGroups = [];

    // Reset photo to empty
    photoPrefilled.style.display = 'none';
    photoPrefilledImg.src = '';

    // Reset preview
    previewName.textContent = 'Display name';
    previewDesc.textContent = 'Description';
    previewPrice.textContent = '$00.00';
    previewCart.textContent = 'Add to cart \u00B7 $00.00';
    previewImage.innerHTML = '<i data-lucide="image" class="lucide-icon preview-card__image-placeholder" style="width:48px;height:48px"></i>';
    if (window.lucide) lucide.createIcons();
  }

  // ── Remove SKU link (X button on prefilled card) ──
  const skuRemoveBtn = document.getElementById('sku-remove-btn');
  if (skuRemoveBtn) {
    skuRemoveBtn.addEventListener('click', unlinkSku);
  }

  // ── Remove prefilled photo (X button) ──
  if (photoRemoveBtn) {
    photoRemoveBtn.addEventListener('click', function() {
      photoPrefilled.style.display = 'none';
      photoPrefilledImg.src = '';
      // Also reset preview image
      previewImage.innerHTML = '<i data-lucide="image" class="lucide-icon preview-card__image-placeholder" style="width:48px;height:48px"></i>';
      if (window.lucide) lucide.createIcons();
    });
  }

  // ── Unlink button in Edit modal ──
  if (unlinkBtn) {
    unlinkBtn.addEventListener('click', () => {
      closeSkuModal();
      unlinkSku();
    });
  }

  // ══════════════════════════════════════════════════════════
  // ── ASSIGN CATEGORIES MODAL ──
  // ══════════════════════════════════════════════════════════

  const catOverlay      = document.getElementById('cat-modal-overlay');
  const catCloseBtn     = document.getElementById('cat-modal-close');
  const catSearchInput  = document.getElementById('cat-search-input');
  const catListEl       = document.getElementById('cat-modal-list');
  const catEmptyMsg     = document.getElementById('cat-modal-empty');
  const catConfirmBtn   = document.getElementById('cat-modal-confirm');
  const catCreateNewBtn = document.getElementById('cat-modal-create-new');
  const catSelectAllCb  = catOverlay.querySelector('.cat-modal__select-all .cat-modal__checkbox');

  // Category section states
  const categoriesEmpty      = document.getElementById('categories-empty');
  const categoriesFilled     = document.getElementById('categories-filled');
  const categoriesFilledList = document.getElementById('categories-filled-list');
  const categoriesEditAction = document.getElementById('categories-edit-action');
  const categoriesAssignBtn  = document.getElementById('categories-assign-btn');
  const categoriesEditBtn    = document.getElementById('categories-edit-btn');

  // Category data
  const CATEGORIES = [
    { name: 'Breakfast plates', desc: 'Used in Breakfast Beauties menu', count: '10 items' },
    { name: 'Breakfast tacos',  desc: 'Used in Breakfast Beauties menu', count: '8 items' },
    { name: 'Drinks',           desc: 'Used in Breakfast Beauties menu', count: '12 items' },
    { name: 'Desserts',         desc: 'Used in Breakfast Beauties menu', count: '5 items' },
    { name: 'Sides',            desc: 'Used in Breakfast Beauties menu', count: '6 items' }
  ];

  let selectedCategories = []; // track currently assigned categories

  // Build category list in modal
  function buildCategoryList() {
    catListEl.innerHTML = '';
    CATEGORIES.forEach((cat) => {
      const el = document.createElement('div');
      el.className = 'cat-modal__option';
      el.dataset.value = cat.name;
      el.innerHTML =
        '<input type="checkbox" class="cat-modal__checkbox" data-value="' + escapeHtml(cat.name) + '">' +
        '<div class="cat-modal__option-info">' +
          '<span class="cat-modal__option-name">' + escapeHtml(cat.name) + '</span>' +
          '<span class="cat-modal__option-desc">' + escapeHtml(cat.desc) + '</span>' +
        '</div>' +
        '<span class="cat-modal__option-count">' + escapeHtml(cat.count) + '</span>';
      catListEl.appendChild(el);
    });
  }

  // Open category modal
  function openCatModal() {
    buildCategoryList();
    catSearchInput.value = '';
    catEmptyMsg.classList.remove('cat-modal__empty--visible');

    // Pre-check already selected categories
    selectedCategories.forEach(function(catName) {
      var opt = catListEl.querySelector('.cat-modal__option[data-value="' + catName + '"]');
      if (opt) opt.querySelector('.cat-modal__checkbox').checked = true;
    });
    syncCatSelectAll();
    updateCatConfirmBtn();

    catOverlay.classList.add('cat-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { catSearchInput.focus(); }, 100);
  }

  // Close category modal
  function closeCatModal() {
    catOverlay.classList.remove('cat-modal-overlay--visible');
  }

  // Sync select all checkbox
  function syncCatSelectAll() {
    var allChecked = true;
    var visibleOpts = catListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.cat-modal__checkbox').checked) allChecked = false;
    });
    catSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Update confirm button state — always enabled so user can deselect all and confirm
  function updateCatConfirmBtn() {
    catConfirmBtn.disabled = false;
  }

  // Category option click
  catListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.cat-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.cat-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncCatSelectAll();
    updateCatConfirmBtn();
  });

  // Select all click
  catOverlay.querySelector('.cat-modal__select-all .cat-modal__option').addEventListener('click', function(e) {
    if (e.target !== catSelectAllCb) catSelectAllCb.checked = !catSelectAllCb.checked;
    var checked = catSelectAllCb.checked;
    catListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"]) .cat-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
    updateCatConfirmBtn();
  });

  // Search filter
  catSearchInput.addEventListener('input', function() {
    var query = catSearchInput.value.toLowerCase();
    var visibleCount = 0;
    catListEl.querySelectorAll('.cat-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.cat-modal__option-name').textContent.toLowerCase();
      var match = name.includes(query);
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      catEmptyMsg.classList.add('cat-modal__empty--visible');
    } else {
      catEmptyMsg.classList.remove('cat-modal__empty--visible');
    }
    syncCatSelectAll();
  });

  // Close button
  catCloseBtn.addEventListener('click', closeCatModal);
  catOverlay.addEventListener('click', function(e) {
    if (e.target === catOverlay) closeCatModal();
  });

  // Confirm button — apply selected categories
  catConfirmBtn.addEventListener('click', function() {
    selectedCategories = [];
    catListEl.querySelectorAll('.cat-modal__checkbox').forEach(function(cb) {
      if (cb.checked) selectedCategories.push(cb.dataset.value);
    });
    closeCatModal();
    applyCategorySelection();
  });

  // Create new — just close for prototype
  catCreateNewBtn.addEventListener('click', function() {
    closeCatModal();
  });

  // Apply category selection to the takeover form
  var categoriesFilledHeader = document.getElementById('categories-filled-header');

  function applyCategorySelection() {
    if (selectedCategories.length > 0) {
      categoriesEmpty.style.display = 'none';
      categoriesFilled.style.display = '';
      var count = selectedCategories.length;
      categoriesFilledHeader.textContent = count + (count === 1 ? ' category' : ' categories');
      categoriesFilledList.textContent = selectedCategories.join(', ');
      categoriesEditAction.style.display = '';
    } else {
      categoriesEmpty.style.display = '';
      categoriesFilled.style.display = 'none';
      categoriesFilledHeader.textContent = 'Categories';
      categoriesFilledList.textContent = '';
      categoriesEditAction.style.display = 'none';
    }
    if (window.lucide) lucide.createIcons();
  }

  // Assign category button (empty state)
  if (categoriesAssignBtn) {
    categoriesAssignBtn.addEventListener('click', openCatModal);
  }

  // Edit category button (filled state header)
  if (categoriesEditBtn) {
    categoriesEditBtn.addEventListener('click', openCatModal);
  }

  // Reset categories in resetForm
  var _origResetForm = resetForm;
  resetForm = function() {
    _origResetForm();
    selectedCategories = [];
    categoriesEmpty.style.display = '';
    categoriesFilled.style.display = 'none';
    categoriesFilledList.textContent = '';
    categoriesEditAction.style.display = 'none';
  };

  // ══════════════════════════════════════════════════════════
  // ── ADD MODIFIER GROUPS MODAL ──
  // ══════════════════════════════════════════════════════════

  const mgOverlay      = document.getElementById('mg-modal-overlay');
  const mgCloseBtn     = document.getElementById('mg-modal-close');
  const mgSearchInput  = document.getElementById('mg-search-input');
  const mgListEl       = document.getElementById('mg-modal-list');
  const mgEmptyMsg     = document.getElementById('mg-modal-empty');
  const mgConfirmBtn   = document.getElementById('mg-modal-confirm');
  const mgCreateNewBtn = document.getElementById('mg-modal-create-new');
  const mgSelectAllCb  = mgOverlay.querySelector('.mg-modal__select-all .mg-modal__checkbox');
  const mgCountEl      = document.getElementById('mg-modal-count');

  // Modifier groups section states
  const modifiersAddAction = document.getElementById('modifiers-add-action');
  const modifiersAddBtn    = document.getElementById('modifiers-add-btn');
  const modifiersAddMoreBtn = document.getElementById('modifiers-add-more-btn');
  const modifiersFilled    = document.getElementById('modifiers-filled');

  // Modifier group data (from modifier-groups.md)
  const MODIFIER_GROUPS = [
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
        { name: 'Extra Waffle', price: '$2.49' }
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

  let selectedModifierGroups = []; // track currently assigned modifier group names

  // Build modifier group list in modal
  function buildMgList() {
    mgListEl.innerHTML = '';
    MODIFIER_GROUPS.forEach(function(mg) {
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
      mgListEl.appendChild(el);
    });
    mgCountEl.textContent = MODIFIER_GROUPS.length;
  }

  // Open modifier groups modal — always starts with all checkboxes unchecked
  function openMgModal() {
    buildMgList();
    mgSearchInput.value = '';
    mgEmptyMsg.classList.remove('mg-modal__empty--visible');

    // All checkboxes start unchecked (additive flow — each open adds new groups)
    mgSelectAllCb.checked = false;
    updateMgConfirmBtn();

    mgOverlay.classList.add('mg-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { mgSearchInput.focus(); }, 100);
  }

  // Close modifier groups modal
  function closeMgModal() {
    mgOverlay.classList.remove('mg-modal-overlay--visible');
  }

  // Sync select all checkbox
  function syncMgSelectAll() {
    var allChecked = true;
    var visibleOpts = mgListEl.querySelectorAll('.mg-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.mg-modal__checkbox').checked) allChecked = false;
    });
    mgSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Update confirm button state — always enabled so user can deselect all
  function updateMgConfirmBtn() {
    mgConfirmBtn.disabled = false;
  }

  // Option click
  mgListEl.addEventListener('click', function(e) {
    var opt = e.target.closest('.mg-modal__option');
    if (!opt) return;
    var cb = opt.querySelector('.mg-modal__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    syncMgSelectAll();
    updateMgConfirmBtn();
  });

  // Select all click
  mgOverlay.querySelector('.mg-modal__select-all .mg-modal__option').addEventListener('click', function(e) {
    if (e.target !== mgSelectAllCb) mgSelectAllCb.checked = !mgSelectAllCb.checked;
    var checked = mgSelectAllCb.checked;
    mgListEl.querySelectorAll('.mg-modal__option:not([style*="display: none"]) .mg-modal__checkbox').forEach(function(cb) {
      cb.checked = checked;
    });
    updateMgConfirmBtn();
  });

  // Search filter
  mgSearchInput.addEventListener('input', function() {
    var query = mgSearchInput.value.toLowerCase();
    var visibleCount = 0;
    mgListEl.querySelectorAll('.mg-modal__option').forEach(function(opt) {
      var name = opt.querySelector('.mg-modal__option-name').textContent.toLowerCase();
      var desc = opt.querySelector('.mg-modal__option-desc').textContent.toLowerCase();
      var match = name.includes(query) || desc.includes(query);
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      mgEmptyMsg.classList.add('mg-modal__empty--visible');
    } else {
      mgEmptyMsg.classList.remove('mg-modal__empty--visible');
    }
    syncMgSelectAll();
  });

  // Close button
  mgCloseBtn.addEventListener('click', closeMgModal);
  mgOverlay.addEventListener('click', function(e) {
    if (e.target === mgOverlay) closeMgModal();
  });

  // Confirm button — append newly selected modifier groups
  mgConfirmBtn.addEventListener('click', function() {
    mgListEl.querySelectorAll('.mg-modal__checkbox').forEach(function(cb) {
      if (cb.checked && selectedModifierGroups.indexOf(cb.dataset.value) === -1) {
        selectedModifierGroups.push(cb.dataset.value);
      }
    });
    closeMgModal();
    applyModifierGroupSelection();
  });

  // ── COPY FROM MENU ITEMS MODAL ──
  var cfmOverlay = document.getElementById('cfm-modal-overlay');
  var cfmBackBtn = document.getElementById('cfm-modal-back');
  var cfmCloseBtn = document.getElementById('cfm-modal-close');
  var cfmSearchInput = document.getElementById('cfm-search-input');
  var cfmItemsList = document.getElementById('cfm-items-list');
  var cfmModifiersList = document.getElementById('cfm-modifiers-list');
  var cfmEmptyMsg = document.getElementById('cfm-modal-empty');
  var cfmConfirmBtn = document.getElementById('cfm-modal-confirm');
  var cfmCreateNewBtn = document.getElementById('cfm-modal-create-new');

  var cfmSelectedItem = null; // currently selected menu item name in left column

  // Build menu items with modifier groups data
  function getCfmMenuItems() {
    var tooltipData = window._tooltipItemData || {};
    var items = [];
    // Scrape table for prices
    var tItems = scrapeTableItems();
    var priceMap = {};
    tItems.forEach(function(ti) { priceMap[ti.name] = ti.price; });

    Object.keys(tooltipData).forEach(function(name) {
      var data = tooltipData[name];
      if (data.modifiers && data.modifiers.length > 0) {
        items.push({
          name: name,
          internalName: name,
          modifiers: data.modifiers,
          price: priceMap[name] || ''
        });
      }
    });
    return items;
  }

  // Build left column items
  function buildCfmItemsList() {
    cfmItemsList.innerHTML = '';
    cfmModifiersList.innerHTML = '';
    cfmSelectedItem = null;
    cfmConfirmBtn.disabled = true;

    var items = getCfmMenuItems();
    if (items.length === 0) {
      cfmEmptyMsg.classList.add('cfm-modal__empty--visible');
      return;
    }
    cfmEmptyMsg.classList.remove('cfm-modal__empty--visible');

    items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'cfm-item';
      el.dataset.name = item.name;

      var modSummary = item.modifiers.join(', ');
      el.innerHTML =
        '<div class="cfm-item__info">' +
          '<span class="cfm-item__name">' + escapeHtml(item.name) + '  <span class="cfm-item__name-dot">•</span>  ' + escapeHtml(item.internalName) + '</span>' +
          '<span class="cfm-item__modifiers">' + escapeHtml(modSummary) + '</span>' +
        '</div>' +
        '<div class="cfm-item__end">' +
          '<span class="cfm-item__price">' + escapeHtml(item.price) + '</span>' +
          '<div class="cfm-item__chevron"><i data-lucide="chevron-right" class="lucide-icon" style="width:16px;height:16px"></i></div>' +
        '</div>';

      cfmItemsList.appendChild(el);
    });
  }

  // Show modifier groups for a selected menu item in right column
  function showCfmModifiers(itemName) {
    cfmModifiersList.innerHTML = '';
    var tooltipData = window._tooltipItemData || {};
    var data = tooltipData[itemName];
    if (!data || !data.modifiers) return;

    data.modifiers.forEach(function(mgName) {
      var mgData = MODIFIER_GROUPS.find(function(g) { return g.name === mgName; });
      if (!mgData) return;

      var el = document.createElement('div');
      el.className = 'cfm-mg-option';
      el.dataset.value = mgName;

      var itemNames = mgData.items.map(function(it) { return it.name; }).join(', ');
      el.innerHTML =
        '<input type="checkbox" class="cfm-mg-option__checkbox" data-value="' + escapeHtml(mgName) + '" checked>' +
        '<div class="cfm-mg-option__info">' +
          '<span class="cfm-mg-option__name">' + escapeHtml(mgName) + '</span>' +
          '<span class="cfm-mg-option__items">' + escapeHtml(itemNames) + '</span>' +
        '</div>' +
        '<span class="cfm-mg-option__rule">' + escapeHtml(mgData.ruleShort) + '</span>';

      cfmModifiersList.appendChild(el);
    });

    // Enable confirm since checkboxes are pre-checked
    updateCfmConfirmBtn();
    if (window.lucide) lucide.createIcons();
  }

  // Update confirm button state
  function updateCfmConfirmBtn() {
    var anyChecked = cfmModifiersList.querySelectorAll('.cfm-mg-option__checkbox:checked').length > 0;
    cfmConfirmBtn.disabled = !anyChecked;
  }

  // Open copy-from modal
  function openCfmModal() {
    buildCfmItemsList();
    cfmSearchInput.value = '';
    cfmOverlay.classList.add('cfm-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { cfmSearchInput.focus(); }, 100);
  }

  // Close copy-from modal
  function closeCfmModal() {
    cfmOverlay.classList.remove('cfm-modal-overlay--visible');
  }

  // "Copy from menu items" button in mg-modal footer
  document.getElementById('mg-modal-copy-from').addEventListener('click', function() {
    closeMgModal();
    openCfmModal();
  });

  // Back button → return to mg-modal
  cfmBackBtn.addEventListener('click', function() {
    closeCfmModal();
    openMgModal();
  });

  // Close button
  cfmCloseBtn.addEventListener('click', closeCfmModal);
  cfmOverlay.addEventListener('click', function(e) {
    if (e.target === cfmOverlay) closeCfmModal();
  });

  // Item click in left column → select and show modifiers
  cfmItemsList.addEventListener('click', function(e) {
    var item = e.target.closest('.cfm-item');
    if (!item) return;

    // Deselect previous
    var prev = cfmItemsList.querySelector('.cfm-item--selected');
    if (prev) prev.classList.remove('cfm-item--selected');

    // Select this one
    item.classList.add('cfm-item--selected');
    cfmSelectedItem = item.dataset.name;
    showCfmModifiers(cfmSelectedItem);
  });

  // Checkbox toggle in right column
  cfmModifiersList.addEventListener('click', function(e) {
    var opt = e.target.closest('.cfm-mg-option');
    if (!opt) return;
    var cb = opt.querySelector('.cfm-mg-option__checkbox');
    if (e.target !== cb) cb.checked = !cb.checked;
    updateCfmConfirmBtn();
  });

  // Search filter
  cfmSearchInput.addEventListener('input', function() {
    var query = cfmSearchInput.value.toLowerCase();
    var visibleCount = 0;
    cfmItemsList.querySelectorAll('.cfm-item').forEach(function(item) {
      var name = item.dataset.name.toLowerCase();
      var mods = (item.querySelector('.cfm-item__modifiers') || {}).textContent || '';
      var match = name.includes(query) || mods.toLowerCase().includes(query);
      item.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (visibleCount === 0) {
      cfmEmptyMsg.classList.add('cfm-modal__empty--visible');
    } else {
      cfmEmptyMsg.classList.remove('cfm-modal__empty--visible');
    }

    // If selected item is now hidden, clear right column
    var selectedEl = cfmItemsList.querySelector('.cfm-item--selected');
    if (selectedEl && selectedEl.style.display === 'none') {
      selectedEl.classList.remove('cfm-item--selected');
      cfmModifiersList.innerHTML = '';
      cfmSelectedItem = null;
      cfmConfirmBtn.disabled = true;
    }
  });

  // Confirm button — add checked modifier groups
  cfmConfirmBtn.addEventListener('click', function() {
    cfmModifiersList.querySelectorAll('.cfm-mg-option__checkbox').forEach(function(cb) {
      if (cb.checked && selectedModifierGroups.indexOf(cb.dataset.value) === -1) {
        selectedModifierGroups.push(cb.dataset.value);
      }
    });
    closeCfmModal();
    applyModifierGroupSelection();
  });

  // Create new — just close for prototype
  cfmCreateNewBtn.addEventListener('click', function() {
    closeCfmModal();
  });

  // ── CREATE MODIFIER GROUP SIDE PANEL ──
  var mgcOverlay = document.getElementById('mgc-overlay');
  var mgcPanel = document.getElementById('mgc-panel');
  var mgcCloseBtn = document.getElementById('mgc-close');
  var mgcCancelBtn = document.getElementById('mgc-cancel');
  var mgcConfirmBtn = document.getElementById('mgc-confirm');
  var mgcTypeGrid = document.getElementById('mgc-type-grid');
  var mgcTotalMin = document.getElementById('mgc-total-min');
  var mgcTotalMax = document.getElementById('mgc-total-max');
  var mgcMaxPer = document.getElementById('mgc-max-per');
  var mgcTotalHint = document.getElementById('mgc-total-hint');
  var mgcMaxperHint = document.getElementById('mgc-maxper-hint');
  var mgcMaxperSection = document.getElementById('mgc-maxper-section');
  var mgcDefaultCell = document.getElementById('mgc-default-cell');
  var mgcDescription = document.getElementById('mgc-description');
  var mgcDescCount = document.getElementById('mgc-desc-count');

  var mgcOpenedFrom = null; // 'mg' or 'cfm' — which modal opened this panel

  // Type → default rules mapping
  var MG_TYPE_DEFAULTS = {
    'Size':               { min: 1, max: '1', maxPer: '1' },
    'Product variation':  { min: 1, max: '1', maxPer: '1' },
    'Preference':         { min: 1, max: '1', maxPer: '1' },
    'Packaging':          { min: 1, max: '1', maxPer: '1' },
    'Add-on':             { min: 0, max: '4', maxPer: '2' },
    'Removal':            { min: 0, max: '4', maxPer: '1' },
    'Condiments':         { min: 0, max: '4', maxPer: '2' },
    'Combo / Bundle':     { min: 1, max: '1', maxPer: '1' },
    'Upsell':             { min: 0, max: '4', maxPer: '2' },
    'Custom':             { min: 0, max: 'Unlimited', maxPer: 'Unlimited' }
  };

  // Open the create panel
  function openMgcPanel(from) {
    mgcOpenedFrom = from || 'mg';
    resetMgcPanel();
    // Always reset title (Edit flow will override after this)
    var panelTitle = document.querySelector('.mgc-panel__title');
    if (panelTitle) panelTitle.textContent = 'Create modifier group';
    mgcOverlay.classList.add('mgc-overlay--visible');
    if (window.lucide) lucide.createIcons();
  }

  // Close the create panel
  function closeMgcPanel() {
    mgcOverlay.classList.remove('mgc-overlay--visible');
  }

  // Reset panel to default state
  function resetMgcPanel() {
    // Clear type selection
    mgcTypeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
      c.classList.remove('mgc-type-card--selected');
    });
    // Reset inputs
    var dispName = document.getElementById('mgc-display-name');
    var intName = document.getElementById('mgc-internal-name');
    if (dispName) dispName.value = '';
    if (intName) intName.value = '';
    if (mgcDescription) { mgcDescription.value = ''; mgcDescCount.textContent = '0'; }
    // Reset selects to default (no type = Unlimited)
    mgcTotalMin.value = '0';
    mgcTotalMax.value = 'Unlimited';
    mgcMaxPer.value = 'Unlimited';
    updateMgcRules();
    updateMgcDefaultCell();
  }

  // Type card selection
  mgcTypeGrid.addEventListener('click', function(e) {
    var card = e.target.closest('.mgc-type-card');
    if (!card) return;
    // Toggle selection
    mgcTypeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
      c.classList.remove('mgc-type-card--selected');
    });
    card.classList.add('mgc-type-card--selected');

    var type = card.dataset.type;
    var defaults = MG_TYPE_DEFAULTS[type];
    if (defaults) {
      mgcTotalMin.value = String(defaults.min);
      mgcTotalMax.value = defaults.max;
      mgcMaxPer.value = defaults.maxPer;
    }
    updateMgcRules();
    updateMgcDefaultCell();
  });

  // Update rule hints and conditional visibility
  function updateMgcRules() {
    var minVal = parseInt(mgcTotalMin.value, 10);
    var maxVal = mgcTotalMax.value;
    var maxPerVal = mgcMaxPer.value;

    // Total selection hint
    if (minVal >= 1 && maxVal === '1') {
      mgcTotalHint.textContent = 'Required - customers must select 1 options.';
    } else if (minVal >= 1 && maxVal !== 'Unlimited') {
      mgcTotalHint.textContent = 'Required - customers must select between ' + minVal + ' and ' + maxVal + ' options.';
    } else if (minVal === 0 && maxVal === 'Unlimited') {
      mgcTotalHint.textContent = 'Optional - customers can select any number of options.';
    } else if (minVal === 0 && maxVal !== 'Unlimited') {
      mgcTotalHint.textContent = 'Optional \u2014 customers can select up to ' + maxVal + ' options.';
    } else {
      mgcTotalHint.textContent = 'Required - customers must select between ' + minVal + ' and ' + maxVal + ' options.';
    }

    // Show/hide max per options: only when total max > 1
    var maxNum = maxVal === 'Unlimited' ? Infinity : parseInt(maxVal, 10);
    if (maxNum > 1) {
      mgcMaxperSection.style.display = '';
    } else {
      mgcMaxperSection.style.display = 'none';
    }

    // Max per options hint
    if (maxPerVal === 'Unlimited') {
      mgcMaxperHint.textContent = 'Each option can be selected multiple times.';
    } else if (maxPerVal === '1') {
      mgcMaxperHint.textContent = 'Each option can be selected once.';
    } else {
      mgcMaxperHint.textContent = 'Each option can be selected up to ' + maxPerVal + ' times.';
    }
  }

  // Update Default column: only update already-added rows (template row has no default control)
  function updateMgcDefaultCell() {
    if (!mgcDefaultCell) return;
    // Keep the "Search to add" row default cell empty
    mgcDefaultCell.innerHTML = '';

    // Update all already-added rows
    renderMgcItems();
  }

  // Qty selector click handlers (delegated)
  if (mgcDefaultCell) {
    mgcDefaultCell.addEventListener('click', function(e) {
      var btn = e.target.closest('.mgc-default-qty__btn');
      if (!btn) return;
      var valEl = mgcDefaultCell.querySelector('.mgc-default-qty__val');
      if (!valEl) return;
      var val = parseInt(valEl.textContent, 10) || 0;
      if (btn.dataset.action === 'inc') {
        valEl.textContent = val + 1;
      } else if (btn.dataset.action === 'dec' && val > 0) {
        valEl.textContent = val - 1;
      }
    });
  }

  // Default checkboxes — radio-button behavior (only one selected at a time)
  // Delegated on the whole items-table so it covers both added rows and the template row
  var mgcItemsTable = mgcDefaultCell ? mgcDefaultCell.closest('.mgc-items-table') : null;
  if (mgcItemsTable) {
    mgcItemsTable.addEventListener('change', function(e) {
      if (!e.target.classList.contains('mgc-default-cb')) return;
      if (e.target.checked) {
        mgcItemsTable.querySelectorAll('.mgc-default-cb').forEach(function(other) {
          if (other !== e.target) other.checked = false;
        });
      }
    });
  }

  // Listen to dropdown changes
  mgcTotalMin.addEventListener('change', function() { updateMgcRules(); });
  mgcTotalMax.addEventListener('change', function() { updateMgcRules(); updateMgcDefaultCell(); });
  mgcMaxPer.addEventListener('change', function() { updateMgcRules(); updateMgcDefaultCell(); });

  // Description char count
  if (mgcDescription) {
    mgcDescription.addEventListener('input', function() {
      mgcDescCount.textContent = mgcDescription.value.length;
    });
  }

  // "Create new" buttons — open from mg-modal or cfm-modal
  mgCreateNewBtn.addEventListener('click', function() {
    closeMgModal();
    openMgcPanel('mg');
  });
  cfmCreateNewBtn.addEventListener('click', function() {
    closeCfmModal();
    openMgcPanel('cfm');
  });

  // Close panel
  mgcCloseBtn.addEventListener('click', closeMgcPanel);
  mgcCancelBtn.addEventListener('click', closeMgcPanel);
  mgcOverlay.addEventListener('click', function(e) {
    if (e.target === mgcOverlay) closeMgcPanel();
  });

  // ── Validation helpers ──
  function clearMgcErrors() {
    mgcOverlay.querySelectorAll('.mgc-input--error').forEach(function(el) {
      el.classList.remove('mgc-input--error');
    });
    mgcOverlay.querySelectorAll('.mgc-type-grid--error').forEach(function(el) {
      el.classList.remove('mgc-type-grid--error');
    });
    mgcOverlay.querySelectorAll('.mgc-items-table--error').forEach(function(el) {
      el.classList.remove('mgc-items-table--error');
    });
    mgcOverlay.querySelectorAll('.mgc-field__error').forEach(function(el) {
      el.remove();
    });
  }

  function showMgcError(field, message) {
    field.classList.add('mgc-input--error');
    var errEl = document.createElement('div');
    errEl.className = 'mgc-field__error';
    errEl.textContent = message;
    field.parentNode.appendChild(errEl);
  }

  function showMgcTypeError(message) {
    mgcTypeGrid.classList.add('mgc-type-grid--error');
    var errEl = document.createElement('div');
    errEl.className = 'mgc-field__error';
    errEl.textContent = message;
    mgcTypeGrid.parentNode.appendChild(errEl);
  }

  function showMgcItemsError(message) {
    var table = mgcOverlay.querySelector('.mgc-items-table');
    if (table) {
      table.classList.add('mgc-items-table--error');
      var errEl = document.createElement('div');
      errEl.className = 'mgc-field__error';
      errEl.textContent = message;
      table.parentNode.appendChild(errEl);
    }
  }

  // Build rule strings from dropdown values
  function buildMgcRuleStrings(minVal, maxVal, maxPerVal) {
    var min = minVal === 'Unlimited' ? 0 : parseInt(minVal, 10) || 0;
    var max = maxVal === 'Unlimited' ? 'any' : maxVal;
    var maxPer = maxPerVal === 'Unlimited' ? 'Unlimited' : maxPerVal;

    var rule = '';
    var ruleShort = '';

    // Required prefix
    if (min >= 1) rule += 'Required · ';

    // Total
    if (min === parseInt(max, 10)) {
      rule += 'Total ' + min;
      ruleShort = 'Total ' + min;
    } else {
      rule += 'Total ' + min + '-' + max;
      ruleShort = 'Total ' + min + '-' + max;
    }

    // Each / MaxPer
    rule += ' · Each ' + maxPer;
    ruleShort += ' · Each ≤ ' + maxPer;

    return { rule: rule, ruleShort: ruleShort };
  }

  // Clear errors on input
  var mgcDisplayNameInput = document.getElementById('mgc-display-name');
  if (mgcDisplayNameInput) {
    mgcDisplayNameInput.addEventListener('input', function() {
      mgcDisplayNameInput.classList.remove('mgc-input--error');
      var err = mgcDisplayNameInput.parentNode.querySelector('.mgc-field__error');
      if (err) err.remove();
    });
  }

  // Clear type error on type card click
  mgcTypeGrid.addEventListener('click', function() {
    mgcTypeGrid.classList.remove('mgc-type-grid--error');
    var err = mgcTypeGrid.parentNode.querySelector('.mgc-field__error');
    if (err) err.remove();
  });

  // Confirm — validate, persist, and close
  mgcConfirmBtn.addEventListener('click', function() {
    clearMgcErrors();

    var dispName = document.getElementById('mgc-display-name');
    var hasError = false;

    // Validate Display name
    if (!dispName.value.trim()) {
      showMgcError(dispName, 'Display name is required');
      hasError = true;
    }

    // Validate Type selection
    var selectedType = mgcTypeGrid.querySelector('.mgc-type-card--selected');
    if (!selectedType) {
      showMgcTypeError('Please select a modifier group type');
      hasError = true;
    }

    // Validate at least one modifier item
    var mgcItemsSection = document.getElementById('mgc-items-section');
    if (mgcAddedItems.length === 0) {
      showMgcItemsError('At least one modifier item is required');
      hasError = true;
    }

    if (hasError) {
      // Scroll panel to first error
      var panelBody = document.querySelector('.mgc-panel__body');
      if (panelBody) {
        var firstErr = panelBody.querySelector('.mgc-input--error, .mgc-type-grid--error, .mgc-items-table--error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          panelBody.scrollTop = 0;
        }
      }
      return;
    }

    // Collect form data
    var name = dispName.value.trim();
    var typeName = selectedType.querySelector('.mgc-type-card__name').textContent.trim();
    var minVal = mgcTotalMin.value;
    var maxVal = mgcTotalMax.value;
    var maxPerVal = mgcMaxPer.value;
    var rules = buildMgcRuleStrings(minVal, maxVal, maxPerVal);
    var items = mgcAddedItems.map(function(a) {
      return { name: a.name, price: a.price };
    });

    var mgObj = {
      name: name,
      type: typeName,
      rule: rules.rule,
      ruleShort: rules.ruleShort,
      items: items
    };

    if (mgcEditingName) {
      // Edit mode: update existing group in MODIFIER_GROUPS
      var existingIdx = MODIFIER_GROUPS.findIndex(function(g) { return g.name === mgcEditingName; });
      if (existingIdx > -1) {
        MODIFIER_GROUPS[existingIdx] = mgObj;
      }
      // Update name in selectedModifierGroups if it changed
      var selIdx = selectedModifierGroups.indexOf(mgcEditingName);
      if (selIdx > -1) {
        selectedModifierGroups[selIdx] = name;
      }
    } else {
      // Create mode: add new group
      MODIFIER_GROUPS.push(mgObj);
      if (selectedModifierGroups.indexOf(name) === -1) {
        selectedModifierGroups.push(name);
      }
    }

    applyModifierGroupSelection();
    closeMgcPanel();
  });

  // ── MODIFIER ITEMS SEARCH & ADD ──
  var mgcSearchInput = document.getElementById('mgc-search-modifier');
  var mgcSearchDropdown = document.getElementById('mgc-search-dropdown');
  var mgcItemsBody = document.getElementById('mgc-items-body');
  var mgcAddedItems = [];

  // Generate a SKUID like "COK-001" from a name
  // Pattern: 1-2 words → first 3 letters of first word; 3+ words → initials (skip "and"/"of"/"the")
  function generateSkuId(name) {
    var words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(function(w) {
      return ['and', 'of', 'the', 'a', 'an'].indexOf(w.toLowerCase()) === -1;
    });
    var code;
    if (words.length <= 2) {
      code = words[0].substring(0, 3).toUpperCase();
    } else {
      code = words.slice(0, 3).map(function(w) { return w.charAt(0); }).join('').toUpperCase();
    }
    while (code.length < 3) code += 'X';
    return code + '-001';
  }

  function getMgcSearchData() {
    var results = [];
    var seen = {};
    MODIFIER_GROUPS.forEach(function(mg) {
      mg.items.forEach(function(item) {
        if (!seen[item.name]) {
          seen[item.name] = true;
          var modSku = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          results.push({ name: item.name, internalName: item.name, price: item.price, type: 'modifier', sku: modSku, modifiers: [] });
        }
      });
    });
    var tooltipData = window._tooltipItemData || {};
    var tItems = scrapeTableItems();
    var priceMap = {};
    tItems.forEach(function(ti) { priceMap[ti.name] = ti.price; });
    Object.keys(tooltipData).forEach(function(name) {
      var data = tooltipData[name];
      var mods = [];
      if (data.modifiers && data.modifiers.length > 0) {
        data.modifiers.forEach(function(mgName) {
          var mgData = MODIFIER_GROUPS.find(function(g) { return g.name === mgName; });
          if (mgData) mods.push(mgData);
        });
      }
      results.push({ name: name, internalName: name, price: priceMap[name] || '$0.00', type: 'menu', sku: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), modifiers: mods });
    });
    return results;
  }

  function showMgcDropdown(query) {
    var data = getMgcSearchData();
    var q = query.toLowerCase();
    var filtered = data.filter(function(d) { return d.name.toLowerCase().indexOf(q) !== -1; });
    var addedNames = mgcAddedItems.map(function(a) { return a.name; });
    filtered = filtered.filter(function(d) { return addedNames.indexOf(d.name) === -1; });
    mgcSearchDropdown.innerHTML = '';
    if (filtered.length === 0 && !q) { mgcSearchDropdown.classList.remove('mgc-search-dropdown--visible'); return; }

    // Scrollable results container
    var resultsDiv = document.createElement('div');
    resultsDiv.className = 'mgc-search-dropdown__results';

    filtered.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'mgc-search-dropdown__item';
      var badgeHtml = item.type === 'menu' ? '<span class="mgc-badge-menu"><i data-lucide="utensils-crossed" class="lucide-icon" style="width:10px;height:10px"></i> Menu item</span>' : '';
      el.innerHTML =
        '<div class="mgc-search-dropdown__item-info">' +
          '<div class="mgc-search-dropdown__item-name">' + escapeHtml(item.name) + badgeHtml + '</div>' +
          '<div class="mgc-search-dropdown__item-sub">' + escapeHtml(item.internalName) + '</div>' +
        '</div>' +
        '<span class="mgc-search-dropdown__item-price">' + escapeHtml(item.price) + '</span>';
      el.addEventListener('click', function() {
        addMgcItem(item);
        mgcSearchInput.value = '';
        mgcSearchDropdown.classList.remove('mgc-search-dropdown--visible');
      });
      resultsDiv.appendChild(el);
    });
    mgcSearchDropdown.appendChild(resultsDiv);

    // Sticky "Create new" option at the bottom
    if (q) {
      var createEl = document.createElement('div');
      createEl.className = 'mgc-search-dropdown__create';
      createEl.innerHTML = '<div class="mgc-search-dropdown__create-icon">+</div><span>Create "<strong>' + escapeHtml(query) + '</strong>" as a new modifier</span>';
      createEl.addEventListener('click', function() {
        addMgcItem({ name: query, internalName: query, price: '$0.00', type: 'new', sku: '', modifiers: [] });
        mgcSearchInput.value = '';
        mgcSearchDropdown.classList.remove('mgc-search-dropdown--visible');
      });
      mgcSearchDropdown.appendChild(createEl);
    }
    mgcSearchDropdown.classList.add('mgc-search-dropdown--visible');
    if (window.lucide) lucide.createIcons();
  }

  if (mgcSearchInput) {
    mgcSearchInput.addEventListener('input', function() {
      var q = mgcSearchInput.value.trim();
      if (q.length > 0) showMgcDropdown(q);
      else mgcSearchDropdown.classList.remove('mgc-search-dropdown--visible');
    });
    mgcSearchInput.addEventListener('focus', function() {
      if (mgcSearchInput.value.trim().length > 0) showMgcDropdown(mgcSearchInput.value.trim());
    });
  }

  document.addEventListener('click', function(e) {
    if (mgcSearchDropdown && !mgcSearchDropdown.contains(e.target) && e.target !== mgcSearchInput) {
      mgcSearchDropdown.classList.remove('mgc-search-dropdown--visible');
    }
  });

  function addMgcItem(item) {
    mgcAddedItems.push({ name: item.name, price: item.price, sku: item.sku || '', type: item.type, locked: item.type !== 'new', modifiers: item.modifiers || [] });
    renderMgcItems();
    // Clear items-required error when an item is added
    var table = mgcOverlay.querySelector('.mgc-items-table');
    if (table) {
      table.classList.remove('mgc-items-table--error');
      var errEl = table.parentNode.querySelector('.mgc-field__error');
      if (errEl) errEl.remove();
    }
  }

  function removeMgcItem(index) {
    mgcAddedItems.splice(index, 1);
    renderMgcItems();
  }

  function renderMgcItems() {
    mgcItemsBody.innerHTML = '';
    var maxPerVal = mgcMaxPer ? mgcMaxPer.value : '1';
    var maxPerNum = maxPerVal === 'Unlimited' ? Infinity : parseInt(maxPerVal, 10);

    mgcAddedItems.forEach(function(item, idx) {
      var row = document.createElement('div');
      row.className = 'mgc-items-table__row';

      // Drag handle (left icon)
      var dragHtml = '<div class="mgc-row-drag"><i data-lucide="grip-horizontal" class="lucide-icon" style="width:16px;height:16px"></i></div>';

      // Name column content
      var nameHtml;
      if (item.type === 'new' || item.type === 'sku') {
        // Editable name for new items and SKU-linked items
        nameHtml = '<input type="text" class="mgc-input mgc-input--sm" value="' + escapeHtml(item.name) + '">';
      } else if (item.type === 'menu') {
        nameHtml = '<span class="mgc-row-name-text">' + escapeHtml(item.name) + '</span>' +
          '<span class="mgc-badge-menu"><i data-lucide="utensils-crossed" class="lucide-icon" style="width:10px;height:10px"></i> Menu item</span>';
      } else {
        nameHtml = '<span class="mgc-row-name-text">' + escapeHtml(item.name) + '</span>';
      }

      // Price column — editable for all types
      var priceHtml = '<input type="text" class="mgc-input mgc-input--sm" value="' + escapeHtml(item.price) + '">';

      // SKU column — locked display for sku type, blue link for existing, input for new
      var skuHtml;
      if (item.type === 'sku' && item.sku) {
        // SKU-linked: show locked SKU name + code (not editable)
        skuHtml = '<div class="mgc-row-sku"><span class="mgc-row-sku__link">' + escapeHtml(item.sku) + '</span><span class="mgc-row-sku__id">' + escapeHtml(item.skuId) + '</span></div>';
      } else if (item.type === 'new') {
        skuHtml = '<input type="text" class="mgc-input mgc-input--sm" placeholder="SKU code">';
      } else if (item.sku) {
        skuHtml = '<div class="mgc-row-sku"><span class="mgc-row-sku__link">' + escapeHtml(item.sku) + '</span><span class="mgc-row-sku__id">' + generateSkuId(item.name) + '</span></div>';
      } else {
        skuHtml = '';
      }

      // Default column — checkbox or qty stepper
      var defaultHtml;
      if (maxPerNum > 1) {
        defaultHtml = '<div class="mgc-default-qty"><button class="mgc-default-qty__btn" data-action="dec">\u2212</button><span class="mgc-default-qty__val">0</span><button class="mgc-default-qty__btn" data-action="inc">+</button></div>';
      } else {
        defaultHtml = '<input type="checkbox" class="mgc-default-cb">';
      }

      // Chevron for menu items with nested modifiers
      var chevronHtml = '';
      if (item.type === 'menu' && item.modifiers && item.modifiers.length > 0) {
        chevronHtml = '<button class="mgc-row-chevron" data-idx="' + idx + '"><i data-lucide="chevron-up" class="lucide-icon" style="width:16px;height:16px"></i></button>';
      }

      row.innerHTML = dragHtml +
        '<span class="mgc-items-table__col mgc-items-table__col--name" style="display:flex;align-items:center;gap:4px">' + chevronHtml + nameHtml + '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--price">' + priceHtml + '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--sku">' + skuHtml + '</span>' +
        '<span class="mgc-items-table__col mgc-items-table__col--default">' + defaultHtml + '</span>' +
        '<button class="mgc-row-more"><i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>';
      mgcItemsBody.appendChild(row);

      // Nested modifier groups for menu items
      if (item.type === 'menu' && item.modifiers && item.modifiers.length > 0) {
        var nestedWrapper = document.createElement('div');
        nestedWrapper.className = 'mgc-nested-wrapper';
        nestedWrapper.dataset.parentIdx = idx;

        item.modifiers.forEach(function(mg) {
          var nested = document.createElement('div');
          nested.className = 'mgc-nested';

          // Header: gray bg, chevron + name + ⋮
          var headerHtml = '<div class="mgc-nested__header">' +
            '<div class="mgc-nested__header-drag"></div>' +
            '<div class="mgc-nested__header-name">' +
              '<div class="mgc-nested__toggle"><i data-lucide="chevron-down" class="lucide-icon" style="width:16px;height:16px"></i></div>' +
              '<span class="mgc-nested__name">' + escapeHtml(mg.name) + '</span>' +
            '</div>' +
            '<button class="mgc-nested__header-more"><i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>' +
            '</div>';

          // Item rows: aligned to table columns
          var itemsHtml = '<div class="mgc-nested__items">';
          mg.items.forEach(function(mi) {
            var miSku = mi.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            itemsHtml += '<div class="mgc-nested__item-row">' +
              '<div class="mgc-nested__item-drag"></div>' +
              '<span class="mgc-nested__item-name">' + escapeHtml(mi.name) + '</span>' +
              '<span class="mgc-nested__item-price">' + escapeHtml(mi.price) + '</span>' +
              '<span class="mgc-nested__item-sku"><span class="mgc-nested__item-sku-link">' + escapeHtml(miSku) + '</span><span class="mgc-nested__item-sku-id">' + generateSkuId(mi.name) + '</span></span>' +
              '<div class="mgc-nested__item-default"></div>' +
              '<button class="mgc-nested__item-more"><i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px"></i></button>' +
              '</div>';
          });
          itemsHtml += '</div>';
          nested.innerHTML = headerHtml + itemsHtml;
          nestedWrapper.appendChild(nested);
          nested.querySelector('.mgc-nested__header').addEventListener('click', function(e) {
            if (e.target.closest('.mgc-nested__header-more')) return;
            nested.classList.toggle('mgc-nested--collapsed');
          });
        });
        mgcItemsBody.appendChild(nestedWrapper);

        // Chevron toggle to collapse/expand all nested groups
        var chevronBtn = row.querySelector('.mgc-row-chevron');
        if (chevronBtn) {
          chevronBtn.addEventListener('click', function() {
            var isCollapsed = chevronBtn.classList.toggle('mgc-row-chevron--collapsed');
            nestedWrapper.style.display = isCollapsed ? 'none' : '';
            var icon = chevronBtn.querySelector('[data-lucide]');
            if (icon) {
              icon.setAttribute('data-lucide', isCollapsed ? 'chevron-down' : 'chevron-up');
              if (window.lucide) lucide.createIcons();
            }
          });
        }
      }
    });

    // Qty buttons in added rows
    mgcItemsBody.querySelectorAll('.mgc-default-qty__btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var valEl = btn.parentNode.querySelector('.mgc-default-qty__val');
        var val = parseInt(valEl.textContent, 10) || 0;
        if (btn.dataset.action === 'inc') valEl.textContent = val + 1;
        else if (btn.dataset.action === 'dec' && val > 0) valEl.textContent = val - 1;
      });
    });

    // Default checkboxes — radio behavior handled by delegated listener on table

    if (window.lucide) lucide.createIcons();
  }

  // Clear added items on panel reset
  var _origResetMgcPanel = resetMgcPanel;
  resetMgcPanel = function() {
    _origResetMgcPanel();
    mgcAddedItems = [];
    if (mgcItemsBody) mgcItemsBody.innerHTML = '';
    if (mgcSearchInput) mgcSearchInput.value = '';
  };

  // ── MGC: Add modifier items from SKU library sub-panel ──
  var mgcSkuOverlay   = document.getElementById('mgc-sku-overlay');
  var mgcSkuBack      = document.getElementById('mgc-sku-back');
  var mgcSkuClose     = document.getElementById('mgc-sku-close');
  var mgcSkuSearch    = document.getElementById('mgc-sku-search');
  var mgcSkuSelectAll = document.getElementById('mgc-sku-select-all');
  var mgcSkuCount     = document.getElementById('mgc-sku-count');
  var mgcSkuList      = document.getElementById('mgc-sku-list');
  var mgcSkuAddBtn    = document.getElementById('mgc-sku-add');
  var mgcSkuCancelBtn = document.getElementById('mgc-sku-cancel');
  var mgcSkuItems     = [];       // full list from table
  var mgcSkuSelected  = new Set(); // indices of selected items

  // Open the SKU selection panel (hides the mgc panel behind it)
  function openMgcSkuPanel() {
    mgcSkuItems = scrapeTableItems();
    mgcSkuSelected.clear();
    mgcSkuSearch.value = '';
    mgcSkuSelectAll.checked = false;
    mgcSkuAddBtn.disabled = true;
    buildMgcSkuList(mgcSkuItems);
    // Hide the Create modifier group panel
    mgcOverlay.classList.remove('mgc-overlay--visible');
    // Show the SKU selection panel
    mgcSkuOverlay.classList.add('mgc-sku-overlay--visible');
    if (window.lucide) lucide.createIcons();
  }

  // Close the SKU selection panel (returns to the mgc panel)
  function closeMgcSkuPanel() {
    mgcSkuOverlay.classList.remove('mgc-sku-overlay--visible');
    // Restore the Create modifier group panel
    mgcOverlay.classList.add('mgc-overlay--visible');
  }

  // Build the list of SKU items with checkboxes
  function buildMgcSkuList(items) {
    mgcSkuList.innerHTML = '';
    mgcSkuCount.textContent = items.length;
    items.forEach(function(item, idx) {
      var el = document.createElement('div');
      el.className = 'mgc-sku-item';
      el.dataset.index = idx;
      var checked = mgcSkuSelected.has(idx) ? ' checked' : '';
      el.innerHTML =
        '<input type="checkbox" class="mgc-sku-item__checkbox" data-index="' + idx + '"' + checked + '>' +
        '<div class="mgc-sku-item__info">' +
          '<span class="mgc-sku-item__name">' + escapeHtml(item.skuLink || item.name) + '</span>' +
          '<span class="mgc-sku-item__code">' + escapeHtml(item.skuId) + '</span>' +
        '</div>' +
        '<span class="mgc-sku-item__price">' + escapeHtml(item.price) + '</span>';
      mgcSkuList.appendChild(el);
    });
  }

  // Update the Add button state and select-all
  function updateMgcSkuState() {
    mgcSkuAddBtn.disabled = mgcSkuSelected.size === 0;
    // Update select-all checkbox
    var visibleCheckboxes = mgcSkuList.querySelectorAll('.mgc-sku-item:not([style*="display: none"]) .mgc-sku-item__checkbox');
    var allChecked = visibleCheckboxes.length > 0;
    visibleCheckboxes.forEach(function(cb) {
      if (!cb.checked) allChecked = false;
    });
    mgcSkuSelectAll.checked = allChecked;
  }

  // Handle clicking an SKU list item (toggle checkbox)
  if (mgcSkuList) {
    mgcSkuList.addEventListener('click', function(e) {
      var item = e.target.closest('.mgc-sku-item');
      if (!item) return;
      var idx = parseInt(item.dataset.index, 10);
      var cb = item.querySelector('.mgc-sku-item__checkbox');
      if (e.target !== cb) cb.checked = !cb.checked;
      if (cb.checked) {
        mgcSkuSelected.add(idx);
        item.classList.add('mgc-sku-item--selected');
      } else {
        mgcSkuSelected.delete(idx);
        item.classList.remove('mgc-sku-item--selected');
      }
      updateMgcSkuState();
    });
  }

  // Select / deselect all
  if (mgcSkuSelectAll) {
    mgcSkuSelectAll.addEventListener('change', function() {
      var checked = mgcSkuSelectAll.checked;
      mgcSkuList.querySelectorAll('.mgc-sku-item:not([style*="display: none"])').forEach(function(item) {
        var idx = parseInt(item.dataset.index, 10);
        var cb = item.querySelector('.mgc-sku-item__checkbox');
        cb.checked = checked;
        if (checked) {
          mgcSkuSelected.add(idx);
          item.classList.add('mgc-sku-item--selected');
        } else {
          mgcSkuSelected.delete(idx);
          item.classList.remove('mgc-sku-item--selected');
        }
      });
      updateMgcSkuState();
    });
  }

  // Search filter
  if (mgcSkuSearch) {
    mgcSkuSearch.addEventListener('input', function() {
      var q = mgcSkuSearch.value.toLowerCase();
      mgcSkuList.querySelectorAll('.mgc-sku-item').forEach(function(item) {
        var name = item.querySelector('.mgc-sku-item__name').textContent.toLowerCase();
        var code = item.querySelector('.mgc-sku-item__code').textContent.toLowerCase();
        item.style.display = (name.includes(q) || code.includes(q)) ? '' : 'none';
      });
    });
  }

  // "Add from SKU library" button in the mgc panel
  var mgcAddSkuBtn = document.querySelector('.mgc-add-sku-btn');
  if (mgcAddSkuBtn) {
    mgcAddSkuBtn.addEventListener('click', function() {
      openMgcSkuPanel();
    });
  }

  // Add selected SKU items as modifier items
  if (mgcSkuAddBtn) {
    mgcSkuAddBtn.addEventListener('click', function() {
      mgcSkuSelected.forEach(function(idx) {
        var item = mgcSkuItems[idx];
        // Check not already added (by name)
        var exists = mgcAddedItems.some(function(a) { return a.name === (item.skuLink || item.name); });
        if (!exists) {
          mgcAddedItems.push({
            name: item.skuLink || item.name,
            price: item.price,
            sku: item.skuLink || '',
            skuId: item.skuId || '',
            type: 'sku',
            locked: false,
            modifiers: []
          });
        }
      });
      renderMgcItems();
      closeMgcSkuPanel();
    });
  }

  // Back / Cancel / Close buttons
  if (mgcSkuBack) mgcSkuBack.addEventListener('click', closeMgcSkuPanel);
  if (mgcSkuCancelBtn) mgcSkuCancelBtn.addEventListener('click', closeMgcSkuPanel);
  if (mgcSkuClose) mgcSkuClose.addEventListener('click', function() {
    closeMgcSkuPanel();
    closeMgcPanel();
  });

  // Apply modifier group selection to the takeover form + preview
  function applyModifierGroupSelection() {
    if (selectedModifierGroups.length > 0) {
      modifiersEmpty.style.display = 'none';
      modifiersFilled.style.display = '';
      modifiersAddAction.style.display = '';
      renderModifierGroupCards();
    } else {
      modifiersEmpty.style.display = '';
      modifiersFilled.style.display = 'none';
      modifiersFilled.innerHTML = '';
      modifiersAddAction.style.display = 'none';
    }
    renderPreviewModifiers();
    if (window.lucide) lucide.createIcons();
  }

  // ── Preview: render modifier groups in the right-side panel ──
  var previewMgContainer = document.getElementById('preview-modifier-groups');

  // Generate customer-facing rule text for the preview subtitle
  function getCustomerFacingRule(mgData) {
    // Parse rule string: "Required · Total 1 · Each 1" or "Optional · Total 0–any · Each 1"
    var rule = mgData.rule || '';
    var isRequired = rule.indexOf('Required') !== -1;
    var isOptional = rule.indexOf('Optional') !== -1;

    // Extract total min/max
    var totalMatch = rule.match(/Total\s+(\d+)(?:[–-](any|\d+))?/);
    var totalMin = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    var totalMax = totalMatch && totalMatch[2] ? (totalMatch[2] === 'any' ? Infinity : parseInt(totalMatch[2], 10)) : totalMin;

    if (isRequired) {
      if (totalMin === totalMax) {
        return 'Required — you must select ' + totalMin + (totalMin === 1 ? ' option.' : ' options.');
      } else {
        return 'Required — you must select at least ' + totalMin + ', up to ' + totalMax + ' options.';
      }
    } else {
      if (totalMax === Infinity) {
        return 'Optional — you can select any number of options.';
      } else {
        return 'Optional — you can select up to ' + totalMax + ' options.';
      }
    }
  }

  function renderPreviewModifiers() {
    if (!previewMgContainer) return;
    previewMgContainer.innerHTML = '';

    if (selectedModifierGroups.length === 0) {
      // Default placeholder
      var section = document.createElement('div');
      section.className = 'preview-card__section';
      section.innerHTML =
        '<div class="preview-card__section-header">' +
          '<div>' +
            '<div class="preview-card__section-title">Modifier group</div>' +
            '<div class="preview-card__section-subtitle">Selection rule</div>' +
          '</div>' +
          '<i data-lucide="chevron-up" class="lucide-icon" style="width:16px;height:16px;color:var(--color-text-weak)"></i>' +
        '</div>' +
        '<div class="preview-card__section-body">' +
          '<div class="preview-card__modifier-option"><div class="preview-card__modifier-radio"></div><span class="preview-card__modifier-name">Modifier</span><span class="preview-card__modifier-price">$0.00</span></div>' +
          '<div class="preview-card__modifier-option"><div class="preview-card__modifier-radio"></div><span class="preview-card__modifier-name">Modifier</span><span class="preview-card__modifier-price">$0.00</span></div>' +
          '<div class="preview-card__modifier-option"><div class="preview-card__modifier-radio"></div><span class="preview-card__modifier-name">Modifier</span><span class="preview-card__modifier-price">$0.00</span></div>' +
        '</div>';
      previewMgContainer.appendChild(section);
      return;
    }

    selectedModifierGroups.forEach(function(mgName) {
      var mgData = MODIFIER_GROUPS.find(function(g) { return g.name === mgName; });
      if (!mgData) return;

      var section = document.createElement('div');
      section.className = 'preview-card__section';

      var isRadio = mgData.type === 'Product variation';
      var customerRule = getCustomerFacingRule(mgData);

      // Header
      var header = document.createElement('div');
      header.className = 'preview-card__section-header';
      header.innerHTML =
        '<div>' +
          '<div class="preview-card__section-title">' + escapeHtml(mgData.name) + '</div>' +
          '<div class="preview-card__section-subtitle">' + escapeHtml(customerRule) + '</div>' +
        '</div>' +
        '<i data-lucide="chevron-up" class="lucide-icon" style="width:16px;height:16px;color:var(--color-text-weak)"></i>';
      section.appendChild(header);

      // Body with modifier items
      var body = document.createElement('div');
      body.className = 'preview-card__section-body';

      mgData.items.forEach(function(item) {
        var opt = document.createElement('div');
        opt.className = 'preview-card__modifier-option';
        var indicator = isRadio
          ? '<div class="preview-card__modifier-radio"></div>'
          : '<div class="preview-card__modifier-checkbox"></div>';
        opt.innerHTML =
          indicator +
          '<span class="preview-card__modifier-name">' + escapeHtml(item.name) + '</span>' +
          '<span class="preview-card__modifier-price">' + escapeHtml(item.price) + '</span>';
        body.appendChild(opt);
      });

      section.appendChild(body);

      // Toggle collapse on header click
      header.addEventListener('click', function() {
        var isHidden = body.style.display === 'none';
        body.style.display = isHidden ? '' : 'none';
        var icon = header.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', isHidden ? 'chevron-up' : 'chevron-down');
          if (window.lucide) lucide.createIcons();
        }
      });

      previewMgContainer.appendChild(section);
    });
  }

  // Render modifier group cards in the filled state
  function renderModifierGroupCards() {
    modifiersFilled.innerHTML = '';
    selectedModifierGroups.forEach(function(mgName) {
      var mgData = MODIFIER_GROUPS.find(function(g) { return g.name === mgName; });
      if (!mgData) return;

      var card = document.createElement('div');
      card.className = 'mg-card';
      card.dataset.mgName = mgName;

      // Item names summary
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
          '<button class="mg-card__dropdown-item mg-card__dropdown-edit" data-mg-name="' + escapeHtml(mgName) + '">' +
            '<i data-lucide="pencil" class="lucide-icon" style="width:16px;height:16px"></i>' +
            '<span>Edit modifier group</span>' +
          '</button>' +
          '<button class="mg-card__dropdown-item mg-card__dropdown-item--danger mg-card__dropdown-delete" data-mg-name="' + escapeHtml(mgName) + '">' +
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

      // Toggle expand/collapse on header click
      header.addEventListener('click', function(e) {
        // Don't toggle if clicking the more button or dropdown
        if (e.target.closest('.mg-card__more') || e.target.closest('.mg-card__dropdown')) return;
        card.classList.toggle('mg-card--expanded');
      });

      // Three-dots more button → toggle dropdown
      var moreBtn = header.querySelector('.mg-card__more');
      var dropdown = header.querySelector('.mg-card__dropdown');
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Close any other open dropdowns
        closeAllMgCardDropdowns();
        // Position dropdown using fixed coords
        var rect = moreBtn.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.classList.add('mg-card__dropdown--open');
      });

      // Edit button
      dropdown.querySelector('.mg-card__dropdown-edit').addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllMgCardDropdowns();
        openEditMgPanel(mgName);
      });

      // Delete button
      dropdown.querySelector('.mg-card__dropdown-delete').addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllMgCardDropdowns();
        openDeleteMgModal(mgName);
      });

      modifiersFilled.appendChild(card);
    });
  }

  // Close all open mg-card dropdown menus
  function closeAllMgCardDropdowns() {
    document.querySelectorAll('.mg-card__dropdown--open').forEach(function(d) {
      d.classList.remove('mg-card__dropdown--open');
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', function() {
    closeAllMgCardDropdowns();
  });

  // ── Delete modifier group confirmation modal ──
  var mgDeleteOverlay  = document.getElementById('mg-delete-overlay');
  var mgDeleteNameEl   = document.getElementById('mg-delete-name');
  var mgDeleteCancel   = document.getElementById('mg-delete-cancel');
  var mgDeleteConfirm  = document.getElementById('mg-delete-confirm');
  var mgDeleteTarget   = '';  // name of the group to delete

  function openDeleteMgModal(mgName) {
    mgDeleteTarget = mgName;
    mgDeleteNameEl.textContent = mgName;
    mgDeleteOverlay.classList.add('mg-delete-overlay--visible');
  }

  function closeDeleteMgModal() {
    mgDeleteOverlay.classList.remove('mg-delete-overlay--visible');
    mgDeleteTarget = '';
  }

  if (mgDeleteCancel) {
    mgDeleteCancel.addEventListener('click', closeDeleteMgModal);
  }

  if (mgDeleteConfirm) {
    mgDeleteConfirm.addEventListener('click', function() {
      if (mgDeleteTarget) {
        // Remove from selectedModifierGroups
        var idx = selectedModifierGroups.indexOf(mgDeleteTarget);
        if (idx > -1) selectedModifierGroups.splice(idx, 1);
        applyModifierGroupSelection();
      }
      closeDeleteMgModal();
    });
  }

  // Close delete modal on overlay click
  if (mgDeleteOverlay) {
    mgDeleteOverlay.addEventListener('click', function(e) {
      if (e.target === mgDeleteOverlay) closeDeleteMgModal();
    });
  }

  // ── Edit modifier group (reuse mgc-panel) ──
  var mgcPanelTitle = document.querySelector('.mgc-panel__title');
  var mgcEditingName = '';  // track which group is being edited
  var mgcSharedBanner = document.getElementById('mgc-shared-banner');
  var mgcSharedBannerClose = document.getElementById('mgc-shared-banner-close');

  // Check if a modifier group is used by other menu items (i.e. it's "shared")
  function isMgShared(mgName) {
    var tooltipData = window._tooltipItemData || {};
    var count = 0;
    Object.keys(tooltipData).forEach(function(itemName) {
      var data = tooltipData[itemName];
      if (data.modifiers && data.modifiers.indexOf(mgName) > -1) {
        count++;
      }
    });
    // Shared if used by at least 1 other menu item (from master data)
    return count > 0;
  }

  // Dismiss banner
  if (mgcSharedBannerClose) {
    mgcSharedBannerClose.addEventListener('click', function() {
      if (mgcSharedBanner) mgcSharedBanner.style.display = 'none';
    });
  }

  function openEditMgPanel(mgName) {
    var mgData = MODIFIER_GROUPS.find(function(g) { return g.name === mgName; });
    if (!mgData) return;

    mgcEditingName = mgName;

    // Open the panel (resets all fields first)
    openMgcPanel('edit');

    // Change title to "Edit modifier group"
    if (mgcPanelTitle) mgcPanelTitle.textContent = 'Edit modifier group';

    // Pre-fill Display name
    var dispName = document.getElementById('mgc-display-name');
    if (dispName) dispName.value = mgData.name;

    // Pre-fill Internal name (use name as fallback)
    var intName = document.getElementById('mgc-internal-name');
    if (intName) intName.value = mgData.name;

    // Select the correct type card
    if (mgData.type) {
      mgcTypeGrid.querySelectorAll('.mgc-type-card').forEach(function(c) {
        var cardName = c.querySelector('.mgc-type-card__name');
        if (cardName && cardName.textContent.trim() === mgData.type) {
          c.classList.add('mgc-type-card--selected');
        }
      });
    }

    // Parse rule to set dropdowns (e.g. "Required · Total 1 · Each 1")
    if (mgData.rule) {
      var ruleStr = mgData.rule;
      // Parse total min/max from rule
      var totalMatch = ruleStr.match(/Total\s+(\d+)(?:\s*[-–]\s*(\d+))?/i);
      if (totalMatch) {
        var totalVal = totalMatch[1];
        if (ruleStr.indexOf('Required') > -1) {
          mgcTotalMin.value = totalVal;
        } else {
          mgcTotalMin.value = '0';
        }
        mgcTotalMax.value = totalMatch[2] || totalVal;
      }
      // Parse each/maxPer
      var eachMatch = ruleStr.match(/Each\s+(\d+)/i);
      if (eachMatch) {
        mgcMaxPer.value = eachMatch[1];
      }
      // Trigger rule updates
      updateMgcRules();
      updateMgcDefaultCell();
    }

    // Populate modifier items
    mgcAddedItems = [];
    mgData.items.forEach(function(item) {
      mgcAddedItems.push({
        name: item.name,
        price: item.price,
        sku: '',
        skuId: '',
        type: 'manual',
        locked: false,
        modifiers: []
      });
    });
    renderMgcItems();

    // Show shared banner + change button text if this group is used by other items
    if (isMgShared(mgName)) {
      if (mgcSharedBanner) mgcSharedBanner.style.display = '';
      mgcConfirmBtn.textContent = 'Save & apply to all';
    } else {
      if (mgcSharedBanner) mgcSharedBanner.style.display = 'none';
      mgcConfirmBtn.textContent = 'Confirm';
    }

    if (window.lucide) lucide.createIcons();
  }

  // Override the close/cancel to restore title
  var _origCloseMgcPanel = closeMgcPanel;
  closeMgcPanel = function() {
    _origCloseMgcPanel();
    // Restore title
    if (mgcPanelTitle) mgcPanelTitle.textContent = 'Create modifier group';
    mgcEditingName = '';
    // Reset shared banner and button text
    if (mgcSharedBanner) mgcSharedBanner.style.display = 'none';
    mgcConfirmBtn.textContent = 'Confirm';
  };

  // Add modifier group button (empty state)
  if (modifiersAddBtn) {
    modifiersAddBtn.addEventListener('click', openMgModal);
  }

  // Add modifier group button (header action, when filled)
  if (modifiersAddMoreBtn) {
    modifiersAddMoreBtn.addEventListener('click', openMgModal);
  }

  // Reset modifier groups in resetForm — monkey-patch again
  var _origResetForm2 = resetForm;
  resetForm = function() {
    _origResetForm2();
    selectedModifierGroups = [];
    modifiersEmpty.style.display = '';
    modifiersFilled.style.display = 'none';
    modifiersFilled.innerHTML = '';
    modifiersAddAction.style.display = 'none';
    renderPreviewModifiers();
  };

  // ── Keyboard: Escape to close modal/takeover ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mgcOverlay.classList.contains('mgc-overlay--visible')) {
        closeMgcPanel();
      } else if (cfmOverlay.classList.contains('cfm-modal-overlay--visible')) {
        closeCfmModal();
      } else if (mgOverlay.classList.contains('mg-modal-overlay--visible')) {
        closeMgModal();
      } else if (catOverlay.classList.contains('cat-modal-overlay--visible')) {
        closeCatModal();
      } else if (overlay.classList.contains('sku-modal-overlay--visible')) {
        closeSkuModal();
      } else if (takeover.classList.contains('takeover--visible')) {
        closeTakeover();
      }
    }
  });

  // Expose for use by edit-menu.js
  window.openAddItemFlow = function () { openSkuModal('add'); };
});
