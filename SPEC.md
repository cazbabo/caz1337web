# RCS Use Case Showcase — แผนงานและ Spec

> **Owner:** Presale / Solution Team
> **Purpose:** เว็บไซต์รวม RCS use case แบบ interactive เพื่อให้ทีมงานใช้จุดประกายไอเดีย และเปิดโชว์ให้ลูกค้าเห็น "ความเป็นไปได้" ของ RCS channel ได้ทันทีในห้องประชุม
> **Hosting:** GitHub Pages → `https://cazbabo.github.io/caz1337web/`

---

## 1. แผนงาน (Plan)

| Phase | ขอบเขต | สถานะ |
|-------|--------|-------|
| **Phase 1 (build ตอนนี้)** | Static showcase site + **RCS Phone Simulator** (mock conversation แบบกดเล่นได้จริง) ครอบคลุม 5 อุตสาหกรรม อย่างน้อย 10 use cases | 🔨 |
| Phase 2 | เพิ่ม use case ได้เองผ่านไฟล์ JSON (ไม่ต้องแก้โค้ด), เพิ่ม industry ใหม่ (Travel, Government) | รอ |
| Phase 3 | ต่อ RBM API จริง (เช่น Infobip / Google RBM sandbox) ให้ demo ยิงเข้ามือถือลูกค้าได้จริง | รอ |

## 2. Scope (Phase 1)

**In scope**
- Static site (HTML/CSS/vanilla JS) — ไม่มี build step, ไม่มี backend, deploy ผ่าน GitHub Pages ได้ทันที
- ภาษาไทยเป็นหลัก (ศัพท์เทคนิคเป็นอังกฤษ) — กลุ่มผู้ใช้คือทีม presale ไทย
- Responsive: ใช้ present ผ่าน projector (desktop) และเปิดจากมือถือได้
- **ห้ามใช้ CDN/external resource** — ทุกอย่าง self-contained (โลโก้/ภาพใช้ SVG/emoji ที่วาดเอง)

**Out of scope (Phase 1):** การยิงข้อความจริง, ระบบ login, CMS

## 3. โครงสร้างหน้าเว็บ (Site Structure & Logic)

### 3.1 Landing / Hero
- Headline: "RCS Business Messaging — SMS ที่วิวัฒนาการแล้ว"
- ตัวเลขขายของ (แสดงเป็น stat tiles): RCS CTR **15–25%** vs SMS **2–5%**, Verified Sender ลด phishing, Rich media + Interactive ในแอป Messages ที่มีอยู่แล้ว **ไม่ต้องลงแอปเพิ่ม**

### 3.2 RCS Capability Chips (อธิบายความสามารถของ channel)
Rich Card · Carousel · Suggested Reply · Suggested Action (โทร/เปิดแผนที่/เปิดลิงก์) · Verified Sender · รูป/วิดีโอ · Location & Live Map · QR Code · **AI Chatbot / Agent** · SMS Fallback

### 3.3 Use Case Gallery
- Grid card ทั้งหมด filter ได้ 2 แกน: **Industry** และ **Capability**
- แต่ละ card: industry badge, ชื่อ use case, ปัญหาที่แก้, KPI เด่น, ปุ่ม "ลองเล่น Demo"

### 3.4 RCS Phone Simulator (หัวใจของเว็บ — จุด wow ตอน present)
- Mockup มือถือ (วาดด้วย CSS) แสดงหน้าแชท RCS: header มีชื่อ brand + verified badge ✓
- เล่น conversation ตาม script: ข้อความ bot ทยอยขึ้นพร้อม typing indicator, ผู้ใช้ **กด Suggested Reply/Action เองเพื่อเดินเรื่องต่อ** (บาง step มีทางแยก branch ได้)
- รองรับ message type: text, rich card (รูป+ปุ่ม), carousel (เลื่อนซ้ายขวา), map/location (mock), QR, star rating, payment summary
- ปุ่ม Reset / เลือก use case อื่นได้จากใน simulator

### 3.5 Business Value ต่อ use case
แสดงใต้ simulator: ปัญหาเดิม → RCS แก้อย่างไร → KPI ที่คาดหวัง → ข้อมูล/ระบบที่ลูกค้าต้องมี (integration checklist สั้นๆ)

## 4. Use Cases ที่ต้องมี (อย่างน้อย 10 — script flow ให้ครบทุกตัว)

### 📡 Telecom
1. **เปลี่ยนแพ็กเกจมือถือผ่านแชท (Execution over RCS)** — carousel เทียบแพ็กเกจ → กดเลือก → ยืนยันตัวตน (PIN mock) → rich card ยืนยันสำเร็จ+วันมีผล | KPI: self-service rate ↑, call center cost ↓
2. **AI FAQ Bot** — ลูกค้าถามเรื่องบิลด้วยภาษาธรรมชาติ → AI ตอบพร้อม rich card สรุปบิล → เสนอ suggested reply ต่อยอด (จ่ายบิล/คุยกับพนักงาน) | KPI: containment rate, CSAT

### 🏦 Financial
3. **Fraud Alert แบบโต้ตอบได้** — แจ้งเตือนธุรกรรมผิดปกติเป็น rich card (ร้านค้า+ยอด+แผนที่) → ปุ่ม "ใช่ ฉันใช้เอง / ไม่ใช่!" → branch: อายัดบัตรทันที + ออกบัตรใหม่ | KPI: fraud loss ↓, response time ↓
4. **สมัครบัตรเครดิต/สินเชื่อผ่านแชท** — carousel เทียบบัตร → bot เก็บข้อมูลทีละขั้น → อัปโหลดเอกสาร (mock) → แจ้งสถานะอนุมัติ | KPI: application completion rate ↑

### 🏥 Medical
5. **นัดหมาย + เลื่อนนัดแพทย์** — rich card รูปแพทย์+เวลา+แผนที่ รพ. → ปุ่ม ยืนยัน/เลื่อนนัด → เลือก slot ใหม่ในแชท | KPI: no-show rate ↓
6. **AI Symptom Check → จอง Telehealth** — bot คัดกรองอาการเบื้องต้น → แนะนำแผนก → จองคิว video call + แจ้งเตือนกินยา | KPI: เข้าถึงบริการเร็วขึ้น, ลดคิว OPD

### 📦 Logistics
7. **Real-time Delivery Tracking** — card ติดตามพัสดุ + **live map ตำแหน่งคนส่ง** + ETA → ปุ่ม "เปลี่ยนเวลา/ฝากไว้จุดรับ" | KPI: failed delivery ↓ (cost ต่อรอบส่งซ้ำสูง), WISMO call ↓
8. **ส่งไม่สำเร็จ → Re-delivery Bot** — แจ้งส่งไม่สำเร็จพร้อมรูปหน้างาน → เลือกวันส่งใหม่ / รับเองที่จุดใกล้บ้าน (แผนที่+QR) | KPI: re-delivery success ↑

### 🛍️ Retail
9. **Flash Sale Carousel → ปิดการขายในแชท** — carousel สินค้า+countdown → หยิบใส่ตะกร้า → สรุปยอด+ปุ่มจ่ายเงิน (mock payment) | KPI: CTR 15–25% vs SMS 2–5%, conversion ↑
10. **Cart Abandonment + AI Recovery** — AI ทักลูกค้าที่ทิ้งตะกร้า → ตอบคำถามสินค้า → ให้ส่วนลดเฉพาะบุคคล → หลังซื้อส่ง star rating ขอรีวิว | KPI: cart recovery rate, review rate

> ทุก use case ต้อง **จบ flow ได้ใน 4–8 interaction** — สั้นพอสำหรับโชว์ลูกค้าใน 1–2 นาที

## 5. Data Model (ข้อมูลที่ต้องใช้)

```
usecases.js  →  const USECASES = [ { ... } ]
{
  id, industry,            // 'telecom' | 'financial' | 'medical' | 'logistics' | 'retail'
  title, problem, solution,
  capabilities: ['carousel','ai', ...],
  kpis: [{label, value}],
  integrations: ['CRM', 'Billing API', ...],   // ลูกค้าต้องมีอะไรถึงทำได้จริง
  flow: [ // conversation script
    { type:'bot', msg:{kind:'text'|'richCard'|'carousel'|'map'|'qr'|'rating'|'payment', ...} },
    { type:'choice', options:[ {label, next} ] },   // suggested replies — next ชี้ step ต่อไป (branch ได้)
    ...
  ]
}
```

**ข้อมูลที่ทีมต้องเตรียมเพิ่มภายหลัง (Phase 2–3):** brand asset จริงของลูกค้าแต่ละราย, KPI benchmark จาก campaign จริง, RBM agent verification + API credentials, sender ID registration (NBTC)

## 6. Technical Structure

```
/index.html          — ทุก section ในหน้าเดียว (SPA-lite, anchor nav)
/css/style.css       — dark theme ทันสมัย, รองรับ projector
/js/usecases.js      — data ทั้งหมด (แก้ไฟล์นี้ไฟล์เดียวเพื่อเพิ่ม use case)
/js/simulator.js     — engine เล่น conversation flow
/js/app.js           — gallery, filter, navigation
/.github/workflows/pages.yml — auto-deploy GitHub Pages
```

## 7. Definition of Done (Phase 1)
- [ ] เปิด `index.html` แล้วใช้ได้ทันทีโดยไม่ต้องมี server / internet
- [ ] use case ครบ 10 ตัว เล่น flow จบได้ทุกตัว มี branch อย่างน้อย 3 use case
- [ ] filter ตาม industry และ capability ทำงานถูกต้อง
- [ ] responsive (มือถือ + desktop)
- [ ] push ขึ้น branch `claude/github-web-app-hosting-ovjmfe` + Pages deploy ผ่าน
