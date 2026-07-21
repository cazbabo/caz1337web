/**
 * simulator.js — RCS Phone Simulator engine
 * -----------------------------------------------------------------------
 * เล่น conversation flow ของ use case จาก usecases.js บน mockup โทรศัพท์
 * ที่วาดด้วย CSS ล้วนๆ ไม่พึ่งพา library ภายนอกใดๆ
 *
 * Public API: window.Simulator
 *   .init(rootEl, { onSwitch })  — สร้าง DOM ของ simulator ครั้งเดียว
 *   .load(usecaseId)             — โหลด use case ใหม่ + reset บทสนทนา
 *   .reset()                     — เล่น use case ปัจจุบันใหม่ตั้งแต่ต้น
 */

(function () {
  'use strict';

  /* ---------- small DOM helper (no deps) ---------- */
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

  /* ---------- fake QR generator (deterministic per code string) ---------- */
  function seededRandom(seedStr) {
    let a = 0;
    for (let i = 0; i < seedStr.length; i++) a = (a * 31 + seedStr.charCodeAt(i)) | 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildQrGrid(code) {
    const size = 13;
    const rnd = seededRandom(code || 'rcs-demo');
    const grid = h('div', { class: 'qr-grid', style: `grid-template-columns:repeat(${size},1fr)` });
    const isFinderZone = (r, c) =>
      (r < 4 && c < 4) || (r < 4 && c >= size - 4) || (r >= size - 4 && c < 4);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFinderZone(r, c)) {
          grid.appendChild(h('div', { class: 'qr-cell qr-blank' }));
        } else {
          const on = rnd() > 0.5;
          grid.appendChild(h('div', { class: 'qr-cell' + (on ? ' on' : '') }));
        }
      }
    }
    return grid;
  }

  function buildQrVisual(code) {
    const wrap = h('div', { class: 'qr-visual' }, buildQrGrid(code));
    ['tl', 'tr', 'bl'].forEach((pos) => {
      wrap.appendChild(h('div', { class: `qr-finder qr-finder-${pos}` }, h('div', { class: 'qr-finder-inner' })));
    });
    return wrap;
  }

  /* ---------- engine ---------- */
  const Simulator = {
    root: null,
    feedEl: null,
    choiceEl: null,
    headerEl: null,
    selectEl: null,
    endBannerEl: null,
    usecase: null,
    nodeMap: null,
    session: 0,
    onSwitch: null,

    init(rootEl, opts) {
      this.root = rootEl;
      this.onSwitch = (opts && opts.onSwitch) || null;
      const hideSelect = !!(opts && opts.hideSelect);
      this.selectEl = null;
      this.root.innerHTML = '';

      const controls = h(
        'div', { class: 'sim-controls' },
        hideSelect ? null : h('label', { class: 'sim-select-label' },
          'เลือก Use Case:',
          (this.selectEl = h('select', { class: 'sim-select', onchange: () => {
            if (this.onSwitch) this.onSwitch(this.selectEl.value);
          } }))
        ),
        h('button', { class: 'btn btn-ghost sim-reset', onclick: () => this.reset(), type: 'button' },
          h('span', { class: 'reset-icon', 'aria-hidden': 'true' }, '↺'), ' เล่นใหม่'
        )
      );

      const phone = h(
        'div', { class: 'phone-shell' },
        h('div', { class: 'phone-notch' }),
        h('div', { class: 'phone-screen' },
          (this.headerEl = h('div', { class: 'chat-header' })),
          (this.feedEl = h('div', { class: 'chat-feed' })),
          (this.endBannerEl = h('div', { class: 'end-banner hidden' },
            h('span', {}, '🎉 จบบทสนทนาตัวอย่างแล้ว'),
            h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => this.reset() }, 'เล่นอีกครั้ง')
          )),
          (this.choiceEl = h('div', { class: 'suggested-row' })),
          h('div', { class: 'chat-inputbar' },
            h('span', { class: 'inputbar-plus', 'aria-hidden': 'true' }, '+'),
            h('span', { class: 'inputbar-placeholder' }, 'พิมพ์ข้อความ RCS...'),
            h('span', { class: 'inputbar-mic', 'aria-hidden': 'true' }, '🎤')
          )
        ),
        h('div', { class: 'phone-home-bar' })
      );

      this.root.appendChild(controls);
      this.root.appendChild(phone);

      this.populateSelect();
    },

    populateSelect() {
      if (!this.selectEl) return;
      this.selectEl.innerHTML = '';
      USECASES.forEach((uc) => {
        const ind = INDUSTRIES.find((i) => i.id === uc.industry);
        this.selectEl.appendChild(
          h('option', { value: uc.id }, `${ind ? ind.icon : ''} ${uc.title}`)
        );
      });
    },

    load(usecaseId) {
      const uc = USECASES.find((u) => u.id === usecaseId) || USECASES[0];
      this.usecase = uc;
      if (this.selectEl) this.selectEl.value = uc.id;
      this.buildNodeMap();
      this.renderHeader();
      this.reset();
    },

    buildNodeMap() {
      const map = {};
      const flow = this.usecase.flow;
      flow.forEach((node, i) => {
        map[node.id] = node;
        node._autoNext = i < flow.length - 1 ? flow[i + 1].id : null;
      });
      this.nodeMap = map;
    },

    renderHeader() {
      const uc = this.usecase;
      this.headerEl.innerHTML = '';
      this.headerEl.style.setProperty('--brand-color', uc.brand.color);
      // brand avatar: render the mapped industry line-icon (white stroke) instead of emoji
      const avatar = h('div', { class: 'chat-avatar' });
      const avatarSvg = window.ICONS && window.ICONS[uc.industry];
      if (avatarSvg) avatar.innerHTML = avatarSvg;
      else avatar.textContent = uc.brand.icon;
      this.headerEl.appendChild(avatar);
      const nameRow = h('div', { class: 'chat-brand-row' },
        h('span', { class: 'chat-brand-name' }, uc.brand.name),
        h('span', { class: 'verified-badge', title: 'Verified Sender', 'aria-label': 'Verified Sender' })
      );
      this.headerEl.appendChild(
        h('div', { class: 'chat-header-text' },
          nameRow,
          h('span', { class: 'chat-header-sub' }, uc.title)
        )
      );
      this.headerEl.appendChild(h('div', { class: 'chat-header-dots' }, '⋮'));
    },

    reset() {
      this.session++;
      this.feedEl.innerHTML = '';
      this.choiceEl.innerHTML = '';
      this.choiceEl.classList.remove('hidden');
      this.endBannerEl.classList.add('hidden');
      if (!this.usecase || !this.usecase.flow.length) return;
      this.goTo(this.usecase.flow[0].id);
    },

    /* resolve the "next" id for a node, respecting explicit `next` (even null) vs auto-chain */
    resolveNext(node) {
      return 'next' in node ? node.next : node._autoNext;
    },

    goTo(nodeId, mySession) {
      mySession = mySession === undefined ? this.session : mySession;
      if (mySession !== this.session) return; // stale timer from a previous load/reset
      this.choiceEl.innerHTML = '';

      if (!nodeId || !this.nodeMap[nodeId]) {
        this.showEnd();
        return;
      }
      const node = this.nodeMap[nodeId];

      if (node.type === 'choice') {
        this.renderChoiceRow(node.options, mySession);
        return;
      }

      // type === 'bot'
      this.showTyping(mySession).then(() => {
        if (mySession !== this.session) return;
        this.appendBotMessage(node.msg, mySession);
        const interactive = this.isInteractive(node.msg);
        if (interactive) {
          this.wireInteractive(node, mySession);
        } else {
          const nextId = this.resolveNext(node);
          setTimeout(() => this.goTo(nextId, mySession), 480);
        }
      });
    },

    isInteractive(msg) {
      if (!msg) return false;
      if (msg.kind === 'rating') return true;
      if (Array.isArray(msg.buttons) && msg.buttons.length) return true;
      if (msg.kind === 'carousel' && (msg.cards || []).some((c) => c.buttons && c.buttons.length)) return true;
      return false;
    },

    wireInteractive(node, mySession) {
      // buttons live inside the message bubble itself (Suggested Action style);
      // clicking one logs a user bubble then advances the flow.
      const msg = node.msg;
      const handle = (label, next) => {
        this.pushUserBubble(label, mySession);
        setTimeout(() => this.goTo(next, mySession), 260);
      };
      if (msg.kind === 'rating') {
        // handled via delegated listener set in renderRating()
        this._ratingHandler = (stars) => handle(`${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} (${stars}/5)`, this.resolveNext(node));
        return;
      }
      const lastBubble = this.feedEl.lastElementChild;
      if (!lastBubble) return;
      lastBubble.querySelectorAll('[data-next]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (mySession !== this.session) return;
          handle(btn.dataset.label || btn.textContent.trim(), btn.dataset.next);
        });
      });
    },

    renderChoiceRow(options, mySession) {
      this.choiceEl.innerHTML = '';
      options.forEach((opt) => {
        this.choiceEl.appendChild(
          h('button', { class: 'chip chip-reply', type: 'button', onclick: () => {
            if (mySession !== this.session) return;
            this.pushUserBubble(opt.label, mySession);
            this.choiceEl.innerHTML = '';
            setTimeout(() => this.goTo(opt.next, mySession), 260);
          } }, opt.label)
        );
      });
    },

    showEnd() {
      this.choiceEl.innerHTML = '';
      this.endBannerEl.classList.remove('hidden');
      this.feedEl.scrollTop = this.feedEl.scrollHeight;
    },

    showTyping(mySession) {
      return new Promise((resolve) => {
        const bubble = h('div', { class: 'msg-row bot typing-row' },
          h('div', { class: 'bubble typing-bubble' },
            h('span', { class: 'dot' }), h('span', { class: 'dot' }), h('span', { class: 'dot' })
          )
        );
        this.feedEl.appendChild(bubble);
        this.scrollToBottom();
        const delay = 500 + Math.random() * 450;
        setTimeout(() => {
          bubble.remove();
          if (mySession !== this.session) return resolve();
          resolve();
        }, delay);
      });
    },

    pushUserBubble(label, mySession) {
      if (mySession !== this.session) return;
      const row = h('div', { class: 'msg-row user' }, h('div', { class: 'bubble user-bubble' }, label));
      this.feedEl.appendChild(row);
      this.scrollToBottom();
    },

    appendBotMessage(msg, mySession) {
      if (mySession !== this.session) return;
      const row = h('div', { class: 'msg-row bot' });
      row.appendChild(this.renderMsgContent(msg));
      this.feedEl.appendChild(row);
      requestAnimationFrame(() => row.classList.add('in'));
      this.scrollToBottom();
    },

    scrollToBottom() {
      this.feedEl.scrollTop = this.feedEl.scrollHeight;
    },

    renderMsgContent(msg) {
      switch (msg.kind) {
        case 'text': return this.renderText(msg);
        case 'richCard': return this.renderRichCard(msg);
        case 'carousel': return this.renderCarousel(msg);
        case 'map': return this.renderMap(msg);
        case 'qr': return this.renderQr(msg);
        case 'rating': return this.renderRating(msg);
        case 'payment': return this.renderPayment(msg);
        default: return h('div', { class: 'bubble' }, JSON.stringify(msg));
      }
    },

    renderButtons(buttons) {
      if (!buttons || !buttons.length) return null;
      return h('div', { class: 'card-actions' },
        buttons.map((b) => h('button', {
          class: 'chip chip-action', type: 'button',
          'data-next': b.next === null || b.next === undefined ? '' : b.next,
          'data-label': b.label,
        }, b.label))
      );
    },

    renderText(msg) {
      return h('div', { class: 'bubble text-bubble' }, msg.text);
    },

    renderRichCard(msg) {
      const tone = msg.tone || 'default';
      return h('div', { class: `bubble card-bubble tone-${tone}` },
        h('div', { class: 'card-visual' },
          h('span', { class: 'card-visual-icon' }, msg.icon || '📩'),
          msg.tag ? h('span', { class: 'card-tag' }, msg.tag) : null
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'card-title' }, msg.title),
          msg.subtitle ? h('div', { class: 'card-subtitle' }, msg.subtitle) : null,
          msg.desc ? h('div', { class: 'card-desc' }, msg.desc) : null,
        ),
        this.renderButtons(msg.buttons)
      );
    },

    renderCarousel(msg) {
      return h('div', { class: 'bubble carousel-bubble' },
        h('div', { class: 'carousel-track' },
          msg.cards.map((c) => h('div', { class: 'carousel-card' },
            h('div', { class: 'card-visual' },
              h('span', { class: 'card-visual-icon' }, c.icon || '📦'),
              c.tag ? h('span', { class: 'card-tag' }, c.tag) : null
            ),
            h('div', { class: 'card-body' },
              h('div', { class: 'card-title' }, c.title),
              c.subtitle ? h('div', { class: 'card-subtitle' }, c.subtitle) : null,
              c.price ? h('div', { class: 'card-price' }, c.price) : null,
            ),
            this.renderButtons(c.buttons)
          ))
        ),
        h('div', { class: 'carousel-hint' }, '← เลื่อนดูสินค้าเพิ่มเติม →')
      );
    },

    renderMap(msg) {
      return h('div', { class: 'bubble map-bubble' },
        h('div', { class: `map-canvas${msg.animated ? ' animated' : ''}` },
          h('div', { class: 'map-roads' }),
          h('div', { class: 'map-pin map-pin-dest', title: 'ปลายทาง' }, '📍'),
          h('div', { class: 'map-pin map-pin-courier', title: msg.courier || 'พนักงานส่งของ' }, '🛵')
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'card-title' }, msg.title),
          msg.address ? h('div', { class: 'card-subtitle' }, msg.address) : null,
          h('div', { class: 'map-meta' },
            msg.eta ? h('span', { class: 'map-meta-chip' }, `⏱ ETA ${msg.eta}`) : null,
            msg.distanceLabel ? h('span', { class: 'map-meta-chip' }, msg.distanceLabel) : null,
          )
        ),
        this.renderButtons(msg.buttons)
      );
    },

    renderQr(msg) {
      return h('div', { class: 'bubble qr-bubble' },
        buildQrVisual(msg.code || msg.label || 'rcs'),
        h('div', { class: 'card-body' },
          h('div', { class: 'card-title' }, msg.label),
          msg.sublabel ? h('div', { class: 'card-subtitle' }, msg.sublabel) : null
        )
      );
    },

    renderRating(msg) {
      const starsWrap = h('div', { class: 'rating-stars' });
      for (let i = 1; i <= 5; i++) {
        const star = h('button', { class: 'star-btn', type: 'button', 'data-val': String(i), 'aria-label': `${i} ดาว` }, '★');
        star.addEventListener('mouseenter', () => this.paintStars(starsWrap, i));
        star.addEventListener('click', () => {
          this.paintStars(starsWrap, i, true);
          starsWrap.querySelectorAll('.star-btn').forEach((b) => (b.disabled = true));
          if (this._ratingHandler) this._ratingHandler(i);
        });
        starsWrap.appendChild(star);
      }
      starsWrap.addEventListener('mouseleave', () => {
        const filled = starsWrap.dataset.locked;
        this.paintStars(starsWrap, filled ? Number(filled) : 0);
      });
      return h('div', { class: 'bubble rating-bubble' },
        h('div', { class: 'card-body' }, h('div', { class: 'card-title' }, msg.prompt)),
        starsWrap
      );
    },

    paintStars(wrap, count, lock) {
      if (lock) wrap.dataset.locked = String(count);
      wrap.querySelectorAll('.star-btn').forEach((b) => {
        b.classList.toggle('filled', Number(b.dataset.val) <= count);
      });
    },

    renderPayment(msg) {
      return h('div', { class: 'bubble payment-bubble' },
        h('div', { class: 'card-body' }, h('div', { class: 'card-title' }, '📋 สรุปรายการชำระเงิน')),
        h('div', { class: 'payment-items' },
          msg.items.map((it) => h('div', { class: 'payment-row' },
            h('span', { class: 'payment-label' }, it.label),
            h('span', { class: 'payment-price' }, it.price)
          ))
        ),
        h('div', { class: 'payment-total' },
          h('span', {}, 'ยอดชำระทั้งหมด'),
          h('span', { class: 'payment-total-value' }, msg.total)
        ),
        msg.method ? h('div', { class: 'payment-method' }, `💳 ${msg.method}`) : null,
        this.renderButtons(msg.buttons)
      );
    },
  };

  window.Simulator = Simulator;
})();
