import { confirm } from '@inquirer/prompts';
import fs from 'fs-extra';
import path from 'path';

import { readConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

interface ComponentEntry {
    name: string;
    description: string;
    files: string[];
    coreDependencies: string[];
    cssRequired: boolean;
}

interface Registry {
    [key: string]: ComponentEntry;
}

interface AddOptions {
    overwrite?: boolean;
}

export async function add(componentName: string, options: AddOptions) {
    const cwd = process.cwd();

    // Read config
    const config = await readConfig(cwd);
    if (!config) {
        logger.error('No alien.config.json found. Run `npx alien init` first.');
        process.exit(1);
    }

    // Load registry
    const registry = await loadRegistry();
    const component = registry[componentName];

    if (!component) {
        logger.error(`Unknown component: "${componentName}"`);
        logger.log(`Available components: ${Object.keys(registry).join(', ')}`);
        process.exit(1);
    }

    const templateDir = getTemplateDir();
    const lang = config.typescript ? 'ts' : 'js';
    const ext = config.typescript ? '.ts' : '.js';
    const componentDir = path.resolve(cwd, config.componentDir);

    // Check CSS
    if (component.cssRequired) {
        const cssPath = path.resolve(componentDir, 'styles', 'alien-ui.css');
        if (!await fs.pathExists(cssPath)) {
            logger.warn('CSS file not found. Run `npx alien init` to generate styles.');
        }
    }

    const createdFiles: string[] = [];

    for (const file of component.files) {
        // Switch extension based on config
        const sourceFile = config.typescript ? file : file.replace(/\.ts$/, '.js');
        const sourcePath = path.resolve(templateDir, lang, sourceFile);
        const targetFile = config.typescript ? file : file.replace(/\.ts$/, '.js');
        const targetPath = path.resolve(componentDir, targetFile);

        // Check if source template exists
        if (!await fs.pathExists(sourcePath)) {
            logger.warn(`Template not found: ${sourceFile}`);
            continue;
        }

        // Check if target exists
        if (await fs.pathExists(targetPath) && !options.overwrite) {
            const overwrite = await confirm({
                message: `${path.relative(cwd, targetPath)} already exists. Overwrite?`,
                default: false
            });

            if (!overwrite) {
                continue;
            }
        }

        await fs.ensureDir(path.dirname(targetPath));
        await fs.copy(sourcePath, targetPath);
        createdFiles.push(path.relative(cwd, targetPath));
    }

    if (createdFiles.length) {
        logger.break();
        logger.success(`Added ${component.name} component (${createdFiles.length} files):`);
        createdFiles.forEach(f => logger.log(`  ${f}`));
    } else {
        logger.warn('No files were created.');
    }
}

async function loadRegistry(): Promise<Registry> {
    // import.meta.url points to dist/index.js
    // new URL('..', url).pathname gives us the cli package root (packages/cli/)
    const pkgRoot = new URL('..', import.meta.url).pathname;

    const registryPath = path.resolve(pkgRoot, 'src', 'registry', 'components.json');

    // Try the src path first (development), then the bundled path
    if (await fs.pathExists(registryPath)) {
        return fs.readJson(registryPath);
    }

    // Fallback: try relative to dist
    const distRegistryPath = path.resolve(pkgRoot, 'dist', 'registry', 'components.json');

    if (await fs.pathExists(distRegistryPath)) {
        return fs.readJson(distRegistryPath);
    }

    // Inline fallback
    return {
        panel: {
            name: 'Panel',
            description: 'A panel container for various UI components',
            files: [
                'panels/Panel.ts',
                'panels/PanelItem.ts',
                'panels/PanelLink.ts',
                'panels/PanelThumbnail.ts',
                'panels/PanelGraph.ts',
                'panels/PanelMeter.ts',
                'panels/List.ts',
                'panels/ListToggle.ts',
                'panels/ListSelect.ts',
                'panels/Slider.ts',
                'panels/Toggle.ts',
                'panels/Content.ts',
                'panels/ColorPicker.ts',
                'panels/usePanel.ts'
            ],
            coreDependencies: ['Interface', 'Stage', 'ticker', 'EventEmitter', 'Vector2', 'Color', 'clamp'],
            cssRequired: true
        }
    };
}

function getTemplateDir(): string {
    // import.meta.url points to dist/index.js
    // new URL('..', url).pathname gives us the cli package root (packages/cli/)
    return path.resolve(new URL('..', import.meta.url).pathname, 'templates');
}
