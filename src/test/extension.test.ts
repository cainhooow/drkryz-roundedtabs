import * as assert from 'assert';

import {
	buildManagedWorkbenchCss,
	hasManagedRoundedTabsBlock,
	stripManagedRoundedTabsBlock,
} from '../roundedStyles';
import { DEFAULT_STYLE_OPTIONS } from '../roundedTabsConfig';

suite('Extension Test Suite', () => {
	const baseCss = [
		'.monaco-workbench {',
		'  color: white;',
		'}',
	].join('\n');

	test('buildManagedWorkbenchCss appends a managed block', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss);

		assert.ok(hasManagedRoundedTabsBlock(patchedCss));
		assert.ok(patchedCss.includes('#workbench\\.parts\\.sidebar'));
		assert.ok(patchedCss.startsWith(baseCss));
	});

	test('buildManagedWorkbenchCss is idempotent', () => {
		const once = buildManagedWorkbenchCss(baseCss);
		const twice = buildManagedWorkbenchCss(once);

		assert.strictEqual(twice, once);
	});

	test('stripManagedRoundedTabsBlock restores the original css', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss);
		const strippedCss = stripManagedRoundedTabsBlock(patchedCss);

		assert.strictEqual(strippedCss, baseCss);
		assert.strictEqual(hasManagedRoundedTabsBlock(strippedCss), false);
	});

	test('buildManagedWorkbenchCss respects custom style options', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss, {
			...DEFAULT_STYLE_OPTIONS,
			radius: 18,
			tabGap: 3,
		});

		assert.ok(patchedCss.includes('--drkryz-roundedtabs-radius: 18px;'));
		assert.ok(patchedCss.includes('--drkryz-roundedtabs-gap: 3px;'));
	});

	test('buildManagedWorkbenchCss protects key rounded surfaces with important rules', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss);

		assert.ok(patchedCss.includes('border-radius: var(--drkryz-roundedtabs-radius) !important;'));
		assert.ok(patchedCss.includes('overflow: hidden !important;'));
	});

	test('buildManagedWorkbenchCss fills rounded surfaces with theme-aware backgrounds', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss);

		assert.ok(patchedCss.includes('--drkryz-roundedtabs-editor-surface: var(--vscode-editorGroupHeader-tabsBackground'));
		assert.ok(patchedCss.includes('background-color: var(--drkryz-roundedtabs-sidebar-surface) !important;'));
		assert.ok(patchedCss.includes('background-color: var(--drkryz-roundedtabs-panel-surface) !important;'));
	});

	test('tabs-only preset skips extended workbench rounding', () => {
		const patchedCss = buildManagedWorkbenchCss(baseCss, {
			...DEFAULT_STYLE_OPTIONS,
			preset: 'tabs-only',
		});

		assert.ok(!patchedCss.includes('.monaco-workbench .part.panel > .content'));
		assert.ok(!patchedCss.includes('.quick-input-widget'));
	});
});
