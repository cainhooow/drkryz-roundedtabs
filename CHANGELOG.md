# Change Log

## 0.4.1

- Reworked the extension to append a managed CSS block to the current VS Code workbench CSS instead of relying on a shipped stale copy.
- Added safer restore behavior so RoundedTabs removes only its own injected block.
- Added startup repair and auto-reapply support after VS Code updates replace the workbench CSS file.
- Improved workbench CSS path detection for newer versioned VS Code installation layouts.
- Expanded rounded coverage across tabs, sidebars, auxiliary bar, activity bar, panels, quick input, notifications, context menus, breadcrumbs, title actions, input boxes, and safe editor widgets.
- Added optional soft animations for tabs, menus, quick input, notifications, and header actions.
- Improved tab entry motion for newly opened tabs and rounded the integrated terminal surface without gray background bleed.
- Extended the motion layer to more VS Code layout transitions such as pane movement, split views, terminal surfaces, and terminal tabs.
- Improved Explorer/sidebar wrapper coverage so the tree surface is applied more consistently across the full view.
- Refreshed backup handling so RoundedTabs preserves the newest detected base workbench CSS before rewriting it.
- Updated project dependencies and aligned the extension with newer VS Code engine support.

## 0.2.3

- macOS implementation test support.

## 0.2.0

- UI bug fixes.

## 0.1.9

- Added backup file handling for Windows.

## 0.1.5

- Expanded rounded styling in VS Code.

## 0.1.3

- Added Windows support.
- Let the user provide the installation directory if the default path is not found on Windows.

## 0.0.8

- Let the user provide the installation directory if the default path is not found on Linux.

## 0.0.2

- Added early Windows test support.
