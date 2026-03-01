# Yave AI Image Generator - Workflow Update Hand-off

## 1. Objective & Context
This document summarizes the extensive refinements made to the Yave AI Image Generator application. The primary goal was to enhance the accuracy and brand compliance of AI-generated images for Yave Tequila bottles and cocktails. This involved a complete overhaul of the prompt generation logic, data structures, and UI workflow to ensure that every user selection (from bottle anatomy to custom environment vibes) is faithfully reflected in the final prompt.

## 2. Core Architecture Changes

### A. Data Layer (`lib/data.ts`)
*   **Enhanced Tequila SKUs**: Updated the `TequilaSku` type definition to include:
    *   `colorDescription`: Precise liquid color (e.g., "crystal clear liquid").
    *   `labelInstructions`: Detailed visual instructions for label text and layout.
    *   `bottleText`: Explicit text string to enforce label accuracy.
*   **Populated Data**: Updated `TEQUILA_SKUS` with exact specifications from `brand_config_yave.md`.
*   **Props & Placements**: Validated `PROP_PLACEMENTS` to map placement IDs (e.g., 'surrounding', 'under') to natural language relationship phrases (e.g., 'surrounded by', 'resting on a') for better prompt coherence.

### B. Prompt Generation Engine (`lib/prompt-generator.ts`)
The `lib/prompt-generator.ts` file was the focus of major refactoring to serve as the reliable "Brain" of the application.
*   **Unified Custom Text Logic**: Lifted `bgCustomText` (Background) and `surfCustomText` (Surface) resolution to the top function scope. This ensures that any custom text entered in "Set the Scene" is **always** accessible and included in the prompt, regardless of whether the user is in Tequila or Studio mode, or if a Reference Image is active.
*   **Bottle Anatomy Constants**: Defined `BOTTLE_CORE` constants to rigorously describe the fixed anatomy of the Yave bottle (Shape, Gold Key Graphic, Inner Pattern, Main Logo).
*   **Refined Bottle Logic**: 
    *   Constructs highly detailed `bottleMention` blocks combining `BOTTLE_CORE`, specific SKU `colorDescription`, and `labelInstructions`.
    *   **Count Enforcement**: Implemented strict logic to count `activeBottles`. If one bottle is requested, the prompt now explicitly states "EXACTLY ONE BOTTLE" and "DO NOT INCLUDE ANY EXTRA BOTTLES".
*   **Props Integration**: 
    *   Imported `PROP_PLACEMENTS` to resolve placement values dynamically.
    *   Refactored `propsText` generation to use explicit phrasing: `"Additional Scene Element: [Item]. Relation: [Placement] the main subject."` This ensures the AI model understands the spatial relationship between props and the hero product.
*   **Brand Safeguards**:
    *   Implemented `BRAND_NEGATIVE_PROMPT` with specific, high-weight terms to prevent common hallucinations: `(floating keys:1.5)`, `(duplicate bottles:1.5)`, `(misspelled text)`, `(incorrect liquid color)`.

### C. UI / Wizard Logic (`components/WizardOverlay.tsx`)
*   **Workflow Expansion**: Added the **Props/Elements** step (Index 9) to the Tequila workflow (previously exclusive to Studio mode).
*   **Navigation Logic**: Updated `TEQUILA_STEPS` array and completely rewrote the internal navigation logic (Render Switch, Forward Skip, Backward Skip) to accommodate the new step index.
*   **Input Handling**: Verified that "Set the Scene" custom inputs (`customAtmosphere`, etc.) correctly dispatch updates to the shared state, which are then picked up by the new Prompt Generator logic.

## 3. Key Files & Locations

| File | Purpose | Key Changes |
| :--- | :--- | :--- |
| **`lib/prompt-generator.ts`** | Prompt Logic | `BOTTLE_CORE`, `BRAND_NEGATIVE_PROMPT`, Bottle Count Logic, Props Phrasing, Unified Environment Text. |
| **`lib/data.ts`** | Static Data | `TequilaSku` updates, `PROP_PLACEMENTS`, `TEQUILA_SKUS` population. |
| **`components/WizardOverlay.tsx`** | UI Controller | Added `Props` step to Tequila flow, updated step indices and navigation guards. |
| **`lib/builder-context.tsx`** | Global State | Verified `dispatch` and `reducer` handling for `ADD_PROP` and `SET_BACKGROUND`. |
| **`brand_config_yave.md`** | Spec Sheet | Serves as the source of truth for all visual descriptions. |

## 4. Current State & Functionality
*   **Botle Accuracy**: The AI now receives precise instructions for bottle shape, liquid color, and strictly enforces label text.
*   **No Duplicates**: Strong negative prompts and "Exact Count" instructions prevent the generation of extra or hallucinated bottles.
*   **Props Visibility**: Props added in the workflow are now explicitly formatted in the prompt with clear spatial relationships, ensuring they appear in the final image.
*   **Custom Environment**: Custom text entered in "Set the Scene" is correctly prioritized and appended to the prompt in both Tequila and Studio modes, even when using reference assets.

## 5. Handoff Instructions
If continuing development from this point:
1.  **Test Generations**: Run generation tests to verify that the new "Relation: ..." phrasing for props results in natural-looking compositions.
2.  **Expand Data**: To add more props or background presets, update `lib/data.ts` and ensuring `PROP_PLACEMENTS` covers any new spatial relationships needed.
3.  **Monitor Compliance**: If the AI begins to hallucinate floating objects again, increase the weight of `(floating keys:1.5)` in `BRAND_NEGATIVE_PROMPT` within `lib/prompt-generator.ts`.
