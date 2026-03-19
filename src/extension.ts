import * as vscode from "vscode";
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

    context.subscriptions.push(applyCommand, restoreCommand, configurationListener);

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
