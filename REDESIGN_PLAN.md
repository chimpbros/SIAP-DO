# Mobile Responsiveness Enhancement Plan (Revised)

This document outlines the plan to improve the mobile responsiveness of the SIAP application.

## 1. Sidebar Transformation to Hamburger Menu (Mobile)

*   **Goal:** Replace the persistent sidebar with a hamburger-triggered dropdown/overlay menu on mobile screens.
*   **Files to Modify:**
    *   `frontend/src/components/MainLayout.js`
    *   `frontend/src/components/TopBar.js`
    *   `frontend/src/components/Sidebar.js`
    *   Possibly global CSS or `frontend/src/index.css` for fine-tuning.

*   **Steps:**
    1.  **State Management in `MainLayout.js`:**
        *   Introduce a new state variable, `isMobileMenuOpen`, initialized to `false`.
        *   Create a function `toggleMobileMenu` to update this state.
        *   Pass `isMobileMenuOpen` and `toggleMobileMenu` as props to `TopBar` and `Sidebar`.
    2.  **Hamburger Icon and Logo/Title in `TopBar.js`:**
        *   **Logo and Title (Left Side):**
            *   The existing logo (`frontend/public/polri.png`) and text ("Sistem Informasi Administrasi Pengarsipan") will remain on the left side of the `TopBar`. The text currently has `hidden md:block` (see `TopBar.js`), this will be maintained unless further changes are requested for its mobile visibility.
        *   **Hamburger Icon (Right Side):**
            *   Add a hamburger icon button to the *right* side of the `TopBar`.
            *   This button should be visible only on mobile screens (e.g., using Tailwind's `md:hidden` class).
            *   On click, it should call `toggleMobileMenu` (passed from `MainLayout`).
        *   **Layout:**
            *   The `TopBar` already uses `justify-between` (see `TopBar.js`), which will help position the logo/title on the left and the new hamburger menu on the right.
            *   The `TopBar`'s `left` style/margin will be `0` on mobile screens (when the main sidebar is hidden). On desktop, it will continue to adjust based on `sidebarIsPinned`.
    3.  **Responsive Sidebar Logic in `Sidebar.js`:**
        *   **Mobile View (e.g., screen width < `md` breakpoint):**
            *   The sidebar should be hidden by default.
            *   When `isMobileMenuOpen` is `true`, the sidebar should appear. It could be an overlay (fixed position, high z-index, covering part of the screen) or slide in from the left.
            *   The existing `isPinned` and `isHovered` logic should likely be disabled or adapted for mobile. On mobile, the sidebar, when open, might always be "expanded" in terms of showing text.
            *   The sidebar width should be appropriate for mobile (e.g., `w-3/4`, `w-full sm:w-64`).
            *   Add a close button (e.g., 'X' icon) within the mobile sidebar or make clicking the overlay background close the menu.
        *   **Desktop View (e.g., screen width >= `md` breakpoint):**
            *   Retain the current pinning and hover functionality.
    4.  **Main Content Adjustment in `MainLayout.js`:**
        *   On mobile screens, the main content area (`div` containing `<Outlet />`) should not have a `marginLeft` to account for a persistent sidebar. Its `marginLeft` should be `0`.

## 2. Dashboard Page: Hide Specific Stat Cards (Mobile)

*   **Goal:** Remove "Surat Masuk", "Surat Keluar", and "Bulan Ini" stat cards on mobile view.
*   **File to Modify:** `frontend/src/pages/DashboardPage.js`
*   **Steps:**
    1.  Identify the `StatCard` components for "Surat Masuk", "Surat Keluar", and "Bulan Ini".
    2.  Apply Tailwind's responsive utility classes to the parent `div` of each of these specific `StatCard` instances (e.g., `hidden md:flex`).
    3.  The grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) will adjust.

## 3. Archive Page: Responsive Search Field

*   **Goal:** Ensure the "Cari Dokumen" search field and its associated filters adjust to screen width on mobile.
*   **File to Modify:** `frontend/src/pages/ArchiveListPage.js`
*   **Steps:**
    1.  The search form uses `grid grid-cols-1 md:grid-cols-4 gap-4 items-end`.
    2.  The `input-field` class should ensure inputs take full width (e.g., `w-full`).
    3.  Verify the grid layout stacks elements correctly on mobile.
    4.  Verify the "Cari" button stacks and sizes appropriately on mobile.

## 4. Admin Page: Responsive Table

*   **Goal:** Make the table on the admin page adjust to screen width.
*   **File to Modify:** `frontend/src/pages/AdminDashboardPage.js`
*   **Steps:**
    1.  The `UserTable` component wraps the `table` in a `div` with `overflow-x-auto` and the `table` has `min-w-full`.
    2.  Verify this setup and the responsive column hiding (`hidden md:table-cell`, etc.).

## Visual Plan

```mermaid
graph TD
    A[Start: Mobile Responsiveness Task] --> B{1. Sidebar to Hamburger};
    B --> B1[Modify MainLayout.js: Add isMobileMenuOpen state, toggleMobileMenu function];
    B --> B2[Modify TopBar.js: Add md:hidden hamburger icon (RIGHT), call toggleMobileMenu, adjust left margin for mobile, RETAIN logo/title (LEFT)];
    B --> B3[Modify Sidebar.js: Conditional rendering/styling for mobile (overlay/slide-in), disable/adapt pin/hover for mobile];
    B --> B4[Modify MainLayout.js: Adjust main content marginLeft for mobile];

    A --> C{2. Dashboard: Hide Stat Cards};
    C --> C1[Modify DashboardPage.js: Apply 'hidden md:flex' to specific StatCards];

    A --> D{3. Archive Page: Responsive Search};
    D --> D1[Modify ArchiveListPage.js: Ensure 'input-field' is w-full, verify grid stacking (md:grid-cols-4 -> grid-cols-1)];

    A --> E{4. Admin Page: Responsive Table};
    E --> E1[Modify AdminDashboardPage.js: Verify existing 'overflow-x-auto' and responsive column hiding ('hidden md:table-cell')];

    B1 --> F[Test Sidebar on Mobile & Desktop];
    B2 --> F;
    B3 --> F;
    B4 --> F;
    C1 --> G[Test Dashboard on Mobile & Desktop];
    D1 --> H[Test Archive Search on Mobile & Desktop];
    E1 --> I[Test Admin Table on Mobile & Desktop];

    F --> Z[Completion];
    G --> Z;
    H --> Z;
    I --> Z;