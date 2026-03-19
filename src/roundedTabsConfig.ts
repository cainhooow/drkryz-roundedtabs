import type * as vscode from "vscode";

const CONFIG_NAMESPACE = "drkryz-roundedtabs";
const STYLE_PRESET_KEY = `${CONFIG_NAMESPACE}.stylePreset`;
const RADIUS_KEY = `${CONFIG_NAMESPACE}.radius`;
const TAB_GAP_KEY = `${CONFIG_NAMESPACE}.tabGap`;

type RoundedTabsStylePreset = "tabs-only" | "balanced";

interface RoundedTabsStyleOptions {
    preset: RoundedTabsStylePreset;
    radius: number;
    tabGap: number;
}

const DEFAULT_STYLE_OPTIONS: RoundedTabsStyleOptions = {
    preset: "balanced",
    radius: 12,
    tabGap: 6,
};

export function getRoundedTabsStyleOptions(
    configuration = getVscodeApi().workspace.getConfiguration(CONFIG_NAMESPACE)
): RoundedTabsStyleOptions {
    const preset = normalizePreset(configuration.get<string>("stylePreset", DEFAULT_STYLE_OPTIONS.preset));
    const radius = clampNumber(configuration.get<number>("radius", DEFAULT_STYLE_OPTIONS.radius), 6, 24, DEFAULT_STYLE_OPTIONS.radius);
    const tabGap = clampNumber(configuration.get<number>("tabGap", DEFAULT_STYLE_OPTIONS.tabGap), 0, 12, DEFAULT_STYLE_OPTIONS.tabGap);

    return {
        preset,
        radius,
        tabGap,
    };
}

export function affectsRoundedTabsStyleConfiguration(event: vscode.ConfigurationChangeEvent): boolean {
    return event.affectsConfiguration(STYLE_PRESET_KEY)
        || event.affectsConfiguration(RADIUS_KEY)
        || event.affectsConfiguration(TAB_GAP_KEY);
}

function getVscodeApi(): typeof import("vscode") {
    // Loaded lazily so CSS helpers can be tested without the VS Code runtime.
    return require("vscode") as typeof import("vscode");
}

function normalizePreset(value: string): RoundedTabsStylePreset {
    return value === "tabs-only" ? value : DEFAULT_STYLE_OPTIONS.preset;
}

function clampNumber(value: number, min: number, max: number, fallback: number): number {
    if (!Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, Math.round(value)));
}

export {
    CONFIG_NAMESPACE,
    DEFAULT_STYLE_OPTIONS,
};

export type {
    RoundedTabsStyleOptions,
    RoundedTabsStylePreset,
};
