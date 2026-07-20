/**
 * app.js — gallery, filters, navigation, business-value panel
 * -----------------------------------------------------------------------
 * เชื่อม usecases.js (data) เข้ากับ simulator.js (engine) และจัดการ UI
 * ส่วนที่เหลือทั้งหมดของหน้าเว็บ (hero, capability chips, gallery, filter,
 * business value panel, mobile nav)
 */

(function () {
  'use strict';

  const state = {
    currentUsecaseId: USECASES[0].id,
    activeIndustries: new Set(),
    activeCapabilities: new Set(),
  };

  function h(tag, attrs, ...children) {
    const e = document.createElement(tag);
    attrs = attrs || {};
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  }

  /* ---------------- capability chips (section 3.2) ---------------- */
  function renderCapabilityChips() {
    const wrap = document.getElementById('capabilityChips');
    if (!wrap) return;
    wrap.innerHTML = '';
    CAPABILITIES.forEach((cap) => {
      wrap.appendChild(
        h('div', { class: 'capability-chip' },
          h('span', { class: 'capability-chip-icon', 'aria-hidden': 'true' }, cap.icon),
          h('span', {}, cap.label)
        )
      );
    });
  }

  /* ---------------- gallery filters ---------------- */
  function renderFilters() {
    const indWrap = document.getElementById('industryFilters');
    const capWrap = document.getElementById('capabilityFilters');
    if (indWrap) {
      indWrap.innerHTML = '';
      indWrap.appendChild(makeFilterChip('ทั้งหมด', null, 'industry', true));
      INDUSTRIES.forEach((ind) => {
        indWrap.appendChild(makeFilterChip(`${ind.icon} ${ind.labelTh}`, ind.id, 'industry'));
      });
    }
    if (capWrap) {
      capWrap.innerHTML = '';
      capWrap.appendChild(makeFilterChip('ทั้งหมด', null, 'capability', true));
      CAPABILITIES.forEach((cap) => {
        capWrap.appendChild(makeFilterChip(`${cap.icon} ${cap.label}`, cap.id, 'capability'));
      });
    }
  }

  function makeFilterChip(label, value, group, isAll) {
    const set = group === 'industry' ? state.activeIndustries : state.activeCapabilities;
    const btn = h('button', { class: 'chip chip-filter', type: 'button' }, label);
    const sync = () => {
      const active = isAll ? set.size === 0 : set.has(value);
      btn.classList.toggle('active', active);
    };
    btn.addEventListener('click', () => {
      if (isAll) {
        set.clear();
      } else {
        set.has(value) ? set.delete(value) : set.add(value);
      }
      // re-sync every chip in this group
      const wrap = group === 'industry' ? document.getElementById('industryFilters') : document.getElementById('capabilityFilters');
      wrap.querySelectorAll('.chip-filter').forEach((c) => c._sync && c._sync());
      renderGallery();
    });
    btn._sync = sync;
    sync();
    return btn;
  }

  function matchesFilter(uc) {
    const indOk = state.activeIndustries.size === 0 || state.activeIndustries.has(uc.industry);
    const capOk = state.activeCapabilities.size === 0 || uc.capabilities.some((c) => state.activeCapabilities.has(c));
    return indOk && capOk;
  }

  /* ---------------- gallery cards ---------------- */
  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = USECASES.filter(matchesFilter);

    if (!filtered.length) {
      grid.appendChild(h('div', { class: 'gallery-empty' }, 'ไม่พบ use case ที่ตรงกับตัวกรอง ลองเลือกใหม่ดูนะครับ'));
      return;
    }

    filtered.forEach((uc) => {
      const ind = INDUSTRIES.find((i) => i.id === uc.industry);
      const topKpi = uc.kpis[0];
      const card = h('div', { class: 'usecase-card', 'data-uc': uc.id },
        h('div', { class: 'usecase-card-top' },
          h('span', { class: 'industry-badge' }, `${ind.icon} ${ind.labelTh}`),
          h('span', { class: 'usecase-brand' }, uc.brand.icon + ' ' + uc.brand.name)
        ),
        h('h3', { class: 'usecase-title' }, uc.title),
        h('p', { class: 'usecase-problem' }, uc.problem),
        h('div', { class: 'usecase-kpi' },
          h('span', { class: 'usecase-kpi-value' }, topKpi.value),
          h('span', { class: 'usecase-kpi-label' }, topKpi.label)
        ),
        h('div', { class: 'usecase-caps' },
          uc.capabilities.slice(0, 4).map((capId) => {
            const cap = CAPABILITIES.find((c) => c.id === capId);
            return cap ? h('span', { class: 'mini-chip', title: cap.label }, cap.icon) : null;
          })
        ),
        h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => selectUsecase(uc.id, { scroll: true }) },
          'ลองเล่น Demo ▸'
        )
      );
      grid.appendChild(card);
    });
  }

  function syncGalleryActiveState() {
    document.querySelectorAll('.usecase-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.uc === state.currentUsecaseId);
    });
  }

  /* ---------------- business value panel (section 3.5) ---------------- */
  function renderBusinessValue(usecaseId) {
    const uc = USECASES.find((u) => u.id === usecaseId);
    const panel = document.getElementById('businessValue');
    if (!uc || !panel) return;
    const ind = INDUSTRIES.find((i) => i.id === uc.industry);

    panel.innerHTML = '';
    panel.appendChild(
      h('div', { class: 'bv-header' },
        h('span', { class: 'industry-badge' }, `${ind.icon} ${ind.labelTh}`),
        h('h3', {}, uc.title),
      )
    );
    panel.appendChild(
      h('div', { class: 'bv-grid' },
        h('div', { class: 'bv-block bv-problem' },
          h('div', { class: 'bv-block-label' }, '❌ ปัญหาเดิม'),
          h('p', {}, uc.problem)
        ),
        h('div', { class: 'bv-block bv-solution' },
          h('div', { class: 'bv-block-label' }, '✅ RCS แก้อย่างไร'),
          h('p', {}, uc.solution)
        )
      )
    );
    panel.appendChild(
      h('div', { class: 'bv-kpis' },
        h('div', { class: 'bv-block-label' }, '📈 KPI ที่คาดหวัง'),
        h('div', { class: 'bv-kpi-row' },
          uc.kpis.map((k) => h('div', { class: 'bv-kpi-tile' },
            h('span', { class: 'bv-kpi-value' }, k.value),
            h('span', { class: 'bv-kpi-label' }, k.label)
          ))
        )
      )
    );
    panel.appendChild(
      h('div', { class: 'bv-integrations' },
        h('div', { class: 'bv-block-label' }, '🔧 ข้อมูล/ระบบที่ลูกค้าต้องมี'),
        h('ul', { class: 'bv-integration-list' },
          uc.integrations.map((i) => h('li', {}, i))
        )
      )
    );
  }

  /* ---------------- cross-section selection ---------------- */
  function selectUsecase(id, opts) {
    opts = opts || {};
    state.currentUsecaseId = id;
    window.Simulator.load(id);
    renderBusinessValue(id);
    syncGalleryActiveState();
    if (opts.scroll) {
      const target = document.getElementById('simulator');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------------- nav / mobile menu ---------------- */
  function setupNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('open');
      });
      menu.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => {
          menu.classList.remove('open');
          toggle.classList.remove('open');
        })
      );
    }
  }

  /* ---------------- hero stat count-up ---------------- */
  function setupStatCountUp() {
    const tiles = document.querySelectorAll('.stat-tile [data-count-to]');
    if (!tiles.length) return;
    const animate = (el) => {
      const to = parseFloat(el.dataset.countTo);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.countTo.includes('.') ? 1 : 0;
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    tiles.forEach((t) => io.observe(t));
  }

  /* ---------------- boot ---------------- */
  function init() {
    renderCapabilityChips();
    renderFilters();
    renderGallery();
    window.Simulator.init(document.getElementById('simulatorRoot'), { onSwitch: (id) => selectUsecase(id) });
    selectUsecase(state.currentUsecaseId);
    setupNav();
    setupStatCountUp();

    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear() + 543; // พ.ศ.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
