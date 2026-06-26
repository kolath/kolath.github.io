// Pill tab switching + tab content show/hide
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.pill-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Map tab names to singular form for the "Add" button
  const entityNames = {
    'menus': 'menu',
    'menu-items': 'menu item',
    'modifier-items': 'modifier item',
    'categories': 'category',
    'modifier-groups': 'modifier group'
  };

  // Map tab keys to content panel IDs
  const tabPanelMap = {
    'menus': 'tab-menus',
    'menu-items': 'tab-menu-items',
    'modifier-items': 'tab-modifier-items',
    'categories': 'tab-categories',
    'modifier-groups': 'tab-modifier-groups'
  };

  function setOverviewView(view) {
    const overview = document.getElementById('tab-menus');
    if (!overview) return;

    const panels = overview.querySelectorAll('[data-overview-view-panel]');
    const buttons = overview.querySelectorAll('[data-overview-view]');

    panels.forEach(panel => {
      const active = panel.getAttribute('data-overview-view-panel') === view;
      panel.hidden = !active;
      panel.classList.toggle('overview-view-panel--active', active);
    });

    buttons.forEach(button => {
      const active = button.getAttribute('data-overview-view') === view;
      button.classList.toggle('overview-view-toggle__btn--active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    overview.setAttribute('data-current-view', view);
  }

  function setupOverviewTableView() {
    const menusPanel = document.getElementById('tab-menus-source');
    const tablePanel = document.getElementById('overview-table-view');
    const sharedBanner = document.getElementById('overview-shared-banner');
    const tableActions = document.getElementById('overview-table-actions');
    if (!menusPanel || !tablePanel || tablePanel.dataset.hydrated === 'true') return;

    const infoBanner = menusPanel.querySelector('.info-banner');
    if (infoBanner && sharedBanner) {
      sharedBanner.appendChild(infoBanner);
    }

    const filterBar = menusPanel.querySelector('.filter-bar');
    const columnToggle = filterBar?.querySelector('.column-toggle');
    if (columnToggle && tableActions) {
      const trigger = columnToggle.querySelector('#menus-column-toggle-btn');
      if (trigger) {
        trigger.setAttribute('aria-label', 'Customize columns');
        trigger.setAttribute('title', 'Customize columns');
      }
      tableActions.appendChild(columnToggle);
    }
    if (filterBar) filterBar.remove();

    const tableContent = document.createElement('div');
    tableContent.className = 'overview-table-view-content';

    while (menusPanel.firstChild) {
      tableContent.appendChild(menusPanel.firstChild);
    }

    tablePanel.appendChild(tableContent);
    tablePanel.dataset.hydrated = 'true';
  }

  function setupOverviewViewToggle() {
    const buttons = document.querySelectorAll('#tab-menus [data-overview-view]');
    buttons.forEach(button => {
      const view = button.getAttribute('data-overview-view');
      button.setAttribute('aria-pressed', String(view === 'list'));
      button.addEventListener('click', () => setOverviewView(view));
    });
  }

  function switchTab(tabKey, tabLabel) {
    // Update section header and add button
    const sectionHeader = document.querySelector('.section-header');
    const sectionTitle = document.querySelector('.section-header__title');
    const addBtn = document.querySelector('.section-header__actions .btn span:last-child');

    if (sectionTitle) sectionTitle.textContent = tabLabel;
    if (sectionHeader) sectionHeader.style.display = tabKey === 'menus' ? 'none' : '';
    if (addBtn && entityNames[tabKey]) addBtn.textContent = 'Add ' + entityNames[tabKey];

    // Show/hide tab content panels
    var panelId = tabPanelMap[tabKey];
    var visiblePanelId = panelId;
    tabContents.forEach(function(panel) {
      if (visiblePanelId && panel.id === visiblePanelId) {
        panel.style.display = '';
      } else if (visiblePanelId) {
        panel.style.display = 'none';
      } else {
        // Tabs without their own panel: show menu-items as fallback
        panel.style.display = panel.id === 'tab-menu-items' ? '' : 'none';
      }
    });

    if (tabKey === 'menus') {
      setOverviewView('list');
    }

    // Re-render icons in newly visible panel
    if (window.lucide) lucide.createIcons();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove selected from all tabs
      tabs.forEach(t => {
        t.classList.remove('pill-tab--selected');
        t.classList.add('pill-tab--default');
      });

      // Set clicked tab as selected
      tab.classList.remove('pill-tab--default');
      tab.classList.add('pill-tab--selected');

      switchTab(tab.getAttribute('data-tab'), tab.textContent.trim());
    });
  });

  setupOverviewTableView();
  setupOverviewViewToggle();

  // Set initial state from the currently selected tab
  const activeTab = document.querySelector('.pill-tab--selected');
  if (activeTab) {
    switchTab(activeTab.getAttribute('data-tab'), activeTab.textContent.trim());
  }

  function setupOverviewInternalNameColumn() {
    const tables = document.querySelectorAll('#tab-menus .overview-table');

    function toInternalName(name) {
      return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    tables.forEach(table => {
      const availabilityHeader = table.querySelector('thead th.col-overview-availability');
      if (availabilityHeader && !table.querySelector('thead th.col-overview-internal')) {
        const header = document.createElement('th');
        header.className = 'col-overview-internal';
        header.textContent = 'Internal name';
        availabilityHeader.insertAdjacentElement('afterend', header);
      }

      table.querySelectorAll('tbody tr').forEach(row => {
        if (row.querySelector('td.col-overview-internal')) return;

        const availabilityCell = row.querySelector('td .availability')?.closest('td');
        const itemName = row.querySelector('.overview-item-name')?.textContent.trim();
        if (!availabilityCell || !itemName) return;

        const cell = document.createElement('td');
        cell.className = 'col-overview-internal';
        cell.innerHTML = '<span class="overview-internal-name">' + toInternalName(itemName) + '</span>';
        availabilityCell.insertAdjacentElement('afterend', cell);
      });
    });
  }

  setupOverviewInternalNameColumn();

  function setupOverviewCategorySelectAll() {
    const categories = document.querySelectorAll('#tab-menus .overview-category');

    categories.forEach(category => {
      const selectAll = category.querySelector('.overview-select-all .table-checkbox');
      const headerCheckbox = category.querySelector('thead .table-checkbox');
      const rowCheckboxes = Array.from(category.querySelectorAll('tbody .table-checkbox'));
      const allCheckboxes = [selectAll, headerCheckbox].filter(Boolean);

      if (!selectAll || !headerCheckbox || rowCheckboxes.length === 0) return;

      function setRows(checked) {
        rowCheckboxes.forEach(checkbox => {
          checkbox.checked = checked;
          const row = checkbox.closest('tr');
          if (row) row.classList.toggle('table-row--selected', checked);
        });
      }

      function syncSelectAllState() {
        const checkedCount = rowCheckboxes.filter(checkbox => checkbox.checked).length;
        const allChecked = checkedCount === rowCheckboxes.length;
        const partiallyChecked = checkedCount > 0 && !allChecked;

        allCheckboxes.forEach(checkbox => {
          checkbox.checked = allChecked;
          checkbox.indeterminate = partiallyChecked;
        });
      }

      allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          setRows(checkbox.checked);
          syncSelectAllState();
          setTimeout(syncSelectAllState, 0);
        });
      });

      rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const row = checkbox.closest('tr');
          if (row) row.classList.toggle('table-row--selected', checkbox.checked);
          syncSelectAllState();
          setTimeout(syncSelectAllState, 0);
        });
      });

      syncSelectAllState();
    });
  }

  setupOverviewCategorySelectAll();

  function setupOverviewCollapseControls() {
    const buttons = document.querySelectorAll('#tab-menus [data-overview-toggle]');
    const storagePrefix = 'menuPrototype.overviewCollapse.';

    function getStorageKey(button) {
      return storagePrefix + (button.dataset.collapseKey || button.getAttribute('aria-label') || button.textContent.trim());
    }

    function getEntityName(button, type) {
      const selector = type === 'menu' ? '.overview-menu-group__title' : '.overview-category__title';
      return button.closest(type === 'menu' ? '.overview-menu-group' : '.overview-category')
        ?.querySelector(selector)
        ?.textContent
        ?.trim() || (type === 'menu' ? 'menu' : 'category');
    }

    function updateCollapseButtonLabel(button) {
      const type = button.getAttribute('data-overview-toggle');
      const expanded = button.getAttribute('aria-expanded') !== 'false';
      const noun = type === 'menu' ? 'menu' : 'category';
      const entityName = getEntityName(button, type);
      const action = expanded ? 'Collapse' : 'Expand';
      button.setAttribute('data-tooltip', action + ' ' + noun);
      button.setAttribute('aria-label', action + ' ' + entityName);
      button.setAttribute('title', action + ' ' + noun);
    }

    function syncCollapsedClass(container, type, expanded) {
      if (type === 'menu') {
        container?.classList.toggle('overview-menu-group--collapsed', !expanded);
      }
      if (type === 'category') {
        container?.classList.toggle('overview-category--collapsed', !expanded);
      }
    }

    function syncMenuDividers() {
      const menuGroups = Array.from(document.querySelectorAll('#tab-menus .overview-menu-group'));
      menuGroups.forEach((group, index) => {
        const previous = menuGroups[index - 1];
        const shouldSeparate = index > 0 && (
          previous?.classList.contains('overview-menu-group--collapsed') ||
          group.classList.contains('overview-menu-group--collapsed')
        );
        group.classList.toggle('overview-menu-group--separated', shouldSeparate);
      });
    }

    buttons.forEach(button => {
      if (!button.dataset.collapseKey) {
        button.dataset.collapseKey = button.getAttribute('aria-label') || button.textContent.trim();
      }

      const type = button.getAttribute('data-overview-toggle');
      const container = type === 'menu'
        ? button.closest('.overview-menu-group')
        : button.closest('.overview-category');
      const content = container?.querySelector(type === 'menu' ? '.overview-menu-content' : '.overview-category-content');
      const storedExpanded = sessionStorage.getItem(getStorageKey(button));

      if (content) {
        const expanded = storedExpanded !== null
          ? storedExpanded === 'true'
          : type === 'menu';
        button.setAttribute('aria-expanded', String(expanded));
        content.hidden = !expanded;
        syncCollapsedClass(container, type, expanded);
      }

      updateCollapseButtonLabel(button);

      button.addEventListener('click', () => {
        const type = button.getAttribute('data-overview-toggle');
        const container = type === 'menu'
          ? button.closest('.overview-menu-group')
          : button.closest('.overview-category');
        const content = container?.querySelector(type === 'menu' ? '.overview-menu-content' : '.overview-category-content');

        if (!content) return;

        const expanded = button.getAttribute('aria-expanded') !== 'false';
        button.setAttribute('aria-expanded', String(!expanded));
        content.hidden = expanded;
        syncCollapsedClass(container, type, !expanded);
        if (type === 'menu') syncMenuDividers();
        updateCollapseButtonLabel(button);
        sessionStorage.setItem(getStorageKey(button), String(!expanded));
      });
    });

    syncMenuDividers();
  }

  setupOverviewCollapseControls();
});
