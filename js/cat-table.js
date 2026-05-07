// Categories table: select-all + bulk action bar
document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('cat-data-table');
  if (!table) return;

  const selectAll = document.getElementById('cat-select-all');
  const rowCheckboxes = () => table.querySelectorAll('tbody .cat-table-checkbox');
  const bulkBar = document.getElementById('cat-bulk-action-bar');
  const bulkCount = document.getElementById('cat-bulk-action-count');
  const bulkDismiss = document.getElementById('cat-bulk-action-dismiss');

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
      cb.closest('tr')?.classList.remove('table-row--selected');
    });
    updateBulkActionBar();
  }

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      rowCheckboxes().forEach(cb => {
        cb.checked = selectAll.checked;
        cb.closest('tr')?.classList.toggle('table-row--selected', cb.checked);
      });
      updateBulkActionBar();
    });

    table.querySelector('tbody').addEventListener('change', (e) => {
      if (!e.target.classList.contains('cat-table-checkbox')) return;
      e.target.closest('tr')?.classList.toggle('table-row--selected', e.target.checked);

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
});
