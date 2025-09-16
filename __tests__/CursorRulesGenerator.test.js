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
      expect(generator.templatesDir).toContain('templates/rules');
      expect(generator.destinationDir).toBe('.cursor/rules');
    });
  });

  describe('copyRules', () => {
    beforeEach(() => {
      // Mock glob to return template files
      glob.sync.mockReturnValue([
        'readme-data-model.mdc',
        'readme-content.mdc',
        'readme-config.mdc',
        'readme-async-messaging.mdc'
      ]);
    });

    it('should copy all template files successfully', async () => {
      // Mock fs-extra methods
      fs.ensureDir.mockResolvedValue();
      fs.copy.mockResolvedValue();

      await generator.copyRules();

      // Verify directory creation
      expect(fs.ensureDir).toHaveBeenCalledWith('.cursor/rules');

      // Verify all files were copied
      expect(fs.copy).toHaveBeenCalledTimes(4);
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('templates/rules/readme-data-model.mdc'),
        expect.stringContaining('.cursor/rules/readme-data-model.mdc')
      );

      // Verify console output
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🚀 WeOrbitant Cursor Rules Generator')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📁 Found 4 template files:')
      );
    });

    it('should handle no template files found', async () => {
      glob.sync.mockReturnValue([]);
      fs.ensureDir.mockResolvedValue();

      await generator.copyRules();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚠️  No template files found')
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
      glob.sync.mockReturnValue([
        'readme-data-model.mdc',
        'readme-content.mdc'
      ]);

      await generator.listTemplates();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('📋 Available Cursor Rules Templates:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1. readme-data-model.mdc')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('2. readme-content.mdc')
      );
    });

    it('should handle no templates found', async () => {
      glob.sync.mockReturnValue([]);

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
      glob.sync.mockReturnValue([
        'readme-data-model.mdc',
        'readme-content.mdc'
      ]);
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
        expect.stringContaining('.cursor/rules/readme-content.mdc')
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

      // Verify directory was removed
      expect(fs.remove).toHaveBeenCalledWith('.cursor/rules');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed empty directory: .cursor/rules')
      );
    });

    it('should handle files not found', async () => {
      fs.pathExists
        .mockResolvedValueOnce(true)  // for first file
        .mockResolvedValueOnce(false) // for second file
        .mockResolvedValueOnce(true); // for directory check
      fs.remove.mockResolvedValue();
      fs.readdir.mockResolvedValue([]);

      await generator.cleanRules();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Removed: readme-data-model.mdc')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('⚪ Not found: readme-content.mdc')
      );
    });

    it('should handle no template files to clean', async () => {
      glob.sync.mockReturnValue([]);

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
