// Sidebar expand/collapse and active state management
document.addEventListener('DOMContentLoaded', () => {
  // Expand/collapse brand menus
  const toggleBtns = document.querySelectorAll('[data-toggle]');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-toggle');
      const target = document.getElementById(targetId);
      const arrow = btn.querySelector('.sidebar-item__arrow img');

      if (target) {
        target.classList.toggle('sidebar-children--collapsed');
        // Rotate arrow
        if (arrow) {
          const isCollapsed = target.classList.contains('sidebar-children--collapsed');
          arrow.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }
    });
  });

  // Active state for sidebar items
  const sidebarItems = document.querySelectorAll('.sidebar-item__container');
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Skip if it's a toggle button
      if (item.hasAttribute('data-toggle')) return;

      // Remove selected from all
      document.querySelectorAll('.sidebar-item--selected').forEach(el => {
        el.classList.remove('sidebar-item--selected');
      });

      // Add selected to clicked item's parent
      const parentItem = item.closest('.sidebar-item');
      if (parentItem) {
        parentItem.classList.add('sidebar-item--selected');

        const label = item.querySelector('.sidebar-item__label').textContent.trim();

        // Page switching: SKU library vs Brand menus
        const brandMenusPage = document.getElementById('page-brand-menus');
        const skuLibraryPage = document.getElementById('page-sku-library');

        if (label === 'SKU library') {
          if (brandMenusPage) brandMenusPage.style.display = 'none';
          if (skuLibraryPage) {
            skuLibraryPage.style.display = '';
            if (window.lucide) lucide.createIcons();
          }
        } else if (parentItem.classList.contains('sidebar-item--nested')) {
          // Brand menu item selected
          if (skuLibraryPage) skuLibraryPage.style.display = 'none';
          if (brandMenusPage) brandMenusPage.style.display = '';
          const brandName = label;
          const pageTitle = document.querySelector('.page-header__title');
          if (pageTitle) {
            pageTitle.textContent = brandName + ' menus';
          }
        } else {
          // Other sidebar items - show brand menus page by default
          if (skuLibraryPage) skuLibraryPage.style.display = 'none';
          if (brandMenusPage) brandMenusPage.style.display = '';
        }
      }
    });
  });
});
