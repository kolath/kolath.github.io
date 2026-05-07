// Table checkbox interactions + row selection highlight + bulk action bar
document.addEventListener('DOMContentLoaded', () => {
  const selectAll = document.getElementById('select-all');
  const rowCheckboxes = document.querySelectorAll('.data-table tbody .table-checkbox');
  const bulkBar = document.getElementById('bulk-action-bar');
  const bulkCount = document.getElementById('bulk-action-count');
  const bulkDismiss = document.getElementById('bulk-action-dismiss');

  function updateBulkActionBar() {
    const checkedCount = Array.from(rowCheckboxes).filter(c => c.checked).length;

    if (bulkBar) {
      bulkBar.style.display = checkedCount > 0 ? 'flex' : 'none';
    }
    if (bulkCount) {
      bulkCount.textContent = checkedCount + ' selected';
    }
  }

  function clearAllSelections() {
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
    rowCheckboxes.forEach(cb => {
      cb.checked = false;
      const tr = cb.closest('tr');
      if (tr) tr.classList.remove('table-row--selected');
    });
    updateBulkActionBar();
  }

  if (selectAll) {
    // Select all / deselect all
    selectAll.addEventListener('change', () => {
      rowCheckboxes.forEach(cb => {
        cb.checked = selectAll.checked;
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('table-row--selected', cb.checked);
      });
      updateBulkActionBar();
    });

    // Update select-all state when individual checkboxes change
    rowCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        // Toggle row highlight
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('table-row--selected', cb.checked);

        // Sync select-all checkbox
        const allChecked = Array.from(rowCheckboxes).every(c => c.checked);
        const someChecked = Array.from(rowCheckboxes).some(c => c.checked);
        selectAll.checked = allChecked;
        selectAll.indeterminate = someChecked && !allChecked;

        updateBulkActionBar();
      });
    });
  }

  // Dismiss button clears all selections
  if (bulkDismiss) {
    bulkDismiss.addEventListener('click', () => {
      clearAllSelections();
    });
  }
});
