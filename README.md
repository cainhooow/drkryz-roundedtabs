<div align="center" class="logo">
<img width="100px" src="assets/logo_bg_none.png">
</div>

<div align="center">
<h1>Rounded Tabs</h1>
</div>

<div align="center">
<img src="assets/drkryzroundedtabs.png">
</div>

RoundedTabs keeps the original VS Code workbench CSS and appends a small managed block with rounded tabs plus softer workbench surfaces.

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

## What changed

- RoundedTabs no longer depends on shipping a stale copy of the full VS Code workbench CSS.
- The extension stores its backup and state in extension storage instead of `src/css`.
- If `drkryz-roundedtabs.autoReapplyOnStartup` is enabled, the extension can reapply the rounded styles after a VS Code update replaces the workbench CSS file.
- Changing the RoundedTabs style settings now refreshes the managed CSS block automatically when the extension is active.

## Settings

- `drkryz-roundedtabs.autoReapplyOnStartup`: Reapplies the managed CSS block after VS Code updates its workbench file.
- `drkryz-roundedtabs.stylePreset`: Choose `balanced` for broader workbench rounding or `tabs-only` for a narrower, safer scope.
- `drkryz-roundedtabs.radius`: Controls the base corner radius used in tabs and other rounded surfaces.
- `drkryz-roundedtabs.tabGap`: Controls the spacing between editor tabs.
- `drkryz-roundedtabs.installPath`: Optional custom installation root, resources folder, or direct path to `workbench.desktop.main.css`.

## Rounded coverage

- Editor tab groups and individual tabs
- Sidebar and auxiliary bar containers
- Explorer/tree rows in side surfaces
- Activity bar and panel surfaces in the `balanced` preset
- Quick input, notifications, and context menus in the `balanced` preset
