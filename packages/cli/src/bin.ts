#!/usr/bin/env node

import { runCli } from './cli.js';

const status = await runCli(process.argv.slice(2));
process.exitCode = status;
