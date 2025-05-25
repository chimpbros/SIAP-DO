# UI Redesign Plan

This document outlines the detailed plan for redesigning the UI of the application, focusing on the dashboard and main page, addressing the user's specific requirements.

## Goals

### Goal 1: Address Top Div Gap and Remove Search Bar
*   **File:** `frontend/src/components/TopBar.js`
*   **Changes:**
    *   Remove the `left` style property and the `ml-` classes from the main `div` of the `TopBar` component. This will ensure the top bar aligns correctly with the main content area, which is already being managed by `MainLayout.js`.
    *   Completely remove the search bar `form` element and its contents from `TopBar.js`.

### Goal 2: Adjust Main Logo Text
*   **File:** `frontend/src/components/TopBar.js`
*   **Changes:**
    *   Reduce the font size of the logo text from `text-xl` to `text-base`.
    *   Modify the logo text to be split into two lines: "Sistem Informasi" and "Administrasi Pengarsipan", by wrapping them in `span` tags within a `div` and adding a line break. Add `leading-tight` for compact line height.

### Goal 3: Update Sidebar Color and Text
*   **File:** `frontend/tailwind.config.js`
*   **Changes:**
    *   Change the `sidebar-bg` color to white (`#FFFFFF`).
    *   Change the `sidebar-text` color to a darker light gray (`#6B7280`), which is already defined as `text-light` in your Tailwind config.
    *   Adjust the `sidebar-hover-bg` color to a lighter shade (`#F0F4FA`), which is your `page-bg` color, to ensure good contrast on the white sidebar.
    *   The `sidebar-active-bg` (primary blue) and `sidebar-active-text` (white) will remain unchanged as they align with the example design.

### Goal 4: Ensure Main Layout Compatibility
*   **File:** `frontend/src/components/MainLayout.js`
*   **Changes:**
    *   No direct changes are needed in `MainLayout.js`. The existing `mainContentMarginLeftClass` correctly handles the main content's positioning, and the adjustments in `TopBar.js` will ensure it integrates seamlessly.

### Goal 5: Fix "Total Surat" Icon
*   **File:** `frontend/src/pages/DashboardPage.js`
*   **Changes:**
    *   No code changes needed in `DashboardPage.js` as the `iconSrc="/messageRed.png"` is now valid since the user has provided the `messageRed.png` file.

## Visual Representation of the Plan

```mermaid
graph TD
    A[Start UI Redesign] --> B{Analyze Requirements};
    B --> C[Identify Relevant Files];
    C --> D[Read TopBar.js];
    D --> E[Read Sidebar.js];
    E --> F[Read tailwind.config.js];
    F --> G[Read index.css];
    G --> H[Read MainLayout.js];
    H --> I[Read DashboardPage.js];
    I --> J{Formulate Detailed Plan};
    J --> K[Goal 1: Top Div Gap & Search Bar];
    J --> L[Goal 2: Main Logo Text];
    J --> M[Goal 3: Sidebar Color & Text];
    J --> N[Goal 4: Main Layout Compatibility (No direct changes needed)];
    J --> O[Goal 5: Fix "Total Surat" Icon (Resolved)];
    K --> K1[Modify TopBar.js: Remove left style and ml classes];
    K --> K2[Modify TopBar.js: Remove search bar];
    L --> L1[Modify TopBar.js: Adjust font size and split text];
    M --> M1[Modify tailwind.config.js: Update sidebar-bg to white];
    M --> M2[Modify tailwind.config.js: Update sidebar-text to light gray];
    M --> M3[Modify tailwind.config.js: Update sidebar-hover-bg];
    O --> O1[Confirm messageRed.png provided];
    O1 --> P[Plan Finalized];
    P --> Q[Implement Changes in Code Mode];