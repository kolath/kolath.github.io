// Bulk action modal interactions for all tabs
(function () {
  'use strict';

  const TABLE_CONFIGS = {
    'bulk-action-bar': {
      tableScope: '#tab-menu-items .data-table',
      checkboxClass: 'table-checkbox',
      selectAllId: 'select-all',
      countId: 'bulk-action-count',
      entity: 'menu item',
    },
    'menus-bulk-action-bar': {
      tableScope: '#menus-data-table',
      checkboxClass: 'menus-table-checkbox',
      selectAllId: 'menus-select-all',
      countId: 'menus-bulk-action-count',
      entity: 'menu',
    },
    'mi-bulk-action-bar': {
      tableScope: '#mi-data-table',
      checkboxClass: 'mi-table-checkbox',
      selectAllId: 'mi-select-all',
      countId: 'mi-bulk-action-count',
      entity: 'modifier item',
    },
    'cat-bulk-action-bar': {
      tableScope: '#cat-data-table',
      checkboxClass: 'cat-table-checkbox',
      selectAllId: 'cat-select-all',
      countId: 'cat-bulk-action-count',
      entity: 'category',
    },
    'mg-bulk-action-bar': {
      tableScope: '#mg-data-table',
      checkboxClass: 'mg-table-checkbox',
      selectAllId: 'mg-select-all',
      countId: 'mg-bulk-action-count',
      entity: 'modifier group',
    },
  };

  let currentContext = null;
  let activeModalId = null;

  // ── MODAL SYSTEM ──────────────────────────────────────────────────────────

  function openModal(modalId, context) {
    currentContext = context;
    activeModalId = modalId;
    document.getElementById('ba-scrim').classList.add('open');
    document.getElementById(modalId).classList.add('open');
  }

  function closeModal() {
    if (activeModalId) {
      document.getElementById('ba-scrim')?.classList.remove('open');
      document.getElementById(activeModalId)?.classList.remove('open');
    }
    activeModalId = null;
    currentContext = null;
  }

  // ── SELECTION HELPERS ─────────────────────────────────────────────────────

  function getCount(context) {
    const el = document.getElementById(context.config.countId);
    return parseInt(el?.textContent) || 0;
  }

  function getSelectedRows(context) {
    const scope = document.querySelector(context.config.tableScope);
    if (!scope) return [];
    return Array.from(scope.querySelectorAll(`tbody .${context.config.checkboxClass}:checked`))
      .map(cb => cb.closest('tr'));
  }

  function clearSelections(context) {
    const { selectAllId, checkboxClass, tableScope } = context.config;
    const selectAll = document.getElementById(selectAllId);
    if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
    const scope = document.querySelector(tableScope);
    if (scope) {
      scope.querySelectorAll(`tbody .${checkboxClass}`).forEach(cb => {
        cb.checked = false;
        cb.closest('tr')?.classList.remove('table-row--selected');
      });
    }
    const bar = document.getElementById(context.barId);
    if (bar) bar.style.display = 'none';
  }

  function pluralize(count, entity) {
    return count === 1 ? `1 ${entity}` : `${count} ${entity}s`;
  }

  // ── ACTION DISPATCHER ─────────────────────────────────────────────────────

  function handleAction(action, context) {
    const { count, config } = context;

    switch (action) {
      case 'delete': {
        const modal = document.getElementById('ba-delete-modal');
        const plural = pluralize(count, config.entity);
        modal.querySelector('.ba-modal__title').textContent = `Delete ${plural}?`;
        modal.querySelector('.ba-modal__desc').textContent =
          `This will permanently delete the selected ${plural.replace(/^\d+ /, count === 1 ? config.entity : config.entity + 's')}. This action cannot be undone.`;
        openModal('ba-delete-modal', context);
        break;
      }

      case 'archive': {
        const modal = document.getElementById('ba-archive-modal');
        modal.querySelector('.ba-modal__title').textContent = `Archive ${pluralize(count, 'menu')}?`;
        openModal('ba-archive-modal', context);
        break;
      }

      case 'edit-price': {
        const modal = document.getElementById('ba-price-modal');
        modal.querySelector('.ba-modal__subtitle').textContent =
          `Update price for ${pluralize(count, config.entity)}`;
        // Reset form
        const setRadio = modal.querySelector('input[name="price-adjust"][value="set"]');
        if (setRadio) setRadio.checked = true;
        const input = document.getElementById('ba-price-input');
        if (input) input.value = '';
        updatePriceLabel();
        openModal('ba-price-modal', context);
        break;
      }

      case 'edit-tax': {
        const modal = document.getElementById('ba-tax-modal');
        modal.querySelector('.ba-modal__subtitle').textContent =
          `Update tax rate for ${pluralize(count, config.entity)}`;
        openModal('ba-tax-modal', context);
        break;
      }

      case 'edit-station': {
        const modal = document.getElementById('ba-station-modal');
        modal.querySelector('.ba-modal__subtitle').textContent =
          `Update station profiles for ${pluralize(count, config.entity)}`;
        openModal('ba-station-modal', context);
        break;
      }

      case 'edit-availability': {
        const modal = document.getElementById('ba-availability-modal');
        modal.querySelector('.ba-modal__subtitle').textContent =
          `Update availability for ${pluralize(count, config.entity)}`;
        const availRadio = modal.querySelector('input[name="availability"][value="available"]');
        if (availRadio) availRadio.checked = true;
        openModal('ba-availability-modal', context);
        break;
      }

      case 'duplicate': {
        const rows = getSelectedRows(context);
        rows.forEach(row => {
          const clone = row.cloneNode(true);
          clone.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          clone.classList.remove('table-row--selected');
          // Add "(copy)" to the first name cell
          const nameEl = clone.querySelector('.cell-name-text, .cell-cat-display-name, a');
          if (nameEl) nameEl.textContent = nameEl.textContent.trim() + ' (copy)';
          row.parentNode.insertBefore(clone, row.nextSibling);
        });
        clearSelections(context);
        if (window.lucide) lucide.createIcons();
        break;
      }

      case 'assign-to-menu-items': {
        const modal = document.getElementById('ba-assign-modal');
        modal.querySelector('.ba-modal__subtitle').textContent =
          `Add ${pluralize(count, config.entity)} to menu items`;
        openModal('ba-assign-modal', context);
        break;
      }
    }
  }

  // ── PRICE MODAL HELPERS ───────────────────────────────────────────────────

  function updatePriceLabel() {
    const adjustType = document.querySelector('input[name="price-adjust"]:checked')?.value || 'set';
    const prefix = document.getElementById('ba-price-prefix');
    const suffix = document.getElementById('ba-price-suffix');
    const label = document.getElementById('ba-price-adjust-label');
    const isPct = adjustType === 'increase-pct' || adjustType === 'decrease-pct';
    if (prefix) prefix.textContent = isPct ? '' : '$';
    if (suffix) suffix.textContent = isPct ? '%' : '';
    if (label) {
      const labels = {
        'set': 'New price',
        'increase': 'Increase by',
        'decrease': 'Decrease by',
        'increase-pct': 'Increase by',
        'decrease-pct': 'Decrease by',
      };
      label.textContent = labels[adjustType] || 'New price';
    }
  }

  // ── CONFIRM HANDLERS ──────────────────────────────────────────────────────

  function onDeleteConfirm() {
    getSelectedRows(currentContext).forEach(row => row.remove());
    clearSelections(currentContext);
    closeModal();
  }

  function onArchiveConfirm() {
    getSelectedRows(currentContext).forEach(row => row.remove());
    clearSelections(currentContext);
    closeModal();
  }

  function onPriceConfirm() {
    const adjustType = document.querySelector('input[name="price-adjust"]:checked')?.value || 'set';
    const inputVal = parseFloat(document.getElementById('ba-price-input')?.value);
    if (!isNaN(inputVal) && inputVal >= 0) {
      getSelectedRows(currentContext).forEach(row => {
        Array.from(row.querySelectorAll('td')).forEach(td => {
          const text = td.textContent.trim();
          if (/^\$\d+(\.\d+)?$/.test(text)) {
            const old = parseFloat(text.replace('$', ''));
            let next;
            if (adjustType === 'set') next = inputVal;
            else if (adjustType === 'increase') next = old + inputVal;
            else if (adjustType === 'decrease') next = Math.max(0, old - inputVal);
            else if (adjustType === 'increase-pct') next = old * (1 + inputVal / 100);
            else if (adjustType === 'decrease-pct') next = Math.max(0, old * (1 - inputVal / 100));
            if (next !== undefined) td.textContent = '$' + next.toFixed(2);
          }
        });
      });
    }
    clearSelections(currentContext);
    closeModal();
  }

  function onAvailabilityConfirm() {
    const status = document.querySelector('input[name="availability"]:checked')?.value;
    const statusMap = {
      'available': { cls: 'availability--available', icon: 'circle-check', text: 'Available' },
      'unavailable': { cls: 'availability--unavailable', icon: 'circle-x', text: 'Unavailable' },
      'partial': { cls: 'availability--partial', icon: 'circle-alert', text: 'Partially available' },
    };
    const info = statusMap[status];
    if (info) {
      getSelectedRows(currentContext).forEach(row => {
        const badge = row.querySelector('.availability');
        if (badge) {
          badge.className = `availability ${info.cls}`;
          badge.innerHTML = `<i data-lucide="${info.icon}" class="lucide-icon" style="width:14px;height:14px"></i>${info.text}`;
        }
      });
      if (window.lucide) lucide.createIcons();
    }
    clearSelections(currentContext);
    closeModal();
  }

  // ── INIT ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    // Scrim click closes modal
    document.getElementById('ba-scrim')?.addEventListener('click', closeModal);

    // Wire all price-adjust radios
    document.querySelectorAll('input[name="price-adjust"]').forEach(r =>
      r.addEventListener('change', updatePriceLabel)
    );

    // Wire confirm / cancel buttons
    document.getElementById('ba-delete-confirm')?.addEventListener('click', onDeleteConfirm);
    document.getElementById('ba-delete-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-archive-confirm')?.addEventListener('click', onArchiveConfirm);
    document.getElementById('ba-archive-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-price-confirm')?.addEventListener('click', onPriceConfirm);
    document.getElementById('ba-price-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-tax-confirm')?.addEventListener('click', () => { clearSelections(currentContext); closeModal(); });
    document.getElementById('ba-tax-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-station-confirm')?.addEventListener('click', () => { clearSelections(currentContext); closeModal(); });
    document.getElementById('ba-station-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-availability-confirm')?.addEventListener('click', onAvailabilityConfirm);
    document.getElementById('ba-availability-cancel')?.addEventListener('click', closeModal);
    document.getElementById('ba-assign-confirm')?.addEventListener('click', () => { clearSelections(currentContext); closeModal(); });
    document.getElementById('ba-assign-cancel')?.addEventListener('click', closeModal);

    // Wire all modal close (×) buttons
    document.querySelectorAll('.ba-modal__close').forEach(btn =>
      btn.addEventListener('click', closeModal)
    );

    // Wire all bulk action buttons in all bars
    Object.entries(TABLE_CONFIGS).forEach(([barId, config]) => {
      const bar = document.getElementById(barId);
      if (!bar) return;
      bar.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const count = parseInt(document.getElementById(config.countId)?.textContent) || 0;
          handleAction(btn.getAttribute('data-action'), { barId, config, count });
        });
      });
    });
  });

})();
