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
        });
      } else {
        option.addEventListener('click', () => {
          option.classList.toggle('filter-option--selected');
          syncOptionState(option);
          syncFilterApplied(control);
          if (isOptionSelected(option)) closeFilterControl(control);
        });
      }
    });

    syncFilterApplied(control);

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
