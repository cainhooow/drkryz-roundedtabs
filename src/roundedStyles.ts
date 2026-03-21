import {
    DEFAULT_STYLE_OPTIONS,
} from "./roundedTabsConfig";
import type {
    RoundedTabsStyleOptions,
} from "./roundedTabsConfig";

const STYLE_START_MARKER = "/* drkryz-roundedtabs:start */";
const STYLE_END_MARKER = "/* drkryz-roundedtabs:end */";

const MANAGED_BLOCK_PATTERN = new RegExp(
    `${escapeForRegex(STYLE_START_MARKER)}[\\s\\S]*?${escapeForRegex(STYLE_END_MARKER)}\\s*`,
    "g"
);

export function buildManagedWorkbenchCss(
    workbenchCss: string,
    styleOptions: RoundedTabsStyleOptions = DEFAULT_STYLE_OPTIONS
): string {
    const baseCss = stripManagedRoundedTabsBlock(workbenchCss).trimEnd();

    return `${baseCss}\n\n${buildRoundedTabsCssBlock(styleOptions)}\n`;
}

export function hasManagedRoundedTabsBlock(workbenchCss: string): boolean {
    MANAGED_BLOCK_PATTERN.lastIndex = 0;
    return MANAGED_BLOCK_PATTERN.test(workbenchCss);
}

export function stripManagedRoundedTabsBlock(workbenchCss: string): string {
    MANAGED_BLOCK_PATTERN.lastIndex = 0;
    return workbenchCss.replace(MANAGED_BLOCK_PATTERN, "").trimEnd();
}

export function buildRoundedTabsCssBlock(
    styleOptions: RoundedTabsStyleOptions = DEFAULT_STYLE_OPTIONS
): string {
    const cssBlocks = [
        `${STYLE_START_MARKER}
/* RoundedTabs keeps the original workbench CSS intact and appends only this managed block. */
/* preset: ${styleOptions.preset}; radius: ${styleOptions.radius}px; tab-gap: ${styleOptions.tabGap}px; animations: ${styleOptions.enableAnimations ? "on" : "off"} */
/* Some workbench surfaces receive runtime styles, so rounded properties stay intentionally important here. */
${buildBaseRoundedCss(styleOptions)}`,
    ];

    if (styleOptions.preset === "balanced") {
        cssBlocks.push(buildBalancedRoundedCss());
    }

    if (styleOptions.enableAnimations) {
        cssBlocks.push(buildAnimationCss());
    }

    cssBlocks.push(STYLE_END_MARKER);

    return cssBlocks.join("\n");
}

function escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBaseRoundedCss(styleOptions: RoundedTabsStyleOptions): string {
    const surfaceRadius = Math.max(8, styleOptions.radius - 2);
    const itemRadius = Math.max(6, styleOptions.radius - 4);
    const chipRadius = Math.max(4, styleOptions.radius - 6);

    return `:root {
    --drkryz-roundedtabs-radius: ${styleOptions.radius}px;
    --drkryz-roundedtabs-radius-md: ${surfaceRadius}px;
    --drkryz-roundedtabs-radius-sm: ${itemRadius}px;
    --drkryz-roundedtabs-radius-xs: ${chipRadius}px;
    --drkryz-roundedtabs-gap: ${styleOptions.tabGap}px;
    --drkryz-roundedtabs-duration-fast: 140ms;
    --drkryz-roundedtabs-duration-normal: 220ms;
    --drkryz-roundedtabs-duration-slow: 280ms;
    --drkryz-roundedtabs-duration-layout: 260ms;
    --drkryz-roundedtabs-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --drkryz-roundedtabs-ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
    --drkryz-roundedtabs-editor-surface: var(--vscode-editorGroupHeader-tabsBackground, var(--vscode-editor-background));
    --drkryz-roundedtabs-sidebar-surface: var(--vscode-sideBar-background, var(--vscode-editor-background));
    --drkryz-roundedtabs-sidebar-header-surface: var(--vscode-sideBarSectionHeader-background, var(--vscode-sideBar-background, var(--vscode-editor-background)));
    --drkryz-roundedtabs-activitybar-surface: var(--vscode-activityBar-background, var(--vscode-sideBar-background));
    --drkryz-roundedtabs-panel-surface: var(--vscode-panel-background, var(--vscode-editor-background));
    --drkryz-roundedtabs-terminal-surface: var(--vscode-terminal-background, var(--vscode-panel-background));
    --drkryz-roundedtabs-widget-surface: var(--vscode-quickInput-background, var(--vscode-editorWidget-background));
    --drkryz-roundedtabs-notification-surface: var(--vscode-notifications-background, var(--vscode-editorWidget-background));
    --drkryz-roundedtabs-menu-surface: var(--vscode-menu-background, var(--vscode-editorWidget-background));
    --drkryz-roundedtabs-titlebar-surface: var(--vscode-titleBar-activeBackground, var(--vscode-editor-background));
    --drkryz-roundedtabs-widget-border: var(--vscode-widget-border, var(--vscode-contrastBorder, transparent));
    --drkryz-roundedtabs-chrome-surface: var(--vscode-editor-background);
}

.monaco-workbench .part.editor > .content .editor-group-container,
.monaco-workbench .part.editor > .content .editor-group-container > .editor-container {
    background-color: transparent !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-editor-surface) !important;
    background-clip: padding-box !important;
    box-sizing: border-box !important;
    padding-top: 5px;
    padding-bottom: 3px;
    padding-left: 6px;
    padding-right: 6px;
    overflow: hidden !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-and-actions-container,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container {
    gap: var(--drkryz-roundedtabs-gap);
    background-color: transparent !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-and-actions-container {
    border-radius: inherit !important;
    background-clip: padding-box !important;
    align-items: center;
    padding-top: 2px;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container {
    align-items: center;
    padding-top: 2px;
    padding-bottom: 2px;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    overflow: hidden !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.sizing-fit {
    margin-left: 0;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:focus-within {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title > .editor-actions,
.monaco-workbench .part.editor > .content .editor-group-container > .title > .title-actions,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-actions .action-label,
.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions .action-label,
.monaco-workbench .part.editor > .content .editor-group-container > .title .title-actions .action-label {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title > .editor-actions,
.monaco-workbench .part.editor > .content .editor-group-container > .title > .title-actions {
    align-self: center;
}

.monaco-workbench .part.editor .breadcrumbs-control,
.monaco-workbench .part.editor .breadcrumbs-below-tabs .monaco-breadcrumbs,
.monaco-workbench .part.editor .breadcrumbs-below-tabs .monaco-breadcrumb-item {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-color: var(--drkryz-roundedtabs-editor-surface) !important;
    background-clip: padding-box !important;
}

#workbench\\.parts\\.sidebar,
.monaco-workbench .part.sidebar,
.monaco-workbench .part.auxiliarybar,
.monaco-workbench .part.sidebar > .content,
.monaco-workbench .part.auxiliarybar > .content,
.monaco-workbench .part.sidebar > .content > .composite,
.monaco-workbench .part.auxiliarybar > .content > .composite,
.monaco-workbench .pane-composite-part.sidebar,
.monaco-workbench .pane-composite-part.sidebar > .content,
.monaco-workbench .pane-composite-part.auxiliarybar,
.monaco-workbench .pane-composite-part.auxiliarybar > .content,
.monaco-workbench .part.sidebar .monaco-pane-view,
.monaco-workbench .part.auxiliarybar .monaco-pane-view,
.monaco-workbench .part.sidebar .monaco-pane-view > .monaco-split-view2,
.monaco-workbench .part.auxiliarybar .monaco-pane-view > .monaco-split-view2,
.monaco-workbench .part.sidebar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element,
.monaco-workbench .part.auxiliarybar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element,
.monaco-workbench .part.sidebar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container,
.monaco-workbench .part.auxiliarybar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-sidebar-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar,
.monaco-workbench .part.auxiliarybar {
    overflow: hidden !important;
}

.monaco-workbench .part.sidebar > .title,
.monaco-workbench .part.sidebar > .composite.title,
.monaco-workbench .part.auxiliarybar > .title,
.monaco-workbench .part.auxiliarybar > .composite.title,
.monaco-workbench .pane-composite-part.sidebar > .title,
.monaco-workbench .pane-composite-part.auxiliarybar > .title {
    border-radius: var(--drkryz-roundedtabs-radius) var(--drkryz-roundedtabs-radius) 0 0 !important;
    background-color: var(--drkryz-roundedtabs-sidebar-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar > .content,
.monaco-workbench .part.auxiliarybar > .content {
    overflow: hidden !important;
    border-radius: 0 0 var(--drkryz-roundedtabs-radius) var(--drkryz-roundedtabs-radius) !important;
}

.monaco-workbench .part.sidebar .monaco-scrollable-element[role="presentation"] > .split-view-container,
.monaco-workbench .part.auxiliarybar .monaco-scrollable-element[role="presentation"] > .split-view-container {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    background-color: transparent !important;
}

.monaco-workbench .part.sidebar .pane,
.monaco-workbench .part.auxiliarybar .pane {
    border-radius: 0 !important;
    overflow: visible !important;
    background-color: transparent !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar .pane > .pane-header,
.monaco-workbench .part.sidebar .pane > .pane-body,
.monaco-workbench .part.auxiliarybar .pane > .pane-header,
.monaco-workbench .part.auxiliarybar .pane > .pane-body {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar .pane > .pane-header,
.monaco-workbench .part.auxiliarybar .pane > .pane-header {
    background-color: var(--drkryz-roundedtabs-sidebar-header-surface) !important;
}

.monaco-workbench .part.sidebar .pane > .pane-body,
.monaco-workbench .part.auxiliarybar .pane > .pane-body {
    background-color: transparent !important;
}

.monaco-workbench .part.sidebar .explorer-folders-view,
.monaco-workbench .part.sidebar .tree-explorer-viewlet-tree-view,
.monaco-workbench .part.sidebar .tree-explorer-viewlet-tree-view > .customview-tree,
.monaco-workbench .part.sidebar .customview-tree,
.monaco-workbench .part.sidebar .customview-tree > .monaco-list,
.monaco-workbench .part.sidebar .customview-tree > .monaco-list > .monaco-scrollable-element,
.monaco-workbench .part.sidebar .customview-tree > .monaco-list > .monaco-scrollable-element > .monaco-list-rows,
.monaco-workbench .part.auxiliarybar .tree-explorer-viewlet-tree-view,
.monaco-workbench .part.auxiliarybar .tree-explorer-viewlet-tree-view > .customview-tree,
.monaco-workbench .part.auxiliarybar .customview-tree,
.monaco-workbench .part.auxiliarybar .customview-tree > .monaco-list,
.monaco-workbench .part.auxiliarybar .customview-tree > .monaco-list > .monaco-scrollable-element,
.monaco-workbench .part.auxiliarybar .customview-tree > .monaco-list > .monaco-scrollable-element > .monaco-list-rows,
.monaco-workbench .part.sidebar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view,
.monaco-workbench .part.auxiliarybar .monaco-pane-view > .monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view {
    min-height: 100%;
    background-color: transparent !important;
    border-radius: 0 !important;
}

.monaco-workbench .part.sidebar > .title .action-label,
.monaco-workbench .part.auxiliarybar > .title .action-label,
.monaco-workbench .part.sidebar .pane-header .action-label,
.monaco-workbench .part.auxiliarybar .pane-header .action-label {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar .monaco-list-row,
.monaco-workbench .part.sidebar .monaco-list-row.focused,
.monaco-workbench .part.sidebar .monaco-list-row.selected,
.monaco-workbench .part.sidebar .monaco-list-row:hover,
.monaco-workbench .part.auxiliarybar .monaco-list-row,
.monaco-workbench .part.auxiliarybar .monaco-list-row.focused,
.monaco-workbench .part.auxiliarybar .monaco-list-row.selected,
.monaco-workbench .part.auxiliarybar .monaco-list-row:hover {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}`;
}

function buildBalancedRoundedCss(): string {
    return `
.monaco-workbench .part.activitybar,
.monaco-workbench .part.activitybar > .content {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-activitybar-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.activitybar .action-item .action-label,
.monaco-workbench .part.panel .pane-header .action-label,
.monaco-workbench .part.panel .composite.title .action-label,
.monaco-workbench .part.titlebar .action-label,
.monaco-workbench .part.titlebar .command-center-center,
.monaco-workbench .part.titlebar .window-title {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.titlebar .menubar > .menubar-menu-button,
.monaco-workbench .part.titlebar .menubar > .menubar-menu-button > .menubar-menu-title {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.titlebar .command-center-center,
.monaco-workbench .part.titlebar .window-title {
    background-color: var(--drkryz-roundedtabs-titlebar-surface) !important;
}

.monaco-workbench .part.panel > .content,
.monaco-workbench .part.panel .pane-composite-part > .title,
.monaco-workbench .part.panel .pane-composite-part > .content {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    background-color: var(--drkryz-roundedtabs-panel-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.panel .pane > .pane-header,
.monaco-workbench .part.panel .pane > .pane-body {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-color: var(--drkryz-roundedtabs-panel-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.panel .pane-body.integrated-terminal,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-outer-container,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-groups-container,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-group,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-instance,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-split-pane,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-wrapper,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm-rows,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm-screen,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm-viewport,
.monaco-workbench .terminal-editor .terminal-instance,
.monaco-workbench .terminal-editor .terminal-wrapper,
.monaco-workbench .terminal-editor .terminal-group,
.monaco-workbench .terminal-editor .terminal-split-pane,
.monaco-workbench .terminal-editor .terminal-outer-container,
.monaco-workbench .terminal-editor .xterm,
.monaco-workbench .terminal-editor .xterm-rows,
.monaco-workbench .terminal-editor .xterm-screen,
.monaco-workbench .terminal-editor .xterm-viewport {
    background-color: var(--drkryz-roundedtabs-terminal-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.panel .pane-body.integrated-terminal,
.monaco-workbench .terminal-editor {
    overflow: hidden !important;
}

.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-outer-container,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-instance,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-group,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-split-pane,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-wrapper,
.monaco-workbench .terminal-editor .terminal-outer-container,
.monaco-workbench .terminal-editor .terminal-instance,
.monaco-workbench .terminal-editor .terminal-group,
.monaco-workbench .terminal-editor .terminal-split-pane,
.monaco-workbench .terminal-editor .terminal-wrapper {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    overflow: hidden !important;
    box-shadow: inset 0 0 0 1px var(--drkryz-roundedtabs-widget-border) !important;
}

.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-wrapper,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm-screen,
.monaco-workbench .part.panel .pane-body.integrated-terminal .xterm-viewport,
.monaco-workbench .terminal-editor .terminal-wrapper,
.monaco-workbench .terminal-editor .xterm,
.monaco-workbench .terminal-editor .xterm-screen,
.monaco-workbench .terminal-editor .xterm-viewport {
    border-radius: inherit !important;
}

.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-tabs-entry,
.monaco-workbench .terminal-editor .terminal-tabs-entry {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.panel .monaco-list-row,
.monaco-workbench .part.panel .monaco-list-row.focused,
.monaco-workbench .part.panel .monaco-list-row.selected,
.monaco-workbench .monaco-list-row.quick-input-list-entry,
.quick-input-list .monaco-list-row,
.quick-input-list .monaco-list-row.focused,
.quick-input-list .monaco-list-row.selected,
.quick-input-list .monaco-list-row:hover {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}

.quick-input-widget,
.quick-input-widget .quick-input-header,
.quick-input-widget .quick-input-filter .monaco-inputbox,
.quick-input-widget .quick-input-list,
.quick-input-widget .quick-input-action,
.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast,
.context-view .context-view-block,
.context-view .monaco-menu-container {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    overflow: hidden !important;
    background-clip: padding-box !important;
}

.quick-input-widget,
.quick-input-widget .quick-input-header,
.quick-input-widget .quick-input-filter .monaco-inputbox {
    background-color: var(--drkryz-roundedtabs-widget-surface) !important;
}

.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast {
    background-color: var(--drkryz-roundedtabs-notification-surface) !important;
}

.context-view .context-view-block,
.context-view .monaco-menu-container {
    background-color: var(--drkryz-roundedtabs-menu-surface) !important;
}

.monaco-workbench .monaco-inputbox,
.monaco-workbench .monaco-inputbox > .ibwrapper,
.monaco-workbench .search-widget .monaco-inputbox,
.monaco-workbench .settings-editor .settings-search-container,
.monaco-workbench .settings-editor .settings-search-container .monaco-inputbox {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    overflow: hidden !important;
    background-clip: padding-box !important;
}

.context-view .monaco-menu .monaco-action-bar.vertical .action-item,
.context-view .monaco-menu .monaco-action-bar.vertical .action-item .action-label,
.context-view .monaco-menu .monaco-action-bar.vertical .action-item .action-menu-item,
.monaco-workbench > .notifications-center .notification-list-item,
.monaco-workbench > .notifications-toasts .notification-list-item {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}

.monaco-editor .find-widget,
.monaco-editor .suggest-widget,
.monaco-editor .parameter-hints-widget,
.monaco-editor .rename-box,
.monaco-hover,
.monaco-editor .zone-widget,
.monaco-editor .peekview-widget {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    overflow: hidden !important;
    background-clip: padding-box !important;
}

.monaco-editor .find-widget,
.monaco-editor .suggest-widget,
.monaco-editor .parameter-hints-widget,
.monaco-editor .rename-box,
.monaco-hover {
    background-color: var(--drkryz-roundedtabs-widget-surface) !important;
    border-color: var(--drkryz-roundedtabs-widget-border) !important;
}

.monaco-workbench,
.monaco-workbench .part.editor,
.monaco-workbench .part.editor > .content {
    background-color: var(--drkryz-roundedtabs-chrome-surface) !important;
}`;
}

function buildAnimationCss(): string {
    return `
@keyframes drkryz-roundedtabs-surface-in {
    from {
        opacity: 0;
        transform: translateY(6px) scale(0.985);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes drkryz-roundedtabs-tab-activate {
    from {
        opacity: 0.9;
        transform: translateY(4px) scale(0.99);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes drkryz-roundedtabs-tab-enter {
    from {
        opacity: 0;
        transform: translateY(6px) scale(0.985);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-tabs-entry,
.monaco-workbench .terminal-editor .terminal-tabs-entry,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-actions .action-label,
.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions .action-label,
.monaco-workbench .part.editor > .content .editor-group-container > .title .title-actions .action-label,
.monaco-workbench .part.editor .breadcrumbs-control,
.monaco-workbench .part.sidebar .monaco-list-row,
.monaco-workbench .part.auxiliarybar .monaco-list-row,
.monaco-workbench .part.panel .monaco-list-row,
.monaco-workbench .part.sidebar > .title .action-label,
.monaco-workbench .part.auxiliarybar > .title .action-label,
.monaco-workbench .part.panel .pane-header .action-label,
.monaco-workbench .part.activitybar .action-item .action-label,
.monaco-workbench .part.titlebar .action-label,
.monaco-workbench .part.titlebar .command-center-center,
.quick-input-list .monaco-list-row,
.context-view .monaco-menu .monaco-action-bar.vertical .action-item .action-label,
.monaco-workbench > .notifications-center .notification-list-item,
.monaco-workbench > .notifications-toasts .notification-list-item {
    transition:
        background-color var(--drkryz-roundedtabs-duration-fast) var(--drkryz-roundedtabs-ease),
        color var(--drkryz-roundedtabs-duration-fast) var(--drkryz-roundedtabs-ease),
        border-color var(--drkryz-roundedtabs-duration-fast) var(--drkryz-roundedtabs-ease),
        transform var(--drkryz-roundedtabs-duration-normal) var(--drkryz-roundedtabs-ease-soft),
        opacity var(--drkryz-roundedtabs-duration-fast) var(--drkryz-roundedtabs-ease),
        margin var(--drkryz-roundedtabs-duration-normal) var(--drkryz-roundedtabs-ease-soft),
        padding var(--drkryz-roundedtabs-duration-normal) var(--drkryz-roundedtabs-ease-soft),
        max-width var(--drkryz-roundedtabs-duration-layout) var(--drkryz-roundedtabs-ease-soft),
        width var(--drkryz-roundedtabs-duration-layout) var(--drkryz-roundedtabs-ease-soft);
}

.monaco-scrollable-element > .visible,
.monaco-scrollable-element > .invisible.fade {
    transition-duration: var(--drkryz-roundedtabs-duration-layout) !important;
    transition-timing-function: var(--drkryz-roundedtabs-ease-soft) !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-tabs-entry,
.monaco-workbench .terminal-editor .terminal-tabs-entry {
    animation: drkryz-roundedtabs-tab-enter var(--drkryz-roundedtabs-duration-normal) var(--drkryz-roundedtabs-ease-soft);
    animation-fill-mode: both;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
    animation: drkryz-roundedtabs-tab-activate var(--drkryz-roundedtabs-duration-normal) var(--drkryz-roundedtabs-ease-soft);
}

.quick-input-widget,
.context-view .monaco-menu-container,
.context-view .context-view-block,
.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast,
.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-wrapper,
.monaco-workbench .terminal-editor .terminal-wrapper,
.monaco-editor .find-widget,
.monaco-editor .suggest-widget,
.monaco-editor .parameter-hints-widget,
.monaco-editor .rename-box,
.monaco-hover {
    animation: drkryz-roundedtabs-surface-in var(--drkryz-roundedtabs-duration-slow) var(--drkryz-roundedtabs-ease-soft);
}

.context-view .monaco-menu-container,
.context-view .context-view-block {
    transform-origin: top left;
}

.monaco-workbench .part.titlebar .menubar > .menubar-menu-button,
.monaco-workbench .part.titlebar .menubar > .menubar-menu-button > .menubar-menu-title,
.menubar .menubar-menu-items-holder,
.menubar .menubar-menu-items-holder.monaco-menu-container,
.menubar .menubar-menu-items-holder .monaco-menu,
.menubar .menubar-menu-items-holder .monaco-action-bar .action-label {
    transform: none !important;
    animation: none !important;
}

.menubar .menubar-menu-items-holder,
.menubar .menubar-menu-items-holder.monaco-menu-container {
    z-index: 4000 !important;
}

.quick-input-widget {
    transform-origin: top center;
}

.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast {
    transform-origin: top right;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:focus-within,
.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions .action-label:hover,
.monaco-workbench .part.editor > .content .editor-group-container > .title .title-actions .action-label:hover,
.monaco-workbench .part.sidebar > .title .action-label:hover,
.monaco-workbench .part.auxiliarybar > .title .action-label:hover,
.monaco-workbench .part.panel .pane-header .action-label:hover,
.monaco-workbench .part.activitybar .action-item .action-label:hover,
.monaco-workbench .part.titlebar .action-label:hover,
.monaco-workbench .part.titlebar .command-center-center:hover {
    transform: translateY(-1px);
}

.monaco-workbench .part.titlebar .menubar > .menubar-menu-button:hover,
.monaco-workbench .part.titlebar .menubar > .menubar-menu-button:focus,
.monaco-workbench .part.titlebar .menubar > .menubar-menu-button.open {
    transform: none !important;
}

.monaco-workbench .part.sidebar .monaco-list-row:hover,
.monaco-workbench .part.auxiliarybar .monaco-list-row:hover,
.monaco-workbench .part.panel .monaco-list-row:hover,
.quick-input-list .monaco-list-row:hover,
.context-view .monaco-menu .monaco-action-bar.vertical .action-item:hover .action-label,
.monaco-workbench > .notifications-center .notification-list-item:hover,
.monaco-workbench > .notifications-toasts .notification-list-item:hover {
    transform: translateX(2px);
}

@media (prefers-reduced-motion: reduce) {
    .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab,
    .monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-tabs-entry,
    .monaco-workbench .terminal-editor .terminal-tabs-entry,
    .monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab .tab-actions .action-label,
    .monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions .action-label,
    .monaco-workbench .part.editor > .content .editor-group-container > .title .title-actions .action-label,
    .monaco-workbench .part.editor .breadcrumbs-control,
    .monaco-workbench .part.sidebar .monaco-list-row,
    .monaco-workbench .part.auxiliarybar .monaco-list-row,
    .monaco-workbench .part.panel .monaco-list-row,
    .monaco-workbench .part.sidebar > .title .action-label,
    .monaco-workbench .part.auxiliarybar > .title .action-label,
    .monaco-workbench .part.panel .pane-header .action-label,
    .monaco-workbench .part.activitybar .action-item .action-label,
    .monaco-workbench .part.titlebar .action-label,
    .monaco-workbench .part.titlebar .command-center-center,
    .quick-input-list .monaco-list-row,
    .context-view .monaco-menu .monaco-action-bar.vertical .action-item .action-label,
    .monaco-workbench > .notifications-center .notification-list-item,
    .monaco-workbench > .notifications-toasts .notification-list-item,
    .menubar .menubar-menu-items-holder,
    .menubar .menubar-menu-items-holder.monaco-menu-container,
    .menubar .menubar-menu-items-holder .monaco-menu,
    .menubar .menubar-menu-items-holder .monaco-action-bar .action-label,
    .monaco-scrollable-element > .visible,
    .monaco-scrollable-element > .invisible.fade,
    .monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-wrapper,
    .monaco-workbench .terminal-editor .terminal-wrapper,
    .quick-input-widget,
    .context-view .monaco-menu-container,
    .context-view .context-view-block,
    .monaco-workbench > .notifications-center,
    .monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast,
    .monaco-editor .find-widget,
    .monaco-editor .suggest-widget,
    .monaco-editor .parameter-hints-widget,
    .monaco-editor .rename-box,
    .monaco-hover {
        transition: none !important;
        animation: none !important;
    }
}`;
}

export { STYLE_END_MARKER, STYLE_START_MARKER };
