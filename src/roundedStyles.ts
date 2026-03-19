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
    const surfaceRadius = Math.max(8, styleOptions.radius - 2);
    const itemRadius = Math.max(6, styleOptions.radius - 4);
    const chipRadius = Math.max(4, styleOptions.radius - 6);
    const cssBlocks = [
        `${STYLE_START_MARKER}
/* RoundedTabs keeps the original workbench CSS intact and appends only this managed block. */
/* preset: ${styleOptions.preset}; radius: ${styleOptions.radius}px; tab-gap: ${styleOptions.tabGap}px */
/* Some workbench surfaces receive runtime styles, so rounded properties stay intentionally important here. */
:root {
    --drkryz-roundedtabs-radius: ${styleOptions.radius}px;
    --drkryz-roundedtabs-radius-md: ${surfaceRadius}px;
    --drkryz-roundedtabs-radius-sm: ${itemRadius}px;
    --drkryz-roundedtabs-radius-xs: ${chipRadius}px;
    --drkryz-roundedtabs-gap: ${styleOptions.tabGap}px;
    --drkryz-roundedtabs-editor-surface: var(--vscode-editorGroupHeader-tabsBackground, var(--vscode-editor-background));
    --drkryz-roundedtabs-sidebar-surface: var(--vscode-sideBar-background, var(--vscode-editor-background));
    --drkryz-roundedtabs-activitybar-surface: var(--vscode-activityBar-background, var(--vscode-sideBar-background));
    --drkryz-roundedtabs-panel-surface: var(--vscode-panel-background, var(--vscode-editor-background));
    --drkryz-roundedtabs-widget-surface: var(--vscode-quickInput-background, var(--vscode-editorWidget-background));
    --drkryz-roundedtabs-notification-surface: var(--vscode-notifications-background, var(--vscode-editorWidget-background));
    --drkryz-roundedtabs-menu-surface: var(--vscode-menu-background, var(--vscode-editorWidget-background));
}

.monaco-workbench .part.editor > .content .editor-group-container > .title {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-editor-surface) !important;
    background-clip: padding-box !important;
    padding-left: 6px;
    padding-right: 6px;
    overflow: hidden !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-and-actions-container,
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container {
    gap: var(--drkryz-roundedtabs-gap);
    background-color: transparent !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container {
    padding-bottom: 4px;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    margin-left: 0;
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
.monaco-workbench .part.editor > .content .editor-group-container > .title > .title-actions {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
}

#workbench\\.parts\\.sidebar,
.monaco-workbench .part.sidebar > .content,
.monaco-workbench .part.auxiliarybar > .content {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-sidebar-surface) !important;
    background-clip: padding-box !important;
}

.monaco-workbench .part.sidebar > .content,
.monaco-workbench .part.auxiliarybar > .content {
    overflow: hidden !important;
}

.monaco-workbench .part.sidebar .monaco-scrollable-element[role="presentation"] > .split-view-container,
.monaco-workbench .part.auxiliarybar .monaco-scrollable-element[role="presentation"] > .split-view-container {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
}

.monaco-workbench .part.sidebar .pane > .pane-header,
.monaco-workbench .part.sidebar .pane > .pane-body,
.monaco-workbench .part.auxiliarybar .pane > .pane-header,
.monaco-workbench .part.auxiliarybar .pane > .pane-body {
    border-radius: var(--drkryz-roundedtabs-radius-sm) !important;
    background-color: var(--drkryz-roundedtabs-sidebar-surface) !important;
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
}
`,
    ];

    if (styleOptions.preset === "balanced") {
        cssBlocks.push(`
.monaco-workbench .part.activitybar,
.monaco-workbench .part.activitybar > .content {
    border-radius: var(--drkryz-roundedtabs-radius) !important;
    background-color: var(--drkryz-roundedtabs-activitybar-surface) !important;
    background-clip: padding-box !important;
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
.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast,
.context-view .monaco-menu-container {
    border-radius: var(--drkryz-roundedtabs-radius-md) !important;
    overflow: hidden !important;
    background-clip: padding-box !important;
}

.quick-input-widget {
    background-color: var(--drkryz-roundedtabs-widget-surface) !important;
}

.monaco-workbench > .notifications-center,
.monaco-workbench > .notifications-toasts .notification-toast-container > .notification-toast {
    background-color: var(--drkryz-roundedtabs-notification-surface) !important;
}

.context-view .monaco-menu-container {
    background-color: var(--drkryz-roundedtabs-menu-surface) !important;
}

.context-view .monaco-menu .monaco-action-bar.vertical .action-item .action-label,
.monaco-workbench > .notifications-center .notification-list-item,
.monaco-workbench > .notifications-toasts .notification-list-item {
    border-radius: var(--drkryz-roundedtabs-radius-xs) !important;
    background-clip: padding-box !important;
}
`);
    }

    cssBlocks.push(STYLE_END_MARKER);

    return cssBlocks.join("\n");
}

function escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { STYLE_END_MARKER, STYLE_START_MARKER };
