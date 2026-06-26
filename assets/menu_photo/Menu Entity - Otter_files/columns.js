// Column visibility toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('column-toggle-btn');
  const dropdown = document.getElementById('column-toggle-dropdown');
  const listContainer = document.getElementById('column-toggle-list');
  const table = document.querySelector('.data-table');

  if (!toggleBtn || !dropdown || !table) return;

  // Get all column headers (skip checkbox column)
  const headers = table.querySelectorAll('thead th');
  const columns = [];

  headers.forEach((th, index) => {
    if (th.classList.contains('col-checkbox')) return;
    // Extract the col-* class name
    const colClass = Array.from(th.classList).find(c => c.startsWith('col-'));
    if (!colClass) return;
    columns.push({
      index: index,
      colClass: colClass,
      label: th.textContent.trim(),
      visible: true
    });
  });

  // Build toggle list items
  function renderList() {
    listContainer.innerHTML = '';
    columns.forEach(col => {
      const item = document.createElement('div');
      item.className = 'column-toggle__item';
      item.innerHTML = `
        <span class="column-toggle__item-label">${col.label}</span>
        <label class="toggle-switch">
          <input type="checkbox" ${col.visible ? 'checked' : ''} data-col-class="${col.colClass}">
          <span class="toggle-switch__slider"></span>
        </label>
      `;

      // Toggle column on switch change
      const checkbox = item.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        col.visible = checkbox.checked;
        applyColumnVisibility(col);
      });

      listContainer.appendChild(item);
    });
  }

  // Show/hide a single column across all rows
  function applyColumnVisibility(col) {
    const allRows = table.querySelectorAll('tr');
    allRows.forEach(row => {
      const cells = row.children;
      if (cells[col.index]) {
        cells[col.index].style.display = col.visible ? '' : 'none';
      }
    });
  }

  // Toggle dropdown
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('column-toggle__dropdown--open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#column-toggle')) {
      dropdown.classList.remove('column-toggle__dropdown--open');
    }
  });

  // Initialize
  renderList();
});
