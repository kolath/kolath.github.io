// Modifier Items table interactions: select-all checkbox + column toggle + sorting
document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('mi-data-table');
  if (!table) return;

  // ── Select-all checkbox sync + bulk actions ──
  const selectAll = document.getElementById('mi-select-all');
  const rowCheckboxes = () => table.querySelectorAll('tbody .mi-table-checkbox');
  const bulkBar = document.getElementById('mi-bulk-action-bar');
  const bulkCount = document.getElementById('mi-bulk-action-count');
  const bulkDismiss = document.getElementById('mi-bulk-action-dismiss');

  function updateBulkActionBar() {
    const checkedCount = Array.from(rowCheckboxes()).filter(c => c.checked).length;
    if (bulkBar) bulkBar.style.display = checkedCount > 0 ? 'flex' : 'none';
    if (bulkCount) bulkCount.textContent = checkedCount + ' selected';
  }

  function clearAllSelections() {
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
    rowCheckboxes().forEach(cb => {
      cb.checked = false;
      const tr = cb.closest('tr');
      if (tr) tr.classList.remove('table-row--selected');
    });
    updateBulkActionBar();
  }

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      rowCheckboxes().forEach(cb => {
        cb.checked = selectAll.checked;
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('table-row--selected', cb.checked);
      });
      updateBulkActionBar();
    });

    table.querySelector('tbody').addEventListener('change', (e) => {
      if (!e.target.classList.contains('mi-table-checkbox')) return;
      const tr = e.target.closest('tr');
      if (tr) tr.classList.toggle('table-row--selected', e.target.checked);

      const cbs = rowCheckboxes();
      const allChecked = Array.from(cbs).every(c => c.checked);
      const someChecked = Array.from(cbs).some(c => c.checked);
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
      updateBulkActionBar();
    });
  }

  if (bulkDismiss) {
    bulkDismiss.addEventListener('click', () => clearAllSelections());
  }

  // ── Column toggle ──
  const toggleBtn = document.getElementById('mi-column-toggle-btn');
  const dropdown = document.getElementById('mi-column-toggle-dropdown');
  const listContainer = document.getElementById('mi-column-toggle-list');

  if (toggleBtn && dropdown) {
    const headers = table.querySelectorAll('thead th');
    const columns = [];

    headers.forEach((th, index) => {
      if (th.classList.contains('col-checkbox') || th.classList.contains('col-mi-actions')) return;
      const colClass = Array.from(th.classList).find(c => c.startsWith('col-'));
      if (!colClass) return;
      columns.push({ index, colClass, label: th.textContent.trim(), visible: true });
    });

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

        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
          col.visible = checkbox.checked;
          const allRows = table.querySelectorAll('tr');
          allRows.forEach(row => {
            const cells = row.children;
            if (cells[col.index]) {
              cells[col.index].style.display = col.visible ? '' : 'none';
            }
          });
        });

        listContainer.appendChild(item);
      });
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('column-toggle__dropdown--open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#mi-column-toggle')) {
        dropdown.classList.remove('column-toggle__dropdown--open');
      }
    });

    renderList();
  }

  // ── Column sorting ──
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const thElements = thead.querySelectorAll('th');
  let sortState = { colIndex: null, direction: null };

  thElements.forEach((th, index) => {
    if (th.classList.contains('col-checkbox') || th.classList.contains('col-mi-actions')) return;

    th.classList.add('sortable');

    const indicator = document.createElement('span');
    indicator.className = 'sort-indicator';
    indicator.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path class="sort-asc" d="M6 2L9 6H3L6 2Z" fill="currentColor" opacity="0.3"/><path class="sort-desc" d="M6 10L3 6H9L6 10Z" fill="currentColor" opacity="0.3"/></svg>';
    th.appendChild(indicator);

    th.addEventListener('click', () => {
      let direction;
      if (sortState.colIndex === index) {
        if (sortState.direction === 'asc') direction = 'desc';
        else if (sortState.direction === 'desc') direction = null;
        else direction = 'asc';
      } else {
        direction = 'asc';
      }

      thElements.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));

      if (direction === null) {
        sortState = { colIndex: null, direction: null };
        originalRows.forEach(row => tbody.appendChild(row));
        return;
      }

      sortState = { colIndex: index, direction };
      th.classList.add('sort-' + direction);
      sortRows(index, direction);
    });
  });

  const originalRows = Array.from(tbody.querySelectorAll('tr'));

  function sortRows(colIndex, direction) {
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
      const cellA = a.children[colIndex];
      const cellB = b.children[colIndex];
      let valA = getCellSortValue(cellA);
      let valB = getCellSortValue(cellB);

      const numA = parseNumeric(valA);
      const numB = parseNumeric(valB);

      let result;
      if (numA !== null && numB !== null) {
        result = numA - numB;
      } else {
        result = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
      }
      return direction === 'desc' ? -result : result;
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function getCellSortValue(cell) {
    const nameText = cell.querySelector('.cell-name-text');
    if (nameText) return nameText.textContent.trim();
    const skuLink = cell.querySelector('.cell-sku-link');
    if (skuLink) return skuLink.textContent.trim();
    const avail = cell.querySelector('.availability');
    if (avail) return avail.textContent.trim();
    return cell.textContent.trim();
  }

  function parseNumeric(str) {
    const priceMatch = str.match(/\$(\d+(?:\.\d+)?)/);
    if (priceMatch) return parseFloat(priceMatch[1]);
    const countMatch = str.match(/^(\d+)\s/);
    if (countMatch) return parseInt(countMatch[1]);
    return null;
  }
});
