/**
 * icons.js — cohesive minimal line-icon set (hand-authored inline SVG)
 * -----------------------------------------------------------------------
 * แทนที่ emoji category-icon เดิม (capabilities / industries / brand avatar)
 * ให้เป็นชุดไอคอนเส้นสไตล์เดียวกันทั้งเด็ค (design-system look)
 *
 * ข้อกำหนดร่วมของทุกไอคอน (shared stroke spec):
 *   viewBox="0 0 24 24" · fill="none" · stroke="currentColor"
 *   stroke-width="1.75" · stroke-linecap="round" · stroke-linejoin="round"
 * ไม่มีสีตายตัว → สืบสี stroke จาก CSS `color` (currentColor) ของ container
 *   - capabilities / industry  → สี accent
 *   - brand avatar             → สีขาว (บนวงกลมสีแบรนด์)
 *
 * โหลดผ่าน <script src="js/icons.js"> ก่อน app.js / simulator.js
 * ใช้งาน: ICONS[id]  →  คืนค่า SVG string (ใส่ผ่าน innerHTML / html attribute)
 *
 * mapping brand → industry icon (ใช้ industry ของ use case ได้เลย):
 *   nextTel→telecom · sabuyBank→financial · wellness→medical
 *   swiftLogix→logistics · urbanMart→retail
 */
(function () {
  'use strict';

  // ห่อ inner markup ด้วย <svg> ที่มี shared stroke spec เดียวกันทุกตัว
  function svg(inner) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false" class="line-icon">' + inner + '</svg>'
    );
  }

  const PARTS = {
    /* ---------------- Capabilities (10) ---------------- */

    // Rich Card — การ์ดรูปภาพพร้อมบรรทัดข้อความ (image-card with lines)
    richCard:
      '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/>' +
      '<line x1="3.5" y1="12.5" x2="20.5" y2="12.5"/>' +
      '<circle cx="8" cy="8" r="1.15"/>' +
      '<path d="M4.5 11.5 L8 8.2 L10.5 10.3 L13.5 7.3 L16 9.6"/>' +
      '<line x1="6.5" y1="15.4" x2="17.5" y2="15.4"/>' +
      '<line x1="6.5" y1="17.6" x2="13.5" y2="17.6"/>',

    // Carousel — การ์ดกลางพร้อมลูกศรเลื่อนซ้าย/ขวา (cards with side arrows)
    carousel:
      '<rect x="8.5" y="5.5" width="7" height="13" rx="1.6"/>' +
      '<path d="M5 9 L3.4 12 L5 15"/>' +
      '<path d="M19 9 L20.6 12 L19 15"/>' +
      '<line x1="10.6" y1="9.2" x2="13.4" y2="9.2"/>' +
      '<line x1="10.6" y1="12" x2="13.4" y2="12"/>',

    // Suggested Reply — บับเบิลข้อความพร้อมลูกศรตอบกลับ (speech bubble + reply arrow)
    suggestedReply:
      '<path d="M6 4.5 H18 a2.5 2.5 0 0 1 2.5 2.5 V14 a2.5 2.5 0 0 1 -2.5 2.5 H10 L5.5 20 V16.5 a2.5 2.5 0 0 1 -2 -2.45 A2.5 2.5 0 0 1 3.5 14 V7 A2.5 2.5 0 0 1 6 4.5 Z"/>' +
      '<path d="M13.5 8.5 L16 11 L13.5 13.5"/>' +
      '<path d="M16 11 H10 a2 2 0 0 0 -2 2 v0.6"/>',

    // Suggested Action — สายฟ้า (lightning bolt = action)
    suggestedAction:
      '<path d="M13.5 2.5 L5.5 13 H11 L10 21.5 L18.5 10.5 H12.5 L13.5 2.5 Z"/>',

    // Verified Sender — โล่พร้อมเครื่องหมายถูก (shield with check)
    verified:
      '<path d="M12 3 L19 5.5 V11 c0 4.6 -3 7.7 -7 9.2 c-4 -1.5 -7 -4.6 -7 -9.2 V5.5 Z"/>' +
      '<path d="M8.8 11.6 L11.2 14 L15.4 9.6"/>',

    // รูป/วิดีโอ — กรอบรูปภาพ ภูเขา+ดวงอาทิตย์ (photo frame: mountain + sun)
    media:
      '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/>' +
      '<circle cx="8.3" cy="9.4" r="1.35"/>' +
      '<path d="M4.5 17 L9 12 L12 14.6 L15.5 10 L19.5 15"/>',

    // Location & Live Map — แผนที่พับพร้อมหมุดปักตำแหน่ง (folded map + location pin)
    map:
      '<path d="M3.5 6.6 L9 4.6 L15 6.6 L20.5 4.6 V15.8 L15 17.8 L9 15.8 L3.5 17.8 Z"/>' +
      '<line x1="9" y1="4.6" x2="9" y2="15.8"/>' +
      '<line x1="15" y1="6.6" x2="15" y2="11"/>' +
      '<path d="M16 13 c0 2 -2.6 4.2 -2.6 4.2 S10.8 15 10.8 13 a2.6 2.6 0 0 1 5.2 0 Z"/>' +
      '<circle cx="13.4" cy="12.9" r="0.7"/>',

    // QR Code — ตารางคิวอาร์ finder 3 มุม + module (QR square)
    qr:
      '<rect x="3.5" y="3.5" width="6" height="6" rx="1.3"/>' +
      '<rect x="14.5" y="3.5" width="6" height="6" rx="1.3"/>' +
      '<rect x="3.5" y="14.5" width="6" height="6" rx="1.3"/>' +
      '<line x1="6.5" y1="6.3" x2="6.5" y2="6.7"/>' +
      '<line x1="17.5" y1="6.3" x2="17.5" y2="6.7"/>' +
      '<line x1="6.5" y1="17.3" x2="6.5" y2="17.7"/>' +
      '<path d="M14.5 14.5 H16.5 V16.5"/>' +
      '<path d="M20.5 14.5 V16.5 H18.5"/>' +
      '<line x1="20.5" y1="20" x2="20.5" y2="20.5"/>' +
      '<line x1="14.5" y1="20" x2="16.5" y2="20"/>' +
      '<line x1="18.5" y1="18.5" x2="20.5" y2="18.5"/>',

    // AI Chatbot / Agent — บับเบิลแชทพร้อมประกาย (chat bubble + sparkle)
    ai:
      '<path d="M5 4.5 H19 a2 2 0 0 1 2 2 V14 a2 2 0 0 1 -2 2 H10 L5.5 19.5 V16 H5 a2 2 0 0 1 -2 -2 V6.5 A2 2 0 0 1 5 4.5 Z"/>' +
      '<path d="M12 7 L13 9.8 L15.8 10.8 L13 11.8 L12 14.6 L11 11.8 L8.2 10.8 L11 9.8 Z"/>' +
      '<path d="M16.6 6.4 L17 7.6 L18.2 8 L17 8.4 L16.6 9.6 L16.2 8.4 L15 8 L16.2 7.6 Z"/>',

    // SMS Fallback — ซองจดหมายพร้อมลูกศรย้อนกลับ (envelope + return arrow)
    fallback:
      '<rect x="2.5" y="6" width="14.5" height="11" rx="2"/>' +
      '<path d="M3 7 L9.75 12 L16.5 7"/>' +
      '<path d="M15.5 20.5 A4 4 0 1 0 21 17"/>' +
      '<path d="M21 20.5 V17 H17.5"/>',

    /* ---------------- Industries (5) ---------------- */

    // Telecom — เสาสัญญาณกระจายคลื่น (broadcast tower / signal waves)
    telecom:
      '<circle cx="12" cy="9.5" r="1.4"/>' +
      '<line x1="12" y1="10.9" x2="12" y2="20.5"/>' +
      '<path d="M9 7 a4 4 0 0 0 0 5"/>' +
      '<path d="M15 7 a4 4 0 0 1 0 5"/>' +
      '<path d="M6.8 4.8 a7 7 0 0 0 0 9.4"/>' +
      '<path d="M17.2 4.8 a7 7 0 0 1 0 9.4"/>' +
      '<line x1="9.5" y1="20.5" x2="14.5" y2="20.5"/>',

    // Financial — อาคารธนาคารมีเสา (bank building with columns)
    financial:
      '<path d="M4 9.5 L12 4 L20 9.5"/>' +
      '<line x1="4" y1="12" x2="20" y2="12"/>' +
      '<line x1="6.5" y1="12" x2="6.5" y2="17.5"/>' +
      '<line x1="10.2" y1="12" x2="10.2" y2="17.5"/>' +
      '<line x1="13.8" y1="12" x2="13.8" y2="17.5"/>' +
      '<line x1="17.5" y1="12" x2="17.5" y2="17.5"/>' +
      '<line x1="3.5" y1="20" x2="20.5" y2="20"/>',

    // Medical — เครื่องหมายกากบาททางการแพทย์ (medical cross)
    medical:
      '<path d="M9.75 3.5 H14.25 a0.5 0.5 0 0 1 0.5 0.5 V9.25 H20 a0.5 0.5 0 0 1 0.5 0.5 V14.25 a0.5 0.5 0 0 1 -0.5 0.5 H14.75 V20 a0.5 0.5 0 0 1 -0.5 0.5 H9.75 a0.5 0.5 0 0 1 -0.5 -0.5 V14.75 H4 a0.5 0.5 0 0 1 -0.5 -0.5 V9.75 a0.5 0.5 0 0 1 0.5 -0.5 H9.25 V4 a0.5 0.5 0 0 1 0.5 -0.5 Z"/>',

    // Logistics — รถส่งของ (delivery truck)
    logistics:
      '<rect x="1.5" y="7" width="13" height="9" rx="1.3"/>' +
      '<path d="M14.5 10 H18 L21 13 V16 H14.5 Z"/>' +
      '<circle cx="6" cy="18" r="1.7"/>' +
      '<circle cx="17.5" cy="18" r="1.7"/>' +
      '<line x1="7.7" y1="18" x2="15.8" y2="18"/>' +
      '<line x1="1.5" y1="18" x2="4.3" y2="18"/>',

    // Retail — ถุงช้อปปิ้ง (shopping bag)
    retail:
      '<path d="M5.5 8 H18.5 L17.6 19.5 a1 1 0 0 1 -1 0.9 H6.9 a1 1 0 0 1 -1 -0.9 Z"/>' +
      '<path d="M9 8 V7 a3 3 0 0 1 6 0 V8"/>',
  };

  const ICONS = {};
  Object.keys(PARTS).forEach(function (id) { ICONS[id] = svg(PARTS[id]); });

  // brand key → industry id (เผื่อกรณีต้อง map จากชื่อ brand โดยตรง)
  ICONS._brandIndustry = {
    nextTel: 'telecom', sabuyBank: 'financial', wellness: 'medical',
    swiftLogix: 'logistics', urbanMart: 'retail',
  };

  window.ICONS = ICONS;
  if (typeof module !== 'undefined' && module.exports) module.exports = { ICONS };
})();
