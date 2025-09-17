#!/usr/bin/env node

const { Command } = require('commander');
const CursorRulesGenerator = require('../index');
const chalk = require('chalk');

const program = new Command();
const generator = new CursorRulesGenerator();

program
  .name('cursor-rules')
  .description('Generate Cursor rules from templates')
  .version(require('../package.json').version);

program
  .command('apply')
  .description('Apply all templates to .cursor directory')
  .action(async () => {
    await generator.copyRules();
  });

program
  .command('list')
  .description('List available templates')
  .action(async () => {
    await generator.listTemplates();
  });

program
  .command('clean')
  .description('Remove existing .cursor directory')
  .action(async () => {
    await generator.cleanRules();
  });

// Default action (when no command is provided)
program
  .action(async () => {
    console.log(chalk.blue('🚀 WeOrbitant Cursor Rules CLI'));
    console.log(chalk.gray('=========================='));
    console.log('');
    console.log(chalk.white('Available commands:'));
    console.log(chalk.gray('  apply   Apply all templates to .cursor directory'));
    console.log(chalk.gray('  list    List available rule templates'));
    console.log(chalk.gray('  clean   Remove existing .cursor/rules directory'));
    console.log('');
    console.log(chalk.gray('Use --help for more information.'));
  });

program.parse();
