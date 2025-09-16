const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const CursorRulesGenerator = require('../index');

describe('Integration Tests', () => {
  let tempDir;
  let generator;
  let originalCwd;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-rules-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);

    // Create a mock package directory structure
    const mockPackageDir = path.join(tempDir, 'mock-package');
    await fs.ensureDir(mockPackageDir);
    await fs.ensureDir(path.join(mockPackageDir, 'templates', 'rules'));

    // Create mock template files
    await fs.writeFile(
      path.join(mockPackageDir, 'templates', 'rules', 'test-rule1.mdc'),
      'Test rule 1 content'
    );
    await fs.writeFile(
      path.join(mockPackageDir, 'templates', 'rules', 'test-rule2.mdc'),
      'Test rule 2 content'
    );

    // Mock the package.json path resolution
    const originalResolve = require.resolve;
    require.resolve = jest.fn((id) => {
      if (id === './package.json') {
        return path.join(mockPackageDir, 'package.json');
      }
      return originalResolve(id);
    });

    // Create generator with mocked paths
    generator = new CursorRulesGenerator();
    generator.packageDir = mockPackageDir;
    generator.templatesDir = path.join(mockPackageDir, 'templates', 'rules');
    generator.destinationDir = '.cursor/rules';

    // Restore original resolve
    require.resolve = originalResolve;
  });

  afterEach(async () => {
    // Clean up
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  describe('File Operations', () => {
    it('should copy template files to destination', async () => {
      await generator.copyRules();

      // Verify destination directory was created
      expect(await fs.pathExists('.cursor/rules')).toBe(true);

      // Verify files were copied
      expect(await fs.pathExists('.cursor/rules/test-rule1.mdc')).toBe(true);
      expect(await fs.pathExists('.cursor/rules/test-rule2.mdc')).toBe(true);

      // Verify file contents
      const content1 = await fs.readFile('.cursor/rules/test-rule1.mdc', 'utf8');
      const content2 = await fs.readFile('.cursor/rules/test-rule2.mdc', 'utf8');
      
      expect(content1).toBe('Test rule 1 content');
      expect(content2).toBe('Test rule 2 content');
    });

    it('should handle existing files (overwrite)', async () => {
      // Create existing file
      await fs.ensureDir('.cursor/rules');
      await fs.writeFile('.cursor/rules/test-rule1.mdc', 'Old content');

      await generator.copyRules();

      // Verify file was overwritten
      const content = await fs.readFile('.cursor/rules/test-rule1.mdc', 'utf8');
      expect(content).toBe('Test rule 1 content');
    });

    it('should clean only template files', async () => {
      // First copy the files
      await generator.copyRules();

      // Add a custom file
      await fs.writeFile('.cursor/rules/custom-rule.mdc', 'Custom content');

      // Clean the template files
      await generator.cleanRules();

      // Verify template files were removed
      expect(await fs.pathExists('.cursor/rules/test-rule1.mdc')).toBe(false);
      expect(await fs.pathExists('.cursor/rules/test-rule2.mdc')).toBe(false);

      // Verify custom file was preserved
      expect(await fs.pathExists('.cursor/rules/custom-rule.mdc')).toBe(true);

      // Verify directory still exists
      expect(await fs.pathExists('.cursor/rules')).toBe(true);
    });

    it('should remove empty directory after cleaning', async () => {
      // Copy files
      await generator.copyRules();

      // Clean all files
      await generator.cleanRules();

      // Verify directory was removed
      expect(await fs.pathExists('.cursor/rules')).toBe(false);
    });

    it('should handle nested template files', async () => {
      // Create nested template structure
      await fs.ensureDir(path.join(generator.templatesDir, 'nested'));
      await fs.writeFile(
        path.join(generator.templatesDir, 'nested', 'nested-rule.mdc'),
        'Nested rule content'
      );

      await generator.copyRules();

      // Verify nested file was copied
      expect(await fs.pathExists('.cursor/rules/nested/nested-rule.mdc')).toBe(true);
      
      const content = await fs.readFile('.cursor/rules/nested/nested-rule.mdc', 'utf8');
      expect(content).toBe('Nested rule content');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing template directory gracefully', async () => {
      // Remove templates directory
      await fs.remove(generator.templatesDir);

      // Mock console.error to capture error
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const processExit = jest.spyOn(process, 'exit').mockImplementation();

      // The copyRules method should handle the error internally
      await generator.copyRules();

      // Since the directory doesn't exist, glob.sync will return empty array
      // and the method will show "No template files found" message
      expect(consoleError).not.toHaveBeenCalled();
      expect(processExit).not.toHaveBeenCalled();

      consoleError.mockRestore();
      processExit.mockRestore();
    });

    it('should handle permission errors gracefully', async () => {
      // Create a file that will cause permission error
      await fs.ensureDir('.cursor/rules');
      await fs.writeFile('.cursor/rules/test-rule1.mdc', 'Existing content');
      
      // Make file read-only (simulate permission error)
      await fs.chmod('.cursor/rules/test-rule1.mdc', 0o444);

      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const processExit = jest.spyOn(process, 'exit').mockImplementation();

      // The copy operation should still work (it will overwrite the file)
      await generator.copyRules();

      // Verify the file was overwritten despite permission issues
      const content = await fs.readFile('.cursor/rules/test-rule1.mdc', 'utf8');
      expect(content).toBe('Test rule 1 content');

      consoleError.mockRestore();
      processExit.mockRestore();
    });
  });
});
