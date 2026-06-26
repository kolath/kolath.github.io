// Sidebar: collapse toggle, brand selection, "View all brands" modal
document.addEventListener('DOMContentLoaded', function() {

  var sidebar        = document.getElementById('sidebar');
  var toggleBtn      = document.getElementById('sidebar-toggle');
  var appSwitcher    = document.getElementById('sidebar-app-switcher');
  var viewAllBtn     = document.getElementById('view-all-brands-btn');
  var brandsOverlay  = document.getElementById('brands-modal-overlay');
  var brandsBack     = document.getElementById('brands-modal-back');
  var brandsClose    = document.getElementById('brands-modal-close');
  var brandsTbody    = document.getElementById('brands-modal-tbody');
  var brandsSearch   = document.getElementById('brands-search-input');

  // ── All brands data ──────────────────────────────────────────────
  // Colors from CSDS data-viz weak palette (16% opacity tints)
  // publishStatus: publishing | published | unpublished-menu | unpublish-changes
  // syncStatus:    '' (ok/n-a) | 'problem' (sync_problem icon)
  var ALL_BRANDS = [
    { name: 'Aloha Hibachi',       full: 'Aloha Hibachi (Hawaiian-Inspired Hibachi)', color: 'rgba(249,138,83,0.16)',  logo: 'assets/logo-aloha-hibachi.png',   publishStatus: 'publishing',        syncStatus: '',        locations: 3, channels: 6 },
    { name: 'alpha bowls',         full: 'alpha bowls: greek protein bowls',           color: 'rgba(28,105,232,0.16)',  logo: 'assets/logo-alpha-bowls.png',     publishStatus: 'published',         syncStatus: 'problem', locations: 3, channels: 6 },
    { name: "Big Daddy's",         full: "Big Daddy's Cajun Bowls",                    color: 'rgba(214,85,143,0.16)', logo: 'assets/logo-big-daddys.png',      publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: 'Farmstand',           full: 'Farmstand',                                  color: '#b1e5bf',                                                         publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: "Fatty's Teriyaki",    full: "Fatty's Teriyaki", tag: 'Franchisee',        color: 'rgba(140,66,224,0.16)', logo: 'assets/logo-fattys-teriyaki.png', publishStatus: 'unpublished-menu',  syncStatus: '',        locations: 3, channels: 6 },
    { name: 'Ginger Bowls',        full: 'Ginger Bowls (Healthy Asian Bowls)',         color: 'rgba(228,180,48,0.16)',                                           publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: 'Golden Hour',         full: 'Golden Hour - A Vegan Foodshop',             color: 'rgba(87,182,233,0.16)',                                           publishStatus: 'unpublish-changes', syncStatus: 'problem', locations: 3, channels: 6 },
    { name: 'HotBar',              full: 'HotBar',                                     color: '#f3a4aa',                                                         publishStatus: 'unpublish-changes', syncStatus: '',        locations: 3, channels: 6 },
    { name: 'lulubowls',           full: 'lulubowls (Hawaiian Inspired Bowls)',        color: 'rgba(219,136,242,0.16)',                                          publishStatus: 'unpublished-menu',  syncStatus: '',        locations: 3, channels: 6 },
    { name: 'THRIVE Protein Bowls',full: 'THRIVE Protein Bowls',                       color: 'rgba(36,150,166,0.16)',                                           publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: 'Urban Eats',          full: 'Urban Eats Kitchen',                         color: 'rgba(184,192,86,0.16)',                                           publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: 'The Burger Lab',      full: 'The Burger Lab',                             color: 'rgba(106,205,220,0.16)',                                          publishStatus: 'published',         syncStatus: '',        locations: 3, channels: 6 },
    { name: 'Noodle House',        full: 'Noodle House Express',                       color: 'rgba(249,138,83,0.16)',                                           publishStatus: 'unpublished-menu',  syncStatus: '',        locations: 3, channels: 6 }
  ];

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Publish status badge (CSDS StatusBadge, emphasis: low, size: small) ─
  function publishStatusHtml(s) {
    switch (s) {
      case 'published':
        return '<span class="bm-status bm-status--success">' +
          '<span class="material-symbols-outlined ms">check_circle</span> Published</span>';
      case 'unpublished-menu':
        return '<span class="bm-status bm-status--neutral">' +
          '<span class="material-symbols-outlined ms">warning</span> Unpublished menu</span>';
      case 'unpublish-changes':
        return '<span class="bm-status bm-status--info">' +
          '<span class="material-symbols-outlined ms">info</span> Unpublish changes</span>';
      case 'publishing':
        return '<span class="bm-status bm-status--info">' +
          '<span class="material-symbols-outlined ms">sync</span> Publishing…</span>';
      default:
        return '<span class="bm-status bm-status--info">' +
          '<span class="material-symbols-outlined ms">sync</span> Publishing…</span>';
    }
  }

  // ── Sync status icon (separate column, icon-only) ─────────────────
  function syncStatusHtml(s) {
    if (s === 'problem') {
      return '<span class="bm-sync">' +
        '<span class="material-symbols-outlined ms">sync_problem</span></span>';
    }
    return '<span class="bm-sync"></span>';
  }

  // ── Render brands table ──────────────────────────────────────────
  function renderBrands(list) {
    if (!brandsTbody) return;
    brandsTbody.innerHTML = '';
    list.forEach(function(b) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td style="padding:0">' +
          '<div class="brands-modal__row"' +
            ' data-brand-name="' + escHtml(b.name) + '"' +
            ' data-brand-full="' + escHtml(b.full) + '"' +
            ' data-brand-color="' + b.color + '">' +
            '<span class="brands-modal__brand-avatar" style="background:' + b.color + '">' +
              (b.logo ? '<img src="' + escHtml(b.logo) + '" alt="' + escHtml(b.name) + '">' : b.full.charAt(0).toUpperCase()) +
            '</span>' +
            '<div class="brands-modal__brand-info">' +
              '<span class="brands-modal__brand-name">' + escHtml(b.full) + '</span>' +
              (b.tag ? '<span class="brands-modal__brand-tag">' + escHtml(b.tag) + '</span>' : '') +
            '</div>' +
            publishStatusHtml(b.publishStatus) +
            syncStatusHtml(b.syncStatus) +
            '<span class="brands-modal__meta">' + b.locations + ' locations</span>' +
            '<span class="brands-modal__meta">' + b.channels + ' channels</span>' +
            '<span class="material-symbols-outlined brands-modal__arrow">arrow_forward</span>' +
          '</div>' +
        '</td>';
      brandsTbody.appendChild(tr);
    });
    // (Material Symbols are font-based, no init needed)

    // Row click → select brand
    brandsTbody.querySelectorAll('.brands-modal__row').forEach(function(row) {
      row.addEventListener('click', function() {
        selectBrand(
          row.getAttribute('data-brand-name'),
          row.getAttribute('data-brand-full'),
          row.getAttribute('data-brand-color')
        );
        closeBrandsModal();
      });
    });

  }

  // ── Open / close modal ───────────────────────────────────────────
  function openBrandsModal() {
    if (!brandsOverlay) return;
    renderBrands(ALL_BRANDS);
    brandsOverlay.classList.add('brands-modal-overlay--visible');
  }

  function closeBrandsModal() {
    if (!brandsOverlay) return;
    brandsOverlay.classList.remove('brands-modal-overlay--visible');
  }

  if (viewAllBtn) viewAllBtn.addEventListener('click', openBrandsModal);
  if (brandsBack)  brandsBack.addEventListener('click',  closeBrandsModal);
  if (brandsClose) brandsClose.addEventListener('click', closeBrandsModal);
  if (brandsOverlay) {
    brandsOverlay.addEventListener('click', function(e) {
      if (e.target === brandsOverlay) closeBrandsModal();
    });
  }

  if (brandsSearch) {
    brandsSearch.addEventListener('input', function() {
      var q = brandsSearch.value.toLowerCase();
      renderBrands(q ? ALL_BRANDS.filter(function(b) {
        return b.full.toLowerCase().indexOf(q) !== -1 || b.name.toLowerCase().indexOf(q) !== -1;
      }) : ALL_BRANDS);
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && brandsOverlay &&
        brandsOverlay.classList.contains('brands-modal-overlay--visible')) {
      closeBrandsModal();
    }
  });

  // ── Select / activate brand ──────────────────────────────────────
  function selectBrand(shortName, fullName, color) {
    var childrenEl = document.getElementById('brand-menus');
    if (!childrenEl) return;

    // Look up brand data for logo
    var brandData = ALL_BRANDS.find(function(b) { return b.name === shortName; });
    var logo = brandData && brandData.logo;

    // Check if already in sidebar
    var items = childrenEl.querySelectorAll('.sidebar-item--nested[data-brand]');
    var found = false;
    items.forEach(function(el) {
      if (el.getAttribute('data-brand') === shortName) found = true;
    });

    if (!found) {
      var viewAllRow = childrenEl.querySelector('.sidebar-viewall');
      var newItem = document.createElement('div');
      newItem.className = 'sidebar-item sidebar-item--nested';
      newItem.setAttribute('data-brand', shortName);
      newItem.innerHTML =
        '<div class="sidebar-item__container">' +
          '<span class="sidebar-brand-avatar" ' + (color && !logo ? 'style="background:' + color + '"' : '') + '>' +
            (logo ? '<img src="' + escHtml(logo) + '" alt="' + escHtml(shortName) + '">' : shortName.charAt(0).toUpperCase()) +
          '</span>' +
          '<span class="sidebar-item__label">' + escHtml(shortName) + '</span>' +
        '</div>';
      childrenEl.insertBefore(newItem, viewAllRow);
      var newContainer = newItem.querySelector('.sidebar-item__container');
      newContainer.addEventListener('click', function() {
        activateBrandItem(newItem, shortName);
      });
      wireTooltip(newContainer);
    }

    // Activate it
    var targetItem = Array.from(
      childrenEl.querySelectorAll('.sidebar-item--nested[data-brand]')
    ).find(function(el) { return el.getAttribute('data-brand') === shortName; });

    if (targetItem) activateBrandItem(targetItem, shortName);
  }

  function activateBrandItem(item, brandName) {
    document.querySelectorAll('.sidebar-item--selected').forEach(function(el) {
      el.classList.remove('sidebar-item--selected');
    });
    item.classList.add('sidebar-item--selected');

    var pageTitle = document.getElementById('pageHeaderTitle');
    if (pageTitle) pageTitle.textContent = brandName + ' menus';
    var breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = brandName + ' menus';
    if (window.switchMenu) switchMenu(brandName);

    var brandMenusPage   = document.getElementById('page-brand-menus');
    var skuLibraryPage   = document.getElementById('page-sku-library');
    var pricingRulesPage = document.getElementById('page-pricing-rules');
    if (brandMenusPage)   brandMenusPage.style.display   = '';
    if (skuLibraryPage)   skuLibraryPage.style.display   = 'none';
    if (pricingRulesPage) pricingRulesPage.style.display = 'none';

    syncBrandMenusParentSelection();
  }

  // ── Sidebar collapse toggle ──────────────────────────────────────
  function syncBrandMenusParentSelection() {
    var brandMenusParent = document.querySelector('.sidebar-item--expandable');
    if (!brandMenusParent) return;
    var sidebarCollapsed = sidebar.classList.contains('sidebar--collapsed');
    var accordionCollapsed = document.getElementById('brand-menus').classList.contains('sidebar-children--collapsed');
    var hasSelectedBrand = !!document.querySelector('#brand-menus .sidebar-item--selected');
    if ((sidebarCollapsed || accordionCollapsed) && hasSelectedBrand) {
      brandMenusParent.classList.add('sidebar-item--selected');
    } else {
      brandMenusParent.classList.remove('sidebar-item--selected');
    }
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar--collapsed');
      syncBrandMenusParentSelection();
    });
  }

  if (appSwitcher && sidebar) {
    appSwitcher.addEventListener('click', function() {
      if (!sidebar.classList.contains('sidebar--collapsed')) return;
      sidebar.classList.remove('sidebar--collapsed');
      syncBrandMenusParentSelection();
    });
  }

  // ── Brand-menus expand/collapse ──────────────────────────────────
  document.querySelectorAll('[data-toggle="brand-menus"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = document.getElementById('brand-menus');
      if (!target) return;
      var collapsed = target.classList.toggle('sidebar-children--collapsed');
      var chevron = btn.querySelector('.sidebar-item__chevron');
      if (chevron) chevron.style.transform = collapsed ? 'rotate(180deg)' : '';
      syncBrandMenusParentSelection();
    });
  });

  // ── Wire existing brand items ────────────────────────────────────
  document.querySelectorAll('.sidebar-item--nested[data-brand]').forEach(function(item) {
    item.querySelector('.sidebar-item__container').addEventListener('click', function() {
      activateBrandItem(item, item.getAttribute('data-brand'));
    });
  });

  // ── Collapsed icon tooltips ──────────────────────────────────────
  var tip = document.createElement('div');
  tip.className = 'sidebar-tooltip';
  document.body.appendChild(tip);

  function showTip(text, el, opts) {
    if (!sidebar.classList.contains('sidebar--collapsed') && !(opts && opts.always)) return;
    tip.textContent = text;
    tip.classList.add('sidebar-tooltip--visible');
    var rect = el.getBoundingClientRect();
    tip.style.left = (rect.right + 8) + 'px';
    tip.style.top  = (rect.top + rect.height / 2) + 'px';
  }

  function hideTip() {
    tip.classList.remove('sidebar-tooltip--visible');
  }

  // Toggle button: "Collapse sidebar" / "Expand sidebar"
  if (toggleBtn) {
    toggleBtn.addEventListener('mouseenter', function() {
      var label = sidebar.classList.contains('sidebar--collapsed') ? 'Expand sidebar' : 'Collapse sidebar';
      showTip(label, toggleBtn, { always: true });
    });
    toggleBtn.addEventListener('mouseleave', hideTip);
  }

  if (appSwitcher) {
    appSwitcher.addEventListener('mouseenter', function() {
      showTip('Expand sidebar', appSwitcher);
    });
    appSwitcher.addEventListener('mouseleave', hideTip);
  }

  // Nav item containers — read label text
  function wireTooltip(container) {
    var label = container.querySelector('.sidebar-item__label');
    if (!label) return;
    container.addEventListener('mouseenter', function() {
      showTip(label.textContent.trim(), container);
    });
    container.addEventListener('mouseleave', hideTip);
  }

  document.querySelectorAll('.sidebar-item__container').forEach(function(container) {
    if (container.id !== 'sidebar-toggle') wireTooltip(container);
  });

  // ── Wire other nav items ─────────────────────────────────────────
  document.querySelectorAll('.sidebar-item__container:not([data-toggle])').forEach(function(container) {
    if (container.closest('.sidebar-item--nested')) return;
    container.addEventListener('click', function() {
      var label = container.querySelector('.sidebar-item__label');
      if (!label) return;
      var text = label.textContent.trim();

      document.querySelectorAll('.sidebar-item--selected').forEach(function(el) {
        el.classList.remove('sidebar-item--selected');
      });
      container.closest('.sidebar-item').classList.add('sidebar-item--selected');

      var brandMenusPage   = document.getElementById('page-brand-menus');
      var skuLibraryPage   = document.getElementById('page-sku-library');
      var pricingRulesPage = document.getElementById('page-pricing-rules');
      var activityPage     = document.getElementById('page-activity');
      var archivedMenusPage = document.getElementById('page-archived-menus');
      var hide = function() {
        if (brandMenusPage)   brandMenusPage.style.display   = 'none';
        if (skuLibraryPage)   skuLibraryPage.style.display   = 'none';
        if (pricingRulesPage) pricingRulesPage.style.display = 'none';
        if (activityPage)     activityPage.style.display     = 'none';
        if (archivedMenusPage) archivedMenusPage.style.display = 'none';
      };

      if (text === 'SKU library') {
        hide();
        if (skuLibraryPage) { skuLibraryPage.style.display = ''; if (window.lucide) lucide.createIcons(); }
      } else if (text === 'Pricing rules' || text === 'Tax rules') {
        hide();
        if (pricingRulesPage) pricingRulesPage.style.display = '';
      } else if (text === 'Activity log') {
        hide();
        if (activityPage) activityPage.style.display = '';
      } else if (text === 'Archived menus') {
        hide();
        if (archivedMenusPage) archivedMenusPage.style.display = '';
      } else {
        hide();
        if (brandMenusPage) brandMenusPage.style.display = '';
      }
    });
  });

});
