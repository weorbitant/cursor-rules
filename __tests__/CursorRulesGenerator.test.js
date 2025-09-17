const fs = require('fs-extra');
const path = require('path');
const CursorRulesGenerator = require('../index');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('glob');

const glob = require('glob');

describe('CursorRulesGenerator', () => {
  let generator;
  let mockConsoleLog;
  let mockConsoleError;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    glob.sync.mockClear();
    
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    
    // Create new generator instance
    generator = new CursorRulesGenerator();
  });

  afterEach(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('constructor', () => {
    it('should initialize with correct paths', () => {
      expect(generator.packageDir).toBeDefined();
      expect(generator.templatesDir).toContain('templates');
      expect(generator.rulesDir).toContain('templates/rules');
      expect(generator.commandsDir).toContain('templates/commands');
      expect(generator.rulesDestinationDir).toBe('.cursor/rules');
      expect(generator.commandsDestinationDir).toBe('.cursor/commands');
    });
  });

  describe('copyRules', () => {
    beforeEach(() => {
      // Mock glob to return template files for both rules and commands
      glob.sync
        .mockReturnValueOnce([
          'readme-data-model.mdc',
          'readme-config.mdc',
          'readme-async-messaging.mdc',
          'readme-summary.mdc'
        ]) // rules files
        .mockReturnValueOnce([
          'update-docs.md'
        ]); // commands files
    });

    it('should copy all template files successfully', async () => {
      // Mock fs-extra methods
      fs.ensureDir.mockResolvedValue();
      fs.copy.mockResolvedValue();

      await generator.copyRules();

      // Verify directory creation for both rules and commands
      expect(fs.ensureDir).toHaveBeenCalledWith('.cursor/rules');
      expect(fs.ensureDir).toHaveBeenCalledWith('.cursor/commands');

      // Verify all files were copied (4 rules + 1 command = 5 total)
      expect(fs.copy).toHaveBeenCalledTimes(5);
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('templates/rules/readme-data-model.mdc'),
        expect.stringContaining('.cursor/rules/readme-data-model.mdc')
      );
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('templates/commands/update-docs.md'),
        expect.stringContaining('.cursor/commands/update-docs.md')
      );

      // Verify console output
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🚀 WeOrbitant Cursor Rules Generator')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📁 Found 5 template files:')
      );
    });

    it('should handle no template files found', async () => {
      // Reset the mock completely for this test
      glob.sync.mockReset();
      glob.sync.mockImplementation(() => []);
      fs.ensureDir.mockResolvedValue();

      await generator.copyRules();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚠️  No template files found in templates/')
      );
      expect(fs.copy).not.toHaveBeenCalled();
    });

    it('should handle errors during copy operation', async () => {
      const error = new Error('Copy failed');
      fs.ensureDir.mockResolvedValue();
      fs.copy.mockRejectedValue(error);

      // Mock process.exit to prevent test termination
      const processExit = jest.spyOn(process, 'exit').mockImplementation();

      await generator.copyRules();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error copying rules:'),
        'Copy failed'
      );
      expect(processExit).toHaveBeenCalledWith(1);

      processExit.mockRestore();
    });
  });

  describe('listTemplates', () => {
    it('should list available template files', async () => {
      glob.sync
        .mockReturnValueOnce([
          'readme-data-model.mdc',
          'readme-summary.mdc'
        ]) // rules files
        .mockReturnValueOnce([
          'update-docs.md'
        ]); // commands files

      await generator.listTemplates();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📋 Available Cursor Rules Templates:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1. readme-data-model.mdc (rules)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('2. readme-summary.mdc (rules)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('3. update-docs.md (commands)')
      );
    });

    it('should handle no templates found', async () => {
      glob.sync.mockImplementation(() => []);

      await generator.listTemplates();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No template files found')
      );
    });

    it('should handle errors during listing', async () => {
      const error = new Error('Glob failed');
      glob.sync.mockImplementation(() => {
        throw error;
      });

      // Mock process.exit to prevent test termination
      const processExit = jest.spyOn(process, 'exit').mockImplementation();

      await generator.listTemplates();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error listing templates:'),
        'Glob failed'
      );
      expect(processExit).toHaveBeenCalledWith(1);

      processExit.mockRestore();
    });
  });

  describe('cleanRules', () => {
    beforeEach(() => {
      glob.sync
        .mockReturnValueOnce([
          'readme-data-model.mdc',
          'readme-summary.mdc'
        ]) // rules files
        .mockReturnValueOnce([
          'update-docs.md'
        ]); // commands files
    });

    it('should remove only template files', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.remove.mockResolvedValue();
      fs.readdir.mockResolvedValue(['custom-rule.mdc']);

      await generator.cleanRules();

      // Verify template files were removed
      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('.cursor/rules/readme-data-model.mdc')
      );
      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('.cursor/rules/readme-summary.mdc')
      );
      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('.cursor/commands/update-docs.md')
      );

      // Verify directory was kept (contains other files)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📁 Directory .cursor/rules kept (contains other files)')
      );
    });

    it('should remove empty directory when no other files exist', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.remove.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);

      await generator.cleanRules();

      // Verify directories were removed
      expect(fs.remove).toHaveBeenCalledWith('.cursor/rules');
      expect(fs.remove).toHaveBeenCalledWith('.cursor/commands');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed empty directory: .cursor/rules')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed empty directory: .cursor/commands')
      );
    });

    it('should handle files not found', async () => {
      fs.pathExists
        .mockResolvedValueOnce(true)  // for first rules file
        .mockResolvedValueOnce(false) // for second rules file
        .mockResolvedValueOnce(true)  // for commands file
        .mockResolvedValueOnce(true)  // for rules directory check
        .mockResolvedValueOnce(true); // for commands directory check
      fs.remove.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);

      await generator.cleanRules();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed: readme-data-model.mdc (from .cursor/rules)')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚪ Not found: readme-summary.mdc')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed: update-docs.md (from .cursor/commands)')
      );
    });

    it('should handle no template files to clean', async () => {
      // Reset the mock completely for this test
      glob.sync.mockReset();
      glob.sync.mockImplementation(() => []);

      await generator.cleanRules();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚠️  No template files found to clean')
      );
    });

    it('should handle errors during cleanup', async () => {
      const error = new Error('Cleanup failed');
      fs.pathExists.mockRejectedValue(error);

      // Mock process.exit to prevent test termination
      const processExit = jest.spyOn(process, 'exit').mockImplementation();

      await generator.cleanRules();

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error cleaning rules:'),
        'Cleanup failed'
      );
      expect(processExit).toHaveBeenCalledWith(1);

      processExit.mockRestore();
    });
  });
});
