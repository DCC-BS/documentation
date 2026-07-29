---
---
skillParent: dcc-ui
skillName: ui-components-catalog
skillDescription: "Catalog of all common-ui.bs.js Vue components (SplitView, SplitContainer, FirstRunOrchestrator, Disclaimer/Button/Page, Changelogs/ChangelogsButton, DataBsFooter, DataBsBanner, UndoRedoButtons, NavigationBar, OnlineStatus, Onboarding/OnboardingRestartButton) with one-line summaries. Use to discover which DCC UI component fits a need before opening its detailed reference."
---

# Components

## [SplitView](splitview.md)
A resizable split view layout component supporting both horizontal and vertical orientations with customizable panes.

## [FirstRunOrchestrator](firstrunorchestrator.md)
Orchestrates first-run experience flows (Disclaimer, Changelogs, Onboarding) with priority-based ordering, cookie-based completion tracking, and automatic mounting of the next pending flow.

## [DisclaimerLlm](disclaimer.md)
A disclaimer modal component that users must accept before using the application, typically used for AI/ML applications. Now orchestrated by FirstRunOrchestrator and emits a finished event on acceptance.

## DataBsBanner
A banner component displaying a link to the data science and AI page.

## [DataBsFooter](databsfooter.md)
A footer component with links to data science and AI resources, supporting additional content slots.

## [SplitContainer](splitcontainer.md)
A responsive card-like container with a header and two side-by-side content areas that stack vertically on mobile devices.

## [UndoRedoButtons](undoredobuttons.md)
Provides undo and redo functionality with keyboard shortcuts, tooltips, and automatic button state management.

## [Changelogs](changelogs.md)
Displays application changelog information in a modal, driven by the FirstRunOrchestrator. Accepts releases as a prop and emits a finished event when closed.

## ChangelogsButton
A button that re-triggers the Changelogs flow on demand by resetting the last-read cookie, with responsive icon-only (mobile) and full label (desktop) variants.

## [NavigationBar](navigationbar.md)
A responsive navigation bar with language switching, disclaimer button, changelogs button, onboarding restart button, and customizable content areas with i18n integration.

## [OnlineStatus](onlinestatus.md)
A real-time health status indicator that polls the server to verify connectivity and displays visual status with tooltips.

## [Onboarding](onboarding.md)
A renderless component that drives interactive guided tours using driver.js, supporting phased step builders, cookie-based persistence, and orchestrated startup via FirstRunOrchestrator after the disclaimer is accepted.

## OnboardingRestartButton
A button that restarts the onboarding tour on demand by clearing the tour-completed cookie, allowing users to replay the guided tour.