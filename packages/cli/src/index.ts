import { Command } from 'commander';

import { init } from './commands/init.js';
import { add } from './commands/add.js';

const program = new Command();

program
    .name('alien')
    .description('CLI for adding alien-ui components to your project')
    .version('0.1.0');

program
    .command('init')
    .description('Initialize alien-ui in your project')
    .option('--dir <path>', 'Component directory')
    .option('--typescript', 'Use TypeScript')
    .option('--no-typescript', 'Use JavaScript')
    .option('--three', 'Enable three.js support')
    .option('--no-three', 'Disable three.js support')
    .action(init);

program
    .command('add')
    .description('Add a component to your project')
    .argument('<component>', 'Component name (e.g. panel)')
    .option('--overwrite', 'Overwrite existing files without prompting')
    .action(add);

program.parse();
