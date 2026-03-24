# Design System Specification: Architectural Editorial

## 1. Overview & Creative North Star
This design system is built to position a local SEO and web agency in Alcoy as a premier architectural force in the digital space. We are moving away from the "generic agency" aesthetic of blue boxes and rigid grids.

**Creative North Star: The Digital Architect**
The system is defined by high-contrast editorial typography, intentional asymmetry, and "The No-Line Rule." We create structure not through borders, but through sophisticated tonal shifts and layered surfaces. The goal is to feel like a high-end architectural portfolio—clean, authoritative, and expansive. We utilize generous whitespace (our "breathing room") to signal luxury and professional confidence.

---

## 2. Colors
Our palette is rooted in the deep authority of Alcoy’s industrial heritage but elevated by modern, vibrant accents.

*   **Primary (#002045) & Primary Container (#1a365d):** These represent our "Ink." Use these for deep backgrounds or high-contrast text. They provide the professional weight necessary for a trustworthy SEO agency.
*   **Secondary (#006c49) & Secondary Container (#6cf8bb):** Our "Action" emerald. This is used sparingly for CTAs and success states to ensure they "pop" against the deep blue.
*   **Surface Hierarchy (Nesting):** We define space through color, not lines.
    *   **Surface Lowest (#ffffff):** Used for primary cards or elevated content blocks.
    *   **Surface (#f7f9fb):** The global canvas.
    *   **Surface Container Low (#f2f4f6):** Used for subtle sectioning or background shifts.
    *   **Surface Container High (#e6e8ea):** Used to denote depth within a container.

**The "No-Line" Rule:**
Strictly prohibit 1px solid borders for sectioning or card definition. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clean, sophisticated break without the "cheap" look of a stroke.

**The Glass & Gradient Rule:**
For floating navigation or high-end feature cards, use **Glassmorphism**. Combine `surface-container-lowest` at 70% opacity with a `backdrop-blur` of 20px. Use a subtle linear gradient (Primary to Primary-Container) for Hero sections to add "soul" and dimension.

---

## 3. Typography
We use a dual-typeface system to balance modern flair with extreme readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric, architectural qualities. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero statements to create an editorial, high-fashion impact.
*   **Body & Labels (Inter):** The gold standard for SEO readability. Use `body-lg` (1rem) for general descriptions to ensure clarity on all devices.
*   **Hierarchy Note:** Always maintain a significant scale jump between headlines and body text. If a headline is `headline-lg`, the subtext should skip a level to `body-md` to create "visual tension" that feels curated.

---

## 4. Elevation & Depth
Depth in this system is organic and ambient, mimicking natural light.

*   **Tonal Layering:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift" that is felt rather than seen.
*   **Ambient Shadows:** When a floating effect is required (e.g., a primary CTA or a hovering card), use a diffused shadow: `0 20px 40px rgba(25, 28, 30, 0.06)`. The shadow color is a tint of our `on-surface` token, never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at 15% opacity. It should be a suggestion of a line, not a hard boundary.

---

## 5. Components

### Buttons
*   **Primary:** `secondary` (#006c49) background with `on-secondary` (#ffffff) text. Use `rounded-md` (0.375rem). Use a subtle emerald glow on hover rather than a color darken.
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Pure text with a 2px underline using the `secondary-fixed` color, offset by 4px.

### Cards
*   Forbid dividers. Separate content using `spacing-6` (2rem) or background shifts.
*   **SEO Metric Cards:** Use `surface-container-lowest` with a `secondary` accent icon. The icon should sit in a `secondary-container` soft-circle.

### Input Fields
*   Background: `surface-container-low`.
*   Border: None, except for a 2px bottom-accent in `primary` when focused.
*   Labels: Always use `label-md` in `on-surface-variant` for a sophisticated, "small-caps" feel.

### Additional Component: The "Metric Glass"
Specifically for SEO data, use a semi-transparent `surface-container-lowest` panel with a heavy backdrop blur. This allows the agency's web work to peek through the data, signaling transparency and technical depth.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but offset images to the right with varying margins to create a custom "designed" feel.
*   **Use the Spacing Scale:** Stick strictly to the increments (e.g., use `spacing-12` for section padding) to ensure mathematical harmony.
*   **Layer Surfaces:** Think of the UI as layers of fine paper. Layer 1 (Surface) -> Layer 2 (Container Low) -> Layer 3 (Lowest/White Card).

### Don't:
*   **Don't use 1px borders:** This is the quickest way to make the design look like a template.
*   **Don't use pure black:** Use `on-background` (#191c1e) for text to maintain a high-end, softer contrast.
*   **Don't crowd the content:** If you feel you need a divider line, you actually need more whitespace. Increase your spacing from `8` to `12`.
*   **Don't use "Standard" Blue:** Avoid default web blues. Stick to the `primary-container` (#1a365d) to maintain the "Architectural" brand identity.