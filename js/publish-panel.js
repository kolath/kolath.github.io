// ── Checkbox SVG snippets ──────────────────────────────────
const svgCheck = `<svg class="cb-check" width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3L3.5 5.5L8 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><svg class="cb-minus" width="7" height="2" viewBox="0 0 7 2" fill="none"><path d="M0.5 1H6.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`;

function makeCb(cls = '', checked = true, disabled = false) {
  return `<label class="cb ${cls}${disabled ? ' cb--disabled' : ''}"><input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} class="loc-cb"/><span class="cb-box">${svgCheck}</span></label>`;
}

// ── Warning icon ──────────────────────────────────────────
const warnIcon = `<span class="ms sz14 filled" style="color:#A88020;font-size:14px">warning</span>`;

// ── Platform logo assets (local thumbnail SVGs) ───────────
function makeLogo(src, alt) {
  return `<img src="${src}" alt="${alt}" style="width:32px;height:32px;border-radius:8px;object-fit:contain;flex-shrink:0">`;
}

const logos = {
  doordash:       makeLogo('assets/thumbnails/DoorDash.svg',                  'DoorDash'),
  grubhub:        makeLogo('assets/thumbnails/Grubhub.svg',                   'Grubhub'),
  ubereats:       makeLogo('assets/thumbnails/Uber Eats.svg',                 'Uber Eats'),
  'otter-orders': makeLogo('assets/Icons/App Icons/Online Ordering.svg',    'Otter Online Orders'),
  'otter-pos':    makeLogo('assets/Icons/App Icons/POS.svg',              'Otter POS'),
  caviar:         makeLogo('assets/thumbnails/Caviar.svg',                    'Caviar'),
  postmates:      makeLogo('assets/thumbnails/Postmates.svg',                 'Postmates'),
  ezcater:        makeLogo('assets/thumbnails/EZcater.svg',                   'EZcater'),
};

// ── Pre-publish: platform sub-row ─────────────────────────
function makePlatformRow({ key, name, hasSuggestion, blocked }) {
  const suggestion = hasSuggestion && !blocked
    ? `<span class="psuggestion">${warnIcon} View suggestion</span>` : '';
  return `
    <div class="platform-row${blocked ? ' platform-row--blocked' : ''}">
      ${makeCb('', !blocked, !!blocked)}
      <div class="plogo">${logos[key]}</div>
      <div class="pinfo">
        <div class="pname">${name}</div>
        <div class="pmeta">
          <span class="ptime">${blocked ? 'Blocked by critical issue' : 'Published at 2:48 PM'}</span>
          ${suggestion}
        </div>
      </div>
    </div>`;
}

// ── Pre-publish: location tile ────────────────────────────
function makeTile({ name, addr, badge, critical, platforms, expanded }) {
  const badgeHtml = badge
    ? `<span class="pp-badge">
        <span class="ms sz16 filled" style="color:#86691e;font-size:15px">warning</span>
        Suggestion
      </span>` : '';
  const criticalHtml = critical
    ? `<span class="pp-badge pp-badge--critical">
        <span class="ms sz16 filled" style="color:#C5232B;font-size:15px">error</span>
        Critical issue
      </span>` : '';
  const platformsHtml = platforms && platforms.length
    ? platforms.map(platform => makePlatformRow({ ...platform, blocked: critical })).join('')
    : '';
  const expandBtn = `<button class="expand-btn${expanded ? ' open' : ''}" onclick="ppToggleExpand(this)" aria-label="Expand">
      <span class="ms sz16">expand_more</span>
    </button>`;
  return `
    <div class="tile${critical ? ' tile--blocked' : ''}">
      <div class="tile-header">
        ${makeCb('loc-parent-cb', !critical, !!critical)}
        <div class="tile-info">
          <div class="tile-name">${name}</div>
          <div class="tile-addr">${critical ? 'Blocked: tax settings must be fixed before publishing this location' : addr}</div>
        </div>
        <div class="tile-actions">
          ${criticalHtml}
          ${badgeHtml}
          ${expandBtn}
        </div>
      </div>
      <div class="platforms${expanded ? ' open' : ''}">
        ${platformsHtml}
      </div>
    </div>`;
}

// ── Pre-publish: location data ────────────────────────────
const defaultPlatforms = [
  { key: 'doordash',       name: 'DoorDash',             hasSuggestion: false },
  { key: 'ubereats',       name: 'Uber Eats',             hasSuggestion: false },
  { key: 'grubhub',        name: 'Grubhub',               hasSuggestion: false },
  { key: 'otter-orders',   name: 'Otter Online Orders',   hasSuggestion: false },
  { key: 'otter-pos',      name: 'Otter POS',             hasSuggestion: false },
];
const locationData = [
  { name: 'Greens – Culver City',    addr: '7630 Milky Way, Culver City, CA 60099, USA',  badge: false, critical: true,  platforms: defaultPlatforms, expanded: true },
  { name: 'Greens – Santa Monica',   addr: '412 Ocean Ave, Santa Monica, CA 90401, USA',   badge: true,  critical: false, platforms: defaultPlatforms, expanded: false },
  { name: 'Greens – Venice',         addr: '1800 Lincoln Blvd, Venice, CA 90291, USA',     badge: false, platforms: defaultPlatforms, expanded: false },
  { name: 'Greens – West Hollywood', addr: '8000 Sunset Blvd, West Hollywood, CA 90046',   badge: false, platforms: defaultPlatforms, expanded: false },
  { name: 'Greens – Pasadena',       addr: '280 E Colorado Blvd, Pasadena, CA 91101, USA', badge: false, platforms: defaultPlatforms, expanded: false },
];

document.getElementById('ppLocations').innerHTML = locationData.map(makeTile).join('');

// ── Pre-publish toggle expand ─────────────────────────────
function ppToggleExpand(btn) {
  btn.classList.toggle('open');
  btn.closest('.tile').querySelector('.platforms').classList.toggle('open');
}

// ── Pre-publish select all ────────────────────────────────
function ppToggleAll(cb) {
  document.querySelectorAll('.loc-cb:not(:disabled)').forEach(b => b.checked = cb.checked);
}
document.getElementById('ppLocations').addEventListener('change', e => {
  if (!e.target.classList.contains('loc-cb')) return;
  const all = [...document.querySelectorAll('.loc-cb:not(:disabled)')];
  const n = all.filter(b => b.checked).length;
  const master = document.getElementById('ppSelectAll');
  if (n === 0) { master.checked = false; master.indeterminate = false; }
  else if (n === all.length) { master.checked = true; master.indeterminate = false; }
  else { master.checked = false; master.indeterminate = true; }
});

// ── Channels filter toggle ────────────────────────────────
let channelsApplied = false;
function ppToggleChannels(btn) {
  channelsApplied = !channelsApplied;
  btn.classList.toggle('applied', channelsApplied);
  const chevron = document.getElementById('ppChannelsChevron');
  if (channelsApplied) {
    chevron.style.display = 'none';
    if (!btn.querySelector('.pp-filter-count')) {
      const badge = document.createElement('span');
      badge.className = 'pp-filter-count';
      badge.textContent = '3';
      btn.appendChild(badge);
    }
  } else {
    chevron.style.display = '';
    const badge = btn.querySelector('.pp-filter-count');
    if (badge) badge.remove();
  }
}

// ── Post-publish: status helpers ─────────────────────────
function tileOverallStatus(platforms) {
  const statuses = platforms.map(p => p.status);
  if (statuses.every(s => s === 'pending'))   return 'all-pending';
  if (statuses.includes('failed'))            return 'has-issues';
  if (statuses.includes('in_progress'))       return 'in-progress';
  if (statuses.every(s => s === 'published')) return 'published';
  return '';
}

function makeMiniBar(platforms) {
  if (!platforms.length) return '<div class="post-mini-bar"></div>';
  const counts = { published: 0, in_progress: 0, failed: 0, pending: 0 };
  platforms.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const defs = [['published','#46B760'],['in_progress','#1C69E8'],['failed','#DF5234'],['pending','#CCCCCC']];
  const segs = defs.filter(([s]) => counts[s] > 0)
    .map(([s, c]) => `<div class="post-mini-seg" style="flex:${counts[s]};background:${c}"></div>`).join('');
  return `<div class="post-mini-bar">${segs}</div>`;
}

const inlineStatusMeta = {
  failed:      { icon: 'warning',           fill: true, color: '#C63E1E' },
  in_progress: { icon: 'progress_activity', fill: true, color: '#1C69E8' },
  published:   { icon: 'check_circle',      fill: true, color: '#1E6E36' },
  pending:     { icon: 'schedule',          fill: false, color: '#6C6C6C' },
};

function makeInlineStatus(status) {
  const m = inlineStatusMeta[status] || inlineStatusMeta.pending;
  const spinning = status === 'in_progress' ? ' spinning' : '';
  return `<div class="post-inline-status">
    <span class="ms sz16${m.fill ? ' filled' : ''}${spinning}" style="color:${m.color}">${m.icon}</span>
  </div>`;
}

function makePostPlatformRow({ key, name, status }) {
  return `
    <div class="post-platform-row${status === 'pending' ? ' is-pending' : ''}">
      <div class="post-plat-indent"></div>
      <div class="plogo">${logos[key] || ''}</div>
      <span class="post-platform-name">${name}</span>
      ${makeInlineStatus(status)}
    </div>`;
}

function makePostTile({ name, addr, platforms, expanded }) {
  const overall   = tileOverallStatus(platforms);
  const published = platforms.filter(p => p.status === 'published').length;
  const total     = platforms.length;
  const countText = total > 0 ? `${published}/${total}` : '';
  const expandBtn = total
    ? `<button class="expand-btn${expanded ? ' open' : ''}" onclick="togglePostExpand(this)" aria-label="Expand">
        <span class="ms sz16">expand_more</span>
      </button>`
    : `<div style="width:32px;flex-shrink:0"></div>`;
  return `
    <div class="post-tile${overall === 'all-pending' ? ' all-pending' : ''}">
      <div class="post-tile-row">
        ${expandBtn}
        <div class="post-location-thumb">
          <span class="ms sz16 filled" style="color:#000000">location_on</span>
        </div>
        <div class="post-tile-info">
          <div class="post-tile-name">${name}</div>
          <div class="post-tile-addr">${addr}</div>
        </div>
        <div class="post-tile-right">
          ${makeMiniBar(platforms)}
          <span class="post-count">${countText}</span>
        </div>
      </div>
      <div class="post-platforms${expanded ? ' open' : ''}">
        ${platforms.map(makePostPlatformRow).join('')}
      </div>
    </div>`;
}

// ── Queue card config ─────────────────────────────────────
const cardTypeConfig = {
  menu:             { typeLabel: 'Publishing menu' },
  menu_hours:       { typeLabel: 'Publishing menu hours' },
  item_availability:{ typeLabel: 'Publishing item availability' },
};

function getCardStatusCounts(locations) {
  const c = { published: 0, in_progress: 0, failed: 0, pending: 0 };
  locations.forEach(loc => loc.platforms.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; }));
  return c;
}

function getCardOverallStatus(counts) {
  const total = counts.published + counts.in_progress + counts.failed + counts.pending;
  if (!total) return 'in-progress';
  if (counts.published === total) return 'success';
  if (counts.pending === total)   return 'all-pending';
  if (counts.in_progress > 0 || counts.pending > 0) return 'in-progress';
  return counts.failed > 0 ? 'failed' : 'in-progress';
}

function renderCard(card, idx, total) {
  const cfg    = cardTypeConfig[card.type] || cardTypeConfig.menu;
  const counts = getCardStatusCounts(card.locations);
  const status = getCardOverallStatus(counts);
  let iconHtml;
  switch (status) {
    case 'success':     iconHtml = `<span class="publish-status-icon filled" style="color:#1E6E36">check_circle</span>`; break;
    case 'all-pending': iconHtml = `<span class="publish-status-icon" style="color:#6C6C6C">schedule</span>`; break;
    case 'failed':      iconHtml = `<span class="publish-status-icon filled" style="color:#DF5234">warning</span>`; break;
    default:            iconHtml = `<span class="publish-status-icon spinning" style="color:#1C69E8">progress_activity</span>`; break;
  }
  const bold = `<strong>${card.name}</strong>`;
  const subtitleText = card.type === 'item_availability'
    ? `Sending ${bold} availability to selected channels`
    : `Sending ${bold} to selected channels`;
  const barSegs = [
    counts.pending     > 0 ? `<div class="progress-segment progress-pending"     style="flex:${counts.pending}"></div>` : '',
    counts.in_progress > 0 ? `<div class="progress-segment progress-in-progress" style="flex:${counts.in_progress}"></div>` : '',
    counts.published   > 0 ? `<div class="progress-segment progress-published"   style="flex:${counts.published}"></div>` : '',
    counts.failed      > 0 ? `<div class="progress-segment progress-issues"      style="flex:${counts.failed}"></div>` : '',
  ].join('');
  const countItems = [
    counts.pending    > 0 ? `<span class="status-count-item"><span class="ms sz18" style="color:#6C6C6C">schedule</span> ${counts.pending} Pending</span>` : '',
    counts.in_progress > 0 ? `<span class="status-count-item"><span class="ms sz18 filled" style="color:#1C69E8">progress_activity</span> ${counts.in_progress} In progress</span>` : '',
    counts.published  > 0 ? `<span class="status-count-item"><span class="ms sz18 filled" style="color:#1E6E36">check_circle</span> ${counts.published} Published</span>` : '',
    counts.failed     > 0 ? `<span class="status-count-item"><span class="ms sz18 filled" style="color:#DF5234">warning</span> <a href="#" class="issues-link" onclick="return false">${counts.failed} Issues</a></span>` : '',
  ].join('');
  const alertBtn = `<div class="post-action-row"><button class="alert-btn"><span class="ms sz18">notifications</span> Get alerted</button><button class="cancel-publish-btn" onclick="removeCard('${card.id}')">Cancel publish</button></div>`;
  const minIcon = card.expanded ? 'remove' : 'add';
  const minLabel = card.expanded ? 'Minimize' : 'Expand';
  return `
    <div class="pub-card" id="pub-card-${card.id}" data-id="${card.id}">
      <div class="pub-card-nav" onclick="toggleCard('${card.id}')">
        <div class="pub-card-nav-left">
          ${iconHtml}
          <h2>${cfg.typeLabel}${status === 'in-progress' ? ` <span style="font-weight:400;color:#6C6C6C">${counts.published}/${counts.published+counts.in_progress+counts.failed+counts.pending}</span>` : ''}</h2>
        </div>
        <div class="pub-card-nav-right">
          <button id="pp-min-btn-${card.id}" class="pp-close-btn" onclick="event.stopPropagation();toggleCard('${card.id}')" aria-label="${minLabel}">
            <span class="ms sz16">${minIcon}</span>
          </button>
          <button class="pp-close-btn" onclick="event.stopPropagation();removeCard('${card.id}')" aria-label="Close">
            <span class="ms sz16">close</span>
          </button>
        </div>
      </div>
      <div class="post-header-info">
        <p class="post-subtitle">
          ${subtitleText}
          <span class="ms sz18" style="color:#6C6C6C;flex-shrink:0">info</span>
        </p>
        <div class="progress-bar">${barSegs}</div>
        <div class="status-counts">${countItems}</div>
        ${alertBtn}
      </div>
      <div class="pub-card-scroll">
        <div class="pp-search-row">
          <div class="pp-search-wrap">
            <span class="pp-search-icon"><span class="ms sz16" style="color:#6C6C6C">search</span></span>
            <input class="pp-search-input" type="search" placeholder="Search locations" />
          </div>
          <button class="pp-status-btn">Status<span class="ms sz16" style="flex-shrink:0">arrow_drop_down</span></button>
        </div>
        <div class="group-by-row">
          <span class="group-by-label">Group by</span>
          <div class="seg-control">
            <button class="seg-btn active">Store</button>
            <button class="seg-btn">Channel</button>
          </div>
        </div>
        <div id="post-locs-${card.id}">
          ${card.locations.map(makePostTile).join('')}
        </div>
      </div>
    </div>`;
}

// ── Publish trigger button state ─────────────────────────
let lastPublishedCardId = null;

function updatePublishTrigger() {
  const myCard = publishQueue.find(c => c.brand === currentMenuBrand);
  document.querySelectorAll('.pp-trigger-btn').forEach(btn => {
    if (window.pqHasActiveMenuPublish && window.pqHasActiveMenuPublish()) {
      btn.classList.add('btn--publishing');
      btn.innerHTML = `<span class="pp-btn-spinner">progress_activity</span>Publishing`;
      btn.onclick = () => window.pqOpenQueueCard && window.pqOpenQueueCard();
    } else if (myCard) {
      btn.classList.add('btn--publishing');
      btn.innerHTML = `<span class="pp-btn-spinner">progress_activity</span>Publishing`;
      btn.dataset.publishedCardId = myCard.id;
      btn.onclick = () => showQueueExpanded(myCard.id);
    } else {
      btn.classList.remove('btn--publishing');
      btn.innerHTML = 'Publish';
      btn.onclick = openPanel;
    }
  });
}

function showQueueExpanded(cardId) {
  document.getElementById('queuePanel').classList.add('open');
  const target = publishQueue.find(c => c.id === cardId) || publishQueue[0];
  if (!target) return;
  // Collapse all other cards, expand only the target
  publishQueue.forEach(c => {
    if (c.id !== target.id && c.expanded) {
      c.expanded = false;
      collapseCard(c.id);
      updateMinBtn(c.id, false);
    }
  });
  if (!target.expanded) {
    target.expanded = true;
    applyCardHeight(target.id, false);
    updateMinBtn(target.id, true);
  }
}

// ── Queue render ──────────────────────────────────────────
function renderQueue() {
  document.getElementById('queuePanel').innerHTML = publishQueue.map((c,i) => renderCard(c, i, publishQueue.length)).join('');
  publishQueue.forEach(card => {
    const el = document.getElementById('pub-card-' + card.id);
    if (!el) return;
    if (card.expanded) {
      applyCardHeight(card.id, true);
    } else {
      const navH = el.querySelector('.pub-card-nav').offsetHeight;
      el.style.transition = 'none';
      el.style.height = navH + 'px';
      el.offsetHeight;
      el.style.transition = '';
    }
  });
  updatePublishTrigger();
}

function getCollapsedH(id) {
  const el = document.getElementById('pub-card-' + id);
  return el ? el.querySelector('.pub-card-nav').offsetHeight : 64;
}

function applyCardHeight(id, immediate) {
  const el = document.getElementById('pub-card-' + id);
  if (!el) return;
  if (immediate) el.style.transition = 'none';
  el.style.height = 'auto';
  const h = Math.min(el.scrollHeight, 600);
  el.style.height = getCollapsedH(id) + 'px';
  el.offsetHeight;
  el.style.transition = '';
  el.style.height = h + 'px';
}

function collapseCard(id) {
  const el = document.getElementById('pub-card-' + id);
  if (!el) return;
  el.style.height = el.offsetHeight + 'px';
  el.offsetHeight;
  el.style.height = getCollapsedH(id) + 'px';
}

function updateMinBtn(id, expanded) {
  const btn = document.getElementById('pp-min-btn-' + id);
  if (!btn) return;
  const icon = btn.querySelector('.ms');
  if (icon) icon.textContent = expanded ? 'remove' : 'add';
  btn.setAttribute('aria-label', expanded ? 'Minimize' : 'Expand');
}

function toggleCard(id) {
  const card = publishQueue.find(c => c.id === id);
  if (!card) return;
  if (card.expanded) {
    card.expanded = false;
    collapseCard(id);
    updateMinBtn(id, false);
  } else {
    const cur = publishQueue.find(c => c.expanded);
    if (cur) { cur.expanded = false; collapseCard(cur.id); updateMinBtn(cur.id, false); }
    card.expanded = true;
    applyCardHeight(id, false);
    updateMinBtn(id, true);
  }
}

function removeCard(id) {
  const wasExpanded = !!publishQueue.find(c => c.id === id && c.expanded);
  publishQueue = publishQueue.filter(c => c.id !== id);
  if (!publishQueue.length) {
    updatePublishTrigger();
    document.getElementById('queuePanel').classList.remove('open');
    return;
  }
  if (wasExpanded && !publishQueue.find(c => c.expanded)) publishQueue[0].expanded = true;
  renderQueue();
}

function togglePostExpand(btn) {
  btn.classList.toggle('open');
  btn.closest('.post-tile').querySelector('.post-platforms').classList.toggle('open');
}

// ── Queue location data ───────────────────────────────────
const postLocQ1 = [
  { name: 'Greens - Queen St.',      addr: '7630 Queen Street, Toronto ON',    platforms: [{ key: 'doordash', name: 'DoorDash', status: 'failed' }, { key: 'ubereats', name: 'Uber Eats', status: 'in_progress' }, { key: 'caviar', name: 'Caviar', status: 'published' }, { key: 'grubhub', name: 'Grubhub', status: 'published' }], expanded: true },
  { name: 'Greens - Ossington Ave.', addr: '98 Ossington Avenue, Toronto ON',  platforms: [{ key: 'doordash', name: 'DoorDash', status: 'in_progress' }, { key: 'ubereats', name: 'Uber Eats', status: 'in_progress' }], expanded: false },
  { name: 'Greens - Charlotte St.',  addr: '2 Charlotte Street, Toronto ON',   platforms: [{ key: 'doordash', name: 'DoorDash', status: 'published' }, { key: 'grubhub', name: 'Grubhub', status: 'published' }, { key: 'ubereats', name: 'Uber Eats', status: 'published' }], expanded: false },
  { name: 'Greens - Duncan St.',     addr: '6709 Duncan Street, Toronto ON',   platforms: [{ key: 'doordash', name: 'DoorDash', status: 'published' }, { key: 'grubhub', name: 'Grubhub', status: 'published' }], expanded: false },
  { name: 'Greens - Culver City',    addr: '4423 Culver Drive, Los Angeles CA',platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }], expanded: false },
  { name: 'Greens - King West',      addr: '550 King Street West, Toronto ON', platforms: [{ key: 'doordash', name: 'DoorDash', status: 'published' }, { key: 'grubhub', name: 'Grubhub', status: 'published' }, { key: 'ubereats', name: 'Uber Eats', status: 'published' }], expanded: false },
  { name: 'Greens - Yorkville',      addr: '88 Yorkville Avenue, Toronto ON',  platforms: [{ key: 'doordash', name: 'DoorDash', status: 'failed' }], expanded: false },
];
const postLocQ2 = [
  { name: 'Greens - Queen St.',      addr: '7630 Queen Street, Toronto ON',    platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }], expanded: false },
  { name: 'Greens - Ossington Ave.', addr: '98 Ossington Avenue, Toronto ON',  platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }], expanded: false },
  { name: 'Greens - Charlotte St.',  addr: '2 Charlotte Street, Toronto ON',   platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'grubhub', name: 'Grubhub', status: 'pending' }], expanded: false },
];
const postLocQ3 = [
  { name: 'Greens - Queen St.',      addr: '7630 Queen Street, Toronto ON',    platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }, { key: 'grubhub', name: 'Grubhub', status: 'pending' }], expanded: false },
  { name: 'Greens - King West',      addr: '550 King Street West, Toronto ON', platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }], expanded: false },
  { name: 'Greens - Yorkville',      addr: '88 Yorkville Avenue, Toronto ON',  platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }], expanded: false },
  { name: 'Greens - Culver City',    addr: '4423 Culver Drive, Los Angeles CA',platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }], expanded: false },
];

let currentMenuBrand = 'Breakfast Beauties';

function switchMenu(brandName) {
  currentMenuBrand = brandName;
  updatePublishTrigger();
}

function generatePendingLocations() {
  return [
    { name: 'Greens - Queen St.',      addr: '7630 Queen Street, Toronto ON',    platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'ubereats', name: 'Uber Eats', status: 'pending' }], expanded: false },
    { name: 'Greens - Ossington Ave.', addr: '98 Ossington Avenue, Toronto ON',  platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }, { key: 'grubhub', name: 'Grubhub', status: 'pending' }], expanded: false },
    { name: 'Greens - Charlotte St.',  addr: '2 Charlotte Street, Toronto ON',   platforms: [{ key: 'doordash', name: 'DoorDash', status: 'pending' }], expanded: false },
  ];
}

let publishQueue = [];

// ── Panel page navigation ─────────────────────────────────
function goToStep2() {
  document.getElementById('ppPanelPages').classList.add('show-step2');
}
function showIssuesPage() {
  document.getElementById('ppPanelPages').classList.add('show-issues');
}
function showPrepubPage() {
  document.getElementById('ppPanelPages').classList.remove('show-issues');
  document.getElementById('ppPanelPages').classList.add('show-step2');
}

// ── Panel open/close ──────────────────────────────────────
function openPanel() {
  // Start directly at location selection; the old pre-publish gate is skipped.
  document.getElementById('ppPanelPages').classList.add('show-step2');
  document.getElementById('ppPanelPages').classList.remove('show-issues');
  document.getElementById('ppPanel').classList.add('open');
  document.getElementById('ppScrim').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePanel() {
  document.getElementById('ppPanel').classList.remove('open');
  document.getElementById('ppScrim').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => showPrepubPage(), 350);
}

// ── Publish → close panel, add task to pq-card widget ────
function doPublish() {
  const panelRect = document.getElementById('ppPanel').getBoundingClientRect();
  document.getElementById('ppPanel').classList.remove('open');
  document.getElementById('ppScrim').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function() {
    showPrepubPage();
    // Add "Publish menu" task to the pq widget and show card expanded
    if (window.pqAddPublishMenuTask) {
      window.pqAddPublishMenuTask({ startRect: panelRect });
    }
  }, 350);
}

// ── Tax Settings Modal ────────────────────────────────────
const taxSelections = { doordash: null, grubhub: null, ubereats: null };
let activeTaxDropdown = null;

function openTaxModal() {
  document.getElementById('taxModalScrim').classList.add('open');
  document.getElementById('taxModal').classList.add('open');
}

function closeTaxModal() {
  document.getElementById('taxModalScrim').classList.remove('open');
  document.getElementById('taxModal').classList.remove('open');
  if (activeTaxDropdown) {
    activeTaxDropdown.querySelector('.tax-dropdown-menu')?.remove();
    const caret = activeTaxDropdown.querySelector('.tax-select__caret');
    if (caret) caret.textContent = 'expand_more';
    activeTaxDropdown = null;
  }
}

function openTaxDropdown(el) {
  if (el.classList.contains('tax-select--disabled')) return;
  // Close any other open dropdown
  if (activeTaxDropdown && activeTaxDropdown !== el) {
    activeTaxDropdown.querySelector('.tax-dropdown-menu')?.remove();
    const c = activeTaxDropdown.querySelector('.tax-select__caret');
    if (c) c.textContent = 'expand_more';
  }
  // Toggle current
  const existing = el.querySelector('.tax-dropdown-menu');
  if (existing) {
    existing.remove();
    el.querySelector('.tax-select__caret').textContent = 'expand_more';
    activeTaxDropdown = null;
    return;
  }
  const ch = el.dataset.channel;
  const menu = document.createElement('div');
  menu.className = 'tax-dropdown-menu';
  menu.innerHTML = `
    <div class="tax-option" onclick="selectTaxOption('${ch}','send');event.stopPropagation()">
      <span class="ms tax-option__icon">check</span><span>Send tax rate to channel</span>
    </div>
    <div class="tax-option tax-option--secondary" onclick="selectTaxOption('${ch}','nosend');event.stopPropagation()">
      <span class="ms tax-option__icon">block</span><span>Don't send tax rate to channel</span>
    </div>`;
  el.appendChild(menu);
  el.querySelector('.tax-select__caret').textContent = 'expand_less';
  activeTaxDropdown = el;
}

function selectTaxOption(channel, value) {
  taxSelections[channel] = value;
  const el = document.querySelector(`.tax-select[data-channel="${channel}"]`);
  if (!el) return;
  el.querySelector('.tax-dropdown-menu')?.remove();
  el.querySelector('.tax-select__caret').textContent = 'expand_more';
  activeTaxDropdown = null;
  el.classList.remove('has-error');
  const icon = el.querySelector('.tax-select__icon');
  const text = el.querySelector('.tax-select__text');
  if (value === 'send') {
    icon.textContent = 'check'; icon.style.display = '';
    text.textContent = 'Send tax rate to channel';
  } else {
    icon.textContent = 'block'; icon.style.display = '';
    text.textContent = "Don't send tax rate to channel";
  }
  text.classList.add('tax-select__text--filled');
  checkTaxConfirmReady();
}

function checkTaxConfirmReady() {
  const allDone = Object.values(taxSelections).every(v => v !== null);
  document.getElementById('taxConfirmBtn').disabled = !allDone;
}

function confirmTaxSettings() {
  closeTaxModal();
  const banner = document.getElementById('taxIssueBanner');
  if (banner) banner.remove();
}

// Close tax dropdown when clicking outside
document.addEventListener('click', e => {
  if (activeTaxDropdown && !activeTaxDropdown.contains(e.target)) {
    activeTaxDropdown.querySelector('.tax-dropdown-menu')?.remove();
    const c = activeTaxDropdown.querySelector('.tax-select__caret');
    if (c) c.textContent = 'expand_more';
    activeTaxDropdown = null;
  }
});

// ── Initialize queue on page load ─────────────────────────
// Queue panel hidden by default — shown only after user triggers publish
// if (publishQueue.length > 0) {
//   renderQueue();
//   document.getElementById('queuePanel').classList.add('open');
// }
