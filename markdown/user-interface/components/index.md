---
skillParent: dcc-ui
skillName: ui-components-catalog
skillDescription: "Catalog of all common-ui.bs.js Vue components (SplitView, SplitContainer, FirstRunOrchestrator, Disclaimer/Button/Page, Changelogs/ChangelogsButton, DataBsFooter, DataBsBanner, UndoRedoButtons, NavigationBar, SystemStatus, AppSwitcher, SettingsButton, Onboarding/OnboardingRestartButton) with one-line summaries. Use to discover which DCC UI component fits a need before opening its detailed reference."
---

# Components

## [SplitView](splitview.md)
A resizable split view layout component supporting both horizontal and vertical orientations with customizable panes.

## [FirstRunOrchestrator](first-run-orchestrator.md)
Orchestrates first-run experience flows (Disclaimer, Changelogs, Onboarding) with priority-based ordering, cookie-based completion tracking, and automatic mounting of the next pending flow.

## [DisclaimerLlm](disclaimer.md)
A disclaimer modal component that users must accept before using the application, typically used for AI/ML applications. Now orchestrated by FirstRunOrchestrator and emits a finished event on acceptance.

## DataBsBanner
A banner component displaying a link to the data science and AI page.

## [DataBsFooter](databsfooter.md)
A footer component with links to data science and AI resources, supporting additional content slots. Includes DisclaimerButton and ChangelogsButton in the center slot by default.

## [SplitContainer](splitcontainer.md)
A responsive card-like container with a header and two side-by-side content areas that stack vertically on mobile devices.

## [UndoRedoButtons](undoredobuttons.md)
Provides undo and redo functionality with keyboard shortcuts, tooltips, and automatic button state management.

## [Changelogs](changelogs.md)
Displays application changelog information in a custom overlay with backdrop blur, driven by the FirstRunOrchestrator. Accepts releases as a prop and emits a finished event when closed.

## [ChangelogsButton](changelogsbutton.md)
A button that re-triggers the Changelogs flow on demand by resetting the last-read cookie, with responsive icon-only (mobile) and full label (desktop) variants. Displays the newest release version as a badge.

## [NavigationBar](navigationbar.md)
A responsive navigation bar with language switching, system status indicator, onboarding restart button, optional app switcher, and customizable content areas with i18n integration.

## [SystemStatus](systemstatus.md)
A health status indicator that polls the server to verify connectivity and displays a warning icon with tooltip when offline.

## [AppSwitcher](appswitcher.md)
A Google-style app switcher popover with a grid of app tiles, supporting icons, images, and initials fallback, plus an optional footer link.

## [SettingsButton](settingsbutton.md)
A cog-trigger dropdown button for settings/options menus, accepting `DropdownMenuItem` entries via props.

## [Onboarding](onboarding.md)
A renderless component that drives interactive guided tours using driver.js, supporting phased step builders, cookie-based persistence, and orchestrated startup via FirstRunOrchestrator after the disclaimer is accepted.

## OnboardingRestartButton
A button that restarts the onboarding tour on demand by clearing the tour-completed cookie, allowing users to replay the guided tour.
