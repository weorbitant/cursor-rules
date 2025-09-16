const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

class CursorRulesGenerator {
  constructor() {
    // Get the directory where this package is installed
    this.packageDir = path.dirname(require.resolve('./package.json'));
    this.templatesDir = path.join(this.packageDir, 'templates', 'rules');
    this.destinationDir = '.cursor/rules';
  }

  /**
   * Copy all template files from templates/rules to .cursor/rules
   */
  async copyRules() {
    try {
      console.log(chalk.blue('🚀 WeOrbitant Cursor Rules Generator'));
      console.log(chalk.gray('================================'));

      // Ensure destination directory exists
      await fs.ensureDir(this.destinationDir);
      console.log(chalk.green(`✅ Created directory: ${this.destinationDir}`));

      // Find all template files
      const templateFiles = glob.sync('**/*.mdc', { cwd: this.templatesDir });
      
      if (templateFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No template files found in templates/rules/'));
        return;
      }

      console.log(chalk.blue(`📁 Found ${templateFiles.length} template files:`));

      // Copy each template file
      for (const templateFile of templateFiles) {
        const sourcePath = path.join(this.templatesDir, templateFile);
        const destPath = path.join(this.destinationDir, templateFile);
        
        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Copy file
        await fs.copy(sourcePath, destPath);
        console.log(chalk.green(`  ✅ Copied: ${templateFile}`));
      }

      console.log(chalk.green(`\n🎉 Successfully copied ${templateFiles.length} rule files to ${this.destinationDir}/`));
      console.log(chalk.gray('You can now use these rules in your Cursor IDE!'));

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
      const templateFiles = glob.sync('**/*.mdc', { cwd: this.templatesDir });
      
      console.log(chalk.blue('📋 Available Cursor Rules Templates:'));
      console.log(chalk.gray('===================================='));
      
      if (templateFiles.length === 0) {
        console.log(chalk.yellow('No template files found.'));
        return;
      }

      templateFiles.forEach((file, index) => {
        console.log(chalk.white(`${index + 1}. ${file}`));
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
      const templateFiles = glob.sync('**/*.mdc', { cwd: this.templatesDir });
      
      if (templateFiles.length === 0) {
        console.log(chalk.yellow('⚠️  No template files found to clean'));
        return;
      }

      let cleanedCount = 0;
      let notFoundCount = 0;

      // Remove each template file from destination
      for (const templateFile of templateFiles) {
        const destPath = path.join(this.destinationDir, templateFile);
        
        if (await fs.pathExists(destPath)) {
          await fs.remove(destPath);
          console.log(chalk.green(`  ✅ Removed: ${templateFile}`));
          cleanedCount++;
        } else {
          console.log(chalk.gray(`  ⚪ Not found: ${templateFile}`));
          notFoundCount++;
        }
      }

      // Remove empty directories if they exist
      if (await fs.pathExists(this.destinationDir)) {
        const remainingFiles = await fs.readdir(this.destinationDir);
        if (remainingFiles.length === 0) {
          await fs.remove(this.destinationDir);
          console.log(chalk.green(`✅ Removed empty directory: ${this.destinationDir}`));
        } else {
          console.log(chalk.blue(`📁 Directory ${this.destinationDir} kept (contains other files)`));
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
