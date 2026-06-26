(function () {
  var CHANNEL_LOGOS = {
    'DoorDash': 'assets/thumbnails/DoorDash.svg',
    'Uber Eats': 'assets/thumbnails/Uber Eats.svg',
    'Grubhub': 'assets/thumbnails/Grubhub.svg',
    'Otter Online Orders': 'assets/Icons/App Icons/Online Ordering.svg',
    'Otter POS': 'assets/Icons/App Icons/POS.svg'
  };

  var channels = ['DoorDash', 'Uber Eats', 'Grubhub', 'Otter Online Orders', 'Otter POS'];

  var locations = [
    {
      name: 'Greens - Culver City',
      address: '9130 Wiley Blvd, Culver City, CA 90095, USA',
      statuses: ['completed', 'completed', 'progress', 'failed', 'pending']
    },
    {
      name: 'Greens - Culver City',
      address: '412 Ocean Ave, Santa Monica, CA 90401, USA',
      statuses: ['pending', 'pending', 'pending', 'pending', 'pending']
    },
    {
      name: 'Greens - Culver City',
      address: '1800 Lincoln Blvd, Venice, CA 90291, USA',
      statuses: ['pending', 'pending', 'pending', 'pending', 'pending']
    },
    {
      name: 'Greens - Culver City',
      address: '8000 Sunset Blvd, West Hollywood, CA 90046, USA',
      statuses: ['pending', 'pending', 'pending', 'pending', 'pending']
    },
    {
      name: 'Greens - Culver City',
      address: '280 E Colorado Blvd, Pasadena, CA 91101, USA',
      statuses: ['pending', 'pending', 'pending', 'pending', 'pending']
    }
  ];

  var state = {
    tab: 'status',
    view: 'location',
    status: 'all',
    query: '',
    openTiles: {},
    activeFailedRow: null
  };

  var els = {};

  function init() {
    ensureMarkup();

    els.scrim = document.getElementById('entity-scrim');
    els.panel = document.getElementById('entity-panel');
    els.pages = document.getElementById('entity-pages');
    els.close = document.getElementById('entity-close');
    els.issuesClose = document.getElementById('issues-close');
    els.back = document.getElementById('back-to-main');
    els.search = document.getElementById('entity-search');
    els.results = document.getElementById('entity-results');
    els.count = document.getElementById('result-count');
    els.statusButton = document.getElementById('status-filter-button');
    els.statusLabel = document.getElementById('status-filter-label');
    els.statusMenu = document.getElementById('status-menu');
    els.infoList = document.getElementById('information-list');
    els.popover = document.getElementById('insight-popover');
    els.popoverContent = document.getElementById('insight-content');

    bindEvents();
    var params = new URLSearchParams(window.location.search);
    var shouldOpenOverlay = params.get('overlay') === '1' || params.get('openFirst') === '1';
    if (params.get('openFirst') === '1') {
      state.openTiles[0] = true;
    }
    render();
    renderInformation();
    if (shouldOpenOverlay) {
      openOverlay();
    }
    if (params.get('assistant') === '1') {
      setTimeout(function () {
        openEntityAssistant('nested-modifiers');
      }, 100);
    }
  }

  function ensureMarkup() {
    if (document.getElementById('entity-panel')) return;

    document.body.insertAdjacentHTML('beforeend', [
      '<div class="entity-scrim is-hidden" id="entity-scrim"></div>',
      '<section class="entity-panel" id="entity-panel" role="dialog" aria-modal="true" aria-labelledby="entity-title">',
        '<div class="entity-pages" id="entity-pages">',
          '<article class="entity-page" id="entity-page-main">',
            '<header class="entity-header">',
              '<h1 class="entity-header__title" id="entity-title">Publish menu: [Brand name]</h1>',
              '<button class="entity-icon-button" id="entity-close" type="button" aria-label="Close overlay">',
                '<span class="material-symbols-outlined" aria-hidden="true">close</span>',
              '</button>',
            '</header>',
            '<div class="entity-body">',
              '<nav class="entity-pill-tabs" aria-label="Publish details">',
                '<button class="entity-pill entity-pill--active" type="button" data-tab="status">Status</button>',
                '<button class="entity-pill" type="button" data-tab="information">Information</button>',
              '</nav>',
              '<section class="entity-tab-panel" id="tab-status">',
                '<div class="entity-notice">',
                  '<span class="material-symbols-outlined entity-notice__icon" aria-hidden="true">warning</span>',
                  '<p>Otter assistant identified 2 likely causes behind the failed publishes.</p>',
                  '<button class="entity-secondary-button" id="view-issues" type="button">View issues</button>',
                '</div>',
                '<section class="entity-progress" aria-label="Publishing progress">',
                  '<p class="entity-progress__label">Publishing menu to 25 destinations</p>',
                  '<div class="stack-bar" id="stack-bar" role="img" aria-label="13 completed, 7 in progress, 2 failed, 6 pending">',
                    '<button class="stack-bar__segment stack-bar__segment--completed" type="button" data-status="completed" style="width:52%" aria-label="13 completed"></button>',
                    '<button class="stack-bar__segment stack-bar__segment--progress" type="button" data-status="progress" style="width:28%" aria-label="7 in progress"></button>',
                    '<button class="stack-bar__segment stack-bar__segment--failed" type="button" data-status="failed" style="width:8%" aria-label="2 failed"></button>',
                    '<button class="stack-bar__segment stack-bar__segment--pending" type="button" data-status="pending" style="width:12%" aria-label="6 pending"></button>',
                  '</div>',
                  '<div class="entity-progress__legend">',
                    '<button class="legend-item" type="button" data-status-filter="completed"><span class="legend-dot legend-dot--completed"></span>13 completed</button>',
                    '<button class="legend-item" type="button" data-status-filter="progress"><span class="legend-dot legend-dot--progress"></span>7 in progress</button>',
                    '<button class="legend-item" type="button" data-status-filter="failed"><span class="legend-dot legend-dot--failed"></span>2 failed</button>',
                    '<button class="legend-item" type="button" data-status-filter="pending"><span class="legend-dot legend-dot--pending"></span>6 pending</button>',
                  '</div>',
                '</section>',
                '<section class="entity-list-area">',
                  '<div class="entity-toolbar">',
                    '<label class="entity-search">',
                      '<span class="material-symbols-outlined" aria-hidden="true">search</span>',
                      '<input id="entity-search" type="search" placeholder="Search..." autocomplete="off">',
                    '</label>',
                    '<div class="entity-filter-wrap">',
                      '<button class="entity-filter" id="status-filter-button" type="button" aria-haspopup="listbox" aria-expanded="false">',
                        '<span id="status-filter-label">Status</span>',
                        '<span class="material-symbols-outlined" aria-hidden="true">expand_more</span>',
                      '</button>',
                      '<div class="entity-menu" id="status-menu" role="listbox" aria-label="Status filter">',
                        '<button type="button" data-menu-status="all">All statuses</button>',
                        '<button type="button" data-menu-status="failed">Failed</button>',
                        '<button type="button" data-menu-status="progress">In progress</button>',
                        '<button type="button" data-menu-status="pending">Pending</button>',
                        '<button type="button" data-menu-status="completed">Completed</button>',
                      '</div>',
                    '</div>',
                  '</div>',
                  '<div class="entity-view-row">',
                    '<strong id="result-count">5 locations</strong>',
                    '<div class="entity-view-switch">',
                      '<span>View by</span>',
                      '<div class="segment-control" role="group" aria-label="View by">',
                        '<button class="segment-control__button segment-control__button--active" type="button" data-view="location">Location</button>',
                        '<button class="segment-control__button" type="button" data-view="channel">Channel</button>',
                      '</div>',
                    '</div>',
                  '</div>',
                  '<div class="entity-results" id="entity-results"></div>',
                '</section>',
              '</section>',
              '<section class="entity-tab-panel entity-tab-panel--hidden" id="tab-information">',
                '<div class="information-list" id="information-list"></div>',
              '</section>',
            '</div>',
          '</article>',
          '<article class="entity-page" id="entity-page-issues">',
            '<header class="entity-header entity-header--compact">',
              '<div class="entity-header__left">',
                '<button class="entity-icon-button" id="back-to-main" type="button" aria-label="Back to status">',
                  '<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>',
                '</button>',
                '<h2 class="entity-header__title">AI publish insights</h2>',
              '</div>',
              '<button class="entity-icon-button" id="issues-close" type="button" aria-label="Close overlay">',
                '<span class="material-symbols-outlined" aria-hidden="true">close</span>',
              '</button>',
            '</header>',
            '<div class="issues-body">',
              '<p class="issues-eyebrow">Last publish attempted on May 23 12:07 PM</p>',
              '<div class="issue-card">',
                '<div class="issue-card__header">',
                  '<img src="assets/Icons/Otter_ai.svg" alt="" class="issue-card__icon">',
                  '<h3>Modifier group "Fruit Toppings" has no items</h3>',
                '</div>',
                '<p>This issue prevented publishing to 2 locations across 4 channels.</p>',
                '<h4>Affected locations</h4>',
                '<ul><li>Greens - Culver City</li><li>Greens - Santa Monica</li></ul>',
                '<h4>How to fix</h4>',
                '<p>Add at least one item to the modifier group, then publish again.</p>',
                '<button class="entity-primary-button" type="button" data-entity-assistant-fix="empty-modifier">Fix with Otter Assistant</button>',
              '</div>',
              '<div class="issue-card">',
                '<div class="issue-card__header">',
                  '<img src="assets/Icons/Otter_ai.svg" alt="" class="issue-card__icon">',
                  '<h3>Nested modifier groups aren&apos;t supported</h3>',
                '</div>',
                '<p>Direct Orders could not be updated because several menu items contain nested modifier groups.</p>',
                '<h4>Affected items</h4>',
                '<ul><li>Fiji Water</li><li>Banana Chia Pudding</li><li>Vegan - The Impossible Pizza</li></ul>',
                '<h4>How to fix</h4>',
                '<p>Remove nested modifier groups from the affected menu items, then publish again.</p>',
                '<button class="entity-primary-button" type="button" data-entity-assistant-fix="nested-modifiers">Fix with Otter Assistant</button>',
              '</div>',
            '</div>',
          '</article>',
        '</div>',
      '</section>',
      '<aside class="insight-popover" id="insight-popover" aria-live="polite">',
        '<div class="insight-popover__header">',
          '<strong>AI publish insights</strong>',
          '<button class="entity-icon-button entity-icon-button--ghost" id="popover-close" type="button" aria-label="Close insight">',
            '<span class="material-symbols-outlined" aria-hidden="true">close</span>',
          '</button>',
        '</div>',
        '<div class="insight-popover__content" id="insight-content"></div>',
      '</aside>'
    ].join(''));
  }

  function bindEvents() {
    els.close.addEventListener('click', closeOverlay);
    els.issuesClose.addEventListener('click', closeOverlay);
    els.scrim.addEventListener('click', closeOverlay);
    els.back.addEventListener('click', showMainPage);

    document.querySelectorAll('[data-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.tab = button.getAttribute('data-tab');
        document.querySelectorAll('[data-tab]').forEach(function (tab) {
          tab.classList.toggle('entity-pill--active', tab === button);
        });
        document.getElementById('tab-status').classList.toggle('entity-tab-panel--hidden', state.tab !== 'status');
        document.getElementById('tab-information').classList.toggle('entity-tab-panel--hidden', state.tab !== 'information');
      });
    });

    els.search.addEventListener('input', function () {
      state.query = els.search.value.trim().toLowerCase();
      render();
    });

    els.statusButton.addEventListener('click', function () {
      var open = !els.statusMenu.classList.contains('entity-menu--open');
      setStatusMenu(open);
    });

    els.statusMenu.querySelectorAll('[data-menu-status]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.status = button.getAttribute('data-menu-status');
        setStatusMenu(false);
        render();
      });
    });

    document.querySelectorAll('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.view = button.getAttribute('data-view');
        document.querySelectorAll('[data-view]').forEach(function (viewButton) {
          viewButton.classList.toggle('segment-control__button--active', viewButton === button);
        });
        closeInsightPopover();
        render();
      });
    });

    document.querySelectorAll('[data-status-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        var selected = button.getAttribute('data-status-filter');
        state.status = state.status === selected ? 'all' : selected;
        render();
      });
    });

    document.querySelectorAll('.stack-bar__segment').forEach(function (button) {
      button.addEventListener('click', function () {
        var selected = button.getAttribute('data-status');
        state.status = state.status === selected ? 'all' : selected;
        render();
      });
    });

    document.getElementById('view-issues').addEventListener('click', function () {
      closeInsightPopover();
      els.pages.classList.add('entity-pages--issues');
    });

    document.getElementById('popover-close').addEventListener('click', closeInsightPopover);

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.entity-filter-wrap')) setStatusMenu(false);
      if (!event.target.closest('.insight-popover') && !event.target.closest('.channel-row--failed')) {
        closeInsightPopover();
      }
    });

    document.addEventListener('click', function (event) {
      var fixButton = event.target.closest('[data-entity-assistant-fix]');
      if (!fixButton) return;
      event.preventDefault();
      openEntityAssistant(fixButton.getAttribute('data-entity-assistant-fix'));
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (els.popover.classList.contains('insight-popover--visible')) closeInsightPopover();
        else closeOverlay();
      }
    });
  }

  function setStatusMenu(open) {
    els.statusMenu.classList.toggle('entity-menu--open', open);
    els.statusButton.setAttribute('aria-expanded', String(open));
  }

  function openOverlay() {
    els.scrim.classList.remove('is-hidden');
    els.panel.classList.add('entity-panel--visible');
  }

  function closeOverlay() {
    closeInsightPopover();
    els.pages.classList.remove('entity-pages--issues');
    els.panel.classList.remove('entity-panel--visible');
    els.scrim.classList.add('is-hidden');
  }

  function showMainPage() {
    els.pages.classList.remove('entity-pages--issues');
  }

  function getLocationSummary(location) {
    var failed = location.statuses.filter(function (status) { return status === 'failed'; }).length;
    var completed = location.statuses.filter(function (status) { return status === 'completed'; }).length;
    var pending = location.statuses.filter(function (status) { return status === 'pending'; }).length;

    if (failed > 0) {
      return { text: completed + '/' + location.statuses.length, failed: true };
    }
    if (pending === location.statuses.length) {
      return { text: location.statuses.length + ' pending', failed: false };
    }
    return { text: completed + '/' + location.statuses.length, failed: false };
  }

  function locationMatches(location) {
    var queryMatches = !state.query ||
      location.name.toLowerCase().includes(state.query) ||
      location.address.toLowerCase().includes(state.query) ||
      channels.some(function (channel) { return channel.toLowerCase().includes(state.query); });

    var statusMatches = state.status === 'all' || location.statuses.indexOf(state.status) !== -1;
    return queryMatches && statusMatches;
  }

  function getFilteredLocations() {
    return locations.filter(locationMatches);
  }

  function render() {
    updateStatusControls();
    if (state.view === 'location') renderLocations();
    else renderChannels();
  }

  function updateStatusControls() {
    var labels = {
      all: 'Status',
      completed: 'Completed',
      progress: 'In progress',
      failed: 'Failed',
      pending: 'Pending'
    };

    els.statusLabel.textContent = labels[state.status] || 'Status';

    els.statusMenu.querySelectorAll('[data-menu-status]').forEach(function (button) {
      button.setAttribute('aria-selected', String(button.getAttribute('data-menu-status') === state.status));
    });

    document.querySelectorAll('[data-status-filter]').forEach(function (button) {
      var status = button.getAttribute('data-status-filter');
      button.classList.toggle('is-muted', state.status !== 'all' && state.status !== status);
    });
  }

  function renderLocations() {
    var filtered = getFilteredLocations();
    els.count.textContent = filtered.length + (filtered.length === 1 ? ' location' : ' locations');

    if (!filtered.length) {
      els.results.innerHTML = '<div class="empty-state">No locations match the current filters.</div>';
      return;
    }

    els.results.innerHTML = filtered.map(function (location) {
      return locationTemplate(location, locations.indexOf(location));
    }).join('');

    els.results.querySelectorAll('.location-tile__row').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.closest('.location-tile').getAttribute('data-location-id');
        state.openTiles[id] = !state.openTiles[id];
        renderLocations();
      });
    });

    bindFailedRows();
  }

  function locationTemplate(location, locationId) {
    var summary = getLocationSummary(location);
    var weak = location.statuses.every(function (status) { return status === 'pending'; });
    var open = !!state.openTiles[locationId];

    var channelsHtml = channels.map(function (channel, channelIndex) {
      var status = location.statuses[channelIndex];
      return ofoBadgeTemplate(channel, status, location.name);
    }).join('');

    return (
      '<article class="location-tile' + (weak ? ' location-tile--weak' : '') + (open ? ' location-tile--open' : '') + '" data-location-id="' + locationId + '">' +
        '<button class="location-tile__row" type="button">' +
          '<span class="location-pin"><span class="material-symbols-outlined" aria-hidden="true">location_on</span></span>' +
          '<span class="location-tile__copy">' +
            '<span class="location-tile__name">' + escapeHtml(location.name) + '</span>' +
          '</span>' +
          '<span class="location-tile__summary">' + (summary.failed ? '<span class="status-dot"></span>' : '') + escapeHtml(summary.text) + '</span>' +
          '<span class="location-chevron"><span class="material-symbols-outlined" aria-hidden="true">' + (open ? 'keyboard_arrow_up' : 'keyboard_arrow_down') + '</span></span>' +
        '</button>' +
        '<div class="ofo-list">' + channelsHtml + '</div>' +
      '</article>'
    );
  }

  function renderChannels() {
    var filteredLocations = getFilteredLocations();
    var rows = channels.map(function (channel, channelIndex) {
      var statuses = locations.map(function (location) { return location.statuses[channelIndex]; });
      var failed = statuses.filter(function (status) { return status === 'failed'; }).length;
      var pending = statuses.filter(function (status) { return status === 'pending'; }).length;
      var completed = statuses.filter(function (status) { return status === 'completed'; }).length;
      var progress = statuses.filter(function (status) { return status === 'progress'; }).length;
      var primaryStatus = failed ? 'failed' : progress ? 'progress' : pending === statuses.length ? 'pending' : 'completed';
      var visible = filteredLocations.some(function (location) {
        return state.status === 'all' || location.statuses[channelIndex] === state.status;
      });
      if (!visible) return '';
      return channelSummaryTemplate(channel, primaryStatus, completed, statuses.length);
    }).filter(Boolean);

    els.count.textContent = rows.length + (rows.length === 1 ? ' channel' : ' channels');
    els.results.innerHTML = rows.length ? rows.join('') : '<div class="empty-state">No channels match the current filters.</div>';
    bindFailedRows();
  }

  function channelSummaryTemplate(channel, status, completed, total) {
    return (
      '<article class="location-tile' + (status === 'pending' ? ' location-tile--weak' : '') + '">' +
        '<div class="location-tile__row">' +
          '<img class="channel-logo" src="' + CHANNEL_LOGOS[channel] + '" alt="">' +
          '<span class="location-tile__copy"><span class="location-tile__name">' + escapeHtml(channel) + '</span></span>' +
          '<span class="location-tile__summary">' + (status === 'failed' ? '<span class="status-dot"></span>' : '') + completed + '/' + total + '</span>' +
          statusIcon(status) +
        '</div>' +
      '</article>'
    );
  }

  function channelRowTemplate(channel, status, locationName) {
    var failed = status === 'failed';
    return (
      '<button class="channel-row channel-row--' + status + (failed ? ' channel-row--failed' : '') + '" type="button" data-channel="' + escapeHtml(channel) + '" data-location="' + escapeHtml(locationName) + '">' +
        '<img class="channel-logo" src="' + CHANNEL_LOGOS[channel] + '" alt="">' +
        '<span class="channel-name">' + escapeHtml(channel) + '</span>' +
        statusIcon(status) +
      '</button>'
    );
  }

  function ofoBadgeTemplate(channel, status, locationName) {
    var failed = status === 'failed';
    return (
      '<button class="ofo-badge ofo-badge--' + status + (failed ? ' ofo-badge--failed' : '') + '" type="button" data-channel="' + escapeHtml(channel) + '" data-location="' + escapeHtml(locationName) + '" aria-label="' + escapeHtml(channel + ' ' + status) + '">' +
        '<img class="ofo-badge__logo" src="' + CHANNEL_LOGOS[channel] + '" alt="">' +
        badgeStatusIcon(status) +
      '</button>'
    );
  }

  function statusIcon(status) {
    if (status === 'completed') {
      return '<span class="material-symbols-outlined channel-status channel-status--completed" aria-label="Completed">check_circle</span>';
    }
    if (status === 'progress') {
      return '<span class="channel-status channel-status--progress" aria-label="In progress"></span>';
    }
    if (status === 'failed') {
      return '<span class="material-symbols-outlined channel-status channel-status--failed" aria-label="Failed">error</span>';
    }
    return '<span class="material-symbols-outlined channel-status channel-status--pending" aria-label="Pending">radio_button_unchecked</span>';
  }

  function badgeStatusIcon(status) {
    if (status === 'completed') {
      return '<span class="material-symbols-outlined ofo-badge__status ofo-badge__status--completed" aria-hidden="true">check_circle</span>';
    }
    if (status === 'progress') {
      return '<span class="ofo-badge__status ofo-badge__status--progress" aria-hidden="true"></span>';
    }
    if (status === 'failed') {
      return '<span class="material-symbols-outlined ofo-badge__status ofo-badge__status--failed" aria-hidden="true">error</span>';
    }
    return '<span class="material-symbols-outlined ofo-badge__status ofo-badge__status--pending" aria-hidden="true">radio_button_unchecked</span>';
  }

  function bindFailedRows() {
    els.results.querySelectorAll('.channel-row--failed, .ofo-badge--failed').forEach(function (row) {
      row.addEventListener('click', function (event) {
        event.stopPropagation();
        openInsightPopover(row);
      });
    });
  }

  function openInsightPopover(row) {
    if (state.activeFailedRow) state.activeFailedRow.classList.remove('channel-row--active');
    state.activeFailedRow = row;
    row.classList.add('channel-row--active');

    var channel = row.getAttribute('data-channel') || 'Direct Orders';
    var location = row.getAttribute('data-location') || 'Greens - Culver City';
    els.popoverContent.innerHTML =
      '<div class="insight-card">' +
        '<div class="insight-card__title">' +
          '<img src="assets/Icons/Otter_ai.svg" alt="">' +
          '<strong>Nested modifier groups aren&apos;t supported</strong>' +
        '</div>' +
        '<p>' + escapeHtml(channel) + ' could not publish for ' + escapeHtml(location) + ' because several menu items contain nested modifier groups.</p>' +
        '<h4>Affected items</h4>' +
        '<ul><li>Fiji Water</li><li>Banana Chia Pudding</li><li>Vegan - The Impossible Pizza</li></ul>' +
        '<h4>How to fix</h4>' +
        '<p>Remove nested modifier groups from the affected menu items, then publish again.</p>' +
        '<button class="entity-primary-button" type="button" data-entity-assistant-fix="nested-modifiers">Fix with Otter Assistant</button>' +
      '</div>';

    els.popover.classList.add('insight-popover--visible');
    positionPopover(row);
  }

  function positionPopover(row) {
    var rowRect = row.getBoundingClientRect();
    var panelRect = els.panel.getBoundingClientRect();
    var gap = 12;
    var width = 360;
    var left = Math.max(12, panelRect.left - width - gap);
    var top = rowRect.top - 8;
    var height = els.popover.offsetHeight || 360;
    if (top + height > window.innerHeight - 12) top = window.innerHeight - height - 12;
    if (top < 12) top = 12;
    els.popover.style.left = left + 'px';
    els.popover.style.top = top + 'px';
  }

  function closeInsightPopover() {
    els.popover.classList.remove('insight-popover--visible');
    if (state.activeFailedRow) {
      state.activeFailedRow.classList.remove('channel-row--active');
      state.activeFailedRow = null;
    }
  }

  function renderInformation() {
    var rows = [
      ['Event ID', '8f63f4bf-cb89-4b04-b2f8-b9b8ffd11fa5'],
      ['Published version', 'BN-V12.1'],
      ['Started at', '05/26/2026, 10:57:23 AM'],
      ['Completed at', '--'],
      ['Duration', '--'],
      ['Published by', 'Hui Tan'],
      ['Brand', 'Breakfast Beauties'],
      ['Locations', '5 locations'],
      ['Channels', '5 channels']
    ];

    els.infoList.innerHTML = rows.map(function (row) {
      return '<div class="information-row"><span>' + escapeHtml(row[0]) + '</span><span>' + escapeHtml(row[1]) + '</span></div>';
    }).join('');
  }

  function openEntityAssistant(issueKey) {
    closeInsightPopover();
    var message = assistantMessage(issueKey);
    if (typeof window.openAssistant === 'function') {
      window.openAssistant(message);
      return;
    }
    document.body.classList.add('assistant-open');
  }

  function assistantMessage(issueKey) {
    if (issueKey === 'empty-modifier') {
      return 'Publish failed because modifier group "Fruit Toppings" has no items. Add at least one item to the modifier group, then publish again.';
    }
    return 'Publish failed because nested modifier groups are not supported. Remove nested modifier groups from the affected menu items, then publish again.';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
