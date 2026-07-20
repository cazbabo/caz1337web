/**
 * usecases.js — RCS Use Case Showcase — ข้อมูลทั้งหมด
 * -----------------------------------------------------------------------
 * แก้ไฟล์นี้ไฟล์เดียวเพื่อเพิ่ม/แก้ไข use case ใหม่ (ไม่ต้องแตะโค้ด engine)
 *
 * โครงสร้าง flow เป็น "graph แบบ array": แต่ละ node มี id เฉพาะตัว
 *   - type:'bot'    → ข้อความจาก brand (msg.kind กำหนดรูปแบบการแสดงผล)
 *                     ถ้าไม่ระบุ next จะไหลไปยัง node ถัดไปใน array อัตโนมัติ
 *                     ถ้า msg มี buttons ที่มี next → engine จะหยุดรอผู้ใช้กด
 *   - type:'choice' → แถบ Suggested Reply ใต้ห้องแชท ผู้ใช้ต้องกดเพื่อไปต่อ
 *                     (options[].next ชี้ไปยัง id ของ node ถัดไป → ใช้ทำ branch)
 *   - next:null หรือไม่มี node ถัดไป → จบบทสนทนา (engine โชว์ปุ่ม Reset)
 *
 * msg.kind ที่รองรับ: 'text' | 'richCard' | 'carousel' | 'map' | 'qr' | 'rating' | 'payment'
 */

const CAPABILITIES = [
  { id: 'richCard', label: 'Rich Card', icon: '🃏' },
  { id: 'carousel', label: 'Carousel', icon: '🎠' },
  { id: 'suggestedReply', label: 'Suggested Reply', icon: '💬' },
  { id: 'suggestedAction', label: 'Suggested Action', icon: '⚡' },
  { id: 'verified', label: 'Verified Sender', icon: '✅' },
  { id: 'media', label: 'รูป/วิดีโอ', icon: '🖼️' },
  { id: 'map', label: 'Location & Live Map', icon: '🗺️' },
  { id: 'qr', label: 'QR Code', icon: '🔳' },
  { id: 'ai', label: 'AI Chatbot / Agent', icon: '🤖' },
  { id: 'fallback', label: 'SMS Fallback', icon: '↩️' },
];

const INDUSTRIES = [
  { id: 'telecom', label: 'Telecom', labelTh: 'โทรคมนาคม', icon: '📡' },
  { id: 'financial', label: 'Financial', labelTh: 'การเงิน/ธนาคาร', icon: '🏦' },
  { id: 'medical', label: 'Medical', labelTh: 'การแพทย์', icon: '🏥' },
  { id: 'logistics', label: 'Logistics', labelTh: 'โลจิสติกส์', icon: '📦' },
  { id: 'retail', label: 'Retail', labelTh: 'ค้าปลีก', icon: '🛍️' },
];

const BRANDS = {
  nextTel: { name: 'NextTel', icon: '📡', color: '#22d3ee' },
  sabuyBank: { name: 'Sabuy Bank', icon: '🏦', color: '#34d399' },
  wellness: { name: 'Wellness Hospital', icon: '🏥', color: '#2dd4bf' },
  swiftLogix: { name: 'SwiftLogix', icon: '🚚', color: '#fb923c' },
  urbanMart: { name: 'UrbanMart', icon: '🛍️', color: '#f472b6' },
};

const USECASES = [
  // ───────────────────────────── 1. TELECOM ─────────────────────────────
  {
    id: 'tel-package',
    industry: 'telecom',
    title: 'เปลี่ยนแพ็กเกจมือถือผ่านแชท',
    subtitle: 'Execution over RCS',
    brand: BRANDS.nextTel,
    problem: 'ลูกค้าเน็ตใกล้หมด/อยากเปลี่ยนแพ็กเกจ ต้องโทร Call Center หรือกดผ่านแอปหลายขั้นตอนกว่าจะสำเร็จ',
    solution: 'บอทเสนอแพ็กเกจที่เหมาะสมเป็น carousel ให้ลูกค้าเลือกและยืนยันตัวตนจบในแชทเดียว (Execution over RCS) โดยไม่ต้องออกจากแอป Messages',
    capabilities: ['carousel', 'suggestedReply', 'suggestedAction', 'verified'],
    kpis: [
      { label: 'Self-service rate', value: '+38%' },
      { label: 'Call center cost', value: '-25%' },
      { label: 'เวลาที่ใช้ทำรายการ', value: '< 90 วิ' },
    ],
    integrations: ['Billing / OCS API', 'CRM', 'ระบบยืนยันตัวตน OTP/PIN'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: 'สวัสดีค่ะคุณลูกค้า 👋 จากการใช้งานเดือนนี้ เน็ตของคุณใกล้หมดแพ็กเกจแล้ว อยากให้ NextTel แนะนำแพ็กเกจที่คุ้มกว่านี้ไหมคะ?' } },
      { id: 'c1', type: 'choice', options: [
        { label: 'แนะนำแพ็กเกจหน่อย', next: 'b2' },
        { label: 'ไม่เป็นไร ขอบคุณค่ะ', next: 'end-decline' },
      ] },
      { id: 'b2', type: 'bot', msg: { kind: 'carousel', cards: [
        { icon: '📶', title: 'NEXT 5G LITE', subtitle: '15GB ไม่อั้น (ลดสปีดหลังใช้ครบ)', price: '349.-/เดือน' },
        { icon: '🚀', title: 'NEXT 5G MAX', subtitle: '30GB ไม่อั้น + โทรฟรีทุกเครือข่าย', price: '599.-/เดือน', tag: 'แนะนำสำหรับคุณ' },
        { icon: '👨‍👩‍👧‍👦', title: 'NEXT FAMILY SHARE', subtitle: 'แชร์เน็ตสูงสุด 60GB ได้ 4 เบอร์', price: '799.-/เดือน' },
      ] } },
      { id: 'c2', type: 'choice', options: [
        { label: 'เลือก NEXT 5G MAX', next: 'b3' },
        { label: 'เลือก FAMILY SHARE', next: 'b3' },
        { label: 'ดูแพ็กเกจอื่นทั้งหมด', next: 'end-decline' },
      ] },
      { id: 'b3', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ ✅ แพ็กเกจใหม่จะมีผลตั้งแต่รอบบิลถัดไป กรุณายืนยันตัวตนด้วยรหัส PIN 4 หลักเพื่อดำเนินการเปลี่ยนแพ็กเกจค่ะ 🔐' } },
      { id: 'c3', type: 'choice', options: [{ label: 'ยืนยันด้วย PIN ••••', next: 'b4' }] },
      { id: 'b4', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '✅', title: 'เปลี่ยนแพ็กเกจสำเร็จ!', subtitle: 'มีผลตั้งแต่รอบบิลถัดไป (1 ส.ค. 2569)', desc: 'ขอบคุณที่ใช้บริการ NextTel ค่ะ', tag: 'สำเร็จ', buttons: [
        { label: 'ดูสรุปค่าใช้จ่าย', next: 'b5' },
        { label: 'จบการสนทนา', next: 'end-thanks' },
      ] } },
      { id: 'b5', type: 'bot', msg: { kind: 'text', text: 'บิลรอบถัดไปโดยประมาณ 599 บาท (ยังไม่รวม VAT) ตรวจสอบรายละเอียดเพิ่มเติมได้ในแอป NextTel นะคะ' }, next: 'end-thanks' },
      { id: 'end-thanks', type: 'bot', msg: { kind: 'text', text: 'ขอบคุณที่ใช้บริการค่ะ 🙏 มีอะไรให้ช่วยเพิ่มเติมพิมพ์มาได้เลยนะคะ' }, next: null },
      { id: 'end-decline', type: 'bot', msg: { kind: 'text', text: 'ไม่เป็นไรค่ะ หากสนใจภายหลังพิมพ์คำว่า "แพ็กเกจ" มาได้ทุกเมื่อเลยค่ะ 😊' }, next: null },
    ],
  },
  {
    id: 'tel-ai-faq',
    industry: 'telecom',
    title: 'AI FAQ Bot ตอบคำถามบิล/แพ็กเกจ',
    subtitle: 'AI Chatbot / Agent',
    brand: BRANDS.nextTel,
    problem: 'ลูกค้าโทร Call Center ถามคำถามซ้ำๆ เช่น "ทำไมบิลแพงขึ้น" ทำให้เสียเวลารอสายและต้นทุนพนักงานสูง',
    solution: 'AI Chatbot บน RCS เข้าใจภาษาธรรมชาติ ตอบพร้อมสรุปข้อมูลเป็น rich card และเสนอ suggested reply ต่อยอดให้จบงานได้ในแชทเดียว',
    capabilities: ['ai', 'richCard', 'suggestedReply', 'verified'],
    kpis: [
      { label: 'Containment rate', value: '82%' },
      { label: 'CSAT', value: '4.6/5' },
      { label: 'Call center volume', value: '-30%' },
    ],
    integrations: ['AI / NLU engine', 'Billing API', 'CRM', 'Payment Gateway'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: 'สวัสดีค่ะ 👋 ดิฉัน NextTel AI Assistant พร้อมช่วยตอบคำถามเกี่ยวกับบิลและแพ็กเกจของคุณค่ะ' } },
      { id: 'c1', type: 'choice', options: [{ label: 'ทำไมบิลเดือนนี้แพงขึ้น?', next: 'b2' }] },
      { id: 'b2', type: 'bot', msg: { kind: 'text', text: 'กำลังตรวจสอบข้อมูลการใช้งานของคุณ... 🔎' } },
      { id: 'b3', type: 'bot', msg: { kind: 'richCard', icon: '🧾', title: 'สรุปบิล มิ.ย. 2569', subtitle: 'ยอดรวม 892 บาท (+293 บาท จากเดือนก่อน)', desc: 'สาเหตุ: มีการใช้อินเทอร์เน็ตต่างประเทศ (Data Roaming) 3 วัน ระหว่างเดินทางที่สิงคโปร์', tag: 'AI วิเคราะห์ให้แล้ว', buttons: [
        { label: 'จ่ายบิลตอนนี้', next: 'b4' },
        { label: 'คุยกับพนักงาน', next: 'b6' },
      ] } },
      { id: 'b4', type: 'bot', msg: { kind: 'payment', items: [
        { label: 'ค่าบริการรายเดือน', price: '599.-' },
        { label: 'Data Roaming (สิงคโปร์)', price: '293.-' },
      ], total: '892.-', method: 'บัตรเครดิต •• 4521', buttons: [{ label: 'ยืนยันชำระเงิน 892.-', next: 'b5' }] } },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '✅', title: 'ชำระเงินสำเร็จ', subtitle: '892 บาท ผ่านบัตร •• 4521', desc: 'ใบเสร็จอิเล็กทรอนิกส์ถูกส่งเข้าอีเมลของคุณแล้ว', buttons: [] }, next: 'end1' },
      { id: 'end1', type: 'bot', msg: { kind: 'text', text: 'ขอบคุณที่ใช้บริการ NextTel ค่ะ 🙏 มีคำถามอื่นพิมพ์มาถามได้เลยนะคะ' }, next: null },
      { id: 'b6', type: 'bot', msg: { kind: 'text', text: 'กำลังโอนสายไปยังพนักงาน Live Agent สักครู่นะคะ 📞 เวลารอโดยประมาณ 2 นาที' }, next: null },
    ],
  },

  // ───────────────────────────── 2. FINANCIAL ─────────────────────────────
  {
    id: 'fin-fraud',
    industry: 'financial',
    title: 'Fraud Alert แบบโต้ตอบได้',
    subtitle: 'Interactive Fraud Alert',
    brand: BRANDS.sabuyBank,
    problem: 'ธุรกรรมผิดปกติแจ้งเตือนผ่าน SMS ข้อความเดียว ลูกค้าโทรกลับไม่ทัน เกิดความเสียหายก่อนจะอายัดบัตรได้',
    solution: 'ส่ง rich card แจ้งเตือนพร้อมรายละเอียดร้านค้า/ยอดเงิน/แผนที่ ให้ลูกค้ากดยืนยันหรือปฏิเสธได้ทันทีในแชท ระบบอายัดบัตรอัตโนมัติหากปฏิเสธ',
    capabilities: ['richCard', 'suggestedAction', 'map', 'verified', 'fallback'],
    kpis: [
      { label: 'Fraud loss', value: '-60%' },
      { label: 'Response time', value: '< 30 วิ (จาก ~20 นาที)' },
      { label: 'Card block SLA', value: 'ทันที' },
    ],
    integrations: ['Fraud Detection Engine', 'Card Management System', 'Location/Map API', 'SMS Fallback Gateway'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'richCard', tone: 'alert', icon: '⚠️', title: 'ตรวจพบธุรกรรมผิดปกติ', subtitle: '฿24,900 ที่ TechZone Store, สยามพารากอน', desc: 'เวลา 14:32 น. · บัตรเครดิต •• 7788', tag: 'ต้องการยืนยัน', buttons: [] } },
      { id: 'b2', type: 'bot', msg: { kind: 'map', title: 'ตำแหน่งร้านค้าที่ทำรายการ', address: 'TechZone Store, สยามพารากอน กรุงเทพฯ', distanceLabel: 'ห่างจากตำแหน่งล่าสุดของคุณ 42 กม.' }, next: 'c1' },
      { id: 'c1', type: 'choice', options: [
        { label: '✅ ใช่ ฉันทำรายการเอง', next: 'b3' },
        { label: '🚫 ไม่ใช่ฉัน!', next: 'b4' },
      ] },
      { id: 'b3', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ ขอบคุณที่ยืนยัน ✅ ธุรกรรมนี้ผ่านเรียบร้อย หากพบธุรกรรมผิดปกติอีกครั้ง Sabuy Bank จะแจ้งเตือนทันทีนะคะ' }, next: null },
      { id: 'b4', type: 'bot', msg: { kind: 'text', text: 'ได้รับแจ้งแล้วค่ะ 🚨 เพื่อความปลอดภัยของคุณ ระบบจะอายัดบัตรทันที กรุณายืนยันอีกครั้งเพื่อดำเนินการ' } },
      { id: 'c2', type: 'choice', options: [{ label: 'ยืนยันอายัดบัตรทันที', next: 'b5' }] },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '🔒', title: 'อายัดบัตรสำเร็จ', subtitle: 'บัตร •• 7788 ถูกระงับการใช้งานแล้ว', desc: 'เราได้ยกเลิกรายการ ฿24,900 และดำเนินการคืนเงินให้คุณ (ใช้เวลา 3-5 วันทำการ)', tag: 'ปลอดภัยแล้ว', buttons: [{ label: 'ขอออกบัตรใหม่', next: 'b6' }] } },
      { id: 'b6', type: 'bot', msg: { kind: 'text', text: 'กำลังดำเนินการออกบัตรใหม่ให้ค่ะ 💳 จัดส่งถึงที่อยู่ตามบัญชีภายใน 5-7 วันทำการ คุณจะได้รับ SMS แจ้งเมื่อบัตรพร้อมใช้งาน' }, next: null },
    ],
  },
  {
    id: 'fin-credit',
    industry: 'financial',
    title: 'สมัครบัตรเครดิต/สินเชื่อผ่านแชท',
    subtitle: 'Conversational Application',
    brand: BRANDS.sabuyBank,
    problem: 'ลูกค้าสนใจสมัครบัตร/สินเชื่อแต่เลิกกลางทางเพราะฟอร์มยาว ต้องดาวน์โหลดแอปหรือเดินทางไปสาขา',
    solution: 'นำเสนอบัตร/สินเชื่อเปรียบเทียบเป็น carousel เก็บข้อมูลทีละขั้นในแชท ให้ลูกค้าอัปโหลดเอกสาร (mock) และแจ้งสถานะอนุมัติแบบเรียลไทม์',
    capabilities: ['carousel', 'suggestedReply', 'richCard', 'verified'],
    kpis: [
      { label: 'Application completion', value: '+45%' },
      { label: 'เวลาที่ใช้สมัคร', value: '< 3 นาที' },
      { label: 'แจ้งผลอนุมัติ', value: 'เรียลไทม์' },
    ],
    integrations: ['Loan Origination System', 'e-KYC / OCR เอกสาร', 'Credit Bureau API', 'CRM'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: 'สวัสดีค่ะ 👋 Sabuy Bank มีบัตรเครดิตและสินเชื่อที่ให้ดอกเบี้ยพิเศษสำหรับคุณโดยเฉพาะ สนใจดูรายละเอียดไหมคะ?' } },
      { id: 'c1', type: 'choice', options: [
        { label: 'สนใจครับ/ค่ะ', next: 'b2' },
        { label: 'ไม่สนใจตอนนี้', next: 'end-decline' },
      ] },
      { id: 'b2', type: 'bot', msg: { kind: 'carousel', cards: [
        { icon: '💳', title: 'Sabuy Platinum', subtitle: 'คืนเงิน 5% ทุกหมวดช้อปปิ้ง', price: 'ฟรีค่าธรรมเนียมปีแรก' },
        { icon: '✈️', title: 'Sabuy Travel', subtitle: 'สะสมไมล์ 2 เท่า + ประกันเดินทาง', price: 'ค่าธรรมเนียม 2,500.-/ปี' },
        { icon: '🏠', title: 'สินเชื่อส่วนบุคคล Sabuy', subtitle: 'วงเงินสูงสุด 1.5 ล้านบาท ดอกเบี้ยเริ่ม 9.99%', price: 'ผ่อนสูงสุด 60 เดือน' },
      ] } },
      { id: 'c2', type: 'choice', options: [
        { label: 'สมัคร Sabuy Platinum', next: 'b3' },
        { label: 'สมัครสินเชื่อส่วนบุคคล', next: 'b3' },
        { label: 'ขอข้อมูลเพิ่มเติมทางอีเมล', next: 'end-decline' },
      ] },
      { id: 'b3', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ ✅ กรุณาเตรียมเอกสาร 2 อย่าง คือ บัตรประชาชน และสลิปเงินเดือนล่าสุด แล้วอัปโหลดผ่านลิงก์แนบด้านล่างได้เลยค่ะ' } },
      { id: 'c3', type: 'choice', options: [{ label: '📎 อัปโหลดเอกสารแล้ว (Mock)', next: 'b4' }] },
      { id: 'b4', type: 'bot', msg: { kind: 'richCard', icon: '📄', title: 'ได้รับเอกสารครบถ้วน', subtitle: 'บัตรประชาชน + สลิปเงินเดือน', desc: 'ระบบกำลังตรวจสอบข้อมูลเครดิตของคุณ (ใช้เวลาประมาณ 1 นาที)', tag: 'กำลังตรวจสอบ', buttons: [] } },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '🎉', title: 'อนุมัติเบื้องต้นแล้ว!', subtitle: 'วงเงินที่ได้รับ 150,000 บาท', desc: 'เจ้าหน้าที่จะติดต่อยืนยันตัวตนขั้นสุดท้ายภายใน 1 วันทำการ', tag: 'Pre-approved', buttons: [{ label: 'ยืนยันดำเนินการต่อ', next: 'end-thanks' }] } },
      { id: 'end-thanks', type: 'bot', msg: { kind: 'text', text: 'ขอบคุณที่ไว้วางใจ Sabuy Bank ค่ะ 🙏 ทีมงานจะติดต่อกลับเร็วๆ นี้' }, next: null },
      { id: 'end-decline', type: 'bot', msg: { kind: 'text', text: 'ไม่เป็นไรค่ะ หากสนใจภายหลังสามารถพิมพ์ "สมัครบัตร" มาได้ทุกเมื่อค่ะ 😊' }, next: null },
    ],
  },

  // ───────────────────────────── 3. MEDICAL ─────────────────────────────
  {
    id: 'med-appointment',
    industry: 'medical',
    title: 'นัดหมาย + เลื่อนนัดแพทย์',
    subtitle: 'Appointment Management',
    brand: BRANDS.wellness,
    problem: 'คนไข้ลืมนัดหรือไม่สะดวกมาตามเวลานัด ทำให้เกิด no-show สูง เสียเวลาแพทย์และคิวคนไข้รายอื่น',
    solution: 'ส่ง rich card แจ้งเตือนนัดหมายพร้อมชื่อแพทย์ เวลา และแผนที่ รพ. ให้คนไข้กดยืนยันหรือเลือกเลื่อนนัดเป็นวัน/เวลาใหม่ได้ทันทีในแชท',
    capabilities: ['richCard', 'suggestedAction', 'map', 'suggestedReply', 'verified'],
    kpis: [
      { label: 'No-show rate', value: '-35%' },
      { label: 'เวลาที่ใช้ยืนยันนัด', value: '< 15 วิ' },
      { label: 'Staff call volume', value: '-20%' },
    ],
    integrations: ['Hospital Information System (HIS)', 'ระบบตารางนัดแพทย์', 'Map API'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'richCard', icon: '🩺', title: 'แจ้งเตือนนัดหมายแพทย์', subtitle: 'พญ. สุภาพร ใจดี — แผนกอายุรกรรม', desc: 'วันพฤหัสบดีที่ 23 ก.ค. 2569 เวลา 10:30 น. · ห้องตรวจ 305 ชั้น 3', tag: 'พรุ่งนี้', buttons: [] } },
      { id: 'b2', type: 'bot', msg: { kind: 'map', title: 'Wellness Hospital', address: '123 ถ.สุขุมวิท กรุงเทพฯ', distanceLabel: 'ห่างจากตำแหน่งคุณ 6.2 กม. (ขับรถ ~18 นาที)' }, next: 'c1' },
      { id: 'c1', type: 'choice', options: [
        { label: '✅ ยืนยันมาตามนัด', next: 'b3' },
        { label: '📅 ขอเลื่อนนัด', next: 'b4' },
      ] },
      { id: 'b3', type: 'bot', msg: { kind: 'text', text: 'ยืนยันนัดหมายเรียบร้อยค่ะ ✅ กรุณามาถึงก่อนเวลานัด 15 นาทีเพื่อลงทะเบียน และอย่าลืมนำบัตรประชาชนมาด้วยนะคะ' }, next: null },
      { id: 'b4', type: 'bot', msg: { kind: 'text', text: 'ไม่เป็นไรค่ะ กรุณาเลือกวัน/เวลาที่สะดวกใหม่จากตัวเลือกด้านล่างค่ะ' } },
      { id: 'c2', type: 'choice', options: [
        { label: 'ศุกร์ 24 ก.ค. 09:00 น.', next: 'b5' },
        { label: 'จันทร์ 27 ก.ค. 13:30 น.', next: 'b5' },
        { label: 'ให้เจ้าหน้าที่ติดต่อกลับ', next: 'b6' },
      ] },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '✅', title: 'เลื่อนนัดสำเร็จ', subtitle: 'นัดใหม่กับ พญ. สุภาพร ใจดี', desc: 'ระบบได้อัปเดตวันเวลานัดหมายใหม่ในระบบ HIS เรียบร้อยแล้ว', tag: 'ยืนยันแล้ว', buttons: [] }, next: null },
      { id: 'b6', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ เจ้าหน้าที่แผนกอายุรกรรมจะติดต่อกลับภายใน 1 ชั่วโมงเพื่อนัดวันเวลาที่สะดวกค่ะ 📞' }, next: null },
    ],
  },
  {
    id: 'med-symptom',
    industry: 'medical',
    title: 'AI Symptom Check → จอง Telehealth',
    subtitle: 'AI Triage & Telehealth Booking',
    brand: BRANDS.wellness,
    problem: 'คนไข้ไม่แน่ใจว่าอาการควรพบแพทย์แผนกไหน ต้องไปต่อคิว OPD นานโดยไม่จำเป็น',
    solution: 'AI คัดกรองอาการเบื้องต้นผ่านแชท แนะนำแผนกที่เหมาะสม จองคิว video call ทันที พร้อมตั้งเตือนกินยาอัตโนมัติ',
    capabilities: ['ai', 'suggestedReply', 'richCard', 'verified'],
    kpis: [
      { label: 'เข้าถึงบริการเร็วขึ้น', value: 'จากหลายวัน → 30 นาที' },
      { label: 'ลดคิว OPD', value: '-22%' },
      { label: 'Patient satisfaction', value: '4.7/5' },
    ],
    integrations: ['AI Triage Engine', 'Telehealth / Video Platform', 'HIS', 'ระบบแจ้งเตือนยา'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: 'สวัสดีค่ะ 👋 ดิฉัน Wellness AI Health Assistant มีอาการอะไรให้ช่วยประเมินเบื้องต้นไหมคะ?' } },
      { id: 'c1', type: 'choice', options: [{ label: 'มีไข้ ไอ เจ็บคอ 2 วัน', next: 'b2' }] },
      { id: 'b2', type: 'bot', msg: { kind: 'text', text: 'กำลังประเมินอาการเบื้องต้นจากข้อมูลที่แจ้ง... 🔎' } },
      { id: 'b3', type: 'bot', msg: { kind: 'richCard', icon: '🤒', title: 'ผลประเมินเบื้องต้น', subtitle: 'ความเสี่ยง: ระดับต่ำ-ปานกลาง', desc: 'อาการเข้าข่ายการติดเชื้อทางเดินหายใจส่วนบน แนะนำให้พบแพทย์แผนกอายุรกรรมผ่าน Telehealth', tag: 'AI Triage', buttons: [
        { label: 'จองคิว Telehealth', next: 'c2' },
        { label: 'ขอพบแพทย์ที่ รพ.', next: 'b6' },
      ] } },
      { id: 'c2', type: 'choice', options: [
        { label: 'วันนี้ 15:00 น.', next: 'b4' },
        { label: 'พรุ่งนี้ 09:30 น.', next: 'b4' },
      ] },
      { id: 'b4', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '🎥', title: 'จองคิว Telehealth สำเร็จ', subtitle: 'นพ. ธนกร วัฒนกิจ — แผนกอายุรกรรม', desc: 'ลิงก์ video call จะส่งให้ 5 นาทีก่อนถึงเวลานัด', tag: 'ยืนยันแล้ว', buttons: [] } },
      { id: 'b5', type: 'bot', msg: { kind: 'text', text: 'อย่าลืม! ระบบจะส่งการแจ้งเตือนให้กินยาลดไข้ทุก 6 ชั่วโมง และแจ้งเตือนก่อนถึงเวลา Telehealth ล่วงหน้า 5 นาทีนะคะ 💊⏰' }, next: null },
      { id: 'b6', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ ระบบได้จองคิว OPD แผนกอายุรกรรมให้คุณแล้ว กรุณามาถึงก่อนเวลา 30 นาทีเพื่อลงทะเบียนค่ะ' }, next: null },
    ],
  },

  // ───────────────────────────── 4. LOGISTICS ─────────────────────────────
  {
    id: 'log-tracking',
    industry: 'logistics',
    title: 'Real-time Delivery Tracking',
    subtitle: 'Live Map & ETA',
    brand: BRANDS.swiftLogix,
    problem: 'ลูกค้าโทรถามสถานะพัสดุบ่อย (WISMO - Where Is My Order) เพิ่มภาระ call center และพลาดรับของเพราะไม่รู้เวลาแน่ชัด',
    solution: 'ส่ง card ติดตามพัสดุพร้อม live map ตำแหน่งคนส่งและ ETA แบบเรียลไทม์ ให้ลูกค้ากดเปลี่ยนเวลาส่งหรือฝากไว้จุดรับได้เองในแชท',
    capabilities: ['map', 'richCard', 'suggestedAction', 'verified'],
    kpis: [
      { label: 'Failed delivery', value: '-40%' },
      { label: 'WISMO call', value: '-55%' },
      { label: 'CSAT', value: '+18%' },
    ],
    integrations: ['Fleet / GPS Tracking API', 'Order Management System', 'Map API'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'richCard', icon: '📦', title: 'พัสดุของคุณกำลังมาส่ง', subtitle: 'หมายเลขติดตาม SW20260720TH', desc: 'พนักงานส่งของ: คุณสมชาย (⭐ 4.9) กำลังมุ่งหน้ามาที่บ้านคุณ', tag: 'กำลังจัดส่ง', buttons: [] } },
      { id: 'b2', type: 'bot', msg: { kind: 'map', title: 'ตำแหน่งพนักงานส่งของ (Live)', address: 'กำลังเข้าใกล้จุดหมาย', eta: 'ประมาณ 12 นาที', courier: 'คุณสมชาย', distanceLabel: 'ห่างจากบ้านคุณ 3.4 กม.', animated: true, buttons: [
        { label: 'เปลี่ยนเวลาส่ง', next: 'b3a' },
        { label: 'ฝากไว้จุดรับใกล้บ้าน', next: 'b3b' },
        { label: 'รับตามเวลาเดิม', next: 'end-ok' },
      ] } },
      { id: 'b3a', type: 'bot', msg: { kind: 'text', text: 'กรุณาเลือกช่วงเวลาที่สะดวกใหม่ค่ะ' } },
      { id: 'c1', type: 'choice', options: [
        { label: '17:00-19:00 น. วันนี้', next: 'b5' },
        { label: 'พรุ่งนี้ 09:00-12:00 น.', next: 'b5' },
      ] },
      { id: 'b3b', type: 'bot', msg: { kind: 'map', title: 'จุดรับพัสดุใกล้บ้านคุณ', address: 'ร้าน Sabuy Mart สาขาสุขุมวิท 24 (0.5 กม.)', distanceLabel: 'เปิดถึง 22:00 น.', buttons: [{ label: 'ยืนยันฝากที่จุดนี้', next: 'b6' }] } },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '✅', title: 'เปลี่ยนเวลาส่งสำเร็จ', subtitle: 'จัดส่งใหม่ตามช่วงเวลาที่เลือก', desc: 'คนขับจะได้รับแจ้งเตือนตารางใหม่ทันที', tag: 'อัปเดตแล้ว', buttons: [] }, next: null },
      { id: 'b6', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '📍', title: 'ฝากพัสดุที่จุดรับสำเร็จ', subtitle: 'Sabuy Mart สุขุมวิท 24', desc: 'รับพัสดุได้ภายใน 3 วัน เจ้าหน้าที่หน้าร้านจะแจ้งเมื่อพัสดุมาถึง', tag: 'พร้อมรับ', buttons: [] }, next: null },
      { id: 'end-ok', type: 'bot', msg: { kind: 'text', text: 'รับทราบค่ะ พัสดุจะจัดส่งตามเวลาเดิม คาดว่าถึงภายใน 12 นาทีค่ะ 🚚' }, next: null },
    ],
  },
  {
    id: 'log-redelivery',
    industry: 'logistics',
    title: 'ส่งไม่สำเร็จ → Re-delivery Bot',
    subtitle: 'Failed Delivery Recovery',
    brand: BRANDS.swiftLogix,
    problem: 'จัดส่งไม่สำเร็จเพราะลูกค้าไม่อยู่บ้าน ทำให้ต้องส่งซ้ำ เพิ่มต้นทุนต่อรอบและลูกค้าไม่พอใจ',
    solution: 'แจ้งเตือนทันทีที่ส่งไม่สำเร็จ ให้ลูกค้าเลือกวันส่งใหม่ หรือไปรับเองที่จุดรับใกล้บ้านพร้อม QR code ยืนยันตัวตน',
    capabilities: ['richCard', 'suggestedReply', 'map', 'qr', 'verified'],
    kpis: [
      { label: 'Re-delivery success', value: '+50%' },
      { label: 'ต้นทุนต่อรอบส่งซ้ำ', value: '-35%' },
      { label: 'เวลาที่ใช้แก้ปัญหา', value: '< 1 นาที' },
    ],
    integrations: ['Order Management System', 'Map / Pickup Point API', 'QR Generation Service'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'richCard', tone: 'alert', icon: '📪', title: 'จัดส่งไม่สำเร็จ', subtitle: 'หมายเลขติดตาม SW20260719TH', desc: 'พนักงานมาส่งแล้วแต่ไม่พบผู้รับที่บ้าน เมื่อ 14:20 น.', tag: 'ต้องดำเนินการ', buttons: [] } },
      { id: 'c1', type: 'choice', options: [
        { label: '📅 เลือกวันส่งใหม่', next: 'b2' },
        { label: '📍 รับเองที่จุดใกล้บ้าน', next: 'b3' },
      ] },
      { id: 'b2', type: 'bot', msg: { kind: 'text', text: 'กรุณาเลือกวันที่สะดวกให้จัดส่งใหม่ค่ะ' } },
      { id: 'c2', type: 'choice', options: [
        { label: 'พรุ่งนี้ 09:00-12:00 น.', next: 'b4' },
        { label: 'มะรืนนี้ 13:00-17:00 น.', next: 'b4' },
      ] },
      { id: 'b4', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '✅', title: 'นัดส่งใหม่สำเร็จ', subtitle: 'จัดส่งตามช่วงเวลาที่เลือก', desc: 'กรุณาเตรียมรับพัสดุตามเวลานัดใหม่ค่ะ', tag: 'ยืนยันแล้ว', buttons: [] }, next: null },
      { id: 'b3', type: 'bot', msg: { kind: 'map', title: 'จุดรับพัสดุใกล้บ้านคุณ', address: 'SwiftLogix Point สาขาลาดพร้าว 15 (0.8 กม.)', distanceLabel: 'เปิด 08:00-21:00 น. ทุกวัน', buttons: [{ label: 'ยืนยันฝากที่จุดนี้', next: 'b5' }] } },
      { id: 'b5', type: 'bot', msg: { kind: 'qr', label: 'QR ยืนยันรับพัสดุ', sublabel: 'SW20260719TH · SwiftLogix Point ลาดพร้าว 15', code: 'SW20260719TH-PICKUP-LADPRAO15' } },
      { id: 'b6', type: 'bot', msg: { kind: 'text', text: 'แสดง QR นี้กับพนักงานหน้าจุดรับภายใน 3 วัน เพื่อรับพัสดุของคุณค่ะ 📦✨' }, next: null },
    ],
  },

  // ───────────────────────────── 5. RETAIL ─────────────────────────────
  {
    id: 'retail-flashsale',
    industry: 'retail',
    title: 'Flash Sale Carousel → ปิดการขายในแชท',
    subtitle: 'In-chat Checkout',
    brand: BRANDS.urbanMart,
    problem: 'แคมเปญ SMS มี CTR ต่ำ (2-5%) และลูกค้าต้องออกจากแอปแชทไปเปิดเว็บ/แอปอื่นเพื่อซื้อของ ทำให้เสีย conversion ระหว่างทาง',
    solution: 'ส่ง carousel สินค้าพร้อม countdown Flash Sale ให้ลูกค้าหยิบใส่ตะกร้าและจ่ายเงินจบในแชทเดียว (native checkout experience)',
    capabilities: ['carousel', 'richCard', 'suggestedAction', 'media'],
    kpis: [
      { label: 'CTR', value: '15-25% (จาก SMS 2-5%)' },
      { label: 'Conversion rate', value: '+3x' },
      { label: 'Checkout time', value: '< 1 นาที' },
    ],
    integrations: ['E-commerce Platform', 'Payment Gateway', 'Inventory API'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: '🔥 Flash Sale เริ่มแล้ว! ลดสูงสุด 50% วันนี้เท่านั้น เหลือเวลาอีก 03:24:15 ⏰' } },
      { id: 'b2', type: 'bot', msg: { kind: 'carousel', cards: [
        { icon: '🎧', title: 'หูฟังไร้สาย UrbanBeat Pro', subtitle: 'ลด 45%', price: '1,290.- (จาก 2,350.-)', tag: 'ขายดี' },
        { icon: '⌚', title: 'Smartwatch UrbanFit S2', subtitle: 'ลด 35%', price: '2,590.- (จาก 3,990.-)' },
        { icon: '👟', title: 'รองเท้าวิ่ง UrbanRun Air', subtitle: 'ลด 50%', price: '1,495.- (จาก 2,990.-)', tag: 'เหลือ 8 คู่' },
      ] } },
      { id: 'c1', type: 'choice', options: [
        { label: 'หยิบใส่ตะกร้า: หูฟัง UrbanBeat', next: 'b3' },
        { label: 'หยิบใส่ตะกร้า: Smartwatch', next: 'b3' },
        { label: 'ดูสินค้าทั้งหมด', next: 'end-more' },
      ] },
      { id: 'b3', type: 'bot', msg: { kind: 'richCard', icon: '🛒', title: 'เพิ่มลงตะกร้าแล้ว', subtitle: '1 ชิ้น พร้อมส่วนลด Flash Sale', desc: 'ต้องการชำระเงินตอนนี้เลยไหมคะ ก่อนของหมด!', tag: 'ในตะกร้า', buttons: [
        { label: 'ชำระเงินตอนนี้', next: 'b4' },
        { label: 'เลือกซื้อสินค้าอื่นต่อ', next: 'b2' },
      ] } },
      { id: 'b4', type: 'bot', msg: { kind: 'payment', items: [
        { label: 'สินค้า x1', price: '1,290.-' },
        { label: 'ค่าจัดส่ง', price: 'ฟรี' },
        { label: 'ส่วนลด Flash Sale', price: '-1,060.-' },
      ], total: '1,290.-', method: 'บัตรเครดิต •• 9012 / PromptPay', buttons: [{ label: 'ยืนยันชำระเงิน 1,290.-', next: 'b5' }] } },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '🎉', title: 'สั่งซื้อสำเร็จ!', subtitle: 'คำสั่งซื้อ #UM20260720-118', desc: 'จัดส่งภายใน 2-3 วันทำการ ติดตามพัสดุได้ทันทีในแชทนี้', tag: 'ชำระเงินแล้ว', buttons: [] }, next: null },
      { id: 'end-more', type: 'bot', msg: { kind: 'text', text: 'ดูสินค้า Flash Sale ทั้งหมดได้ที่แอป UrbanMart หรือพิมพ์ "สินค้า" เพื่อดูเพิ่มเติมในแชทนี้ได้เลยค่ะ 🛍️' }, next: null },
    ],
  },
  {
    id: 'retail-cart',
    industry: 'retail',
    title: 'Cart Abandonment + AI Recovery',
    subtitle: 'AI-Personalized Recovery',
    brand: BRANDS.urbanMart,
    problem: 'ลูกค้าเลือกสินค้าใส่ตะกร้าแล้วแต่ไม่ซื้อ (cart abandonment) อีเมล/SMS ทวงตะกร้าถูกเปิดอ่านน้อยและไม่ personalize',
    solution: 'AI ทักทายลูกค้าที่ทิ้งตะกร้าแบบเป็นกันเอง ตอบคำถามเกี่ยวกับสินค้า เสนอส่วนลดเฉพาะบุคคลเพื่อปิดการขาย และขอรีวิวหลังซื้อผ่าน star rating',
    capabilities: ['ai', 'suggestedReply', 'richCard', 'media'],
    kpis: [
      { label: 'Cart recovery rate', value: '+27%' },
      { label: 'Review rate', value: '+3x' },
      { label: 'Revenue recovered', value: '฿180K/เดือน' },
    ],
    integrations: ['E-commerce Platform', 'AI / NLU engine', 'Promotion Engine', 'Review Platform'],
    flow: [
      { id: 'b1', type: 'bot', msg: { kind: 'text', text: 'หวัดดีค่ะ 👋 สังเกตว่าคุณลืมสินค้าในตะกร้าไว้ ยังสนใจ "เสื้อแจ็คเก็ต UrbanWind" อยู่ไหมคะ?' } },
      { id: 'c1', type: 'choice', options: [
        { label: 'มีไซส์ M เหลือไหม?', next: 'b2' },
        { label: 'ไม่เอาแล้ว', next: 'end-decline' },
      ] },
      { id: 'b2', type: 'bot', msg: { kind: 'text', text: 'เช็คสต๊อกให้แล้วค่ะ มีไซส์ M เหลือ 5 ตัว ✅ และเพื่อเป็นกำลังใจให้ตัดสินใจ ขอมอบส่วนลดพิเศษ 15% เฉพาะคุณเลยค่ะ 🎁' } },
      { id: 'b3', type: 'bot', msg: { kind: 'richCard', icon: '🧥', title: 'เสื้อแจ็คเก็ต UrbanWind', subtitle: 'ไซส์ M · ส่วนลดเฉพาะคุณ 15%', desc: 'ราคาปกติ 1,890.- เหลือเพียง 1,606.-', tag: 'ส่วนลดพิเศษ', buttons: [
        { label: 'ชำระเงินตอนนี้', next: 'b4' },
        { label: 'ขอคิดดูก่อน', next: 'end-think' },
      ] } },
      { id: 'b4', type: 'bot', msg: { kind: 'payment', items: [
        { label: 'เสื้อแจ็คเก็ต UrbanWind (M)', price: '1,890.-' },
        { label: 'ส่วนลดเฉพาะบุคคล 15%', price: '-284.-' },
      ], total: '1,606.-', method: 'PromptPay / บัตรเครดิต', buttons: [{ label: 'ยืนยันชำระเงิน 1,606.-', next: 'b5' }] } },
      { id: 'b5', type: 'bot', msg: { kind: 'richCard', tone: 'success', icon: '🎉', title: 'สั่งซื้อสำเร็จ!', subtitle: 'คำสั่งซื้อ #UM20260720-119', desc: 'ขอบคุณที่ตัดสินใจซื้อกับ UrbanMart นะคะ จัดส่งภายใน 2-3 วัน', tag: 'ชำระเงินแล้ว', buttons: [] } },
      { id: 'b6', type: 'bot', msg: { kind: 'rating', prompt: 'ให้คะแนนประสบการณ์การช้อปครั้งนี้หน่อยนะคะ' } },
      { id: 'b7', type: 'bot', msg: { kind: 'text', text: 'ขอบคุณสำหรับคะแนนค่ะ! 🙏 ความคิดเห็นของคุณช่วยให้ UrbanMart พัฒนาบริการให้ดียิ่งขึ้น' }, next: null },
      { id: 'end-decline', type: 'bot', msg: { kind: 'text', text: 'ไม่เป็นไรค่ะ เก็บไว้ในตะกร้าให้เผื่อเปลี่ยนใจนะคะ 😊 หากมีคำถามทักมาได้เสมอค่ะ' }, next: null },
      { id: 'end-think', type: 'bot', msg: { kind: 'text', text: 'ได้เลยค่ะ ส่วนลด 15% นี้เก็บไว้ให้อีก 24 ชั่วโมงนะคะ ตัดสินใจแล้วทักมาได้เลย 🎁' }, next: null },
    ],
  },
];

// เผื่อใช้งานแบบ module ในอนาคต (ปัจจุบันโหลดผ่าน <script> ตรงๆ เป็น global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CAPABILITIES, INDUSTRIES, BRANDS, USECASES };
}
