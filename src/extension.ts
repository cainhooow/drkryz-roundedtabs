import * as vscode from "vscode";
import {
    CONFIG_NAMESPACE,
    DEFAULT_STYLE_OPTIONS,
} from "./roundedTabsConfig";
import {
    applyRoundedTabs,
    isRoundedTabsApplied,
    repairRoundedTabsOnStartup,
    restoreRoundedTabs,
} from "./workbenchCssManager";
import { affectsRoundedTabsStyleConfiguration } from "./roundedTabsConfig";

export function activate(context: vscode.ExtensionContext) {
    const applyCommand = vscode.commands.registerCommand(
        "drkryz-roundedtabs.configure_now",
        async () => {
            await runWithErrorHandling(async () => {
                const result = await applyRoundedTabs(context);

                if (result.changed) {
                    await promptReload("Rounded tabs were applied to the current VS Code workbench CSS.");
                    return;
                }

                void vscode.window.showInformationMessage(
                    "Rounded tabs are already applied to the current VS Code workbench CSS."
                );
            });
        }
    );

    const restoreCommand = vscode.commands.registerCommand(
        "drkryz-roundedtabs.restore",
        async () => {
            await runWithErrorHandling(async () => {
                const result = await restoreRoundedTabs(context);

                if (result.changed) {
                    await promptReload(
                        "RoundedTabs removed its managed CSS block and restored the original workbench CSS."
                    );
                    return;
                }

                void vscode.window.showInformationMessage(
                    "RoundedTabs was not active in the current workbench CSS."
                );
            });
        }
    );

    const enableAnimationsCommand = vscode.commands.registerCommand(
        "drkryz-roundedtabs.enableAnimations",
        async () => {
            await runWithErrorHandling(async () => {
                await updateAnimationsSetting(context, true);
            });
        }
    );

    const disableAnimationsCommand = vscode.commands.registerCommand(
        "drkryz-roundedtabs.disableAnimations",
        async () => {
            await runWithErrorHandling(async () => {
                await updateAnimationsSetting(context, false);
            });
        }
    );

    const configurationListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (!affectsRoundedTabsStyleConfiguration(event) || !isRoundedTabsApplied(context)) {
            return;
        }

        void runWithErrorHandling(async () => {
            const result = await applyRoundedTabs(context);

            if (result.changed) {
                await promptReload("RoundedTabs refreshed the managed CSS block to match your new style settings.");
            }
        });
    });

    context.subscriptions.push(
        applyCommand,
        restoreCommand,
        enableAnimationsCommand,
        disableAnimationsCommand,
        configurationListener
    );

    void runWithErrorHandling(
        async () => {
            const result = await repairRoundedTabsOnStartup(context);

            if (!result.changed) {
                return;
            }

            const message = result.reason === "reapplied"
                ? "RoundedTabs detected a fresh VS Code workbench CSS file and reapplied the rounded styles."
                : "RoundedTabs refreshed its managed CSS block to keep your rounded styles in sync.";

            await promptReload(message);
        },
        true
    );
}

export function deactivate() { }

async function updateAnimationsSetting(
    context: vscode.ExtensionContext,
    enabled: boolean
): Promise<void> {
    const configuration = vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
    const currentValue = configuration.get<boolean>("enableAnimations", DEFAULT_STYLE_OPTIONS.enableAnimations) === true;

    if (currentValue === enabled) {
        const message = enabled
            ? "Soft animations are already enabled."
            : "Soft animations are already disabled.";
        const followUp = isRoundedTabsApplied(context)
            ? ""
            : " Run Apply Rounded Tabs to inject the current visual settings into the workbench CSS.";

        void vscode.window.showInformationMessage(`${message}${followUp}`);
        return;
    }

    await configuration.update("enableAnimations", enabled, vscode.ConfigurationTarget.Global);

    if (!isRoundedTabsApplied(context)) {
        const message = enabled
            ? "Soft animations were enabled. Run Apply Rounded Tabs to inject them into the current workbench CSS."
            : "Soft animations were disabled. Run Apply Rounded Tabs if you want to remove them from the current workbench CSS.";

        void vscode.window.showInformationMessage(message);
    }
}

async function promptReload(message: string): Promise<void> {
    const action = await vscode.window.showInformationMessage(message, "Reload Window");

    if (action === "Reload Window") {
        await vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
}

async function runWithErrorHandling(
    action: () => Promise<void>,
    quiet = false
): Promise<void> {
    try {
        await action();
    } catch (error) {
        console.error(error);

        if (!quiet) {
            const message = error instanceof Error ? error.message : String(error);
            void vscode.window.showErrorMessage(message);
        }
    }
}
