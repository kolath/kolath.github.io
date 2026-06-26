// Filter dropdowns and prototype-only filter button states
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');

  function isOptionSelected(option) {
    const checkbox = option.querySelector('.filter-option__checkbox');
    return checkbox ? checkbox.checked : option.classList.contains('filter-option--selected');
  }

  function syncOptionState(option) {
    if (!option) return;
    option.classList.toggle('filter-option--selected', isOptionSelected(option));
    option.setAttribute('aria-selected', isOptionSelected(option) ? 'true' : 'false');
  }

  function syncFilterApplied(control) {
    if (!control) return;
    const trigger = control.querySelector('[data-filter-trigger]');
    const isMultiSelect = !!control.querySelector('.filter-option__checkbox');
    const count = Array.from(control.querySelectorAll('.filter-option')).filter(isOptionSelected).length;
    if (!trigger) return;

    const countBadge = trigger.querySelector('.filter-btn__count');
    trigger.classList.toggle('filter-btn--applied', count > 0);
    trigger.setAttribute('data-filter-count', String(count));

    if (countBadge) {
      countBadge.textContent = String(count);
      countBadge.hidden = !isMultiSelect || count === 0;
    }
  }

  function getSelectedCount(filterName) {
    const trigger = document.querySelector('[data-filter-trigger="' + filterName + '"]');
    if (!trigger) return 0;
    return Number(trigger.getAttribute('data-filter-count') || '0');
  }

  function getSelectedLabel(filterName) {
    const trigger = document.querySelector('[data-filter-trigger="' + filterName + '"]');
    const control = trigger ? trigger.closest('[data-filter-control]') : null;
    if (!control) return '';

    const selectedOption = Array.from(control.querySelectorAll('.filter-option')).find(isOptionSelected);
    const label = selectedOption ? selectedOption.querySelector('.filter-option__primary') : null;
    return label ? label.textContent.trim() : '';
  }

  function syncContextPreviewShortcut() {
    const shortcut = document.querySelector('[data-context-preview]');
    if (!shortcut) return;

    const hasSingleLocation = getSelectedCount('location') === 1;
    const hasSingleChannel = getSelectedCount('channels') === 1;
    const canPreviewSelection = hasSingleLocation && hasSingleChannel;
    const locationLabel = getSelectedLabel('location');
    const channelLabel = getSelectedLabel('channels');
    const tooltip = canPreviewSelection && locationLabel && channelLabel
      ? 'Preview selected menu: ' + locationLabel + ' on ' + channelLabel
      : 'Preview selected menu';

    shortcut.hidden = !canPreviewSelection;
    shortcut.classList.toggle('overview-context-preview--visible', canPreviewSelection);
    shortcut.setAttribute('aria-label', tooltip);
    shortcut.setAttribute('data-tooltip', tooltip);
  }

  function closeFilterControl(control) {
    if (!control) return;
    const trigger = control.querySelector('[data-filter-trigger]');
    const popover = control.querySelector('[data-filter-popover]');
    if (trigger) {
      trigger.classList.remove('filter-btn--active');
      trigger.setAttribute('aria-expanded', 'false');
    }
    if (popover) popover.hidden = true;
  }

  function closeAllFilterControls(exceptControl) {
    document.querySelectorAll('[data-filter-control]').forEach(control => {
      if (control !== exceptControl) closeFilterControl(control);
    });
  }

  function openFilterControl(control) {
    const trigger = control.querySelector('[data-filter-trigger]');
    const popover = control.querySelector('[data-filter-popover]');
    if (!trigger || !popover) return;

    closeAllFilterControls(control);
    trigger.classList.add('filter-btn--active');
    trigger.setAttribute('aria-expanded', 'true');
    popover.hidden = false;

    if (window.lucide) lucide.createIcons({ nodes: [popover] });
  }

  filterBtns.forEach(btn => {
    const control = btn.closest('[data-filter-control]');

    btn.addEventListener('click', (event) => {
      if (!control) {
        btn.classList.toggle('filter-btn--active');
        return;
      }

      event.stopPropagation();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeFilterControl(control);
      } else {
        openFilterControl(control);
      }
    });
  });

  document.querySelectorAll('.filter-popover__close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      closeFilterControl(closeBtn.closest('[data-filter-control]'));
    });
  });

  document.querySelectorAll('[data-filter-control]').forEach(control => {
    control.querySelectorAll('.filter-option').forEach(option => {
      syncOptionState(option);

      const checkbox = option.querySelector('.filter-option__checkbox');
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          syncOptionState(option);
          syncFilterApplied(control);
          syncContextPreviewShortcut();
        });
      } else {
        option.addEventListener('click', () => {
          option.classList.toggle('filter-option--selected');
          syncOptionState(option);
          syncFilterApplied(control);
          syncContextPreviewShortcut();
          if (isOptionSelected(option)) closeFilterControl(control);
        });
      }
    });

    syncFilterApplied(control);
    syncContextPreviewShortcut();

    control.addEventListener('click', event => {
      event.stopPropagation();
    });
  });

  document.addEventListener('click', () => closeAllFilterControls());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAllFilterControls();
  });

  // View toggle
  const viewBtns = document.querySelectorAll('.view-toggle__btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('view-toggle__btn--active'));
      btn.classList.add('view-toggle__btn--active');
    });
  });
});
