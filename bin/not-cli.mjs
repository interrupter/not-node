#!/usr/bin/env node
import { Command } from "commander";
import { cwd } from "node:process";
const CWD = cwd();

import Actions from "../src/cli/actions/index.mjs";

const program = new Command();
Actions(program, { CWD });
program.parse();
