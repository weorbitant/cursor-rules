const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

class CursorRulesGenerator {
  constructor() {
    // Get the directory where this package is installed
    this.packageDir = path.dirname(require.resolve('./package.json'));
    this.templatesDir = path.join(this.packageDir, 'templates');
    this.rulesDir = path.join(this.templatesDir, 'rules');
    this.commandsDir = path.join(this.templatesDir, 'commands');
    this.rulesDestinationDir = '.cursor/rules';
    this.commandsDestinationDir = '.cursor/commands';
  }

  /**
   * Copy all template files from templates/rules to .cursor/rules and templates/commands to .cursor/commands
   */
  async copyRules() {
    try {
      console.log(chalk.blue('🚀 WeOrbitant Cursor Rules Generator'));
      console.log(chalk.gray('================================'));

      // Ensure destination directories exist
      await fs.ensureDir(this.rulesDestinationDir);
      await fs.ensureDir(this.commandsDestinationDir);
      console.log(chalk.green(`✅ Created directory: ${this.rulesDestinationDir}`));
      console.log(chalk.green(`✅ Created directory: ${this.commandsDestinationDir}`));

      // Find all template files from both rules and commands directories
      const rulesFiles = glob.sync('**/*.mdc', { cwd: this.rulesDir });
      const commandsFiles = glob.sync('**/*.md', { cwd: this.commandsDir });
      
      const allTemplateFiles = [
        ...rulesFiles.map(file => ({ file, source: 'rules' })),
        ...commandsFiles.map(file => ({ file, source: 'commands' }))
      ];
      
      if (allTemplateFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No template files found in templates/'));
        return;
      }

      console.log(chalk.blue(`📁 Found ${allTemplateFiles.length} template files:`));

      // Copy each template file to its appropriate destination
      for (const { file: templateFile, source } of allTemplateFiles) {
        const sourceDir = source === 'rules' ? this.rulesDir : this.commandsDir;
        const destDir = source === 'rules' ? this.rulesDestinationDir : this.commandsDestinationDir;
        const sourcePath = path.join(sourceDir, templateFile);
        const destPath = path.join(destDir, templateFile);
        
        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Copy file
        await fs.copy(sourcePath, destPath);
        console.log(chalk.green(`  ✅ Copied: ${templateFile} (from ${source} to .cursor/${source})`));
      }

      console.log(chalk.green(`\n🎉 Successfully copied template files:`));
      console.log(chalk.gray(`  • Rules: ${rulesFiles.length} files to ${this.rulesDestinationDir}/`));
      console.log(chalk.gray(`  • Commands: ${commandsFiles.length} files to ${this.commandsDestinationDir}/`));
      console.log(chalk.gray('You can now use these rules and commands in your Cursor IDE!'));

    } catch (error) {
      console.error(chalk.red('❌ Error copying rules:'), error.message);
      process.exit(1);
    }
  }

  /**
   * List available template files
   */
  async listTemplates() {
    try {
      const rulesFiles = glob.sync('**/*.mdc', { cwd: this.rulesDir });
      const commandsFiles = glob.sync('**/*.md', { cwd: this.commandsDir });
      
      const allTemplateFiles = [
        ...rulesFiles.map(file => ({ file, source: 'rules' })),
        ...commandsFiles.map(file => ({ file, source: 'commands' }))
      ];
      
      console.log(chalk.blue('📋 Available Cursor Rules Templates:'));
      console.log(chalk.gray('===================================='));
      
      if (allTemplateFiles.length === 0) {
        console.log(chalk.yellow('No template files found.'));
        return;
      }

      allTemplateFiles.forEach(({ file, source }, index) => {
        console.log(chalk.white(`${index + 1}. ${file} (${source})`));
      });

    } catch (error) {
      console.error(chalk.red('❌ Error listing templates:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Clean/remove only the template files that were copied from this package
   */
  async cleanRules() {
    try {
      console.log(chalk.blue('🧹 Cleaning WeOrbitant Cursor Rules'));
      console.log(chalk.gray('================================'));

      // Find all template files that should be removed
      const rulesFiles = glob.sync('**/*.mdc', { cwd: this.rulesDir });
      const commandsFiles = glob.sync('**/*.md', { cwd: this.commandsDir });
      
      const allTemplateFiles = [
        ...rulesFiles.map(file => ({ file, source: 'rules' })),
        ...commandsFiles.map(file => ({ file, source: 'commands' }))
      ];
      
      if (allTemplateFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No template files found to clean'));
        return;
      }

      let cleanedCount = 0;
      let notFoundCount = 0;

      // Remove each template file from its appropriate destination
      for (const { file: templateFile, source } of allTemplateFiles) {
        const destDir = source === 'rules' ? this.rulesDestinationDir : this.commandsDestinationDir;
        const destPath = path.join(destDir, templateFile);
        
        if (await fs.pathExists(destPath)) {
          await fs.remove(destPath);
          console.log(chalk.green(`  ✅ Removed: ${templateFile} (from .cursor/${source})`));
          cleanedCount++;
        } else {
          console.log(chalk.gray(`  ⚪ Not found: ${templateFile}`));
          notFoundCount++;
        }
      }

      // Remove empty directories if they exist
      for (const destDir of [this.rulesDestinationDir, this.commandsDestinationDir]) {
        if (await fs.pathExists(destDir)) {
          const remainingFiles = await fs.readdir(destDir);
          if (remainingFiles.length === 0) {
            await fs.remove(destDir);
            console.log(chalk.green(`✅ Removed empty directory: ${destDir}`));
          } else {
            console.log(chalk.blue(`📁 Directory ${destDir} kept (contains other files)`));
          }
        }
      }

      console.log(chalk.green(`\n🎉 Cleanup complete!`));
      console.log(chalk.gray(`  • Removed: ${cleanedCount} files`));
      console.log(chalk.gray(`  • Not found: ${notFoundCount} files`));

    } catch (error) {
      console.error(chalk.red('❌ Error cleaning rules:'), error.message);
      process.exit(1);
    }
  }
}

module.exports = CursorRulesGenerator;
