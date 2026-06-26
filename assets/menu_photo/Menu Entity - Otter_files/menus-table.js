// Menus table interactions: select-all checkbox + column toggle + sorting + row actions
document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('menus-data-table');
  if (!table) return;

  // ── Select-all checkbox sync + bulk actions ──
  const selectAll = document.getElementById('menus-select-all');
  const rowCheckboxes = () => table.querySelectorAll('tbody .menus-table-checkbox');
  const bulkBar = document.getElementById('menus-bulk-action-bar');
  const bulkCount = document.getElementById('menus-bulk-action-count');
  const bulkDismiss = document.getElementById('menus-bulk-action-dismiss');

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
      if (!e.target.classList.contains('menus-table-checkbox')) return;
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

  // ── Customize columns modal ──
  const toggleBtn = document.getElementById('menus-column-toggle-btn');
  const columnsOverlay = document.getElementById('columns-modal-overlay');
  const columnsClose = document.getElementById('columns-modal-close');
  const columnsCancel = document.getElementById('columns-modal-cancel');
  const columnsSave = document.getElementById('columns-modal-save');
  const columnsList = document.getElementById('columns-modal-list');
  const columnsCount = document.getElementById('columns-modal-count');

  if (toggleBtn && columnsOverlay && columnsList) {
    let columns = [];
    let draftColumns = [];
    let draggedColumnEl = null;

    function getActionHeader() {
      return table.querySelector('thead th.col-menus-actions');
    }

    function collectColumns() {
      const headerRow = table.querySelector('thead tr');
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      columns = Array.from(headerRow.children)
        .filter(th => !th.classList.contains('col-checkbox') && !th.classList.contains('col-menus-actions'))
        .map(th => ({
          id: Array.from(th.classList).find(c => c.startsWith('col-')) || th.textContent.trim(),
          header: th,
          label: th.textContent.trim(),
          cells: rows.map(row => row.children[Array.from(headerRow.children).indexOf(th)]).filter(Boolean),
          visible: th.style.display !== 'none'
        }));

      if (columnsCount) {
        columnsCount.textContent = columns.length + ' columns';
      }
    }

    function applyColumns(nextColumns) {
      const headerAction = getActionHeader();
      const rows = Array.from(table.querySelectorAll('tbody tr'));

      nextColumns.forEach(col => {
        if (headerAction) headerAction.parentNode.insertBefore(col.header, headerAction);
        rows.forEach((row, rowIndex) => {
          const actionCell = row.querySelector('.col-menus-actions');
          const cell = col.cells[rowIndex];
          if (cell && actionCell) row.insertBefore(cell, actionCell);
        });

        const display = col.visible ? '' : 'none';
        col.header.style.display = display;
        col.cells.forEach(cell => {
          if (cell) cell.style.display = display;
        });
      });

      columns = nextColumns.map(col => ({ ...col }));
    }

    function renderColumnsModal() {
      columnsList.innerHTML = '';
      draftColumns.forEach(col => {
        const item = document.createElement('div');
        item.className = 'reorder-modal__item columns-modal__item';
        item.draggable = true;
        item.dataset.columnId = col.id;
        item.innerHTML = `
          <span class="reorder-modal__item-drag">
            <img src="assets/Icons/reorder.svg" alt="" aria-hidden="true" style="width:16px;height:16px">
          </span>
          <span class="reorder-modal__item-name columns-modal__name">${col.label}</span>
          <label class="toggle-switch columns-modal__switch" aria-label="Show ${col.label}">
            <input type="checkbox" ${col.visible ? 'checked' : ''} data-column-id="${col.id}">
            <span class="toggle-switch__slider"></span>
          </label>
        `;

        const checkbox = item.querySelector('input[type="checkbox"]');
        function updateDraftVisibility(checked) {
          const current = draftColumns.find(draft => draft.id === col.id);
          if (current) current.visible = checked;
        }

        checkbox.addEventListener('change', e => {
          updateDraftVisibility(e.target.checked);
        });

        item.addEventListener('click', e => {
          if (e.target.closest('.reorder-modal__item-drag') || e.target.closest('.toggle-switch')) return;
          checkbox.checked = !checkbox.checked;
          updateDraftVisibility(checkbox.checked);
        });

        columnsList.appendChild(item);
      });

      initColumnDragDrop();
    }

    function syncDraftFromDom() {
      draftColumns = Array.from(columnsList.querySelectorAll('.columns-modal__item')).map(item => {
        const column = draftColumns.find(col => col.id === item.dataset.columnId);
        return column;
      }).filter(Boolean);
    }

    function initColumnDragDrop() {
      columnsList.querySelectorAll('.columns-modal__item').forEach(item => {
        item.addEventListener('dragstart', () => {
          draggedColumnEl = item;
          item.classList.add('reorder-modal__item--dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('reorder-modal__item--dragging');
          columnsList.querySelectorAll('.reorder-modal__item--drag-over').forEach(el => {
            el.classList.remove('reorder-modal__item--drag-over');
          });
          draggedColumnEl = null;
          syncDraftFromDom();
        });

        item.addEventListener('dragover', e => {
          e.preventDefault();
          if (item !== draggedColumnEl) item.classList.add('reorder-modal__item--drag-over');
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('reorder-modal__item--drag-over');
        });

        item.addEventListener('drop', e => {
          e.preventDefault();
          item.classList.remove('reorder-modal__item--drag-over');
          if (!draggedColumnEl || draggedColumnEl === item) return;

          const allItems = Array.from(columnsList.children);
          const draggedIndex = allItems.indexOf(draggedColumnEl);
          const targetIndex = allItems.indexOf(item);

          if (draggedIndex < targetIndex) {
            columnsList.insertBefore(draggedColumnEl, item.nextSibling);
          } else {
            columnsList.insertBefore(draggedColumnEl, item);
          }

          syncDraftFromDom();
        });
      });
    }

    function openColumnsModal() {
      collectColumns();
      draftColumns = columns.map(col => ({ ...col }));
      renderColumnsModal();
      columnsOverlay.classList.add('reorder-modal-overlay--visible');
    }

    function closeColumnsModal() {
      columnsOverlay.classList.remove('reorder-modal-overlay--visible');
    }

    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      openColumnsModal();
    });

    if (columnsClose) columnsClose.addEventListener('click', closeColumnsModal);
    if (columnsCancel) columnsCancel.addEventListener('click', closeColumnsModal);
    if (columnsSave) {
      columnsSave.addEventListener('click', () => {
        syncDraftFromDom();
        applyColumns(draftColumns);
        closeColumnsModal();
      });
    }
    columnsOverlay.addEventListener('click', e => {
      if (e.target === columnsOverlay) closeColumnsModal();
    });
  }

  // ── Column sorting ──
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const thElements = thead.querySelectorAll('th');
  let sortState = { colIndex: null, direction: null };

  thElements.forEach((th) => {
    if (th.classList.contains('col-checkbox') || th.classList.contains('col-menus-actions')) return;

    th.classList.add('sortable');

    const indicator = document.createElement('span');
    indicator.className = 'sort-indicator';
    indicator.innerHTML = '<img src="assets/Icons/sorting.svg" alt="" aria-hidden="true">';
    th.appendChild(indicator);

    th.addEventListener('click', () => {
      const index = Array.from(th.parentNode.children).indexOf(th);
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
    return cell.textContent.trim();
  }

  function parseNumeric(str) {
    const countMatch = str.match(/^(\d+)\s/);
    if (countMatch) return parseInt(countMatch[1]);
    return null;
  }
});
