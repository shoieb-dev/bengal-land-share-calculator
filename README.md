# 🧮 Khatiyan Calculator

A React-based web application to calculate **land ownership shares** from Bangladeshi **Khatiyan (খতিয়ান)** records.  
It helps convert **Ana, Gonda, Kora, Kranti, and Til** units into **decimal (শতক)** and distribute shares across multiple owners and plots automatically.

---

## 🚀 Features

### ✅ Khatiyan & Basic Input
- 🏷️ Input Khatiyan number (optional)
- 📏 Input total land in **শতক (decimal)**
- 📚 Add multiple **plots (দাগ)** with individual land amounts
- 🔤 RTL Bengali UI (Noto Sans Bengali font)

### 👤 Owner Management
- 👤 Add multiple **owners** with their share in **Ana–Gonda–Kora–Kranti–Til**
- 👨‍👩‍👧‍👦 **Heir calculations**: support for deceased owners and automatic heir inheritance
- 👥 Owner groups (সম্পত্তির মালিকানা দলের রূপরেখা)

### 📐 Logic & Validation
- 🔁 Automatic conversion to decimal (শতক)
- 🧮 Precise land-share mathematics using `heirShare.ts` and family-tree rules
- ❌ Form-level validation (`validation.ts`) — catches invalid dags, missing ratios, broken heir chains before computation
- ⚡ Lazy evaluation to avoid recalculating the whole result when only one field changes

### 📊 Result Views
- 📈 **ResultCharts** — visual charts of shares per owner and per plot
- 📋 **ResultTable** — printable result table with per-owner and per-plot breakdown
- 🗂️ `EffectiveAnaCell`, `GondaKoraCell`, `GondaKoraText` — reusable share-rendering components

### 💾 Persistence & Templates
- 💾 LocalStorage-based storage (`storage.ts`) with manual + automatic save
- 🗂️ Saved Khatiyan library (`khatiyanLibrary.ts`, `SavedKhatiyansModal`)
- 📋 Template system (`TemplateModal`, `ComplexTemplateModal`) — save/load a khatiyan as a template
- 🆕 EntryList & EntryRow — list + add/edit of saved khatiyan records

### 📤 Export & Sharing
- 📄 Printable & exportable result table / PDF (`PDFOptionsModal`, `pdfExport.ts`, `pdfExportSimple.ts`)
- 🖼️ PNG image export (`imageExportDom.ts`)
- 🔗 Shareable khatiyan records across the application

### 📱 UI / Device
- 📱 Fully mobile-responsive design (optimized for small screens)
- 🎨 Clean Tailwind styling with warning/error states (`ErrorModal`)
- 🍞 Toast notifications (`toast.ts`)
- 🧭 Dark/light theme hooks (`useTheme.ts`)
- ⌨️ Keyboard shortcuts (`useKeyboardShortcuts*`, `ShortcutHints`) — fast navigation without the mouse

### ⌨️ Keyboard Shortcuts
| Keys | Action |
| ---- | ------ |
| `Alt + N` | নতুন মালিক যোগ করুন (new owner) |
| `Alt + Shift + N` | নতুন খতিয়ান শুরু করুন (snapshot current work first) |
| `Ctrl + S` | সংরক্ষণ করুন (manual save) |
| `Ctrl + O` | লাইব্রেরি খুলুন (saved khatiyans) |
| `Ctrl + Enter` | ফলাফল হিসাব করুন (calculate) |
| `Esc` | সব পপআপ/মোডাল বন্ধ করুন |

---

## 🧱 Tech Stack

- ⚛️ React (Next.js)
- 🎨 Tailwind CSS (`tailwind.config`)
- 💾 Local state management with React Hooks (`useState`, `useReducer` where applicable)
- 🈺 Noto Sans Bengali (Google Fonts)
- 📖 TypeScript (strict types in `src/lib/types/index.ts`)
- 🗄️ LocalStorage persistence
- 📤 Export: PDF + PNG

---

## 📁 Project Structure

```
src/
  app/            # Next.js pages & layout
  components/
    khatian/
      forms/          # KhatiyanHeaderForm, OwnerForm
      modals/         # SavedKhatiyans, Template, EntryList/Row, PDFOptions
      visualization/  # ResultCharts, ResultTable (+ shared cells)
    common/             # ErrorModal
  lib/
    constants/     # templates.ts
    exports/       # pdf, png, image export utilities
    types/         # shared TypeScript types
    utils/         # heirShare, validation, khatiyanLibrary, storage, toasts
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ (or the project's documented minimum)
- npm / yarn / pnpm

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

### Build (production)
```bash
npm run build
```

### Lint
```bash
npm run lint
```

---

## 🔜 Roadmap Ideas

- 🌐 Server/database persistence instead of LocalStorage
- 📤 Export entire khatiyan library as JSON/CSV
- 🔍 Global search & filter for saved khatiyans
- 🎨 Theme toggle for dark/light mode
- 📊 More chart types (bar, pie, stacked) for owner vs. plot shares
- 📝 Rich Bengali inline help / tooltip documentation

---

## 🤝 Contributing

1. Fork the repo and create your feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
