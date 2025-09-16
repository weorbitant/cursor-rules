const { execSync } = require('child_process');
const path = require('path');

// Mock child_process
jest.mock('child_process');

describe('CLI', () => {
  let mockConsoleLog;
  let mockConsoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Command execution', () => {
    it('should have correct CLI structure', () => {
      // Test that the CLI file can be parsed without syntax errors
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      
      // Remove shebang line for testing
      const jsContent = cliContent.replace(/^#!/, '//');
      
      // Verify it's a valid JavaScript file
      expect(() => {
        new Function(jsContent);
      }).not.toThrow();
    });
  });

  describe('CLI file structure', () => {
    it('should have correct shebang', () => {
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toMatch(/^#!/);
      expect(cliContent).toContain('#!/usr/bin/env node');
    });

    it('should import required modules', () => {
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain("require('commander')");
      expect(cliContent).toContain("require('../index')");
      expect(cliContent).toContain("require('chalk')");
    });

    it('should define all expected commands', () => {
      const cliPath = path.join(__dirname, '../bin/cli.js');
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('.command(\'copy\')');
      expect(cliContent).toContain('.command(\'list\')');
      expect(cliContent).toContain('.command(\'clean\')');
      expect(cliContent).toContain('.action(async () => {');
    });
  });
});
