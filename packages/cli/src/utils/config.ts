import fs from 'fs-extra';
import path from 'path';

export interface AlienConfig {
    $schema?: string;
    typescript: boolean;
    componentDir: string;
    three: boolean;
}

const CONFIG_FILE = 'alien.config.json';

export function getConfigPath(cwd: string = process.cwd()): string {
    return path.resolve(cwd, CONFIG_FILE);
}

export async function readConfig(cwd: string = process.cwd()): Promise<AlienConfig | null> {
    const configPath = getConfigPath(cwd);

    if (await fs.pathExists(configPath)) {
        return fs.readJson(configPath);
    }

    return null;
}

export async function writeConfig(config: AlienConfig, cwd: string = process.cwd()): Promise<void> {
    const configPath = getConfigPath(cwd);

    await fs.writeJson(configPath, config, { spaces: 4 });
}
