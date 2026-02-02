import { input, confirm } from '@inquirer/prompts';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

import type { AlienConfig } from '../utils/config.js';
import { readConfig, writeConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { detectPackageManager, getInstallCommand } from '../utils/pm.js';

interface InitOptions {
    dir?: string;
    typescript?: boolean;
    three?: boolean;
}

export async function init(options: InitOptions) {
    const cwd = process.cwd();

    // Check if already initialized
    const existingConfig = await readConfig(cwd);
    if (existingConfig) {
        logger.warn('alien.config.json already exists in this directory.');
        const overwrite = await confirm({ message: 'Overwrite existing config?', default: false });
        if (!overwrite) {
            return;
        }
    }

    // Gather config values
    let componentDir: string;
    let typescript: boolean;
    let three: boolean;

    if (options.dir !== undefined) {
        componentDir = options.dir;
    } else {
        componentDir = await input({
            message: 'Component directory:',
            default: './components/alien-ui'
        });
    }

    if (options.typescript !== undefined) {
        typescript = options.typescript;
    } else {
        typescript = await confirm({
            message: 'Use TypeScript?',
            default: true
        });
    }

    if (options.three !== undefined) {
        three = options.three;
    } else {
        three = await confirm({
            message: 'Will you use three.js?',
            default: false
        });
    }

    // Detect package manager
    const pm = await detectPackageManager(cwd);
    logger.info(`Detected package manager: ${pm}`);

    // Install @hobbs/alien-core
    const spinner = logger.spinner('Installing @hobbs/alien-core...');
    try {
        const installCmd = getInstallCommand(pm, '@hobbs/alien-core');
        execSync(installCmd, { cwd, stdio: 'pipe' });
        spinner.succeed('Installed @hobbs/alien-core');
    } catch {
        spinner.warn('Could not install @hobbs/alien-core (package may not be published yet)');
    }

    // Write config
    const config: AlienConfig = {
        $schema: 'https://alien.js.org/schema.json',
        typescript,
        componentDir,
        three
    };

    await writeConfig(config, cwd);
    logger.success('Created alien.config.json');

    // Create CSS file
    const cssDir = path.resolve(cwd, componentDir, 'styles');
    await fs.ensureDir(cssDir);

    const cssPath = path.resolve(cssDir, 'alien-ui.css');
    const templateDir = getTemplateDir();
    const cssTemplate = path.resolve(templateDir, 'css', 'alien-ui.css');

    if (await fs.pathExists(cssTemplate)) {
        await fs.copy(cssTemplate, cssPath);
    } else {
        // Fallback: write inline CSS
        await fs.writeFile(cssPath, getDefaultCSS());
    }

    logger.success(`Created ${path.relative(cwd, cssPath)}`);

    // Done
    logger.break();
    logger.success('Initialization complete!');
    logger.log(`Add this import to your app entry point:`);
    logger.log(`  import '${componentDir}/styles/alien-ui.css';`);
    logger.break();
    logger.log(`Next, add components with:`);
    logger.log(`  npx alien add panel`);
}

function getTemplateDir(): string {
    return path.resolve(new URL('..', import.meta.url).pathname, '..', 'templates');
}

function getDefaultCSS(): string {
    return `:root {
    --bg-color: #060606;
    --ui-panel-width: 100px;
    --ui-font-family: 'Roboto Mono', monospace;
    --ui-font-weight: 400;
    --ui-font-size: 10px;
    --ui-line-height: 15px;
    --ui-letter-spacing: 0.04em;
    --ui-number-letter-spacing: 0.5px;
    --ui-title-font-size: 11px;
    --ui-title-line-height: 18px;
    --ui-title-letter-spacing: 1px;
    --ui-secondary-font-size: 10px;
    --ui-secondary-letter-spacing: 0.5px;
    --ui-secondary-color: #868686;
    --ui-name-font-family: 'Gothic A1', sans-serif;
    --ui-name-font-weight: 500;
    --ui-name-font-size: 13px;
    --ui-name-line-height: 18px;
    --ui-name-letter-spacing: 0.03em;
    --ui-caption-font-family: 'Gothic A1', sans-serif;
    --ui-caption-font-weight: 500;
    --ui-caption-font-size: 12px;
    --ui-caption-line-height: 16px;
    --ui-caption-letter-spacing: 0.03em;
    --ui-link-font-family: 'Gothic A1', sans-serif;
    --ui-link-font-weight: 700;
    --ui-link-font-size: 11px;
    --ui-link-line-height: 18px;
    --ui-link-letter-spacing: 0.03em;
    --ui-info-font-family: 'Gothic A1', sans-serif;
    --ui-info-font-weight: 700;
    --ui-info-font-size: 10px;
    --ui-info-line-height: 20px;
    --ui-info-letter-spacing: 0.08em;
    --ui-info-color: rgb(255 255 255 / 0.55);
    --ui-color: #fff;
    --ui-color-triplet: 255 255 255;
    --ui-color-line-opacity: 0.5;
    --ui-color-divider-line-opacity: 0.15;
    --ui-color-graph-bottom-line-opacity: 0.15;
    --ui-invert-light-color: #000;
    --ui-invert-light-color-triplet: 0 0 0;
    --ui-invert-dark-color: #fff;
    --ui-invert-dark-color-triplet: 255 255 255;
    --ui-color-line: rgb(var(--ui-color-triplet) / var(--ui-color-line-opacity));
    --ui-color-divider-line: rgb(var(--ui-color-triplet) / var(--ui-color-divider-line-opacity));
    --ui-color-graph-bottom-line: rgb(var(--ui-color-triplet) / var(--ui-color-graph-bottom-line-opacity));
    --ui-color-range-1: #3b528b;
    --ui-color-range-2: #21918c;
    --ui-color-range-3: #5ec962;
    --ui-color-range-4: #fde725;
}

input, pre, .info, .target, .panel, .number, .name, .type, .primary, .secondary, .label, .marker {
    font-family: var(--ui-font-family);
    font-weight: var(--ui-font-weight);
    font-size: var(--ui-font-size);
    line-height: var(--ui-line-height);
    letter-spacing: var(--ui-letter-spacing);
}
`;
}
