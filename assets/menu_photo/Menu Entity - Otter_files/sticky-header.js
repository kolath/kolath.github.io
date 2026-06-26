// Sticky table header + filter bar via JS
// (CSS position:sticky doesn't work on thead because overflow-x:auto on the
//  table wrapper creates a new scroll context that breaks it)
document.addEventListener('DOMContentLoaded', () => {
  const pageContainer = document.querySelector('.page-container');
  if (!pageContainer) return;

  let currentThead = null;
  let currentWrapper = null;
  let currentFilterBar = null;
  let wrapperScrollHandler = null;

  // Find visible tab's elements
  function getActiveElements() {
    const visibleTab = document.querySelector('.tab-content:not([style*="display:none"])') ||
                       document.querySelector('.tab-content');
    if (!visibleTab) return null;
    const filterBar = visibleTab.querySelector('.filter-bar');
    const tableWrapper = visibleTab.querySelector('.data-table-wrapper');
    const thead = tableWrapper ? tableWrapper.querySelector('thead') : null;
    return { filterBar, tableWrapper, thead };
  }

  function updateStickyHeader() {
    const els = getActiveElements();
    if (!els || !els.filterBar || !els.thead || !els.tableWrapper) return;

    const { filterBar, tableWrapper, thead } = els;

    const filterBarBottom = filterBar.getBoundingClientRect().bottom;
    const wrapperRect = tableWrapper.getBoundingClientRect();
    // +1 accounts for the wrapper's top border
    const theadNaturalTop = wrapperRect.top + 1;
    const theadHeight = thead.offsetHeight;
    // How much room is left between filter bar bottom and table bottom
    const tableBottomSpace = wrapperRect.bottom - filterBarBottom - theadHeight;

    if (theadNaturalTop < filterBarBottom && tableBottomSpace > 0) {
      // Header should be sticky — translate it down to stay below filter bar
      const offset = filterBarBottom - theadNaturalTop;
      thead.style.transform = 'translateY(' + offset + 'px)';
      thead.classList.add('is-sticky');
    } else {
      // Header in normal position
      thead.style.transform = '';
      thead.classList.remove('is-sticky');
    }

    // Track current elements for cleanup
    if (currentWrapper !== tableWrapper) {
      // Clean up old wrapper's scroll listener
      if (currentWrapper && wrapperScrollHandler) {
        currentWrapper.removeEventListener('scroll', wrapperScrollHandler);
      }
      currentWrapper = tableWrapper;
      // Frozen-column shadow: show when table is horizontally scrolled
      wrapperScrollHandler = function() {
        tableWrapper.classList.toggle('data-table-wrapper--scrolled', tableWrapper.scrollLeft > 0);
      };
      tableWrapper.addEventListener('scroll', wrapperScrollHandler, { passive: true });
      wrapperScrollHandler();
    }

    // Clean up old thead if tab changed
    if (currentThead && currentThead !== thead) {
      currentThead.style.transform = '';
      currentThead.classList.remove('is-sticky');
    }
    currentThead = thead;
    currentFilterBar = filterBar;
  }

  pageContainer.addEventListener('scroll', updateStickyHeader, { passive: true });

  // Run once on load
  updateStickyHeader();

  // Re-run when tabs change (observe tab content visibility changes)
  const observer = new MutationObserver(() => {
    // Reset scroll position tracking and re-run
    updateStickyHeader();
  });

  // Observe style changes on all tab-content panels
  document.querySelectorAll('.tab-content').forEach(panel => {
    observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
  });
});
