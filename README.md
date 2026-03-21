<div align="center" class="logo">
<img width="100px" src="assets/logo_bg_none.png">
</div>

<div align="center">
<h1>Rounded Tabs</h1>
</div>

<div align="center">
<img src="assets/drkryzroundedtabs.png">
</div>

RoundedTabs gives VS Code a softer, more modern workbench by appending a managed CSS block to the current `workbench.desktop.main.css` instead of replacing the full file.

That means the extension stays reversible, safer across VS Code updates, and easier to keep in sync with the current installation.

## Highlights

- Keeps the original VS Code workbench CSS intact and injects only a managed block.
- Refreshes its local backup whenever the current base workbench CSS changes, so new styles are always layered on top of the latest VS Code file.
- Removes only its own block on restore, without overwriting the rest of the file.
- Can reapply styles after VS Code updates replace the workbench CSS file.
- Supports broader rounded surfaces with a safer `balanced` preset.
- Includes optional soft animations for tabs, panes, menus, quick input, notifications, terminal tabs, and header actions.
- Smooths tab creation, Explorer motion, and integrated terminal surfaces without exposing the panel background.

<div align="center">
<h1>Commands</h1>
</div>

### Apply Rounded Tabs
- **Command:** `drkryz-roundedtabs.configure_now`
- **Description:** Reads the current `workbench.desktop.main.css` from your VS Code installation and appends the RoundedTabs managed CSS block.
- **Instructions:** Run the command and reload VS Code when prompted. If VS Code cannot be written, reopen it with elevated permissions or configure `drkryz-roundedtabs.installPath`.

### Restore Defaults
- **Command:** `drkryz-roundedtabs.restore`
- **Description:** Removes only the CSS block managed by RoundedTabs and restores the original workbench CSS.
- **Instructions:** Run the command and reload VS Code when prompted.

### Enable Soft Animations
- **Command:** `drkryz-roundedtabs.enableAnimations`
- **Description:** Enables subtle CSS animations for tabs, context menus, quick input, notifications, and safe title/header actions.
- **Instructions:** If RoundedTabs is already active, the extension refreshes the managed CSS block immediately and prompts for reload. If RoundedTabs is not active yet, run `Apply Rounded Tabs` after enabling it.

### Disable Soft Animations
- **Command:** `drkryz-roundedtabs.disableAnimations`
- **Description:** Turns off the optional animation layer while keeping the rounded surfaces intact.
- **Instructions:** Run the command and reload when prompted if RoundedTabs is already applied.

## How It Works

- RoundedTabs locates the active `workbench.desktop.main.css` from the current VS Code installation.
- It strips any old RoundedTabs managed block and appends a fresh one based on the current settings.
- It stores backup and state data in extension storage instead of shipping a stale CSS file inside the extension.
- Before rewriting the workbench CSS, it refreshes its backup whenever the detected base CSS or target file changes.
- If `drkryz-roundedtabs.autoReapplyOnStartup` is enabled, it can repair the injected block after an update changes the workbench CSS file.

## Settings

- `drkryz-roundedtabs.autoReapplyOnStartup`: Reapplies the managed CSS block after VS Code updates its workbench file.
- `drkryz-roundedtabs.stylePreset`: Choose `balanced` for broader workbench rounding or `tabs-only` for a narrower, safer scope.
- `drkryz-roundedtabs.radius`: Controls the base corner radius used in tabs and other rounded surfaces.
- `drkryz-roundedtabs.tabGap`: Controls the spacing between editor tabs.
- `drkryz-roundedtabs.enableAnimations`: Opt-in setting for smooth tabs, menus, quick input, notifications, and header actions.
- `drkryz-roundedtabs.installPath`: Optional custom installation root, resources folder, or direct path to `workbench.desktop.main.css`.

## Rounded Coverage

### `tabs-only`
- Editor tab groups and individual tabs
- Sidebar and auxiliary bar containers
- Explorer and list rows inside side surfaces

### `balanced`
- Everything from `tabs-only`
- Breadcrumbs and editor title actions
- Activity bar and panel surfaces
- Titlebar command center and safe header actions
- Quick input, notifications, and context menus
- Explorer wrappers and sidebar tree containers
- Integrated terminal containers, terminal tab entries, and terminal surface wrappers
- Input boxes and safe editor widgets such as suggest, find, hover, and rename

## Safety Notes

- RoundedTabs is intentionally CSS-only and does not monkey-patch VS Code runtime JavaScript.
- The extension depends on write access to the VS Code installation directory.
- On Windows, you may need to reopen VS Code as administrator before applying changes.
- If VS Code changes its internal structure in a future update, RoundedTabs is designed to re-detect the current CSS file and reapply only its managed block.
