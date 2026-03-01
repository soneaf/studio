# YaVe Cocktail Studio - Application Documentation

**Last Updated:** December 2025
**Version:** 2.0 (Multi-Mode & Studio Engine)

## 1. Project Overview
**YaVe Cocktail Studio** is an advanced AI-powered web application designed to generate photorealistic product imagery. It features two distinct operating modes:
1.  **Tequila Mode:** Specialized for building cocktail scenes with YaVe Tequila products, ingredients, glassware, and garnishes.
2.  **Studio Mode:** A general-purpose product photography studio allowing compilation of any uploaded assets (bottles, cans, products) into professional scenes.

### Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (v4) + Standard CSS Variables
*   **Database:** SQLite (via Prisma ORM)
*   **State Management:** React Context (`BuilderContext`)
*   **Server Actions:** Used for image generation (Gemini integration), file system access, and DB operations.

---

## 2. Design System & Aesthetics
The application uses a "Premium Dark Mode" aesthetic, characterized by deep blacks, glassmorphism, and vibrant brand accent colors.

### Color Palette (`app/globals.css`)
*   **Background:** `#050505` (Deep Black)
*   **Foreground:** `#ededed` (Off-White)
*   **YaVe Gold:** `#c1b856` (Primary Accent / Buttons / Selection Indicators)
*   **YaVe Silver:** `#C0C0C0` (Secondary Accents)
*   **YaVe Orange:** `#FF8c00` (Glows / Highlights)
*   **YaVe Green:** `#2E8B57` (Glows / Nature elements / Selection Indicators)
*   **YaVe White:** `#FAFAFA`

### Typography
*   **Font:** Geist Sans (UI) & Geist Mono (Code/Prompts).
*   **Style:** Uppercase, tracking-widest for headers; clean sans-serif for body text.

---

## 3. Core Pages & Layout

### A. Main Studio (`app/page.tsx`)
The primary interface for building and generating prompts. It dynamically switches between **Tequila Mode** and **Studio Mode** via the `ModeToggle` in the header or controls. The loading screen features a generic gold spinner and "Generating Scene..." text.

**1. Header**
*   **Logo & Mode Switcher:** Toggle between "Tequila" and "Studio".
*   **Aspect Ratio Selector:** 1:1, 16:9, 9:16, 4:5, 5:4.
*   **Action Buttons:**
    *   **Reset:** Triggers a **Themed Confirmation Dialog** to wipe state.
    *   **History:** Navigates to `/history`.
    *   **Generate:** Triggers the AI generation process.
    *   **Settings (Gear):** Opens `SettingsModal`.

**2. "Build Your Scene" Section (Left Column)**
*   **Live Preview:** Toggleable Reference Image uploader (`ReferenceUploader`).
*   **Scene Prompt Panel (`PromptReviewPanel`):**
    *   Displays the real-time constructed prompt.
    *   **Title:** "Scene Prompt".
    *   **Copy Button:** Allows copying the raw text.

**3. Controls Section (Right Column)**
Depending on the active mode, different control components are rendered. All selections use a consistent **Gold Border + Gold Dot** indicator style.

#### **I. Tequila Mode (`CocktailBuilderControls`)**
*   **Drink Management:** Add/Remove drinks (Multi-drink support).
*   **Ingredients:**
    *   **SKU Selector:** Buttons for Blanco, Reposado, Jalapeño, etc.
    *   **Bottle Only (No Drink) Toggle:** Switches to a bottle-focused composition.
    *   **Multi-Bottle Selection:** Select multiple bottles (e.g., Blanco + Reposado) for group shots. Selection is indicated by a **Gold Border + Gold Dot**.
    *   **Glassware, Ice, Garnish:** Grid and dropdown selectors.
*   **Environment:** Background and Countertop selectors.
*   **Action Button:** **"Mixologist"** - Randomizes the scene.

#### **II. Studio Mode (`StudioBuilderControls`)**
*   **Product Subject:**
    *   **Grid:** Displays uploaded assets.
    *   **Multi-Selection:** Users can select multiple products to appear in the scene (Gold Border + Gold Dot indicator).
    *   **Multi-Variant Selection:** If a product has variants (e.g., "Left Side", "Right Side"), a multi-select dropdown appears. Users can select multiple views (e.g., Main View + Rear View) to provide comprehensive visual references to the AI.
*   **Scene Engine:**
    *   **Camera:** Choose between DSLR, Mirrorless, Film, Polaroid, etc.
    *   **Lighting:** Select lighting moods (e.g., Natural, Studio, Neon).
    *   **Angle:** Define camera angle (Eye Level, High Angle, Low Angle).
*   **Composition:** Background and Countertop selectors.
*   **Reference Image:** Drag-and-drop reference image support.

### B. History View (`app/history/page.tsx`)
*   **Grid View:** Displays all past generations.
*   **Detail View:** Full-screen viewer.
*   **Delete:** Includes a themed confirmation dialog.
*   **Export:** CSV Export functionality.

---

## 4. Key Functionality & Logic

### Multi-Product & Variant System
*   **Multi-Selection:** Both Studio and Tequila modes support selecting multiple primary objects.
    *   *Implementation:* `state.activeProducts` (Studio) and `state.activeBottles` (Tequila).
*   **Variants:** Products can have multiple image variants (e.g. view angles).
    *   *Settings:* Users can upload variants in `Settings > Studio Assets`.
    *   *Usage:* Selecting a variant overrides the main product image in the generation request.

### Auto-Save & File Naming
*   **Configuration:** Users configure naming rules in **Settings > File Naming**.
*   **Format Builder:** An advanced 6-field builder supporting:
    *   **Custom Text** (Static string)
    *   **Product Name** (Dynamic, inserts product/recipe name)
    *   **Increment** (Auto-incrementing counter: '001', '002'...)
    *   **Separators:** Dash, Underscore, Space.
*   **Auto-Save:** Saves to user-defined local folder on successful generation.

### Image Generation Logic
*   **Input:** Text Prompt + Asset Images (Base64).
*   **Process:** The app collects paths from all `activeProducts` (resolving variants), converts to Base64, and sends them to Gemini along with the detailed prompt.

---

## 5. Components Manifest

| Component | Path | Description |
| :--- | :--- | :--- |
| **CocktailBuilderControls** | `components/CocktailBuilderControls.tsx` | Tequila Mode controls (Drinks, Garnishes, Tequila SKUs). |
| **StudioBuilderControls** | `components/StudioBuilderControls.tsx` | Studio Mode controls (Products, Variants, Camera, Light). |
| **PromptReviewPanel** | `components/PromptReviewPanel.tsx` | Read-only view of the generated text. |
| **GeneratedResult** | `components/GeneratedResult.tsx` | "Success" modal with image preview and download. |
| **SettingsModal** | `components/SettingsModal.tsx` | Configures app settings, manages Assets (Products/Bottles) and Variants. |
| **ReferenceUploader** | `components/ReferenceUploader.tsx` | Drag-and-drop area for reference images. |
| **VariantsManager** | `components/StudioSettings.tsx` | UI for uploading/deleting product variants. |
| **FileNamingTab** | `components/SettingsModal.tsx` | UI for configuring file naming convention. |

---

## 6. Database Schema (`prisma/schema.prisma`)
The app uses a local SQLite database (`dev.db`).

**Model: `Cocktail`**
*   `id`: UUID
*   `timestamp`: DateTime
*   `recipeName`: String
*   `sku`: String (or Product names in Studio Mode)
*   `imagePath`: String (Path to local file in `public/history`)
*   `finalPrompt`: String
*   ... (and other legacy drink fields)

---

## 7. Migration & Backup Guide
To move this app to another computer without losing data:

1.  **Backup** the following from the source computer:
    *   `web/prisma/dev.db`
    *   `web/public/history/` (Folder)
    *   `web/public/products/` (Folder - New)
    *   `web/public/bottles/` (Folder)
    *   `web/yave-settings.json`
    *   `web/.env.local`
2.  **Copy** the code folder (excluding `node_modules`).
3.  **Restore** the backed-up files into the new instance.
4.  **Run:** `npm install` -> `npx prisma generate` -> `npm run dev`.
