// Column sorting (all columns except checkbox and actions)
document.addEventListener('DOMContentLoaded', () => {
  const overviewTables = Array.from(document.querySelectorAll('#tab-menus .overview-table'));
  const tables = overviewTables.length ? overviewTables : Array.from(document.querySelectorAll('.data-table'));

  tables.forEach(setupSortableTable);

  function setupSortableTable(table) {
    const headers = table.querySelectorAll('thead th');
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Track sort state: { colIndex, direction }
    let sortState = { colIndex: null, direction: null };

    headers.forEach((th, index) => {
      // Skip checkbox (first) and actions (last) columns
      if (th.classList.contains('col-checkbox') || th.classList.contains('col-actions')) return;
      if (th.querySelector('.sort-indicator')) return;

      // Mark as sortable
      th.classList.add('sortable');

      // Add sort indicator
      const indicator = document.createElement('span');
      indicator.className = 'sort-indicator';
      indicator.innerHTML = '<img src="assets/Icons/sorting.svg" alt="" aria-hidden="true">';
      th.appendChild(indicator);

      // Click handler
      th.addEventListener('click', () => {
        let direction;
        if (sortState.colIndex === index) {
          // Cycle: asc → desc → none
          if (sortState.direction === 'asc') direction = 'desc';
          else if (sortState.direction === 'desc') direction = null;
          else direction = 'asc';
        } else {
          direction = 'asc';
        }

        // Remove sort classes from all headers
        headers.forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });

        // Update state
        if (direction === null) {
          sortState = { colIndex: null, direction: null };
          // Restore original order
          restoreOriginalOrder();
          return;
        }

        sortState = { colIndex: index, direction };
        th.classList.add('sort-' + direction);

        // Sort the rows
        sortRows(index, direction);
      });
    });

    // Store original row order
    const originalRows = Array.from(tbody.querySelectorAll('tr'));

  function restoreOriginalOrder() {
    originalRows.forEach(row => tbody.appendChild(row));
  }

  function sortRows(colIndex, direction) {
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
      const cellA = a.children[colIndex];
      const cellB = b.children[colIndex];

      let valA = getCellSortValue(cellA);
      let valB = getCellSortValue(cellB);

      // Try numeric comparison (for prices, counts)
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
    // For display name column, get the name text
    const nameText = cell.querySelector('.cell-name-text');
    if (nameText) return nameText.textContent.trim();

    // For SKU column, get the link text
    const skuLink = cell.querySelector('.cell-sku-link');
    if (skuLink) return skuLink.textContent.trim();

    // For availability column, get text content
    const avail = cell.querySelector('.availability');
    if (avail) return avail.textContent.trim();

    return cell.textContent.trim();
  }

  function parseNumeric(str) {
    // Handle price: "$2.99", "$8.00 - $10.00" (use first price)
    const priceMatch = str.match(/\$(\d+(?:\.\d+)?)/);
    if (priceMatch) return parseFloat(priceMatch[1]);

    // Handle counts: "2 modifier groups", "10 locations", "3 channels"
    const countMatch = str.match(/^(\d+)\s/);
    if (countMatch) return parseInt(countMatch[1]);

    return null;
  }
  }
});
