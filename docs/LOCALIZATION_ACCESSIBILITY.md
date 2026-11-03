# NagrikSetu — Multilingual Localization & Regional Accessibility Specification

> **Constitutional 8th Schedule Language Support, Voice-Assisted Vernacular Intake, Dialectal Keyword Extraction, and WCAG 2.2 AAA Accessibility for Universal Civic Inclusion.**

---

## 1. Executive Summary & Demographic Context

In accordance with the **Viksit Bharat 2026** digital governance mandates, public civic reporting platforms must provide equitable, frictionless access across India's linguistically diverse demographic landscape. Over 80% of urban and peri-urban citizens seeking municipal resolution speak and write in non-English regional languages. Furthermore, a substantial portion of field laborers, rural migrants, and senior citizens encounter digital literacy barriers when interacting with dense textual form inputs.

NagrikSetu establishes a comprehensive **Multilingual Localization & Accessibility Architecture (MLAA)** engineered to eliminate linguistic exclusion, optimize roadside voice-first reporting, and guarantee strict conformance with **WCAG 2.2 AAA** accessibility standards.

```
+----------------------------------------------------------------------------------------------------+
|                                    Citizen Intake Viewport                                         |
|                                                                                                    |
|  +----------------------------------+            +----------------------------------------------+  |
|  |     Dynamic Language Switcher    |            |          Web Speech Voice Intake             |  |
|  |  - en-IN (English)               |            |  - Web Speech API (webkitSpeechRecognition)  |  |
|  |  - hi-IN (हिन्दी / Hindi)         | <--------> |  - Roadside Acoustic Denoising Filter        |  |
|  |  - mr-IN (मराठी / Marathi)       |            |  - Real-time Phoneme & Token Streamer        |  |
|  |  - ta-IN (தமிழ் / Tamil)          |            +----------------------+-----------------------+  |
|  |  - bn-IN (বাংলা / Bengali)        |                                   |                          |
|  |  - te-IN (తెలుగు / Telugu)        |                                   v                          |
|  +------------------+---------------+            +----------------------------------------------+  |
|                     |                            |       Vernacular Keyword Parser Engine       |  |
|                     v                            |  - N-gram Token Tokenization & Lemmatization |  |
|  +---------------------------------------+       |  - Department Heuristic Classifier Matrix    |  |
|  |   i18n Locale Resolution Engine       |       +----------------------+-----------------------+  |
|  |  - IndexedDB Locale Cache             |                              |                          |
|  |  - Brotli Chunk Delivery (<15 KB/loc) |                              |                          |
|  |  - Strict Parity Fallback (to en-IN)  |                              v                          |
|  +------------------+--------------------+       +----------------------------------------------+  |
|                     |                            |         Multimodal Classification Dispatch   |  |
|                     +--------------------------> |  - Ingests Voice Transcript + WebRTC Image   |  |
|                                                  |  - Synchronous Gemini 1.5/3.6 Flash Inference|  |
|                                                  +----------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Core Language Support Matrix

NagrikSetu establishes native, localized string tables and speech models for the initial Phase 1 deployment across six major Indian linguistic regions:

| Language Code | Language Name | Native Script | Primary Municipal Regions | Typical Dialect Baseline |
|---|---|---|---|---|
| `en-IN` | Indian English | Latin | Pan-India Municipal Corporations | Standard Indian English |
| `hi-IN` | Hindi | Devanagari (देवनागरी) | Delhi (MCD), Uttar Pradesh, Bihar, MP | Khariboli / Standard Hindi |
| `mr-IN` | Marathi | Devanagari (देवनागरी) | Mumbai (BMC), Pune (PMC), Nagpur | Deshi / Puneri Marathi |
| `ta-IN` | Tamil | Tamil (தமிழ்) | Chennai (GCC), Coimbatore, Madurai | Standard Spoken Tamil |
| `bn-IN` | Bengali | Bengali (বাংলা) | Kolkata (KMC), Howrah, Siliguri | Standard Colloquial Bengali |
| `te-IN` | Telugu | Telugu (తెలుగు) | Hyderabad (GHMC), Visakhapatnam, Vijayawada | Coastal / Telangana Telugu |

---

## 3. i18n Architecture & Type Contracts

To prevent runtime missing string errors and maintain deterministic TypeScript type safety across all React components, the localization engine enforces strict structural parity across all locale bundles.

### 3.1 Structural Interface Contract (`src/types/i18n.ts`)

```typescript
export type SupportedLocale = 'en-IN' | 'hi-IN' | 'mr-IN' | 'ta-IN' | 'bn-IN' | 'te-IN';

export interface ICivicCategoryStrings {
  pothole: string;
  garbage: string;
  streetlight: string;
  water_leakage: string;
  drainage: string;
  encroachment: string;
  other: string;
}

export interface ISLAUrgencyStrings {
  on_track: string;
  urgent: string;
  overdue: string;
  hours_remaining: string;
  breached: string;
}

export interface ICitizenPortalStrings {
  header_title: string;
  header_subtitle: string;
  capture_cta: string;
  retake_cta: string;
  analyzing_civic_issue: string;
  analyzing_exif: string;
  verifying_gps: string;
  duplicate_detected_title: string;
  duplicate_detected_desc: string;
  upvote_cta: string;
  submit_report_cta: string;
  submission_success: string;
  ticket_id_prefix: string;
}

export interface IDepartmentPortalStrings {
  queue_title: string;
  active_tickets: string;
  proximity_gating_notice: string;
  within_proximity: string;
  outside_proximity: string;
  capture_proof_cta: string;
  verify_closure_cta: string;
  resolved_badge: string;
}

export interface ICivicLocaleBundle {
  locale: SupportedLocale;
  locale_name_native: string;
  direction: 'ltr' | 'rtl';
  categories: ICivicCategoryStrings;
  urgency: ISLAUrgencyStrings;
  citizen: ICitizenPortalStrings;
  department: IDepartmentPortalStrings;
}
```

### 3.2 Hierarchical Fallback Resolution Engine

The client application resolves strings through a zero-cost immutable dictionary lookup with automated cascading fallbacks:

$$\text{String}_{\text{resolved}} = \mathcal{D}_{\text{active}}[K] \;\; \Vert \;\; \mathcal{D}_{\text{en-IN}}[K] \;\; \Vert \;\; K$$

Where:
- $\mathcal{D}_{\text{active}}$ represents the selected regional locale dictionary.
- $\mathcal{D}_{\text{en-IN}}$ represents the baseline authoritative English dictionary.
- $K$ represents the canonical dot-notated string key path (e.g., `citizen.analyzing_civic_issue`).

---

## 4. Vernacular Voice-First Citizen Intake

Many citizens experiencing road defects or drainage overflow encounter difficulty typing municipal descriptions while standing on busy roadways. NagrikSetu introduces a native voice input pipeline utilizing the browser's `SpeechRecognition` interface with automatic regional fallback.

### 4.1 Speech-to-Text Pipeline Architecture

```typescript
export interface IVoiceRecognitionConfig {
  locale: SupportedLocale;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export class VernacularSpeechEngine {
  private recognition: any | null = null;
  private isListening: boolean = false;

  constructor(private config: IVoiceRecognitionConfig) {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.config.locale;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
    }
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError('SPEECH_RECOGNITION_UNAVAILABLE');
      return;
    }

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.isListening = true;
    this.recognition.start();
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
```

### 4.2 Vernacular Keyword Extraction & Department Classification

Spoken transcripts are evaluated locally through an offline-capable regex tokenization matrix to predict the relevant civic department prior to or concurrently with the Gemini Vision API execution:

| Department Code | Target Incident | Hindi Tokens (`hi-IN`) | Marathi Tokens (`mr-IN`) | Tamil Tokens (`ta-IN`) | Bengali Tokens (`bn-IN`) |
|---|---|---|---|---|---|
| `PWD_ROADS` | Pothole / Crater | खड्डा, गड्ढा, सड़क, डामर | खड्डा, रस्ता, डांबर | குழி, சாலை, தார் | গর্ত, রাস্তা, পিচ |
| `SOLID_WASTE` | Garbage / Dumping | कचरा, कूड़ा, डस्टबिन, बदबू | कचरा, घाण, दुर्गंधी | குப்பை, கழிவு, நாற்றம் | আবর্জনা, ময়লা, দুর্গন্ধ |
| `STREETLIGHT` | Broken Streetlight | बत्ती, लाइट, खंभा, अंधेरा | दिवा, लाईट, खांब, अंधार | விளக்கு, தெருவிளக்கு, இருட்டு | আলো, বাতি, খুঁটি, অন্ধকার |
| `WATER_SUPPLY` | Pipe Leakage / Burst | पानी, लीकेज, नल, बहाव | पाणी, गळती, नळ, पाईप | தண்ணீர், குழாய், கசிவு | জল, পাইপ, ফুটো, অপচয় |
| `DRAINAGE` | Blocked Gutter / Sewage | नाला, गटर, सीवर, जाम | नाला, गटार, चोक, तुंबले | சாக்கடை, கழிவுநீர், அடைப்பு | নর্দমা, নালী, জমা জল |

---

## 5. WCAG 2.2 AAA Accessibility Standards

Civic applications deployed for public infrastructure accountability must be universally operable across variable physical abilities, ambient outdoor glare, and low-cost mobile hardware.

### 5.1 Physical Ergonomics & Touch Target Geometry

Field surveys indicate $>85\%$ of civic issue reports are submitted outdoors under dynamic conditions.
- **Minimum Target Dimensions**: All primary actionable controls (`Capture`, `Submit`, `Upvote`, `Language Select`) must adhere to a minimum dimension of **$48 \times 48\text{ CSS pixels}$** (with an active touch padding bounding box of $\ge 52 \times 52\text{ CSS pixels}$).
- **Target Separation**: A minimum spacing of $\ge 8\text{ CSS pixels}$ must separate adjacent interactive targets to prevent accidental triggers by users wearing work gloves or operating with tremor impairments.

```css
/* High-Target Touch Area Specification */
.civic-touch-target {
  min-width: 48px;
  min-height: 48px;
  padding: 12px 16px;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

### 5.2 Sunlight Contrast & Luminance Ratios

Urban outdoor reporting frequently occurs in direct mid-day sunlight with ambient illuminance exceeding $65,000\text{ lux}$. Standard interface contrasts become unreadable in these conditions.

NagrikSetu establishes a dedicated **High-Contrast Sunlight Mode** enforcing the following contrast thresholds:

$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \ge 7.0:1 \quad (\text{WCAG AAA Large and Normal Text})$$

Where $L_1$ is the relative luminance of the lighter color and $L_2$ is the relative luminance of the darker color:

```css
:root[data-contrast="sunlight"] {
  --bg-primary: #000000;
  --bg-surface: #0a0f1d;
  --border-strong: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #fef08a; /* High-visibility yellow */
  --accent-action: #22c55e;   /* Vivid Emerald */
  --accent-alert: #ef4444;    /* Vivid Signal Red */
  --focus-ring: #38bdf8;      /* Sky Blue 4px solid */
}
```

### 5.3 Complex Script Typography & Devanagari Glyph Height

Complex Indic scripts (Devanagari, Tamil, Bengali, Telugu) feature upper and lower matras (vowel diacritics) and conjunct consonants that exceed Latin x-height envelopes. Standard Latin font-size and line-height configurations result in cropped glyphs or visual clutter.

NagrikSetu applies dynamic typographic scaling rules when Indic locales are active:
- `line-height`: Increased from `1.5` to `1.75` for paragraph copy.
- `font-feature-settings`: Enabled `"liga" 1, "kern" 1` for accurate glyph ligature shaping.
- System fallback stacks: Prioritizes platform-native Indic fonts (`Noto Sans Devanagari`, `Kohinoor Devanagari`, `Nirmala UI`, `Mukti Narrow`, `Latha`).

```css
:lang(hi-IN), :lang(mr-IN) {
  font-family: 'Noto Sans Devanagari', 'Nirmala UI', system-ui, sans-serif;
  line-height: 1.75;
  letter-spacing: 0.015em;
}

:lang(ta-IN) {
  font-family: 'Noto Sans Tamil', 'Latha', system-ui, sans-serif;
  line-height: 1.8;
}

:lang(bn-IN) {
  font-family: 'Noto Sans Bengali', 'Shonar Bangla', system-ui, sans-serif;
  line-height: 1.75;
}

:lang(te-IN) {
  font-family: 'Noto Sans Telugu', 'Gautami', system-ui, sans-serif;
  line-height: 1.8;
}
```

---

## 6. Offline Locale Caching & Bundle Optimization

To ensure zero-latency startup and complete functionality in network-isolated regions, language packs are managed through an aggressive client-side caching protocol.

1. **Lightweight Locale Bundles**: Each compiled regional dictionary is tree-shaken and serialized to a Brotli-compressed JSON chunk measuring $< 12\text{ KB}$ gzipped.
2. **ServiceWorker Cache Storage**: Locale bundles are pre-cached during ServiceWorker installation in the `nagriksetu-i18n-v1` cache tier.
3. **Locale Auto-Detection Cascade**:
   ```typescript
   export function resolveInitialLocale(): SupportedLocale {
     // 1. Explicit user preference stored in localStorage
     const stored = localStorage.getItem('nagriksetu_locale') as SupportedLocale;
     if (stored && ['en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'bn-IN', 'te-IN'].includes(stored)) {
       return stored;
     }

     // 2. Browser navigator.languages match
     const browserLanguages = navigator.languages || [navigator.language];
     for (const lang of browserLanguages) {
       const prefix = lang.slice(0, 2).toLowerCase();
       if (prefix === 'hi') return 'hi-IN';
       if (prefix === 'mr') return 'mr-IN';
       if (prefix === 'ta') return 'ta-IN';
       if (prefix === 'bn') return 'bn-IN';
       if (prefix === 'te') return 'te-IN';
     }

     // 3. Fallback default
     return 'en-IN';
   }
   ```

---

## 7. Automated Parity & Accessibility Validation

Every automated build and continuous integration run enforces:
1. **Locale Parity Assertion**: A TypeScript test suites traverses all keys in `en-IN.json` and verifies that identical non-empty keys exist in all peer language files.
2. **Axe-Core Automated Scans**: All citizen reporting routes (`/citizen`, `/department`, `/`) are audited using `@axe-core/playwright` ensuring 0 critical or serious accessibility violations.
3. **Speech Synthesizer Compatibility**: Fallback audio cues for non-visual verification are tested against standard Web Speech synthesis voices across all targeted regional dialects.
