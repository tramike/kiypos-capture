# KiyPos Capture — Requirements & Architecture

## Purpose

KiyPos Capture is an installable Progressive Web App (PWA) for phones and tablets that handles Swiss VAT export customer onboarding at the point of sale. It is designed for use in retail environments (e.g. Kirchhofer watch boutiques in Interlaken, Grindelwald, and Jungfraujoch) where international customers purchase goods and request a VAT export refund.

The app captures customer and travel document data, collects legally binding consents, and encrypts everything in the browser before transmitting it to a backend service. The backend then splits the data into two pipelines:

1. **Swiss customs export document generation** — produces a printable customs form including the customer's foreign address, a rectified copy of their passport/ID, and their signature.
2. **CRM data capture** — feeds customer contact information and consent states into the store's CRM system.

---

## Entry Flow

The app supports two entry paths:

- **Direct scan:** The customer or employee opens the installed app and scans a QR code using the device camera. The QR code is either a fixed sticker at the cashier station or a per-transaction code displayed on the POS customer screen.
- **URL launch:** The phone's native camera scans the QR code and opens the app URL directly. The app detects the encryption key in the URL query parameter (`?key=...`) and enters the flow immediately.

The QR code contains an encryption key (and optionally a key identifier) that is used to encrypt the entire payload in-browser. The backend uses the same key to decrypt it.

---

## Wizard Steps

### 1. QR Scan
- Live camera QR scanner with on-screen viewfinder and automatic detection
- Fallback to manual key entry if camera is unavailable or permission is denied
- Parses the key from URL parameters, QR content, or manual input
- Accepts formats: URL with `?key=`, `keyId:encryptionKey` pair, or raw key string

### 2. Welcome / Session Context
- Displays session details parsed from the QR code:
  - Station label (for fixed-station QRs)
  - Transaction reference (for per-transaction QRs)
  - Purchase total and goods description (if provided by the POS)
- Outlines the remaining steps
- Confirms encryption security before proceeding

### 3. Customer Address Form
- Full address entry: full name, street, house number, postal code, city, state/region, country, phone, email
- **Swiss residency check:** Validates that the selected country is not Switzerland. Swiss residents do not qualify for VAT export refunds. A clear warning is shown if Switzerland is selected.
- Field-level validation on blur and on step-advance (required fields, email format)
- Auto-selects country based on device locale with manual dropdown override
- Country list excludes Switzerland (not eligible for VAT export)

### 4. Consent Collection
- Four configurable consent items, each with title, description, and required/optional flag:
  - Consent 1 (required) — placeholder for text to be provided
  - Consent 2 (required) — placeholder for text to be provided
  - Consent 3 (optional) — placeholder for text to be provided
  - Consent 4 (required) — Customs Export Declaration: customer confirms that the data and signature provided will be used to generate a Swiss customs export document and that their signature is legally binding for this purpose
- Required consents block advancement; live counter shows remaining required items
- Each consent records an acceptance timestamp
- Consents are configurable objects (title, description, required flag) so exact text can be dropped in without changing app logic

### 5. Travel Document Capture
- Camera-based passport/ID capture with on-screen guide frame
- **Rectified document image:** The captured image is perspective-corrected, deskewed, and border-cropped for customs requirements. (Dynamsoft MRZ Scanner's `getDocumentImage()` provides this natively once the license key is configured.)
- **MRZ data extraction:** Parses the Machine Readable Zone to extract: document type, document number, name, nationality, date of birth, expiry date, gender, issuing state
- Auto-fills address form fields with parsed MRZ data where applicable
- Customer reviews the rectified image and extracted data before proceeding
- **Manual fallback:** If the camera is unavailable, the employee can type document details manually
- The rectified document image (high-quality JPEG) and parsed MRZ data are included in the encrypted payload
- This step is required — the passport copy is needed for customs export papers

### 6. Signature Capture
- Finger-drawn signature pad on HTML canvas
- Optimized for phone and tablet touch events with high-DPI support
- "Clear" button to redo, "Confirm Signature" button to lock it in
- Rejects near-empty canvases
- Captured as PNG at sufficient resolution for print-quality output on the customs export document
- The signature is included in the encrypted payload

### 7. Review & Submit
- Complete review screen showing:
  - Customer name and address (with country confirmation)
  - Document type, number, expiry, and rectified image preview
  - All four consent statuses
  - Signature preview
  - Transaction/station reference from the QR
- "Edit" links allow jumping back to any previous step
- "Submit" button triggers encryption and upload

---

## Encryption & Security

- **In-browser encryption:** The full payload is encrypted using AES-GCM (Web Crypto API) with a key derived from the QR code's encryption key via PBKDF2 (100,000 iterations, SHA-256)
- **Payload contents:** Customer address, all consent states with timestamps, parsed MRZ data, rectified document image (base64 JPEG), signature image (base64 PNG), key identifier, submission timestamp, device type
- **No unencrypted customer data** is stored on the app's own Supabase backend — only lightweight submission tracking records (key ID, status, timestamps, device type, server response references)
- The encryption key never leaves the device in plaintext — only the encrypted blob, IV, salt, and key identifier are transmitted

---

## Backend Architecture

### Edge Function (Supabase)
- Acts as a relay between the app and the FastAPI backend
- Receives the encrypted payload (`keyId`, `iv`, `salt`, `encryptedData`, `deviceType`)
- Creates a submission tracking record in the Supabase database
- Forwards the encrypted blob to the FastAPI backend URL (stored as an edge function secret)
- Returns the FastAPI response to the app
- No decryption happens in the edge function

### FastAPI / Python Backend
- **POST /submissions** — receives the encrypted payload
- Looks up the decryption key by `keyId` (from its station/transaction provisioning database)
- Decrypts the AES-GCM payload using Python's `cryptography` library
- Two processing pipelines after decryption:
  - **VAT export document generation:** Assembles a printable PDF customs export document including the customer's foreign address, rectified passport/ID image, signature, and transaction/goods info from the POS
  - **CRM data capture:** Extracts customer contact information and consent states and feeds them into the CRM system
- Response on success: `{ status: "accepted", exportDocRef, crmRef }`
- Response on failure: `{ status: "rejected", reason }` with appropriate HTTP status
- For fixed-station QRs: generates a new export document reference per submission
- For per-transaction QRs: links the export document to the specific POS transaction and can include goods description and purchase total on the customs form

### Supabase Database
- `submission_tracking` table stores: key ID, status (pending/accepted/rejected/error), device type, server response references, error reason, timestamp
- Row Level Security enabled with anon + authenticated access (no-auth app)

---

## PWA Features

- **Installable:** Web app manifest with standalone display mode, app icons, and home-screen installation on phones and tablets
- **Offline shell:** Service worker caches the app shell for reliable opening at the cashier station even with weak connectivity
- **Responsive:** Adapts between phone (portrait, single column, large touch targets) and tablet (wider layout, supports portrait and landscape)
- **Safe areas:** Respects device safe-area insets for notched phones and tablets

---

## Design Language

The visual design is inspired by Kirchhofer's luxury watch boutique aesthetic:

- **Dark, near-black backgrounds** with deep ink tones for a dramatic, premium feel
- **Champagne gold accents** for buttons, progress indicators, section headers, and interactive elements
- **Cormorant Garamond serif** for headings, paired with **Inter** for body text and form labels
- **Subtle gold divider lines** under section headers
- **Glacier blue** for encryption/security messaging (echoing Kirchhofer's "Glacier Blue" special editions)
- Refined micro-interactions: spring-animated checkmarks, gold scan lines in camera viewfinders, smooth slide transitions between steps
- Professional, minimal, and understated — suited to a customs-facing process in a luxury retail environment

---

## Configuration Items Needed

The following items must be provided before production use:

1. **Dynamsoft MRZ Scanner license key** — stored as an environment variable (`VITE_DYNAMSOFT_LICENSE`). Without it, the document capture step uses the camera-only flow with manual entry fallback. With it, MRZ parsing and automatic perspective rectification activate.

2. **FastAPI backend URL** — stored as a Supabase edge function secret (`FASTAPI_BACKEND_URL`). The edge function relays encrypted payloads to this URL. Without it, submissions will fail with a "backend not configured" error.

3. **Four consent texts** — the exact legal text for Consents 1–3 must replace the placeholder text. Consent 4 (Customs Export Declaration) already has its text. These can be updated in `src/lib/consents.ts` without changing any app logic.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **QR scanning:** jsQR (client-side QR decoding from camera frames)
- **Document capture:** Dynamsoft MRZ Scanner (npm package, license required for full MRZ parsing and rectification)
- **Signature:** HTML5 Canvas with Pointer Events
- **Encryption:** Web Crypto API (AES-GCM, PBKDF2)
- **Backend relay:** Supabase Edge Function (Deno)
- **Database:** Supabase (PostgreSQL with RLS)
- **Backend service:** FastAPI / Python (external, not part of this repository)
- **PWA:** Web App Manifest, Service Worker

---

## File Structure

```
src/
  App.tsx                    — Main wizard controller and step routing
  main.tsx                   — React entry point
  index.css                  — Tailwind + custom component styles
  types/
    index.ts                 — TypeScript type definitions
  lib/
    address.ts               — Address validation, country list, Swiss check
    consents.ts              — Consent definitions and helpers
    crypto.ts                — AES-GCM encryption (Web Crypto API)
    submit.ts                — Edge function submission client
    supabase.ts              — Supabase client singleton
    device.ts                — Phone/tablet detection
  components/
    Progress.tsx             — Progress bar and step indicator
    StepShell.tsx            — Step header and navigation buttons
  steps/
    QRScanner.tsx            — Step 1: QR code scanning
    Welcome.tsx              — Step 2: Session context welcome
    AddressForm.tsx          — Step 3: Customer address form
    Consents.tsx             — Step 4: Consent collection
    DocumentCapture.tsx      — Step 5: Passport/ID capture
    SignaturePad.tsx         — Step 6: Signature capture
    Review.tsx               — Step 7: Review and submit
    SubmittingScreen.tsx     — Encryption/upload progress
    SuccessScreen.tsx        — Success confirmation
    ErrorScreen.tsx          — Error with retry
public/
  manifest.json              — PWA manifest
  sw.js                      — Service worker
  icon.svg, icon-*.png       — App icons
supabase/
  config.toml                — Edge function configuration
  functions/
    submit-payload/index.ts  — Edge function: relay to FastAPI
```
