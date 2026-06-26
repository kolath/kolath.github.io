document.addEventListener('DOMContentLoaded', function () {

  var widget    = document.getElementById('publish-queue');
  var pill      = document.getElementById('pq-pill');
  var card      = document.getElementById('pq-card');
  var showless  = document.getElementById('pq-showless');
  var cardClose = document.getElementById('pq-card-close');
  var overlay   = document.getElementById('psp-overlay');
  var panel     = document.getElementById('psp-panel');
  var pspClose  = document.getElementById('psp-close');

  // ── Channel logos ────────────────────────────────────────────────
  var LOGOS = {
    'DoorDash':           'assets/thumbnails/DoorDash.svg',
    'Uber Eats':          'assets/thumbnails/Uber Eats.svg',
    'Grubhub':            'assets/thumbnails/Grubhub.svg',
    'Otter Online Orders':'assets/Icons/App Icons/Online Ordering.svg',
    'Otter POS':          'assets/Icons/App Icons/POS.svg',
  };

  var CHANNELS = ['DoorDash', 'Uber Eats', 'Grubhub', 'Otter Online Orders', 'Otter POS'];

  var LOCATIONS = [
    { name: 'Greens – Culver City',   addr: '9130 Wiley Blvd, Culver City, CA 90095, USA' },
    { name: 'Greens – Santa Monica',  addr: '412 Ocean Ave, Santa Monica, CA 90401, USA' },
    { name: 'Greens – Venice',        addr: '1800 Lincoln Blvd, Venice, CA 90291, USA' },
    { name: 'Greens – West Hollywood',addr: '8000 Sunset Blvd, West Hollywood, CA 90046, USA' },
    { name: 'Greens – Pasadena',      addr: '280 E Colorado Blvd, Pasadena, CA 91101, USA' },
  ];

  // Diamond/pending icon SVG (inline)
  var OTTER_AI_ICON = '<img class="psp-banner__icon" src="assets/Icons/Otter_ai.svg" alt="">';

  // ── Task data ────────────────────────────────────────────────────
  var TASKS = {
    progress: {
      status: 'progress',
      cancelable: false,
      bannerText: 'Otter assistant identified 2 likely causes behind the failed publishes.',
      bannerBtn: 'View issues',
      counts: { completed: 13, progress: 7, failed: 2, pending: 6 },
      hasFailed: true,
      locationStatus: function(li, ci) {
        if (li === 0 && ci < 2) return 'completed';
        if (li === 0 && ci === 2) return 'progress';
        if (li === 0 && ci === 3) return 'failed';
        if (li === 0 && ci === 4) return 'pending';
        if (li === 1) return 'completed';
        return 'pending';
      },
      locationCount: function(li) {
        if (li === 0) return '2/5';
        if (li === 1) return '5/5';
        return '5 pending';
      },
    },
    pending: {
      status: 'pending',
      cancelable: true,
      bannerText: '25 publishes are queued and waiting to begin.',
      bannerBtn: null,
      counts: { completed: 0, progress: 0, failed: 0, pending: 25 },
      locationStatus: function() { return 'pending'; },
      locationCount: function() { return '5 pending'; },
    },
    completed: {
      status: 'completed',
      cancelable: false,
      bannerText: '25 publishing is finished within xx minutes.',
      bannerBtn: null,
      counts: { completed: 25, progress: 0, failed: 0, pending: 0 },
      locationStatus: function() { return 'completed'; },
      locationCount: function() { return '5/5'; },
    },
    cancelled: {
      status: 'cancelled',
      cancelable: false,
      bannerText: 'Your publish got canceled due to time out.',
      bannerBtn: null,
      counts: { completed: 0, progress: 0, failed: 0, pending: 0 },
      locationStatus: function() { return 'cancelled'; },
      locationCount: function() { return '5 canceled'; },
    },
  };

  // ── Queue state: ordered tasks ───────────────────────────────────
  // count: optional progress display e.g. "12/50" for in-progress tasks
  // published/failed: optional summary display e.g. "12 published, 2 failed"
  var QUEUE = [];
  var currentQueueTask = null; // tracks which task's side panel is open
  var publishedPillLabel = null;
  var publishedPillTimer = null;

  // Green filter ≈ #46B760 ; Blue filter ≈ #1258D2
  var GREEN_FILTER = 'brightness(0) saturate(100%) invert(62%) sepia(38%) saturate(560%) hue-rotate(78deg) brightness(92%) contrast(85%)';
  var BLUE_FILTER  = 'brightness(0) saturate(100%) invert(28%) sepia(96%) saturate(2120%) hue-rotate(213deg) brightness(91%) contrast(91%)';

  // Returns icon HTML for a task state (24px, queue context)
  function queueTaskIcon(state) {
    if (state === 'completed') {
      return '<span class="material-symbols-outlined pq-task__icon" style="font-size:20px;line-height:1;font-variation-settings:\'FILL\' 1;color:#46B760">check_circle</span>';
    }
    if (state === 'progress') {
      return '<img src="assets/icons/icon-loader.svg" class="pq-task__icon pq-task__icon--progress" style="filter:' + BLUE_FILTER + '" alt="">';
    }
    return '<img src="assets/icons/Dashed Circle.svg" class="pq-task__icon icon-gray" alt="">';
  }

  function publishedLabelForTask(task) {
    if (!task) return 'Menu published';
    if (task.name === 'Publish menu hour') return 'Menu hour published';
    if (task.name === 'Publish item availability') return 'Availability published';
    return 'Menu published';
  }

  function queueTaskDescription(task) {
    if (!task) return '';
    if (task.state === 'progress') {
      if (task.published && task.failed) {
        return '<span>' + task.published + '</span><span>, </span><span class="pq-task__description--failed">' + task.failed + '</span>';
      }
      if (task.published) return '<span>' + task.published + '</span>';
      return task.count ? '<span>' + task.count + ' locations published</span>' : '<span>Publishing now</span>';
    }
    if (task.state === 'completed') return '<span>Published</span>';
    if (task.state === 'cancelled') return '<span>Canceled</span>';
    if (task.failed) return '<span class="pq-task__description--failed">' + task.failed + '</span>';
    return '<span>Queued</span>';
  }

  function showPublishedPill(label) {
    publishedPillLabel = label || 'Menu published';
    clearTimeout(publishedPillTimer);
    queueRender();
    publishedPillTimer = setTimeout(function() {
      publishedPillLabel = null;
      queueRender();
    }, 5000);
  }

  function promoteNextPendingTask() {
    var next = QUEUE.find(function(t) { return t.state === 'pending'; });
    if (!next) return;
    next.state = 'progress';
    next.count = next.name === 'Publish menu' ? '0/25' : null;
  }

  function completeQueueTask(task) {
    if (!task || task.state === 'completed') return;
    var label = publishedLabelForTask(task);
    task.state = 'completed';
    task.count = null;
    if (!QUEUE.some(function(t) { return t.state === 'progress'; })) {
      promoteNextPendingTask();
    }
    showPublishedPill(label);
  }

  function hasActiveMenuPublish() {
    return QUEUE.some(function(t) {
      return t.name === 'Publish menu' && t.state !== 'completed' && t.state !== 'cancelled';
    });
  }

  function syncOngoingPublishState() {
    var hasOngoing = QUEUE.some(function(t) {
      return t.state === 'progress' || t.state === 'pending';
    });
    document.body.classList.toggle('has-ongoing-publish', hasOngoing);

    document.querySelectorAll('.pp-trigger-btn').forEach(function(btn) {
      if (hasActiveMenuPublish()) {
        btn.classList.add('btn--publishing');
        btn.innerHTML = '<span class="pp-btn-spinner">progress_activity</span>Publishing';
        btn.onclick = function() { openQueueCard(); };
      } else {
        btn.classList.remove('btn--publishing');
        btn.innerHTML = 'Publish';
        btn.onclick = window.openPanel;
      }
    });
  }

  function openQueueCard() {
    widget.style.display = '';
    pill.style.display = 'none';
    pill.style.visibility = '';
    card.classList.add('pq-card--visible');
  }

  window.pqHasActiveMenuPublish = hasActiveMenuPublish;
  window.pqOpenQueueCard = openQueueCard;

  function queueRender() {
    var list = document.getElementById('pq-task-list');
    list.innerHTML = '';

    var inProgressCount = QUEUE.filter(function(t) { return t.state === 'progress'; }).length;
    var pendingCount    = QUEUE.filter(function(t) { return t.state === 'pending'; }).length;
    var activeCount     = inProgressCount + pendingCount;
    var total           = QUEUE.length;

    // Header / pill label
    var cardTitle = document.getElementById('pq-card-title');
    var cardSummary = document.getElementById('pq-card-summary');
    var pillLabel = document.getElementById('pq-pill-label');
    var cardIcon  = document.getElementById('pq-card-icon');
    var pillIcon  = document.getElementById('pq-pill-icon');
    var pill      = document.getElementById('pq-pill');

    var completedCount = QUEUE.filter(function(t){ return t.state === 'completed'; }).length;
    var visibleProgressCount = Math.max(inProgressCount, activeCount > 0 ? 1 : 0);

    if (pill) pill.classList.remove('pq-pill--done', 'pq-pill--temp-complete');

    if (activeCount > 0) {
      // Static progress ring %: completed + half-credit for in-progress, min 20% for visibility
      var pct = Math.round((completedCount + 0.5 * inProgressCount) / total * 100);
      if (pct < 20) pct = 20;
      if (pct > 100) pct = 100;

      if (cardTitle) cardTitle.textContent = visibleProgressCount + '/' + total + ' publishing';
      var progressTask = QUEUE.find(function(t) { return t.state === 'progress'; });
      var summaryText = progressTask && progressTask.count
        ? progressTask.count + ' locations published'
        : pendingCount + ' queued';
      if (cardSummary) cardSummary.textContent = summaryText;
      if (pillLabel) pillLabel.textContent = visibleProgressCount + '/' + total + ' publishing';
      if (cardIcon)  { cardIcon.className = 'pq-card__spin-icon pq-ring pq-ring--card'; cardIcon.style.cssText = '--pct:' + pct + '%'; cardIcon.innerHTML = ''; }
      if (pillIcon)  { pillIcon.className = 'pq-pill__icon pq-ring pq-ring--pill'; pillIcon.style.cssText = '--pct:' + pct + '%'; pillIcon.innerHTML = ''; }
    } else {
      if (cardTitle) cardTitle.textContent = total + ' completed';
      if (cardSummary) cardSummary.textContent = 'All publishing tasks are complete';
      if (pillLabel) pillLabel.textContent = total + ' completed';
      var checkHtml = '<span class="material-symbols-outlined" style="font-size:20px;line-height:1;font-variation-settings:\'FILL\' 1;color:#46B760">check_circle</span>';
      if (cardIcon)  { cardIcon.className = 'pq-card__spin-icon'; cardIcon.style.cssText = ''; cardIcon.innerHTML = checkHtml; }
      if (pillIcon)  { pillIcon.className = 'pq-pill__icon'; pillIcon.style.cssText = ''; pillIcon.innerHTML = checkHtml; }
      if (pill)      pill.classList.add('pq-pill--done');
    }

    if (publishedPillLabel && activeCount > 0) {
      var tempCheckHtml = '<span class="material-symbols-outlined" style="font-size:20px;line-height:1;font-variation-settings:\'FILL\' 1;color:#46B760">check_circle</span>';
      if (pillLabel) pillLabel.textContent = publishedPillLabel;
      if (pillIcon)  { pillIcon.className = 'pq-pill__icon'; pillIcon.style.cssText = ''; pillIcon.innerHTML = tempCheckHtml; }
      if (pill)      pill.classList.add('pq-pill--temp-complete');
    }

    QUEUE.forEach(function(task) {
      var row = document.createElement('div');
      row.className = 'pq-task pq-task--' + task.state;

      var nameActiveCls = task.state === 'progress' ? ' pq-task__name--active' : '';
      var descriptionHtml = '<div class="pq-task__description">' + queueTaskDescription(task) + '</div>';
      row.innerHTML =
        '<div class="pq-task__left">' +
          queueTaskIcon(task.state) +
          '<div class="pq-task__copy">' +
            '<div class="pq-task__name' + nameActiveCls + '">' + task.name + '</div>' +
            descriptionHtml +
          '</div>' +
        '</div>' +
        '<span class="material-symbols-outlined pq-task__chevron" style="font-size:20px">chevron_right</span>';

      var t = task;
      row.addEventListener('click', function() {
        currentQueueTask = t;
        pspOpenPanel(t.state === 'progress' ? 'progress' : t.state === 'completed' ? 'completed' : 'pending');
      });

      list.appendChild(row);
    });

    syncOngoingPublishState();
  }

  function animatePanelIntoPill(startRect) {
    widget.style.display = '';
    card.classList.remove('pq-card--visible');
    pill.style.display = '';
    pill.style.visibility = 'hidden';

    if (!startRect) {
      pill.style.visibility = '';
      pill.classList.add('pq-pill--pop');
      setTimeout(function() { pill.classList.remove('pq-pill--pop'); }, 320);
      return;
    }

    var endRect = pill.getBoundingClientRect();
    var proxy = document.createElement('div');
    proxy.className = 'pq-launch-proxy';
    proxy.style.left = startRect.left + 'px';
    proxy.style.top = startRect.top + 'px';
    proxy.style.width = startRect.width + 'px';
    proxy.style.height = startRect.height + 'px';
    document.body.appendChild(proxy);

    requestAnimationFrame(function() {
      proxy.style.transform =
        'translate(' + (endRect.left - startRect.left) + 'px, ' + (endRect.top - startRect.top) + 'px) ' +
        'scale(' + (endRect.width / startRect.width) + ', ' + (endRect.height / startRect.height) + ')';
      proxy.style.borderRadius = '999px';
      proxy.style.opacity = '0.18';
    });

    setTimeout(function() {
      proxy.remove();
      pill.style.visibility = '';
      pill.classList.add('pq-pill--pop');
      setTimeout(function() { pill.classList.remove('pq-pill--pop'); }, 320);
    }, 360);
  }

  // ── Add task when user publishes ─────────────────────────────────
  window.pqAddPublishMenuTask = function(options) {
    if (hasActiveMenuPublish()) {
      queueRender();
      openQueueCard();
      return;
    }

    if (QUEUE.length === 0) {
      QUEUE.push(
        { name: 'Publish menu',              taskKey: 'progress', state: 'progress', count: '12/50', published: '12 published', failed: '2 failed' },
        { name: 'Publish menu hour',         taskKey: 'pending',  state: 'pending' },
        { name: 'Publish item availability', taskKey: 'pending',  state: 'pending' }
      );
    } else {
      QUEUE.push({
        name: 'Publish menu',
        taskKey: 'progress',
        state: QUEUE.some(function(t) { return t.state === 'progress'; }) ? 'pending' : 'progress',
        count: '0/25',
      });
    }

    queueRender();
    animatePanelIntoPill(options && options.startRect);
  };

  window.pqCompleteNextPublishingTask = function(taskName) {
    var task = null;
    if (taskName) {
      task = QUEUE.find(function(t) { return t.name === taskName || publishedLabelForTask(t) === taskName; });
    }
    if (!task) task = QUEUE.find(function(t) { return t.state === 'progress'; });
    if (!task) task = QUEUE.find(function(t) { return t.state === 'pending'; });
    if (task && task.state === 'pending') {
      task.state = 'progress';
    }
    completeQueueTask(task);
  };

  // Initial render
  queueRender();

  if (new URLSearchParams(window.location.search).get('pqCompleteDemo') === '1') {
    setTimeout(function() {
      window.pqCompleteNextPublishingTask();
    }, 1200);
  }

  // ── Pill ↔ Card ──────────────────────────────────────────────────
  var pillDrag = {
    active: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
  };

  function moveWidgetTo(left, top) {
    var widgetRect = widget.getBoundingClientRect();
    var maxLeft = window.innerWidth - widgetRect.width - 8;
    var maxTop = window.innerHeight - widgetRect.height - 8;
    widget.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
    widget.style.top = Math.max(8, Math.min(top, maxTop)) + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  }

  pill.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || e.target.closest('.pq-pill__close')) return;
    var rect = widget.getBoundingClientRect();
    pillDrag.active = true;
    pillDrag.moved = false;
    pillDrag.pointerId = e.pointerId;
    pillDrag.startX = e.clientX;
    pillDrag.startY = e.clientY;
    pillDrag.originLeft = rect.left;
    pillDrag.originTop = rect.top;
    pill.setPointerCapture(e.pointerId);
  });

  pill.addEventListener('pointermove', function(e) {
    if (!pillDrag.active || e.pointerId !== pillDrag.pointerId) return;
    var dx = e.clientX - pillDrag.startX;
    var dy = e.clientY - pillDrag.startY;
    if (!pillDrag.moved && Math.hypot(dx, dy) < 4) return;
    pillDrag.moved = true;
    pill.classList.add('pq-pill--dragging');
    moveWidgetTo(pillDrag.originLeft + dx, pillDrag.originTop + dy);
  });

  function endPillDrag(e) {
    if (!pillDrag.active || e.pointerId !== pillDrag.pointerId) return;
    pillDrag.active = false;
    pillDrag.pointerId = null;
    pill.classList.remove('pq-pill--dragging');
  }

  pill.addEventListener('pointerup', endPillDrag);
  pill.addEventListener('pointercancel', endPillDrag);

  pill.addEventListener('click', function (e) {
    if (pillDrag.moved) {
      e.preventDefault();
      e.stopPropagation();
      pillDrag.moved = false;
      return;
    }
    pill.style.display = 'none';
    card.classList.add('pq-card--visible');
  });

  // Pill X (done state) → dismiss widget
  document.getElementById('pq-pill-close').addEventListener('click', function (e) {
    e.stopPropagation();
    widget.style.display = 'none';
  });

  showless.addEventListener('click', function (e) {
    e.stopPropagation();
    card.classList.remove('pq-card--visible');
    pill.style.display = '';
  });

  cardClose.addEventListener('click', function (e) {
    e.stopPropagation();
    card.classList.remove('pq-card--visible');
    widget.style.display = 'none';
  });

  // (task rows bind their own click handlers in queueRender)

  // ── Side panel pill tabs ─────────────────────────────────────────
  document.querySelectorAll('[data-psp-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-psp-tab]').forEach(function (b) {
        b.classList.toggle('psp-pill-tab--selected', b === btn);
      });
      var key = btn.getAttribute('data-psp-tab');
      document.getElementById('psp-tab-status').style.display      = key === 'status'      ? '' : 'none';
      document.getElementById('psp-tab-information').style.display = key === 'information' ? '' : 'none';
    });
  });

  // ── Open panel ───────────────────────────────────────────────────
  var currentTaskKey = null;

  function pspOpenPanel(taskKey) {
    var data = TASKS[taskKey];
    if (!data) return;
    currentTaskKey = taskKey;

    // Reset to Status tab
    document.querySelectorAll('[data-psp-tab]').forEach(function (b) {
      b.classList.toggle('psp-pill-tab--selected', b.getAttribute('data-psp-tab') === 'status');
    });
    document.getElementById('psp-tab-status').style.display      = '';
    document.getElementById('psp-tab-information').style.display = 'none';

    renderBanner(data);
    renderProgressSummary(data.counts);
    renderLocations(data);
    renderInformation(taskKey);

    overlay.classList.add('psp-overlay--visible');
    panel.classList.add('psp-panel--visible');
  }

  function renderBanner(data) {
    var el = document.getElementById('psp-banner');
    var counts = data.counts || {};
    var hasIssues = counts.failed > 0;

    var type, iconHtml, btnHtml = '';

    if (hasIssues) {
      // AI banner — only when there are publish issues
      type = 'ai';
      iconHtml = OTTER_AI_ICON;
      btnHtml = '<button class="psp-banner__cancel-btn" onclick="pspShowIssues()">View issues</button>';
    } else if (data.status === 'pending') {
      // Pending banner — gray, dashed icon, Cancel publish
      type = 'pending';
      iconHtml = '<img class="psp-banner__icon icon-gray" src="assets/icons/Dashed Circle.svg" alt="">';
      btnHtml = '<button class="psp-banner__cancel-btn" onclick="openCancelModal()">Cancel publish</button>';
    } else if (data.status === 'completed') {
      // Success banner — green
      type = 'success';
      iconHtml = '<span class="material-symbols-outlined psp-banner__icon" style="font-size:20px;font-variation-settings:\'FILL\' 1;color:#2A7E3D">check_circle</span>';
    } else if (data.status === 'cancelled') {
      // Failed/cancelled banner — red
      type = 'failed';
      iconHtml = '<span class="material-symbols-outlined psp-banner__icon" style="font-size:20px;font-variation-settings:\'FILL\' 1;color:#C5232B">warning</span>';
    } else {
      // Pure in-progress, no issues → no banner
      el.style.display = 'none';
      return;
    }

    el.style.display = '';
    el.className = 'psp-banner psp-banner--' + type;
    el.innerHTML = iconHtml +
      '<div class="psp-banner__body">' + data.bannerText + '</div>' +
      btnHtml;
  }

  function renderProgressSummary(counts) {
    var total = counts.completed + counts.progress + counts.failed + counts.pending || 1;
    var segs = [
      { key: 'completed', label: 'completed', count: counts.completed },
      { key: 'progress',  label: 'in progress', count: counts.progress },
      { key: 'failed',    label: 'failed',    count: counts.failed },
      { key: 'pending',   label: 'pending',   count: counts.pending },
    ].filter(function (s) { return s.count > 0; });

    var track = segs.map(function (s) {
      return '<div class="psp-progress-seg psp-progress-seg--' + s.key + '" style="width:' + (s.count / total * 100) + '%"></div>';
    }).join('');

    var countItems = segs.map(function (s) {
      return '<span class="psp-progress-count">' +
        '<span class="psp-progress-count__dot psp-progress-count__dot--' + s.key + '"></span>' +
        s.count + ' ' + s.label +
        '</span>';
    }).join('');

    var el = document.getElementById('psp-progress-summary');
    if (counts.progress > 0 || counts.failed > 0 || (counts.completed > 0 && counts.failed > 0)) {
      el.style.display = '';
      el.innerHTML =
        '<div class="psp-progress-track">' + track + '</div>' +
        '<div class="psp-progress-counts">' + countItems + '</div>';
    } else {
      el.style.display = 'none';
    }
  }

  // Channel status: icon only, no text label. Exact DS colors via Material Symbols.
  function statusIcon(status) {
    if (status === 'completed') {
      return '<span class="material-symbols-outlined psp-channel-status-symbol" style="font-variation-settings:\'FILL\' 1;color:#46B760">check_circle</span>';
    }
    if (status === 'progress') {
      return '<img src="assets/icons/icon-loader.svg" class="psp-channel-status-icon psp-channel-status-icon--spin" style="filter:brightness(0) saturate(100%) invert(28%) sepia(96%) saturate(2120%) hue-rotate(213deg) brightness(91%) contrast(91%)" alt="">';
    }
    if (status === 'failed') {
      return '<span class="material-symbols-outlined psp-channel-status-symbol" style="font-variation-settings:\'FILL\' 1;color:#DA252F">error</span>';
    }
    if (status === 'cancelled') {
      return '<span class="material-symbols-outlined psp-channel-status-symbol" style="color:#AAAAAA">cancel</span>';
    }
    // pending
    return '<img src="assets/icons/Dashed Circle.svg" class="psp-channel-status-icon icon-gray" alt="">';
  }

  function renderLocations(data) {
    var container = document.getElementById('psp-locations');
    container.innerHTML = '';

    // Update location count label
    var locCountEl = document.getElementById('psp-loc-count');
    if (locCountEl) locCountEl.textContent = LOCATIONS.length + ' locations';

    LOCATIONS.forEach(function (loc, li) {
      var group = document.createElement('div');
      group.className = 'psp-location-group';

      // Determine per-location failure flag
      var hasFailed = CHANNELS.some(function(ch, ci) {
        return data.locationStatus(li, ci) === 'failed';
      });

      // Build count text
      var countText = data.locationCount ? data.locationCount(li) : '5 pending';

      // Summary HTML: red dot only when location has failures
      var summaryHtml;
      if (hasFailed) {
        summaryHtml =
          '<div class="psp-location-status">' +
            '<span class="material-symbols-outlined psp-location-status__dot" style="font-variation-settings:\'FILL\' 1">fiber_manual_record</span>' +
            '<span class="psp-location-summary__count">' + countText + '</span>' +
          '</div>';
      } else {
        summaryHtml = '<span class="psp-location-summary__count">' + countText + '</span>';
      }

      // Per-channel statuses
      var statuses = CHANNELS.map(function(ch, ci){ return data.locationStatus(li, ci); });
      // Location is "weak" (pending/cancelled) when no channel is completed/in-progress/failed
      var locationWeak = statuses.every(function(s){ return s === 'pending' || s === 'cancelled'; });

      var channelRows = CHANNELS.map(function (ch, ci) {
        var st = statuses[ci];
        var logo = LOGOS[ch]
          ? '<img class="psp-channel-logo" src="' + LOGOS[ch] + '" alt="' + ch + '">'
          : '<div class="psp-channel-logo" style="display:flex;align-items:center;justify-content:center;font:600 11px/1 Inter,sans-serif;color:#fff;background:#9E9E9E;border-radius:8px;flex-shrink:0">' + ch.charAt(0) + '</div>';
        var rowCls = '';
        if (st === 'failed') rowCls = ' psp-channel-row--failed';
        else if (st === 'pending' || st === 'cancelled') rowCls = ' psp-channel-row--weak';
        var dataAttr = st === 'failed' ? ' data-failed="1" data-channel="' + ch + '"' : '';
        return '<div class="psp-channel-row' + rowCls + '"' + dataAttr + '>' + logo +
          '<span class="psp-channel-name">' + ch + '</span>' +
          statusIcon(st) +
        '</div>';
      }).join('');

      if (locationWeak) group.className += ' psp-location-group--weak';

      group.innerHTML =
        '<div class="psp-location-row">' +
          '<div class="psp-location-thumb"><span class="material-symbols-outlined" style="font-size:18px;font-variation-settings:\'FILL\' 1">location_on</span></div>' +
          '<div class="psp-location-info">' +
            '<div class="psp-location-name">' + loc.name + '</div>' +
            '<div class="psp-location-addr">' + loc.addr + '</div>' +
          '</div>' +
          '<div class="psp-location-summary">' + summaryHtml + '</div>' +
          '<span class="psp-location-expand"><span class="material-symbols-outlined" style="font-size:20px">expand_more</span></span>' +
        '</div>' +
        '<div class="psp-channels-list">' + channelRows + '</div>';

      // Toggle expand
      group.querySelector('.psp-location-row').addEventListener('click', function () {
        group.classList.toggle('psp-location-group--open');
      });

      // Failed channel rows → open AI insights popover
      group.querySelectorAll('.psp-channel-row--failed').forEach(function (row) {
        row.addEventListener('click', function (e) {
          e.stopPropagation();
          openInsightPopover(row, loc, row.getAttribute('data-channel'));
        });
      });

      container.appendChild(group);
    });
  }

  // ── AI Insights Popover ──────────────────────────────────────────
  var POPOVER_INSIGHT = {
    title: 'Nested modifier groups aren\'t supported',
    body: 'Direct Orders couldn\'t be updated because several menu items contain nested modifier groups.',
    items: ['Fiji Water', 'Banana Chia Pudding', 'Vegan – The Impossible Pizza', 'Vegan – Art of Pesto'],
    fix: 'Remove nested modifier groups from the affected menu items, then publish again.',
  };
  var activeFailedRow = null;

  function openInsightPopover(row, loc, channel) {
    var pop = document.getElementById('psp-popover');
    var content = document.getElementById('psp-popover-content');

    // Highlight active row
    if (activeFailedRow) activeFailedRow.classList.remove('psp-channel-row--active');
    activeFailedRow = row;
    row.classList.add('psp-channel-row--active');

    var d = POPOVER_INSIGHT;
    content.innerHTML =
      '<div class="psp-popover__card">' +
        '<div class="psp-popover__card-header">' +
          '<img class="psp-popover__card-icon" src="assets/Icons/Otter_ai.svg" alt="">' +
          '<span class="psp-popover__card-title">' + d.title + '</span>' +
        '</div>' +
        '<div class="psp-popover__body">' +
          '<span>' + d.body + '</span>' +
          '<p class="psp-popover__label">Affected items</p>' +
          '<ul class="psp-popover__list">' + d.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
          '<p class="psp-popover__label">How to fix</p>' +
          '<span>' + d.fix + '</span>' +
          '<button class="psp-popover__btn" onclick="openAssistant(otterErrorText())">Fix with Otter Assistant</button>' +
        '</div>' +
      '</div>';

    // Show then position relative to row, to the LEFT of the panel
    pop.classList.add('psp-popover--visible');
    var rowRect = row.getBoundingClientRect();
    var panelRect = panel.getBoundingClientRect();
    var popW = 360;
    var gap = 12;
    var left = panelRect.left - popW - gap;
    if (left < 12) left = 12;
    // Vertically align top of popover near the row, clamp to viewport
    var top = rowRect.top - 8;
    var popH = pop.offsetHeight || 360;
    if (top + popH > window.innerHeight - 12) top = window.innerHeight - popH - 12;
    if (top < 12) top = 12;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function closeInsightPopover() {
    var pop = document.getElementById('psp-popover');
    pop.classList.remove('psp-popover--visible');
    if (activeFailedRow) { activeFailedRow.classList.remove('psp-channel-row--active'); activeFailedRow = null; }
  }
  window.closeInsightPopover = closeInsightPopover;

  function renderInformation(taskKey) {
    var infoMap = {
      progress:  { version: 'BN-V12.1', started: '05/26/2026, 10:57:23 AM', completed: '--', duration: '--',    by: 'Hui Tan', brand: 'Breakfast Beauties', locations: '5 locations', channels: '5 channels' },
      pending:   { version: 'BN-V12.1', started: '05/26/2026, 10:57:23 AM', completed: '--', duration: '--',    by: 'Hui Tan', brand: 'Breakfast Beauties', locations: '5 locations', channels: '5 channels' },
      completed: { version: 'BN-V12.1', started: '05/26/2026, 10:57:23 AM', completed: '05/26/2026, 11:12:44 AM', duration: '4:57:23', by: 'Hui Tan', brand: 'Breakfast Beauties', locations: '5 locations', channels: '5 channels' },
    };
    var info = infoMap[taskKey] || infoMap.progress;
    var eventId = '8f63f4bf-cb89-4b04-b2f8-b9b8ffd11fa5';

    var avatarHtml = '<span class="psp-avatar">HT</span>';

    document.getElementById('psp-info-list').innerHTML = [
      { label: 'Event ID',          html: '<span class="psp-info-value psp-info-value--mono">' + eventId + '</span>' },
      { label: 'Published version', html: '<span class="psp-info-value psp-info-value--link" style="text-decoration:underline">' + info.version + '</span>' },
      { label: 'Started at',        html: '<span class="psp-info-value">' + info.started + '</span>' },
      { label: 'Completed at',      html: '<span class="psp-info-value">' + info.completed + '</span>' },
      { label: 'Duration',          html: '<span class="psp-info-value">' + info.duration + '</span>' },
      { label: 'Published by',      html: '<span class="psp-info-value" style="display:flex;align-items:center;justify-content:flex-end;gap:8px">' + avatarHtml + info.by + '</span>' },
      { label: 'Brand',             html: '<span class="psp-info-value psp-info-value--link" style="text-decoration:underline">' + info.brand + '</span>' },
      { label: 'Locations',         html: '<span class="psp-info-value psp-info-value--expandable">3 locations<span class="material-symbols-outlined" style="font-size:16px">expand_more</span></span>' },
      { label: 'Channnels',         html: '<span class="psp-info-value psp-info-value--expandable">5 channels<span class="material-symbols-outlined" style="font-size:16px">expand_more</span></span>' },
    ].map(function (r) {
      return '<div class="psp-info-row">' +
        '<span class="psp-info-label">' + r.label + '</span>' +
        r.html +
        '</div>';
    }).join('');
  }

  function closePanel() {
    closeInsightPopover();
    overlay.classList.remove('psp-overlay--visible');
    panel.classList.remove('psp-panel--visible');
    setTimeout(function() {
      document.getElementById('psp-pages').classList.remove('show-issues');
    }, 350);
  }

  pspClose.addEventListener('click', closePanel);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) { closeInsightPopover(); closePanel(); }
  });

  // ── AI Insights popover close handlers ───────────────────────────
  document.getElementById('psp-popover-close').addEventListener('click', closeInsightPopover);
  document.addEventListener('click', function (e) {
    var pop = document.getElementById('psp-popover');
    if (!pop.classList.contains('psp-popover--visible')) return;
    if (pop.contains(e.target)) return;
    if (e.target.closest('.psp-channel-row--failed')) return;
    closeInsightPopover();
  });

  // ── View Issues panel ────────────────────────────────────────────
  var ISSUES_DATA = [
    {
      title: 'Modifier group "Fruit Toppings" has no items',
      desc: 'This issue prevented publishing to 2 locations across 4 channels.',
      locations: ['Peppered – Los Angeles', 'Peppered – San Diego'],
      channels: ['Demo Delivery Service', 'Direct Orders', 'FOFO'],
      fix: 'Add at least one item to the modifier group, then republish.',
    },
    {
      title: 'Nested modifier groups aren\'t supported',
      desc: 'Direct Orders couldn\'t be updated for Peppered – New York because several menu items contain nested modifier groups.',
      items: ['Fiji Water', 'Banana Chia Pudding', 'Vegan – The Impossible Pizza', 'Vegan – Art of Pesto'],
      fix: 'Remove nested modifier groups from the affected menu items, then publish again.',
    },
  ];

  function renderIssues() {
    document.getElementById('psp-issues-list').innerHTML = ISSUES_DATA.map(function(issue, idx) {
      var locList = issue.locations
        ? '<p class="psp-issue-section-label">Affected locations</p><ul class="psp-issue-list">' + issue.locations.map(function(l){ return '<li>' + l + '</li>'; }).join('') + '</ul>'
        : '';
      var chList = issue.channels
        ? '<p class="psp-issue-section-label">Affected channels</p><ul class="psp-issue-list">' + issue.channels.map(function(c){ return '<li>' + c + '</li>'; }).join('') + '</ul>'
        : '';
      var itemList = issue.items
        ? '<p class="psp-issue-section-label">Affected items</p><ul class="psp-issue-list">' + issue.items.map(function(i){ return '<li>' + i + '</li>'; }).join('') + '</ul>'
        : '';
      return '<div class="psp-issue-card">' +
        '<div class="psp-issue-header">' +
          '<img src="assets/Icons/Otter_ai.svg" class="psp-issue-icon" alt="">' +
          '<span class="psp-issue-title">' + issue.title + '</span>' +
        '</div>' +
        '<div class="psp-issue-body">' +
          '<span>' + issue.desc + '</span>' +
          locList + chList + itemList +
          '<p class="psp-issue-section-label">How to fix</p>' +
          '<span>' + issue.fix + '</span>' +
        '</div>' +
        '<button class="psp-issue-fix-btn" onclick="openAssistant(otterErrorFromIssue(' + idx + '))">Fix with Otter Assistant</button>' +
      '</div>';
    }).join('');
  }

  // Build an AI-paste error message from an issue
  window.otterErrorFromIssue = function(idx) {
    var issue = ISSUES_DATA[idx] || ISSUES_DATA[0];
    var parts = [];
    if (issue.locations) parts.push('Publish failed for ' + issue.locations.length + ' locations: ' + issue.locations.join(' and ') + ' failed to publish.');
    parts.push(issue.desc);
    parts.push(issue.fix);
    return parts.join(' ');
  };
  // Default popover error message (matches Figma)
  window.otterErrorText = function() {
    return 'Publish failed for 2 locations: Peppered – Los Angeles and Peppered – San Diego failed to publish. Your menu could not be published because the modifier group "Tyler\'s New Custom Sidebar Thing" does not have any items. Add items to Tyler\'s New Custom Sidebar Thing then try again.';
  };

  function pspShowIssues() {
    renderIssues();
    document.getElementById('psp-pages').classList.add('show-issues');
  }
  function pspShowMain() {
    document.getElementById('psp-pages').classList.remove('show-issues');
  }
  window.pspShowIssues = pspShowIssues;
  window.pspShowMain = pspShowMain;

  document.getElementById('psp-issues-close').addEventListener('click', function() {
    pspShowMain();
    closePanel();
  });

  // ── Cancel publish modal ─────────────────────────────────────────
  window.openCancelModal = function() {
    document.getElementById('psp-modal-scrim').classList.add('psp-modal-scrim--visible');
    document.getElementById('psp-modal').classList.add('psp-modal--visible');
  };
  window.closeCancelModal = function() {
    document.getElementById('psp-modal-scrim').classList.remove('psp-modal-scrim--visible');
    document.getElementById('psp-modal').classList.remove('psp-modal--visible');
  };
  window.confirmCancelPublish = function() {
    window.closeCancelModal();

    // Only remove the specific pending task that was open when cancel was triggered
    if (currentQueueTask && currentQueueTask.state === 'pending') {
      var idx = QUEUE.indexOf(currentQueueTask);
      if (idx >= 0) {
        QUEUE.splice(idx, 1);
        queueRender();
      }
      currentQueueTask = null;
    }

    // Close the side panel
    closePanel();

    // If queue is now empty, hide the widget
    if (QUEUE.length === 0) {
      widget.style.display = 'none';
    }
  };

  document.getElementById('psp-modal-scrim').addEventListener('click', window.closeCancelModal);

  // ── Otter Assistant chat panel ───────────────────────────────────
  var oaTextarea = document.getElementById('oa-textarea');
  var oaEmpty    = document.getElementById('oa-empty');
  var oaMessages = document.getElementById('oa-messages');

  function autoGrow() {
    oaTextarea.style.height = 'auto';
    oaTextarea.style.height = Math.min(oaTextarea.scrollHeight, 140) + 'px';
  }

  var sidebarWasCollapsed = false;
  // Open assistant: push page (incl. side panel + queue), prefill input, ready to send
  window.openAssistant = function(errorText) {
    // Close the transient popover (its position is anchored to a row)
    closeInsightPopover();
    // Keep the side panel OPEN and preserve its scrim while the assistant
    // pushes the page left. CSS keeps the scrim out of the assistant column.
    // Reset to empty state
    oaMessages.innerHTML = '';
    oaEmpty.style.display = '';
    // Prefill input
    oaTextarea.value = errorText || '';
    // Auto-collapse the side nav (remember prior state)
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebarWasCollapsed = sidebar.classList.contains('sidebar--collapsed');
      sidebar.classList.add('sidebar--collapsed');
    }
    document.body.classList.add('assistant-open');
    setTimeout(function() { autoGrow(); oaTextarea.focus(); }, 360);
  };

  window.closeAssistant = function() {
    document.body.classList.remove('assistant-open');
    // Restore sidebar to its prior expanded state
    var sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebarWasCollapsed) sidebar.classList.remove('sidebar--collapsed');
  };

  window.toggleAssistant = function(errorText) {
    if (document.body.classList.contains('assistant-open')) {
      window.closeAssistant();
      return;
    }
    window.openAssistant(errorText || '');
  };

  function sendAssistantMessage() {
    var text = oaTextarea.value.trim();
    if (!text) return;
    oaEmpty.style.display = 'none';
    var bubble = document.createElement('div');
    bubble.className = 'oa-msg-user';
    bubble.textContent = text;
    oaMessages.appendChild(bubble);
    // AI thinking indicator
    var aiIcon = document.createElement('img');
    aiIcon.className = 'oa-msg-ai-icon';
    aiIcon.src = 'assets/Icons/Otter_ai.svg';
    oaMessages.appendChild(aiIcon);
    oaTextarea.value = '';
    autoGrow();
    document.getElementById('oa-body').scrollTop = document.getElementById('oa-body').scrollHeight;
  }

  oaTextarea.addEventListener('input', autoGrow);
  oaTextarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAssistantMessage(); }
  });
  document.getElementById('oa-send').addEventListener('click', sendAssistantMessage);
  document.getElementById('oa-close').addEventListener('click', window.closeAssistant);

  // ── Drag ────────────────────────────────────────────────────────
  var dragging = false, startX, startY, origRight, origBottom;

  function startDrag(e) {
    if (e.target.closest('button')) return;
    dragging = true;
    var touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    var rect = widget.getBoundingClientRect();
    origRight  = window.innerWidth  - rect.right;
    origBottom = window.innerHeight - rect.bottom;
    e.preventDefault();
  }
  function onDrag(e) {
    if (!dragging) return;
    var touch = e.touches ? e.touches[0] : e;
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    widget.style.right  = Math.max(8, origRight  - dx) + 'px';
    widget.style.bottom = Math.max(8, origBottom - dy) + 'px';
    widget.style.left   = 'auto';
    widget.style.top    = 'auto';
  }
  function endDrag() { dragging = false; }

  pill.addEventListener('mousedown', startDrag);
  document.getElementById('pq-drag-handle').addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);

});
