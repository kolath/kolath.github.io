/* ===== EDIT MENU PAGE TAKEOVER ===== */
document.addEventListener('DOMContentLoaded', function () {
  var takeover = document.getElementById('edit-menu-takeover');
  var closeBtn = document.getElementById('edit-menu-close');
  var titleEl = document.getElementById('edit-menu-title');
  var sectionTitleEl = document.getElementById('edit-menu-section-title');
  var categoriesContainer = document.getElementById('edit-menu-categories');

  if (!takeover) return;

  var currentMenuName = null;

  /* ================================================================
     DATA MODEL — mirrors the real prototype tables
     ================================================================ */

  var menuItems = {
    'Coke Can':                 { thumb: 'cola.jpg',           contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$2.99' },
    'Sprite Can':               { thumb: 'sprite.jpg',         contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$2.99' },
    'Kool-Aid':                 { thumb: 'juice.jpg',          contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$3.99' },
    'Cakes':                    { thumb: 'cake.jpg',           contains: '1 modifier group',  locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$5.49' },
    'Salsa':                    { thumb: 'salsa.jpg',          contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$0.49' },
    'Toast (Two)':              { thumb: 'toast.jpg',          contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$1.49' },
    'Hash Brown':               { thumb: 'hashbrown.jpg',      contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$2.99' },
    'Bacon (Two)':              { thumb: 'bacon.jpg',          contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$2.99' },
    'Sausage':                  { thumb: 'sausage.jpg',        contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$2.99' },
    'Pancake':                  { thumb: 'pancake.jpg',        contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$3.49' },
    'Waffle':                   { thumb: 'waffle.jpg',         contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$3.49' },
    'French Toast':             { thumb: 'french-toast.jpg',   contains: '0 modifier groups', locations: '1 location', stations: '1 station profile', channels: '2 channels', price: '$3.49' },
    'Waffle Breakfast Plate':   { thumb: 'breakfast-plate.jpg',contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$15.49' },
    'Chicken and Waffles Plate':{ thumb: 'breakfast-plate.jpg',contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$15.49' },
    'Pancake Breakfast Plate':  { thumb: 'breakfast-plate.jpg',contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$15.49' },
    'Big Breakfast Plate':      { thumb: 'breakfast-plate.jpg',contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$15.49' },
    'French Toast Plate':       { thumb: 'breakfast-plate.jpg',contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$15.49' },
    'Eggy Taco':                { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$4.99' },
    'Hammy Eggy Taco':          { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$4.99' },
    'Porky Eggy Taco':          { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$4.99' },
    'Eggy Sausage Taco':        { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$4.99' },
    'Veggie Eggy Taco':         { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$4.99' },
    'Biggy Eggy Taco':          { thumb: 'taco.jpg',           contains: '2 modifier groups', locations: '1 location', stations: '1 station profile', channels: '3 channels', price: '$5.99' }
  };

  var categories = {
    'Drinks':           ['Coke Can', 'Sprite Can', 'Kool-Aid'],
    'Desserts':         ['Cakes'],
    'Sides':            ['Salsa', 'Toast (Two)', 'Hash Brown', 'Bacon (Two)', 'Sausage', 'Pancake', 'Waffle', 'French Toast'],
    'Breakfast plate':  ['Waffle Breakfast Plate', 'Chicken and Waffles Plate', 'Pancake Breakfast Plate', 'Big Breakfast Plate', 'French Toast Plate'],
    'Breakfast tacos':  ['Eggy Taco', 'Hammy Eggy Taco', 'Porky Eggy Taco', 'Eggy Sausage Taco', 'Veggie Eggy Taco', 'Biggy Eggy Taco']
  };

  var menus = {
    'All Day Menu': {
      sectionTitle: 'All Day Menu',
      categories: ['Drinks', 'Desserts', 'Sides', 'Breakfast plate', 'Breakfast tacos'],
      info: {
        displayName: 'All Day Menu',
        internalName: 'All Day Menu',
        description: 'Full-day menu offering',
        cuisineType: 'American',
        fulfillmentMode: 'Dine-in, Pickup, Delivery',
        locations: '1 location',
        channels: '2 channels'
      }
    },
    'Drink Menu': {
      sectionTitle: 'Drink Menu',
      categories: ['Drinks'],
      info: {
        displayName: 'Drink Menu',
        internalName: 'Drink Menu',
        description: 'Beverages',
        cuisineType: 'Beverages',
        fulfillmentMode: 'Dine-in, Pickup',
        locations: '1 location',
        channels: '2 channels'
      }
    }
  };

  /* ================================================================
     HTML GENERATORS
     ================================================================ */

  /** Build a hoverable cell that shows a tooltip on hover */
  function hoverableCell(label, tooltipItems) {
    if (!tooltipItems || tooltipItems.length === 0) return label;
    var escaped = JSON.stringify(tooltipItems).replace(/"/g, '&quot;');
    return '<div class="cell-hoverable" data-tooltip-items="' + escaped + '"><span class="cell-hoverable__text">' + label + '</span></div>';
  }

  /** Look up tooltip detail arrays from the shared tooltips.js data */
  function getTooltipData(name) {
    var td = window._tooltipItemData && window._tooltipItemData[name];
    if (!td) return null;
    return td;
  }

  /** Build a count label like "2 channels" or "1 station profile" */
  function pluralLabel(count, singular, plural) {
    return count + ' ' + (count === 1 ? singular : plural);
  }

  function buildItemRow(name) {
    var item = menuItems[name];
    if (!item) return '';
    var td = getTooltipData(name);

    // Derive display labels from tooltip data so counts always match
    var containsLabel = item.contains;
    var locationsLabel = item.locations;
    var stationsLabel = item.stations;
    var channelsLabel = item.channels;

    if (td) {
      if (td.modifiers) {
        containsLabel = pluralLabel(td.modifiers.length, 'modifier group', 'modifier groups');
      }
      if (td.stations) {
        stationsLabel = pluralLabel(td.stations.length, 'station profile', 'station profiles');
      }
      if (td.channels) {
        channelsLabel = pluralLabel(td.channels.length, 'channel', 'channels');
      }
    }

    var containsHtml = containsLabel;
    var locationsHtml = locationsLabel;
    var stationsHtml = stationsLabel;
    var channelsHtml = channelsLabel;

    if (td) {
      if (td.modifiers && td.modifiers.length > 0) {
        containsHtml = hoverableCell(containsLabel, td.modifiers);
      }
      if (td.location) {
        locationsHtml = hoverableCell(locationsLabel, [td.location]);
      }
      if (td.stations && td.stations.length > 0) {
        stationsHtml = hoverableCell(stationsLabel, td.stations);
      }
      if (td.channels && td.channels.length > 0) {
        channelsHtml = hoverableCell(channelsLabel, td.channels);
      }
    }

    return '' +
      '<tr data-item="' + name + '">' +
        '<td class="cat-col-drag"><span class="cat-drag-handle"><i data-lucide="grip-vertical" class="lucide-icon" style="width:16px;height:16px"></i></span></td>' +
        '<td class="cat-col-checkbox"><input type="checkbox" class="table-checkbox"></td>' +
        '<td>' +
          '<div class="cat-item-name">' +
            '<div class="cat-item-thumb"><img src="assets/thumbnails/' + item.thumb + '" alt="' + name + '"></div>' +
            '<span class="cat-item-label">' + name + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + containsHtml + '</td>' +
        '<td>' + locationsHtml + '</td>' +
        '<td>' + stationsHtml + '</td>' +
        '<td>' + channelsHtml + '</td>' +
        '<td>' + item.price + '</td>' +
        '<td class="cat-col-actions">' +
          '<div class="row-action">' +
            '<button class="row-action__trigger" aria-label="Row actions">' +
              '<i data-lucide="ellipsis-vertical" class="lucide-icon" style="width:16px;height:16px;color:var(--color-text-weak)"></i>' +
            '</button>' +
            '<div class="row-action__menu">' +
              '<button class="row-action__item"><i data-lucide="arrow-up-from-line" class="lucide-icon" style="width:14px;height:14px"></i><span>Remove from category</span></button>' +
            '</div>' +
          '</div>' +
        '</td>' +
      '</tr>';
  }

  function buildCategoryCard(catName) {
    var items = categories[catName];
    if (!items) return '';

    var rowsHtml = '';
    for (var i = 0; i < items.length; i++) {
      rowsHtml += buildItemRow(items[i]);
    }

    return '' +
      '<div class="category-card">' +
        '<div class="category-card__header">' +
          '<span class="category-card__name">' + catName + '</span>' +
          '<div class="category-card__actions">' +
            '<button class="btn btn--secondary edit-cat-btn" data-category="' + catName + '">' +
              '<span class="btn__icon btn__icon--leading"><i data-lucide="pencil" class="lucide-icon" style="width:14px;height:14px"></i></span>' +
              '<span>Edit category</span>' +
            '</button>' +
            '<button class="btn btn--secondary add-item-btn" data-category="' + catName + '">' +
              '<span class="btn__icon btn__icon--leading"><i data-lucide="plus" class="lucide-icon" style="width:14px;height:14px"></i></span>' +
              '<span>Add item</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="category-card__table-wrapper">' +
          '<table class="category-table">' +
            '<thead><tr>' +
              '<th class="cat-col-drag"></th>' +
              '<th class="cat-col-checkbox"><input type="checkbox" class="table-checkbox"></th>' +
              '<th class="cat-col-display-name">Display name</th>' +
              '<th class="cat-col-contains">Contains</th>' +
              '<th class="cat-col-locations">Locations</th>' +
              '<th class="cat-col-station-profiles">Station profiles</th>' +
              '<th class="cat-col-channels">Channels</th>' +
              '<th class="cat-col-price">Price</th>' +
              '<th class="cat-col-actions"></th>' +
            '</tr></thead>' +
            '<tbody data-category="' + catName + '">' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  /* ================================================================
     OPEN / CLOSE
     ================================================================ */

  function openEditMenu(menuName) {
    var data = menus[menuName];
    if (!data) data = menus['All Day Menu'];
    currentMenuName = menuName;

    // Header
    titleEl.textContent = 'Edit ' + menuName;
    sectionTitleEl.textContent = data.sectionTitle;

    // Right-panel info
    var info = data.info;
    setText('edit-menu-info-display-name', info.displayName);
    setText('edit-menu-info-internal-name', info.internalName);
    setText('edit-menu-info-description', info.description);
    setText('edit-menu-info-cuisine', info.cuisineType);
    setText('edit-menu-info-fulfillment', info.fulfillmentMode);

    // Locations & Channels — make hoverable with tooltip
    var menuTooltip = window._tooltipMenuData && window._tooltipMenuData[menuName];
    setHoverableValue('edit-menu-info-locations', info.locations, menuTooltip && menuTooltip.locations);
    setHoverableValue('edit-menu-info-channels', info.channels, menuTooltip && menuTooltip.channels);

    // Build category cards
    var html = '';
    for (var i = 0; i < data.categories.length; i++) {
      html += buildCategoryCard(data.categories[i]);
    }
    categoriesContainer.innerHTML = html;

    // Show takeover
    takeover.classList.add('edit-menu-takeover--open');
    document.body.style.overflow = 'hidden';

    // Re-init icons + row-action menus + item drag
    if (window.lucide) lucide.createIcons();
    initTakeoverRowActions();
    initItemDragDrop();
  }

  /** Set a sidebar info value as a hoverable tooltip trigger, or plain text if no items */
  function setHoverableValue(id, label, tooltipItems) {
    var el = document.getElementById(id);
    if (!el) return;
    if (tooltipItems && tooltipItems.length > 0) {
      var escaped = JSON.stringify(tooltipItems).replace(/"/g, '&quot;');
      el.innerHTML = '<span class="cell-hoverable" data-tooltip-items="' + escaped + '"><span class="cell-hoverable__text">' + label + '</span></span>';
    } else {
      el.textContent = label;
    }
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function closeEditMenu() {
    takeover.classList.remove('edit-menu-takeover--open');
    document.body.style.overflow = '';
    currentMenuName = null;
  }

  closeBtn.addEventListener('click', closeEditMenu);

  /* ================================================================
     ROW-ACTION MENUS INSIDE TAKEOVER
     ================================================================ */

  function initTakeoverRowActions() {
    takeover.querySelectorAll('.row-action__trigger').forEach(function (trigger) {
      var fresh = trigger.cloneNode(true);
      trigger.parentNode.replaceChild(fresh, trigger);

      fresh.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = fresh.closest('.row-action').querySelector('.row-action__menu');
        var isOpen = menu.classList.contains('row-action__menu--open');

        takeover.querySelectorAll('.row-action__menu--open').forEach(function (m) {
          m.classList.remove('row-action__menu--open');
        });

        if (!isOpen) {
          var rect = fresh.getBoundingClientRect();
          menu.style.position = 'fixed';
          menu.style.top = rect.bottom + 4 + 'px';
          menu.style.left = (rect.right - 200) + 'px';
          menu.classList.add('row-action__menu--open');
        }
      });
    });

    takeover.addEventListener('click', function (e) {
      if (!e.target.closest('.row-action')) {
        takeover.querySelectorAll('.row-action__menu--open').forEach(function (m) {
          m.classList.remove('row-action__menu--open');
        });
      }
    });
  }

  /* ================================================================
     ITEM DRAG-AND-DROP WITHIN CATEGORY TABLES
     ================================================================ */

  function initItemDragDrop() {
    var tbodies = takeover.querySelectorAll('.category-table tbody');

    tbodies.forEach(function (tbody) {
      var draggedRow = null;

      // Enable draggable only via the grip handle
      tbody.querySelectorAll('.cat-drag-handle').forEach(function (handle) {
        handle.addEventListener('mousedown', function () {
          var row = handle.closest('tr');
          if (row) row.setAttribute('draggable', 'true');
        });
      });

      // Disable draggable after drag ends or mouse leaves
      tbody.addEventListener('mouseup', function () {
        tbody.querySelectorAll('tr[draggable]').forEach(function (r) {
          r.removeAttribute('draggable');
        });
      });

      tbody.addEventListener('dragstart', function (e) {
        var row = e.target.closest('tr[data-item]');
        if (!row) return;
        draggedRow = row;
        row.classList.add('cat-row--dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', row.getAttribute('data-item'));
      });

      tbody.addEventListener('dragend', function (e) {
        var row = e.target.closest('tr[data-item]');
        if (row) {
          row.classList.remove('cat-row--dragging');
          row.removeAttribute('draggable');
        }
        draggedRow = null;
        tbody.querySelectorAll('.cat-row--drag-over').forEach(function (el) {
          el.classList.remove('cat-row--drag-over');
        });
      });

      tbody.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var row = e.target.closest('tr[data-item]');
        if (row && row !== draggedRow && draggedRow) {
          tbody.querySelectorAll('.cat-row--drag-over').forEach(function (el) {
            el.classList.remove('cat-row--drag-over');
          });
          row.classList.add('cat-row--drag-over');
        }
      });

      tbody.addEventListener('dragleave', function (e) {
        var row = e.target.closest('tr[data-item]');
        if (row) row.classList.remove('cat-row--drag-over');
      });

      tbody.addEventListener('drop', function (e) {
        e.preventDefault();
        var row = e.target.closest('tr[data-item]');
        if (row) row.classList.remove('cat-row--drag-over');
        if (draggedRow && row && draggedRow !== row) {
          var allRows = Array.prototype.slice.call(tbody.querySelectorAll('tr[data-item]'));
          var draggedIdx = allRows.indexOf(draggedRow);
          var targetIdx = allRows.indexOf(row);

          if (draggedIdx < targetIdx) {
            tbody.insertBefore(draggedRow, row.nextSibling);
          } else {
            tbody.insertBefore(draggedRow, row);
          }

          // Update data model
          var catName = tbody.getAttribute('data-category');
          if (catName && categories[catName]) {
            var newOrder = [];
            tbody.querySelectorAll('tr[data-item]').forEach(function (tr) {
              newOrder.push(tr.getAttribute('data-item'));
            });
            categories[catName] = newOrder;
          }
        }
      });
    });
  }

  /* ================================================================
     REORDER CATEGORIES MODAL
     ================================================================ */

  var reorderOverlay  = document.getElementById('reorder-modal-overlay');
  var reorderCloseBtn = document.getElementById('reorder-modal-close');
  var reorderCancel   = document.getElementById('reorder-modal-cancel');
  var reorderSave     = document.getElementById('reorder-modal-save');
  var reorderList     = document.getElementById('reorder-modal-list');
  var reorderMenuName = document.getElementById('reorder-modal-menu-name');
  var reorderMenuCount = document.getElementById('reorder-modal-menu-count');
  var reorderBtn      = document.getElementById('edit-menu-reorder-btn');

  function openReorderModal() {
    if (!currentMenuName) return;
    var data = menus[currentMenuName];
    if (!data) return;

    // Populate menu info card
    reorderMenuName.textContent = data.sectionTitle;
    var catCount = data.categories.length;
    reorderMenuCount.textContent = catCount + ' categor' + (catCount === 1 ? 'y' : 'ies');

    // Build draggable list
    var html = '';
    for (var i = 0; i < data.categories.length; i++) {
      var catName = data.categories[i];
      html +=
        '<div class="reorder-modal__item" draggable="true" data-category="' + catName + '">' +
          '<span class="reorder-modal__item-drag">' +
            '<i data-lucide="grip-vertical" class="lucide-icon" style="width:16px;height:16px;color:#141414"></i>' +
          '</span>' +
          '<span class="reorder-modal__item-name">' + catName + '</span>' +
        '</div>';
    }
    reorderList.innerHTML = html;

    if (window.lucide) lucide.createIcons();
    initReorderDragDrop();

    reorderOverlay.classList.add('reorder-modal-overlay--visible');
  }

  function closeReorderModal() {
    reorderOverlay.classList.remove('reorder-modal-overlay--visible');
  }

  // Bind open
  if (reorderBtn) {
    reorderBtn.addEventListener('click', openReorderModal);
  }

  // Close triggers
  if (reorderCloseBtn) reorderCloseBtn.addEventListener('click', closeReorderModal);
  if (reorderCancel) reorderCancel.addEventListener('click', closeReorderModal);
  if (reorderOverlay) {
    reorderOverlay.addEventListener('click', function (e) {
      if (e.target === reorderOverlay) closeReorderModal();
    });
  }

  // Save: apply new order and re-render
  if (reorderSave) {
    reorderSave.addEventListener('click', function () {
      var items = reorderList.querySelectorAll('.reorder-modal__item');
      var newOrder = [];
      for (var i = 0; i < items.length; i++) {
        newOrder.push(items[i].getAttribute('data-category'));
      }

      // Update data model
      if (currentMenuName && menus[currentMenuName]) {
        menus[currentMenuName].categories = newOrder;
      }

      // Re-render category cards
      var html = '';
      for (var j = 0; j < newOrder.length; j++) {
        html += buildCategoryCard(newOrder[j]);
      }
      categoriesContainer.innerHTML = html;

      if (window.lucide) lucide.createIcons();
      initTakeoverRowActions();
      initItemDragDrop();

      closeReorderModal();
    });
  }

  /* Drag-and-drop for reorder list */
  function initReorderDragDrop() {
    var draggedEl = null;

    var items = reorderList.querySelectorAll('.reorder-modal__item');
    items.forEach(function (item) {

      item.addEventListener('dragstart', function (e) {
        draggedEl = item;
        item.classList.add('reorder-modal__item--dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.getAttribute('data-category'));
      });

      item.addEventListener('dragend', function () {
        item.classList.remove('reorder-modal__item--dragging');
        draggedEl = null;
        reorderList.querySelectorAll('.reorder-modal__item--drag-over').forEach(function (el) {
          el.classList.remove('reorder-modal__item--drag-over');
        });
      });

      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (item !== draggedEl) {
          reorderList.querySelectorAll('.reorder-modal__item--drag-over').forEach(function (el) {
            el.classList.remove('reorder-modal__item--drag-over');
          });
          item.classList.add('reorder-modal__item--drag-over');
        }
      });

      item.addEventListener('dragleave', function () {
        item.classList.remove('reorder-modal__item--drag-over');
      });

      item.addEventListener('drop', function (e) {
        e.preventDefault();
        item.classList.remove('reorder-modal__item--drag-over');
        if (draggedEl && draggedEl !== item) {
          var allItems = Array.prototype.slice.call(reorderList.children);
          var draggedIdx = allItems.indexOf(draggedEl);
          var targetIdx = allItems.indexOf(item);

          if (draggedIdx < targetIdx) {
            reorderList.insertBefore(draggedEl, item.nextSibling);
          } else {
            reorderList.insertBefore(draggedEl, item);
          }
        }
      });
    });
  }

  /* ================================================================
     ADD ITEM TO CATEGORY MODAL
     ================================================================ */

  var addItemOverlay   = document.getElementById('additem-modal-overlay');
  var addItemCloseBtn  = document.getElementById('additem-modal-close');
  var addItemCancel    = document.getElementById('additem-modal-cancel');
  var addItemAddBtn    = document.getElementById('additem-modal-add');
  var addItemList      = document.getElementById('additem-modal-list');
  var addItemSearch    = document.getElementById('additem-modal-search');
  var addItemEmpty     = document.getElementById('additem-modal-empty');
  var addItemCreateNew = document.getElementById('additem-modal-create-new');
  var addItemBanner    = document.getElementById('additem-shared-banner');
  var addItemTitle     = document.getElementById('additem-modal-title');
  var addItemTargetCategory = null;

  function openAddItemModal(catName) {
    addItemTargetCategory = catName;

    // Set dynamic title
    if (addItemTitle) addItemTitle.textContent = 'Add menu item to ' + catName;

    // Get items already in this category
    var existing = categories[catName] || [];

    // Build checklist from all menuItems not already in this category
    var html = '';
    var keys = Object.keys(menuItems);
    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      if (existing.indexOf(name) !== -1) continue; // skip items already in category
      var item = menuItems[name];
      html +=
        '<label class="additem-modal__item" data-name="' + name.toLowerCase() + '">' +
          '<input type="checkbox" class="additem-modal__item-checkbox" value="' + name + '">' +
          '<div class="additem-modal__item-thumb"><img src="assets/thumbnails/' + item.thumb + '" alt="' + name + '"></div>' +
          '<div class="additem-modal__item-info">' +
            '<span class="additem-modal__item-name">' + name + '</span>' +
          '</div>' +
          '<span class="additem-modal__item-price">' + item.price + '</span>' +
        '</label>';
    }
    addItemList.innerHTML = html;

    // Reset search
    if (addItemSearch) addItemSearch.value = '';
    if (addItemEmpty) addItemEmpty.classList.remove('additem-modal__empty--visible');

    // Disable Add button initially
    if (addItemAddBtn) addItemAddBtn.disabled = true;

    // Show shared-categories banner each time modal opens
    if (addItemBanner) addItemBanner.style.display = '';

    // Show modal
    addItemOverlay.classList.add('additem-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();

    // Bind checkbox change to enable/disable Add button
    addItemList.querySelectorAll('.additem-modal__item-checkbox').forEach(function (cb) {
      cb.addEventListener('change', updateAddItemBtn);
    });
  }

  function closeAddItemModal() {
    addItemOverlay.classList.remove('additem-modal-overlay--visible');
    addItemTargetCategory = null;
  }

  function updateAddItemBtn() {
    var checked = addItemList.querySelectorAll('.additem-modal__item-checkbox:checked');
    if (addItemAddBtn) addItemAddBtn.disabled = checked.length === 0;
  }

  // Search filter
  if (addItemSearch) {
    addItemSearch.addEventListener('input', function () {
      var query = addItemSearch.value.toLowerCase().trim();
      var items = addItemList.querySelectorAll('.additem-modal__item');
      var visibleCount = 0;
      items.forEach(function (item) {
        var name = item.getAttribute('data-name');
        var match = !query || name.indexOf(query) !== -1;
        item.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });
      if (addItemEmpty) {
        if (visibleCount === 0) {
          addItemEmpty.classList.add('additem-modal__empty--visible');
        } else {
          addItemEmpty.classList.remove('additem-modal__empty--visible');
        }
      }
    });
  }

  // Banner dismiss
  if (addItemBanner) {
    var bannerClose = addItemBanner.querySelector('.shared-banner__close');
    if (bannerClose) bannerClose.addEventListener('click', function () {
      addItemBanner.style.display = 'none';
    });
  }

  // Close triggers
  if (addItemCloseBtn) addItemCloseBtn.addEventListener('click', closeAddItemModal);
  if (addItemCancel) addItemCancel.addEventListener('click', closeAddItemModal);
  if (addItemOverlay) {
    addItemOverlay.addEventListener('click', function (e) {
      if (e.target === addItemOverlay) closeAddItemModal();
    });
  }

  // Add selected items to category
  if (addItemAddBtn) {
    addItemAddBtn.addEventListener('click', function () {
      var checked = addItemList.querySelectorAll('.additem-modal__item-checkbox:checked');
      if (!addItemTargetCategory || checked.length === 0) return;

      var catItems = categories[addItemTargetCategory] || [];
      checked.forEach(function (cb) {
        var itemName = cb.value;
        if (catItems.indexOf(itemName) === -1) {
          catItems.push(itemName);
        }
      });
      categories[addItemTargetCategory] = catItems;

      // Re-render category cards
      reRenderCategories();
      closeAddItemModal();
    });
  }

  // Create new menu item
  if (addItemCreateNew) {
    addItemCreateNew.addEventListener('click', function () {
      closeAddItemModal();
      closeEditMenu();
      if (window.openAddItemFlow) {
        window.openAddItemFlow();
      }
    });
  }

  /** Re-render all category cards for the current menu */
  function reRenderCategories() {
    if (!currentMenuName || !menus[currentMenuName]) return;
    var catList = menus[currentMenuName].categories;
    var html = '';
    for (var i = 0; i < catList.length; i++) {
      html += buildCategoryCard(catList[i]);
    }
    categoriesContainer.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    initTakeoverRowActions();
    initItemDragDrop();
  }

  /* ================================================================
     EDIT CATEGORY / ADD ITEM — EVENT DELEGATION
     ================================================================ */

  /** Open the category edit takeover, raising its z-index above the edit-menu overlay */
  function openCategoryEdit(catName) {
    if (!window.openCatTakeover) return;

    // The #cat-takeover has z-index 900, below edit-menu's 1000.
    // Temporarily boost it so it appears on top.
    var catTakeover = document.getElementById('cat-takeover');
    if (catTakeover) catTakeover.style.zIndex = '1100';

    window.openCatTakeover({ name: catName, internalName: catName });

    // Watch for the category takeover to close and restore z-index
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (!catTakeover.classList.contains('takeover--visible')) {
            catTakeover.style.zIndex = '';
            observer.disconnect();
          }
        }
      });
    });
    observer.observe(catTakeover, { attributes: true });
  }

  takeover.addEventListener('click', function (e) {
    // Edit category button
    var editBtn = e.target.closest('.edit-cat-btn');
    if (editBtn) {
      var catName = editBtn.getAttribute('data-category');
      if (catName) openCategoryEdit(catName);
      return;
    }

    // Add item button
    var addBtn = e.target.closest('.add-item-btn');
    if (addBtn) {
      var catName2 = addBtn.getAttribute('data-category');
      if (catName2) {
        openAddItemModal(catName2);
      }
      return;
    }
  });

  /* ================================================================
     ESCAPE KEY (modal-first priority)
     ================================================================ */

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (addItemOverlay && addItemOverlay.classList.contains('additem-modal-overlay--visible')) {
        closeAddItemModal();
      } else if (reorderOverlay && reorderOverlay.classList.contains('reorder-modal-overlay--visible')) {
        closeReorderModal();
      } else if (takeover.classList.contains('edit-menu-takeover--open')) {
        closeEditMenu();
      }
    }
  });

  /* ================================================================
     BIND MENUS TABLE ROWS (event delegation)
     ================================================================ */

  var menusTable = document.getElementById('menus-data-table');
  if (menusTable) {
    menusTable.addEventListener('click', function (e) {
      if (e.target.closest('.row-action') || e.target.classList.contains('table-checkbox') || e.target.closest('th')) return;
      var row = e.target.closest('tbody tr');
      if (!row) return;
      var nameCell = row.querySelector('.cell-name-text');
      var menuName = nameCell ? nameCell.textContent.trim() : 'Menu';
      openEditMenu(menuName);
    });
  }

  window.openEditMenu = openEditMenu;

  /* ================================================================
     ADD MENU METHOD MODAL
     ================================================================ */

  var addMenuOverlay   = document.getElementById('addmenu-modal-overlay');
  var addMenuCloseBtn  = document.getElementById('addmenu-modal-close');
  var addMenuCancel    = document.getElementById('addmenu-modal-cancel');
  var addMenuContinue  = document.getElementById('addmenu-modal-continue');

  function openAddMenuModal() {
    if (!addMenuOverlay) return;
    // Reset selection
    addMenuOverlay.querySelectorAll('.addmenu-tile').forEach(function (t) {
      t.classList.remove('addmenu-tile--selected');
    });
    addMenuOverlay.querySelectorAll('.addmenu-tile__radio').forEach(function (r) {
      r.checked = false;
    });
    if (addMenuContinue) addMenuContinue.disabled = true;

    addMenuOverlay.classList.add('addmenu-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
  }

  function closeAddMenuModal() {
    if (addMenuOverlay) addMenuOverlay.classList.remove('addmenu-modal-overlay--visible');
  }

  // Tile selection via radio change
  if (addMenuOverlay) {
    addMenuOverlay.querySelectorAll('.addmenu-tile__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        addMenuOverlay.querySelectorAll('.addmenu-tile').forEach(function (t) {
          t.classList.remove('addmenu-tile--selected');
        });
        var tile = radio.closest('.addmenu-tile');
        if (tile) tile.classList.add('addmenu-tile--selected');
        if (addMenuContinue) addMenuContinue.disabled = false;
      });
    });
  }

  // Close triggers
  if (addMenuCloseBtn) addMenuCloseBtn.addEventListener('click', closeAddMenuModal);
  if (addMenuCancel) addMenuCancel.addEventListener('click', closeAddMenuModal);
  if (addMenuOverlay) {
    addMenuOverlay.addEventListener('click', function (e) {
      if (e.target === addMenuOverlay) closeAddMenuModal();
    });
  }

  // Continue → check which tile is selected and act accordingly
  if (addMenuContinue) {
    addMenuContinue.addEventListener('click', function () {
      var selectedRadio = addMenuOverlay.querySelector('.addmenu-tile__radio:checked');
      var selectedValue = selectedRadio ? selectedRadio.value : '';
      closeAddMenuModal();

      if (selectedValue === 'create') {
        openMenuTakeover();
      }
      // Other tiles (import, upload) can be wired later
    });
  }

  // Intercept "+ Add menu" button click on the Menus tab
  var addEntityBtn = document.querySelector('.section-header__actions .btn');
  if (addEntityBtn) {
    addEntityBtn.addEventListener('click', function (e) {
      var activeTab = document.querySelector('.pill-tab--selected');
      if (activeTab && activeTab.getAttribute('data-tab') === 'menus') {
        e.preventDefault();
        e.stopImmediatePropagation();
        openAddMenuModal();
      }
    });
  }

  /* ================================================================
     ADD MENU PAGE TAKEOVER
     ================================================================ */

  var menuTakeover      = document.getElementById('menu-takeover');
  var menuTakeoverClose = document.getElementById('menu-takeover-close');
  var menuTakeoverSave  = document.getElementById('menu-takeover-save');
  var menuTakeoverSavePublish = document.getElementById('menu-takeover-save-publish');
  var menuDescField     = document.getElementById('menu-field-description');
  var menuDescCount     = document.getElementById('menu-field-description-count');

  function openMenuTakeover() {
    if (!menuTakeover) return;
    menuTakeover.classList.add('takeover--visible');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
    updateMenuDescCount();
  }

  function closeMenuTakeover() {
    if (!menuTakeover) return;
    menuTakeover.classList.remove('takeover--visible');
    document.body.style.overflow = '';
  }

  // Close button
  if (menuTakeoverClose) {
    menuTakeoverClose.addEventListener('click', closeMenuTakeover);
  }

  // Save → just close for prototype
  if (menuTakeoverSave) {
    menuTakeoverSave.addEventListener('click', closeMenuTakeover);
  }
  if (menuTakeoverSavePublish) {
    menuTakeoverSavePublish.addEventListener('click', closeMenuTakeover);
  }

  // Description character count
  function updateMenuDescCount() {
    if (!menuDescField || !menuDescCount) return;
    var len = menuDescField.value.length;
    var max = parseInt(menuDescField.getAttribute('maxlength')) || 200;
    menuDescCount.textContent = len + ' / ' + max + ' Characters Remaining';
  }

  if (menuDescField) {
    menuDescField.addEventListener('input', updateMenuDescCount);
  }

  /* ================================================================
     ADD MENU: ADD CATEGORIES MODAL
     ================================================================ */

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  var menuCatOverlay      = document.getElementById('menu-cat-modal-overlay');
  var menuCatCloseBtn     = document.getElementById('menu-cat-modal-close');
  var menuCatSearchInput  = document.getElementById('menu-cat-search-input');
  var menuCatListEl       = document.getElementById('menu-cat-modal-list');
  var menuCatEmptyMsg     = document.getElementById('menu-cat-modal-empty');
  var menuCatConfirmBtn   = document.getElementById('menu-cat-modal-confirm');
  var menuCatCreateNewBtn = document.getElementById('menu-cat-modal-create-new');
  var menuCatSelectAllCb  = menuCatOverlay ? menuCatOverlay.querySelector('.cat-modal__select-all .cat-modal__checkbox') : null;

  // UI elements
  var menuCatEmpty        = document.getElementById('menu-categories-empty');
  var menuCatFilled       = document.getElementById('menu-categories-filled');
  var menuCatFilledHeader = document.getElementById('menu-categories-filled-header');
  var menuCatFilledList   = document.getElementById('menu-categories-filled-list');
  var menuCatEditAction   = document.getElementById('menu-categories-edit-action');
  var menuCatAddBtn       = document.getElementById('menu-categories-add-btn');
  var menuCatEditBtn      = document.getElementById('menu-categories-edit-btn');

  // Category data (same as menu items page)
  var MENU_CATEGORIES = [
    { name: 'Breakfast plates', desc: 'Used in Breakfast Beauties menu', count: '10 items' },
    { name: 'Breakfast tacos',  desc: 'Used in Breakfast Beauties menu', count: '8 items' },
    { name: 'Drinks',           desc: 'Used in Breakfast Beauties menu', count: '12 items' },
    { name: 'Desserts',         desc: 'Used in Breakfast Beauties menu', count: '5 items' },
    { name: 'Sides',            desc: 'Used in Breakfast Beauties menu', count: '6 items' }
  ];

  var menuSelectedCategories = [];

  function buildMenuCatList() {
    if (!menuCatListEl) return;
    menuCatListEl.innerHTML = '';
    MENU_CATEGORIES.forEach(function(cat) {
      var el = document.createElement('div');
      el.className = 'cat-modal__option';
      el.dataset.value = cat.name;
      el.innerHTML =
        '<input type="checkbox" class="cat-modal__checkbox" data-value="' + escapeHtml(cat.name) + '">' +
        '<div class="cat-modal__option-info">' +
          '<span class="cat-modal__option-name">' + escapeHtml(cat.name) + '</span>' +
          '<span class="cat-modal__option-desc">' + escapeHtml(cat.desc) + '</span>' +
        '</div>' +
        '<span class="cat-modal__option-count">' + escapeHtml(cat.count) + '</span>';
      menuCatListEl.appendChild(el);
    });
  }

  function openMenuCatModal() {
    if (!menuCatOverlay) return;
    buildMenuCatList();
    menuCatSearchInput.value = '';
    menuCatEmptyMsg.classList.remove('cat-modal__empty--visible');

    // Pre-check already selected
    menuSelectedCategories.forEach(function(catName) {
      var opt = menuCatListEl.querySelector('.cat-modal__option[data-value="' + catName + '"]');
      if (opt) opt.querySelector('.cat-modal__checkbox').checked = true;
    });
    syncMenuCatSelectAll();
    menuCatConfirmBtn.disabled = false;

    menuCatOverlay.classList.add('cat-modal-overlay--visible');
    if (window.lucide) lucide.createIcons();
    setTimeout(function() { menuCatSearchInput.focus(); }, 100);
  }

  function closeMenuCatModal() {
    if (menuCatOverlay) menuCatOverlay.classList.remove('cat-modal-overlay--visible');
  }

  function syncMenuCatSelectAll() {
    if (!menuCatSelectAllCb || !menuCatListEl) return;
    var allChecked = true;
    var visibleOpts = menuCatListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"])');
    visibleOpts.forEach(function(opt) {
      if (!opt.querySelector('.cat-modal__checkbox').checked) allChecked = false;
    });
    menuCatSelectAllCb.checked = visibleOpts.length > 0 && allChecked;
  }

  // Option click
  if (menuCatListEl) {
    menuCatListEl.addEventListener('click', function(e) {
      var opt = e.target.closest('.cat-modal__option');
      if (!opt) return;
      var cb = opt.querySelector('.cat-modal__checkbox');
      if (e.target !== cb) cb.checked = !cb.checked;
      syncMenuCatSelectAll();
    });
  }

  // Select all click
  if (menuCatOverlay) {
    var menuCatSelectAllRow = menuCatOverlay.querySelector('.cat-modal__select-all .cat-modal__option');
    if (menuCatSelectAllRow) {
      menuCatSelectAllRow.addEventListener('click', function(e) {
        if (e.target !== menuCatSelectAllCb) menuCatSelectAllCb.checked = !menuCatSelectAllCb.checked;
        var checked = menuCatSelectAllCb.checked;
        menuCatListEl.querySelectorAll('.cat-modal__option:not([style*="display: none"]) .cat-modal__checkbox').forEach(function(cb) {
          cb.checked = checked;
        });
      });
    }
  }

  // Search filter
  if (menuCatSearchInput) {
    menuCatSearchInput.addEventListener('input', function() {
      var query = menuCatSearchInput.value.toLowerCase();
      var visibleCount = 0;
      menuCatListEl.querySelectorAll('.cat-modal__option').forEach(function(opt) {
        var name = opt.querySelector('.cat-modal__option-name').textContent.toLowerCase();
        var match = name.includes(query);
        opt.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });
      if (visibleCount === 0) {
        menuCatEmptyMsg.classList.add('cat-modal__empty--visible');
      } else {
        menuCatEmptyMsg.classList.remove('cat-modal__empty--visible');
      }
      syncMenuCatSelectAll();
    });
  }

  // Close
  if (menuCatCloseBtn) menuCatCloseBtn.addEventListener('click', closeMenuCatModal);
  if (menuCatOverlay) {
    menuCatOverlay.addEventListener('click', function(e) {
      if (e.target === menuCatOverlay) closeMenuCatModal();
    });
  }

  // Confirm
  if (menuCatConfirmBtn) {
    menuCatConfirmBtn.addEventListener('click', function() {
      menuSelectedCategories = [];
      menuCatListEl.querySelectorAll('.cat-modal__checkbox').forEach(function(cb) {
        if (cb.checked) menuSelectedCategories.push(cb.dataset.value);
      });
      closeMenuCatModal();
      applyMenuCatSelection();
    });
  }

  // Create new — close for prototype
  if (menuCatCreateNewBtn) {
    menuCatCreateNewBtn.addEventListener('click', closeMenuCatModal);
  }

  function applyMenuCatSelection() {
    if (menuSelectedCategories.length > 0) {
      if (menuCatEmpty)       menuCatEmpty.style.display = 'none';
      if (menuCatFilled)      menuCatFilled.style.display = '';
      var count = menuSelectedCategories.length;
      if (menuCatFilledHeader) menuCatFilledHeader.textContent = count + (count === 1 ? ' category' : ' categories');
      if (menuCatFilledList)   menuCatFilledList.textContent = menuSelectedCategories.join(', ');
      if (menuCatEditAction)   menuCatEditAction.style.display = '';
    } else {
      if (menuCatEmpty)       menuCatEmpty.style.display = '';
      if (menuCatFilled)      menuCatFilled.style.display = 'none';
      if (menuCatFilledHeader) menuCatFilledHeader.textContent = 'Categories';
      if (menuCatFilledList)   menuCatFilledList.textContent = '';
      if (menuCatEditAction)   menuCatEditAction.style.display = 'none';
    }
    if (window.lucide) lucide.createIcons();
  }

  // Wire buttons
  if (menuCatAddBtn)  menuCatAddBtn.addEventListener('click', openMenuCatModal);
  if (menuCatEditBtn) menuCatEditBtn.addEventListener('click', openMenuCatModal);

  // Escape key — add menu modal + menu takeover + cat modal priority (capture phase)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (menuCatOverlay && menuCatOverlay.classList.contains('cat-modal-overlay--visible')) {
        closeMenuCatModal();
        e.stopImmediatePropagation();
      } else if (addMenuOverlay && addMenuOverlay.classList.contains('addmenu-modal-overlay--visible')) {
        closeAddMenuModal();
        e.stopImmediatePropagation();
      } else if (menuTakeover && menuTakeover.classList.contains('takeover--visible')) {
        closeMenuTakeover();
        e.stopImmediatePropagation();
      }
    }
  }, true);
});
