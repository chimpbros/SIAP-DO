# UI Redesign Plan

This document outlines the plan for redesigning the application's UI based on the provided design images and clarification discussions.

## Current State Analysis Summary:

*   **Layout:** Current simple top navbar. New design requires a collapsible sidebar and a distinct top bar.
*   **Dashboard:** Current dashboard needs significant content and data fetching changes to match the new design's four summary cards, recent documents table, and line chart.
*   **Add Document Form:** Current form includes disposition/response fields. New design simplifies this, moving disposition/follow-up to a modal.
*   **Archive List & Modal:** Table structure, actions, and the response modal need a major overhaul to match the new "Arsip Surat" page and "Tambahkan Disposisi / Tindak Lanjut" modal.
*   **Styling:** A new visual style needs to be implemented (colors, spacing, components), likely involving updates to Tailwind configuration and global CSS.
*   **Assets:** Specific assets from `frontend/public/` are to be used as per `rules.md`.

## User Clarifications Incorporated:

*   **Dashboard Data:**
    *   "Surat Masuk" & "Surat Keluar" cards: Based on `tipe_surat`.
    *   "Total Surat" card: All-time total.
    *   "Recent Documents" table: 10 most recently added documents.
*   **"Tambahkan Disposisi / Tindak Lanjut" Modal & Backend:**
    *   **Disposisi:** New backend capability for "Disposisi attachment" upload. Keterangan uses existing `isi_disposisi`.
    *   **Tindak Lanjut:** Attachment uses existing `response_document`. Keterangan uses existing `response_keterangan`.
*   **Styling - Font:** A modern sans-serif font will be chosen.
*   **Sidebar Behavior:** Icons when collapsed, temporary expansion on hover, pinnable via click.

## Refined Redesign Plan:

**Phase 1: Core Layout & Global Styling**
1.  **Update Global Styles:**
    *   Modify [`frontend/tailwind.config.js`](frontend/tailwind.config.js) for the new color palette and theme settings.
    *   Update [`frontend/src/index.css`](frontend/src/index.css) for base styling, font imports (chosen sans-serif), and global overrides.
2.  **Create New Layout Components:**
    *   Develop a new `Sidebar` component:
        *   Implement collapsible behavior (icons only when collapsed, expands on hover, pinnable via click).
        *   Include navigation links: Akun, Dashboard, Daftar Arsip, Tambah Surat, Admin, Logout, using specified assets.
    *   Develop a new `TopBar` component:
        *   Display main logo ([`polri.png`](frontend/public/polri.png)) and "Sistem Informasi Administrasi Pengarsipan" title.
        *   Include the global search bar.
3.  **Refactor `MainLayout.js`:**
    *   Integrate the new `Sidebar` and `TopBar`.
    *   Ensure correct positioning for `<Outlet />`.

**Phase 2: Dashboard Redesign (`DashboardPage.js`)**
1.  **Implement Summary Cards:**
    *   "Total Surat" (all-time count).
    *   "Surat Masuk" (count based on `tipe_surat`).
    *   "Surat Keluar" (count based on `tipe_surat`).
    *   "Bulan Ini" (count of documents added in the current month).
    *   Use icons specified in [`rules.md`](rules.md).
2.  **Implement Recent Documents Table:**
    *   Display 10 most recently added documents. Columns: "No. Surat," "Tipe," "Jenis," "Perihal," "Pengirim."
3.  **Implement "Statistik Surat Bulanan" Chart:**
    *   Use a line chart.
    *   Data for the last 12 months as per [`rules.md`](rules.md).
4.  **Update Data Fetching:**
    *   Modify [`frontend/src/services/statsService.js`](frontend/src/services/statsService.js) and backend ([`statsController.js`](backend/controllers/statsController.js), [`statsRoutes.js`](backend/routes/statsRoutes.js)) for these new metrics.

**Phase 3: "Tambah Surat" Page Redesign (`AddDocumentPage.js`)**
1.  **Update Form Fields:**
    *   Include: Tipe Surat, Jenis Surat, Nomor Surat, Perihal, Pengirim, Lampiran.
    *   "Tipe Surat" and "Jenis Surat" as dropdowns (per [`rules.md`](rules.md)).
2.  **Styling:** Apply new design styling.
3.  **Logic Adjustment:** Remove initial `isi_disposisi`, `response_document`, `response_keterangan` fields.

**Phase 4: "Arsip Surat" Page & Modal Redesign (`ArchiveListPage.js`)**
1.  **Update Page Header:** Add "Search" and "Export" buttons.
2.  **Modify Table Structure:** Columns: "Nomor Surat," "Tipe," "Jenis," "Perihal," "Pengirim," "Uploader," "Disposisi / Tindak Lanjut," "Aksi."
3.  **Implement "Disposisi / Tindak Lanjut" Column & Modal:**
    *   Display green plus or three-dots icon based on data (rule 24, [`rules.md`](rules.md)).
    *   Create/Refactor modal component (from [`AddResponseModal.js`](frontend/src/components/AddResponseModal.js)):
        *   **Disposisi Section:** Keterangan input (maps to `isi_disposisi`), new file upload for "Lampiran Disposisi."
        *   **Tindak Lanjut Section:** Keterangan input (maps to `response_keterangan`), file upload (maps to `response_document`).
        *   Use icons from [`rules.md`](rules.md).
4.  **Update "Aksi" Column:** View ([`viewArchive.png`](frontend/public/viewArchive.png)) and delete ([`binArchive.png`](frontend/public/binArchive.png)) icons.
5.  **Backend Adjustments for Disposition/Follow-up:**
    *   Modify [`documentService.js`](frontend/src/services/documentService.js), [`documentController.js`](backend/controllers/documentController.js), [`documentRoutes.js`](backend/routes/documentRoutes.js).
    *   Add capability to upload and store "Lampiran Disposisi." This likely requires a new field in the `Document` model ([`Document.js`](backend/models/Document.js)) and database schema (e.g., `disposition_attachment_path`).

**Phase 5: Asset Integration & Final Styling**
1.  **Verify Asset Usage:** Ensure all icons/images from [`frontend/public/`](frontend/public/) as per [`rules.md`](rules.md) are used.
2.  **Consistent Styling:** Apply consistent styling across all components to match design images.

## Mermaid Diagram (Component Structure)

```mermaid
graph TD
    App --> MainLayout
    MainLayout --> TopBar
    MainLayout --> Sidebar
    MainLayout --> PageContent(Outlet for Pages)

    PageContent --> DashboardPage
    PageContent --> AddDocumentPage
    PageContent --> ArchiveListPage
    PageContent --> ProfilePage
    PageContent --> AdminDashboardPage
    PageContent --> LoginPage
    PageContent --> RegisterPage

    ArchiveListPage --> DispositionFollowUpModal

    subgraph TopBar
        Logo
        Title
        GlobalSearch
    end

    subgraph Sidebar
        UserIcon
        DashboardLink
        ArchiveListLink
        AddDocumentLink
        AdminLink
        LogoutLink
    end

    subgraph DashboardPage
        SummaryCard1
        SummaryCard2
        SummaryCard3
        SummaryCard4
        RecentDocsTable
        MonthlyStatsChart
    end

    subgraph ArchiveListPage
        SearchButton
        ExportButton
        DocumentsTable
    end

    subgraph DispositionFollowUpModal
        DispositionSection[Disposisi: Keterangan + Upload]
        FollowUpSection[Tindak Lanjut: Keterangan + Upload]
    end