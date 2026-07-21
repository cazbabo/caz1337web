/**
 * app.js — full-screen slide-deck controller (Apple/Keynote style)
 * -----------------------------------------------------------------------
 * สร้างสไลด์ทั้งหมดจากข้อมูลใน usecases.js แล้วผูกเข้ากับ engine ใน simulator.js
 *
 * ลำดับสไลด์:
 *   0  Hero
 *   1  Capabilities (RCS ทำอะไรได้บ้าง)
 *   2–11  10 use case (จัดกลุ่มตามอุตสาหกรรม ตามลำดับใน USECASES)
 *   12  Closing / value pillars
 *
 * มี Phone Simulator เพียงตัวเดียว (singleton) ที่ถูกย้าย DOM เข้าไปใน
 * use-case slide ที่กำลัง active แล้ว load() flow ของ use case นั้น (reset ทุกครั้ง)
 */

(function () {
  'use strict';

  /* ---------- tiny DOM helper (no deps) ---------- */
  function h(tag, attrs, ...children) {
    const e = document.createElement(tag);
    attrs = attrs || {};
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
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

  const industryById = (id) => INDUSTRIES.find((i) => i.id === id);

  /* ---------- KPI value formatting ----------
   * splitKpi("15-25% (จาก SMS 2-5%)") -> { primary:"15–25%", secondary:"จาก SMS 2–5%" }
   * - converts hyphens between digits to en-dashes (15-25 -> 15–25)
   * - peels a trailing parenthetical off as the small muted qualifier
   */
  function enDashRanges(str) {
    return String(str).replace(/(\d)\s*-\s*(\d)/g, '$1–$2');
  }
  function splitKpi(raw) {
    const value = enDashRanges(raw).trim();
    const m = value.match(/^([^()（）]*?)\s*[\(（]\s*(.+?)\s*[\)）]\s*$/);
    if (m && m[1].trim() && m[2].trim()) {
      return { primary: m[1].trim(), secondary: m[2].trim() };
    }
    return { primary: value, secondary: '' };
  }
  // true when the primary is a bare numeric token (SF Pro digits) — safe to tighten tracking
  function isNumericToken(str) {
    return /\d/.test(str) && /^[\s\d.,%+\-–±<>~/x]+$/i.test(str);
  }

  /* ---------------- slide builders ---------------- */

  function buildHeroSlide() {
    const stats = [
      { value: '25% (เทียบกับ SMS 2-5%)', label: 'RCS Click-through Rate' },
      { value: String(USECASES.length), label: 'Use Case สาธิตได้จริงในเครื่องเดียว' },
    ];
    return h('section', { class: 'slide slide-hero', 'data-kind': 'hero', 'aria-label': 'หน้าเปิด' },
      h('div', { class: 'slide-center' },
        h('p', { class: 'kicker' }, 'RCS Business Messaging'),
        h('h1', { class: 'hero-h1' }, 'SMS ที่วิวัฒนาการแล้ว'),
        h('p', { class: 'hero-lead' },
          'แชนแนลเดียวที่รวม Rich Card, Carousel, AI และ Verified Sender ' +
          'ไว้ในแอป Messages ที่ลูกค้ามีอยู่แล้ว — ไม่ต้องลงแอปเพิ่ม'),
        h('div', { class: 'hero-stats' },
          stats.map((s) => {
            const { primary, secondary } = splitKpi(s.value);
            return h('div', { class: 'hero-stat' },
              h('div', { class: 'hero-stat-value' + (isNumericToken(primary) ? ' is-num' : '') },
                primary,
                secondary ? h('span', { class: 'hero-stat-qual' }, secondary) : null
              ),
              h('div', { class: 'hero-stat-label' }, s.label)
            );
          })
        ),
        h('div', { class: 'hero-industries', role: 'group', 'aria-label': 'อุตสาหกรรมที่รองรับ' },
          h('div', { class: 'hero-ind-cap' }, `${INDUSTRIES.length} อุตสาหกรรมพร้อมสาธิต`),
          h('div', { class: 'hero-ind-row' },
            INDUSTRIES.map((ind) => h('div', { class: 'hero-ind' },
              h('span', { class: 'hero-ind-icon', 'aria-hidden': 'true', html: (window.ICONS && ICONS[ind.id]) || ind.icon }),
              h('span', { class: 'hero-ind-label' }, ind.labelTh)
            ))
          )
        ),
        h('p', { class: 'hero-hint', html:
          'กด <kbd>&#8592;</kbd> <kbd>&#8594;</kbd> หรือปุ่มลูกศรบนหน้าจอเพื่อเลื่อนสไลด์' })
      )
    );
  }

  function buildCapabilitiesSlide() {
    return h('section', { class: 'slide slide-caps', 'data-kind': 'caps', 'aria-label': 'ความสามารถของ RCS' },
      h('div', { class: 'slide-center wide' },
        h('p', { class: 'kicker' }, 'How RCS Works'),
        h('h2', { class: 'slide-h2' }, 'RCS ทำอะไรได้บ้าง'),
        h('p', { class: 'slide-sub' },
          'องค์ประกอบเหล่านี้คือสิ่งที่ทำให้ RCS ต่างจาก SMS ธรรมดา และเป็นวัตถุดิบของทุก use case ในเด็คนี้'),
        h('div', { class: 'cap-list' },
          CAPABILITIES.map((cap) => h('div', { class: 'cap-item' },
            h('div', { class: 'cap-item-icon', 'aria-hidden': 'true', html: (window.ICONS && ICONS[cap.id]) || cap.icon }),
            h('div', { class: 'cap-item-label' }, cap.label)
          ))
        )
      )
    );
  }

  function buildUsecaseSlide(uc) {
    const ind = industryById(uc.industry);
    const kpi = uc.kpis[0]; // headline KPI (ตัวแรกคือตัวชูโรงของแต่ละ use case)
    return h('section', {
      class: 'slide slide-uc',
      'data-kind': 'usecase',
      'data-uc': uc.id,
      'data-industry': uc.industry,
      'aria-label': `Use case: ${uc.title}`,
    },
      h('div', { class: 'uc-inner' },
        h('div', { class: 'uc-copy' },
          h('p', { class: 'uc-industry' },
            h('span', { class: 'uc-industry-icon', 'aria-hidden': 'true', html: (window.ICONS && ICONS[ind.id]) || ind.icon }),
            `${ind.label} · ${ind.labelTh}`
          ),
          h('h2', { class: 'uc-title' }, uc.title),
          h('p', { class: 'uc-problem' }, uc.problem),
          (function () {
            const { primary, secondary } = splitKpi(kpi.value);
            return h('div', { class: 'uc-kpi' },
              h('div', { class: 'uc-kpi-value' + (isNumericToken(primary) ? ' is-num' : '') }, primary),
              secondary ? h('div', { class: 'uc-kpi-qual' }, secondary) : null,
              h('div', { class: 'uc-kpi-label' }, kpi.label)
            );
          })()
        ),
        h('div', { class: 'uc-dock', 'data-dock': uc.id })
      )
    );
  }

  function buildClosingSlide() {
    const pillars = [
      { word: 'Verified', desc: 'แบรนด์ยืนยันตัวตนพร้อมโลโก้ ลด phishing และสร้างความเชื่อมั่นตั้งแต่ข้อความแรก' },
      { word: 'Interactive', desc: 'Rich Card, Carousel, ปุ่ม Suggested Action ให้ลูกค้าตัดสินใจและจบงานในแชทเดียว' },
      { word: 'Native', desc: 'ทำงานบนแอป Messages ที่มีอยู่แล้ว ไม่ต้องดาวน์โหลดหรือติดตั้งแอปเพิ่ม' },
      { word: 'Measurable', desc: 'CTR และ conversion สูงกว่า SMS หลายเท่า วัดผลได้จริงทุกแคมเปญ' },
    ];
    return h('section', { class: 'slide slide-close', 'data-kind': 'close', 'aria-label': 'สรุปคุณค่า' },
      h('div', { class: 'slide-center wide' },
        h('p', { class: 'kicker' }, 'ทำไมต้อง RCS'),
        h('h2', { class: 'close-h2' }, 'ช่องทางเดียว ปิดงานได้จริง'),
        h('div', { class: 'pillars' },
          pillars.map((p) => h('div', { class: 'pillar' },
            h('div', { class: 'pillar-word' }, p.word),
            h('div', { class: 'pillar-desc' }, p.desc)
          ))
        ),
        h('p', { class: 'close-cta' }, 'พร้อมนำ RCS ไปสร้างประสบการณ์ให้ลูกค้าของคุณแล้ววันนี้')
      )
    );
  }

  /* ---------------- deck controller ---------------- */
  const Deck = {
    el: null,
    slides: [],
    dotsEl: null,
    counterEl: null,
    prevBtn: null,
    nextBtn: null,
    simRoot: null,
    current: 0,

    build() {
      this.el = document.getElementById('deck');
      this.dotsEl = document.getElementById('deckDots');
      this.counterEl = document.getElementById('deckCounter');
      this.prevBtn = document.getElementById('deckPrev');
      this.nextBtn = document.getElementById('deckNext');
      this.simRoot = document.getElementById('simulatorRoot');

      // build slides
      this.el.appendChild(buildHeroSlide());
      this.el.appendChild(buildCapabilitiesSlide());
      USECASES.forEach((uc) => this.el.appendChild(buildUsecaseSlide(uc)));
      this.el.appendChild(buildClosingSlide());
      this.slides = Array.prototype.slice.call(this.el.querySelectorAll('.slide'));

      // init single simulator engine (no per-phone use-case dropdown — slides drive it)
      window.Simulator.init(this.simRoot, { hideSelect: true });

      this.buildDots();
      this.wireControls();
      this.go(0, true);
    },

    buildDots() {
      this.dotsEl.innerHTML = '';
      this.slides.forEach((slide, i) => {
        const prev = this.slides[i - 1];
        const isSectionStart =
          slide.dataset.industry &&
          (!prev || prev.dataset.industry !== slide.dataset.industry);
        const dot = h('button', {
          class: 'deck-dot' + (isSectionStart ? ' section-start' : ''),
          type: 'button',
          role: 'tab',
          'aria-label': `ไปสไลด์ ${i + 1}`,
          onclick: () => { this.go(i); dot.blur(); },
        });
        this.dotsEl.appendChild(dot);
      });
    },

    wireControls() {
      this.prevBtn.addEventListener('click', () => { this.prev(); this.prevBtn.blur(); });
      this.nextBtn.addEventListener('click', () => { this.next(); this.nextBtn.blur(); });

      document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'ArrowRight' || key === 'PageDown') {
          e.preventDefault(); this.next();
        } else if (key === 'ArrowLeft' || key === 'PageUp') {
          e.preventDefault(); this.prev();
        } else if (key === ' ' || key === 'Spacebar') {
          // don't hijack Space while a button (e.g. a chat chip) is focused
          if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
          e.preventDefault(); this.next();
        } else if (key === 'Home') {
          e.preventDefault(); this.go(0);
        } else if (key === 'End') {
          e.preventDefault(); this.go(this.slides.length - 1);
        }
      });

      // lightweight swipe (ignored when the gesture starts on the phone mockup)
      let sx = null, sy = null;
      this.el.addEventListener('touchstart', (e) => {
        if (e.target.closest && e.target.closest('.phone-shell')) { sx = null; return; }
        sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      }, { passive: true });
      this.el.addEventListener('touchend', (e) => {
        if (sx === null) return;
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          dx < 0 ? this.next() : this.prev();
        }
        sx = null;
      }, { passive: true });
    },

    next() { this.go(this.current + 1); },
    prev() { this.go(this.current - 1); },

    go(index, force) {
      index = Math.max(0, Math.min(this.slides.length - 1, index));
      if (!force && index === this.current) return;

      this.slides[this.current].classList.remove('active');
      this.slides[index].classList.add('active');
      this.current = index;

      this.onEnter(this.slides[index]);
      this.updateChrome();
    },

    onEnter(slide) {
      if (slide.dataset.uc) {
        const dock = slide.querySelector('.uc-dock');
        // move the single simulator into this slide, then (re)load its flow -> resets conversation
        if (this.simRoot.parentElement !== dock) dock.appendChild(this.simRoot);
        window.Simulator.load(slide.dataset.uc);
      }
    },

    updateChrome() {
      const total = this.slides.length;
      this.counterEl.textContent = `${this.current + 1} / ${total}`;
      Array.prototype.forEach.call(this.dotsEl.children, (dot, i) => {
        const active = i === this.current;
        dot.classList.toggle('active', active);
        if (active) dot.setAttribute('aria-selected', 'true');
        else dot.removeAttribute('aria-selected');
      });
      this.prevBtn.disabled = this.current === 0;
      this.nextBtn.disabled = this.current === total - 1;
    },
  };

  function init() {
    Deck.build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
