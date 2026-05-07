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

  function switchTab(tabKey, tabLabel) {
    // Update section header and add button
    const sectionTitle = document.querySelector('.section-header__title');
    const addBtn = document.querySelector('.section-header__actions .btn span:last-child');

    if (sectionTitle) sectionTitle.textContent = tabLabel;
    if (addBtn && entityNames[tabKey]) addBtn.textContent = 'Add ' + entityNames[tabKey];

    // Show/hide tab content panels
    var panelId = tabPanelMap[tabKey];
    tabContents.forEach(function(panel) {
      if (panelId && panel.id === panelId) {
        panel.style.display = '';
      } else if (panelId) {
        panel.style.display = 'none';
      } else {
        // Tabs without their own panel: show menu-items as fallback
        panel.style.display = panel.id === 'tab-menu-items' ? '' : 'none';
      }
    });

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

  // Set initial state from the currently selected tab
  const activeTab = document.querySelector('.pill-tab--selected');
  if (activeTab) {
    switchTab(activeTab.getAttribute('data-tab'), activeTab.textContent.trim());
  }
});
