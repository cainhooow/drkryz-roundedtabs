import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import path from "path";
import * as vscode from "vscode";
import {
    buildManagedWorkbenchCss,
    hasManagedRoundedTabsBlock,
    stripManagedRoundedTabsBlock,
} from "./roundedStyles";
import { getRoundedTabsStyleOptions } from "./roundedTabsConfig";

const WORKBENCH_CSS_FILE_NAME = "workbench.desktop.main.css";
const BACKUP_FILE_NAME = "workbench.desktop.main.backup.css";
const STATE_FILE_NAME = "state.json";

interface RoundedTabsState {
    applied: boolean;
    baseHash?: string;
    targetPath?: string;
    updatedAt?: string;
}

interface RepairResult {
    changed: boolean;
    reason?: "reapplied" | "updated";
    targetPath?: string;
}

interface ApplyResult {
    changed: boolean;
    repaired: boolean;
    targetPath: string;
}

interface RestoreResult {
    changed: boolean;
    targetPath: string;
}

export async function applyRoundedTabs(context: vscode.ExtensionContext): Promise<ApplyResult> {
    const targetPath = await resolveWorkbenchCssPath();
    const currentCss = readWorkbenchCss(targetPath);
    const hadManagedBlock = hasManagedRoundedTabsBlock(currentCss);
    const baseCss = stripManagedRoundedTabsBlock(currentCss);
    const patchedCss = buildManagedWorkbenchCss(baseCss, getRoundedTabsStyleOptions());

    if (!hadManagedBlock || !existsSync(getBackupFilePath(context))) {
        writeBackup(context, baseCss);
    }

    if (currentCss !== patchedCss) {
        writeWorkbenchCss(targetPath, patchedCss);
    }

    writeState(context, {
        applied: true,
        baseHash: createContentHash(baseCss),
        targetPath,
        updatedAt: new Date().toISOString(),
    });

    return {
        changed: currentCss !== patchedCss,
        repaired: hadManagedBlock,
        targetPath,
    };
}

export async function restoreRoundedTabs(context: vscode.ExtensionContext): Promise<RestoreResult> {
    const currentState = readState(context);
    const targetPath = await resolveWorkbenchCssPath(currentState.targetPath);
    const currentCss = readWorkbenchCss(targetPath);
    const restoredCss = stripManagedRoundedTabsBlock(currentCss);

    if (currentCss !== restoredCss) {
        writeWorkbenchCss(targetPath, restoredCss);
    }

    writeState(context, {
        applied: false,
        baseHash: createContentHash(restoredCss),
        targetPath,
        updatedAt: new Date().toISOString(),
    });

    return {
        changed: currentCss !== restoredCss,
        targetPath,
    };
}

export async function repairRoundedTabsOnStartup(
    context: vscode.ExtensionContext
): Promise<RepairResult> {
    const config = getConfiguration();
    const currentState = readState(context);

    if (!config.get<boolean>("autoReapplyOnStartup", true) || !currentState.applied) {
        return { changed: false };
    }

    let targetPath: string;

    try {
        targetPath = await resolveWorkbenchCssPath(currentState.targetPath, false);
    } catch {
        return { changed: false };
    }

    const currentCss = readWorkbenchCss(targetPath);
    const hadManagedBlock = hasManagedRoundedTabsBlock(currentCss);
    const baseCss = stripManagedRoundedTabsBlock(currentCss);
    const patchedCss = buildManagedWorkbenchCss(baseCss, getRoundedTabsStyleOptions());
    const nextBaseHash = createContentHash(baseCss);
    const shouldRefreshBackup = !hadManagedBlock || currentState.baseHash !== nextBaseHash;

    if (shouldRefreshBackup) {
        writeBackup(context, baseCss);
    }

    if (currentCss === patchedCss) {
        writeState(context, {
            applied: true,
            baseHash: nextBaseHash,
            targetPath,
            updatedAt: currentState.updatedAt ?? new Date().toISOString(),
        });

        return { changed: false, targetPath };
    }

    writeWorkbenchCss(targetPath, patchedCss);
    writeState(context, {
        applied: true,
        baseHash: nextBaseHash,
        targetPath,
        updatedAt: new Date().toISOString(),
    });

    return {
        changed: true,
        reason: hadManagedBlock ? "updated" : "reapplied",
        targetPath,
    };
}

async function resolveWorkbenchCssPath(
    preferredPath?: string,
    promptIfMissing = true
): Promise<string> {
    const candidatePaths = buildWorkbenchCssCandidates(preferredPath, getConfiguration().get<string>("installPath", ""));

    for (const candidatePath of candidatePaths) {
        if (existsSync(candidatePath)) {
            return path.normalize(candidatePath);
        }
    }

    if (!promptIfMissing) {
        throw new Error("Unable to locate the VS Code workbench CSS file.");
    }

    const manualPath = await vscode.window.showInputBox({
        title: "VS Code installation path",
        prompt: "Paste the VS Code installation root, resources folder, or the workbench.desktop.main.css file path",
        ignoreFocusOut: true,
    });

    if (!manualPath) {
        throw new Error("The VS Code installation path was not provided.");
    }

    const manualCandidates = buildWorkbenchCssCandidates(undefined, manualPath);
    for (const candidatePath of manualCandidates) {
        if (existsSync(candidatePath)) {
            return path.normalize(candidatePath);
        }
    }

    throw new Error(`Could not locate ${WORKBENCH_CSS_FILE_NAME}.`);
}

function buildWorkbenchCssCandidates(...rawPaths: Array<string | undefined>): string[] {
    const candidates = new Set<string>();
    const execDir = path.dirname(process.execPath);
    const processWithResourcesPath = process as NodeJS.Process & { resourcesPath?: string };

    addActiveVersionWorkbenchCssCandidate(candidates, execDir);
    addActiveVersionWorkbenchCssCandidate(candidates, path.resolve(execDir, ".."));
    addWorkbenchCssCandidate(candidates, path.join(vscode.env.appRoot, "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));

    if (processWithResourcesPath.resourcesPath) {
        addWorkbenchCssCandidate(
            candidates,
            path.join(processWithResourcesPath.resourcesPath, "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME)
        );
    }

    addWorkbenchCssCandidate(candidates, path.join(execDir, "resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));
    addWorkbenchCssCandidate(candidates, path.join(execDir, "..", "Resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));

    for (const rawPath of rawPaths) {
        if (!rawPath || !rawPath.trim()) {
            continue;
        }

        const normalizedPath = path.normalize(rawPath.trim().replace(/^['"]|['"]$/g, ""));

        if (path.basename(normalizedPath) === WORKBENCH_CSS_FILE_NAME) {
            addWorkbenchCssCandidate(candidates, normalizedPath);
            continue;
        }

        addWorkbenchCssCandidate(candidates, path.join(normalizedPath, WORKBENCH_CSS_FILE_NAME));
        addWorkbenchCssCandidate(candidates, path.join(normalizedPath, "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));
        addWorkbenchCssCandidate(candidates, path.join(normalizedPath, "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));
        addWorkbenchCssCandidate(candidates, path.join(normalizedPath, "resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));
        addWorkbenchCssCandidate(candidates, path.join(normalizedPath, "Contents", "Resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME));
        addVersionedWorkbenchCssCandidates(candidates, normalizedPath);
    }

    return [...candidates];
}

function addActiveVersionWorkbenchCssCandidate(collection: Set<string>, installRootPath: string): void {
    const updatingVersionPath = path.join(installRootPath, "updating_version");

    if (!existsSync(updatingVersionPath)) {
        return;
    }

    try {
        const activeVersionHash = readFileSync(updatingVersionPath, "utf8").trim().slice(0, 10);

        if (!activeVersionHash) {
            return;
        }

        addWorkbenchCssCandidate(
            collection,
            path.join(installRootPath, activeVersionHash, "resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME)
        );
        addWorkbenchCssCandidate(
            collection,
            path.join(installRootPath, activeVersionHash, "Contents", "Resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME)
        );
    } catch {
        // Ignore malformed updater state and continue with the remaining candidates.
    }
}

function addVersionedWorkbenchCssCandidates(collection: Set<string>, installRootPath: string): void {
    if (!existsSync(installRootPath)) {
        return;
    }

    try {
        const entries = readdirSync(installRootPath, { withFileTypes: true });
        const directoryEntries = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => ({
                name: entry.name,
                path: path.join(installRootPath, entry.name),
            }))
            .filter((entry) => isPotentialVersionDirectory(entry.path))
            .sort((left, right) => getDirectoryModifiedTime(right.path) - getDirectoryModifiedTime(left.path));

        for (const entry of directoryEntries) {
            const entryPath = entry.path;
            addWorkbenchCssCandidate(
                collection,
                path.join(entryPath, "resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME)
            );
            addWorkbenchCssCandidate(
                collection,
                path.join(entryPath, "Contents", "Resources", "app", "out", "vs", "workbench", WORKBENCH_CSS_FILE_NAME)
            );
        }
    } catch {
        // Ignore unreadable directories and keep the existing fallback candidates.
    }
}

function isPotentialVersionDirectory(directoryPath: string): boolean {
    try {
        return statSync(path.join(directoryPath, "version")).isFile();
    } catch {
        return false;
    }
}

function getDirectoryModifiedTime(directoryPath: string): number {
    try {
        return statSync(directoryPath).mtimeMs;
    } catch {
        return 0;
    }
}

function addWorkbenchCssCandidate(collection: Set<string>, candidatePath: string): void {
    if (!candidatePath) {
        return;
    }

    collection.add(path.normalize(candidatePath));
}

function readWorkbenchCss(targetPath: string): string {
    return readFileSync(targetPath, "utf8");
}

function writeWorkbenchCss(targetPath: string, content: string): void {
    try {
        writeFileSync(targetPath, content, "utf8");
    } catch (error) {
        throw new Error(createWriteErrorMessage(targetPath, error));
    }
}

function createWriteErrorMessage(targetPath: string, error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === "object" && error !== null && "code" in error
        ? String((error as NodeJS.ErrnoException).code)
        : "";

    if (errorCode === "EACCES" || errorCode === "EPERM") {
        return `No permission to update ${targetPath}. On Windows, reopen VS Code as administrator. On Linux or macOS, grant write access to the VS Code installation and try again.`;
    }

    return `Unable to update ${targetPath}: ${errorMessage}`;
}

function writeBackup(context: vscode.ExtensionContext, content: string): void {
    ensureStorageDirectory(context);
    writeFileSync(getBackupFilePath(context), content, "utf8");
}

function readState(context: vscode.ExtensionContext): RoundedTabsState {
    const stateFilePath = getStateFilePath(context);

    if (!existsSync(stateFilePath)) {
        return { applied: false };
    }

    try {
        const rawState = readFileSync(stateFilePath, "utf8");
        return JSON.parse(rawState) as RoundedTabsState;
    } catch {
        return { applied: false };
    }
}

function writeState(context: vscode.ExtensionContext, state: RoundedTabsState): void {
    ensureStorageDirectory(context);
    writeFileSync(getStateFilePath(context), JSON.stringify(state, null, 2), "utf8");
}

function ensureStorageDirectory(context: vscode.ExtensionContext): void {
    mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
}

function getBackupFilePath(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, BACKUP_FILE_NAME);
}

function getStateFilePath(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, STATE_FILE_NAME);
}

function createContentHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
}

function getConfiguration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("drkryz-roundedtabs");
}

export function isRoundedTabsApplied(context: vscode.ExtensionContext): boolean {
    return readState(context).applied;
}

export type { ApplyResult, RepairResult, RestoreResult };
