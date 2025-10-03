# @orbitant/cursor-rules

A Node.js package for generating and managing Cursor IDE rules and commands from templates. This package allows you to easily copy predefined Cursor rules to your project's `.cursor/rules` directory and commands to your `.cursor/commands` directory.

## 🚀 Features

- **Template-based Rule Generation**: Copy Cursor rules from predefined templates
- **Template-based Command Generation**: Copy Cursor commands from predefined templates
- **Selective File Management**: Only manages files from this package, preserving user's custom rules and commands
- **CLI Interface**: Easy-to-use command-line interface
- **Safe Operations**: Non-destructive clean operations that preserve user files
- **Smart Directory Management**: Automatically handles directory creation and cleanup

## 📦 Installation

Install as a dev dependency in your project:

```bash
npm install --save-dev @orbitant/cursor-rules
```

## 🎯 Usage

### Available Commands

#### Apply Rules and Commands
Apply all rule and command templates to your project's `.cursor/` directory:

```bash
npx @orbitant/cursor-rules apply
```

#### List Templates
View all available rule templates:

```bash
npx @orbitant/cursor-rules list
```

#### Clean Rules and Commands
Remove only the rules and commands that were copied from this package (preserves user's custom files):

```bash
npx @orbitant/cursor-rules clean
```

#### Show Help
Display available commands and usage information:

```bash
npx @orbitant/cursor-rules
# or
npx @orbitant/cursor-rules --help
```

### Package.json Scripts

Add to your `package.json` for easy access:

```json
{
  "scripts": {
    "cursor:rules": "npx @orbitant/cursor-rules apply",
    "cursor:rules:list": "npx @orbitant/cursor-rules list",
    "cursor:rules:clean": "npx @orbitant/cursor-rules clean"
  }
}
```

Then run:
```bash
npm run cursor:rules
```

## 📁 Available Templates

This package includes the following Cursor rule and command templates:

### Rules (.cursor/rules/)
1. **readme-async-messaging.mdc** - Auto-update README with async messaging architecture
2. **readme-config.mdc** - Auto-update README with configuration section
3. **readme-data-model.mdc** - Auto-update README with data model documentation
4. **readme-development.mdc** - Auto-update README with project setup and development instructions
5. **readme-content.mdc** - Auto-update README overall, defining document sections and which template are intended to use on each one
6. **readme-summary.mdc** - Auto-update README with summary section

### Commands (.cursor/commands/)
1. **update-docs.md** - Command to update project documentation

## 🔧 How It Works

1. **Template Discovery**: Scans the `templates/rules/` directory for `.mdc` files and `templates/commands/` directory for `.md` files
2. **Destination Management**: Creates `.cursor/rules/` and `.cursor/commands/` directories if they don't exist
3. **File Copying**: Copies each template file, preserving directory structure
4. **Safe Cleanup**: Only removes files that were originally copied from this package

## 🛡️ Safety Features

- **Non-destructive**: Clean operations only remove files from this package
- **Preserves User Files**: Keeps any custom rules you've added to `.cursor/rules/`
- **Smart Directory Management**: Only removes empty directories
- **Error Handling**: Comprehensive error handling with clear messages

## 📋 Example Output

### Apply Command
```
🚀 WeOrbitant Cursor Rules Generator
================================
✅ Created directory: .cursor/rules
✅ Created directory: .cursor/commands
📁 Found 4 rule template files:
  ✅ Copied: readme-data-model.mdc
  ✅ Copied: readme-summary.mdc
  ✅ Copied: readme-config.mdc
  ✅ Copied: readme-async-messaging.mdc
📁 Found 1 command template files:
  ✅ Copied: update-docs.md

🎉 Successfully copied 4 rule files to .cursor/rules/
🎉 Successfully copied 1 command file to .cursor/commands/
You can now use these rules and commands in your Cursor IDE!
```

### Clean Command
```
🧹 Cleaning WeOrbitant Cursor Rules
================================
  ✅ Removed: readme-data-model.mdc
  ✅ Removed: readme-summary.mdc
  ✅ Removed: readme-config.mdc
  ✅ Removed: readme-async-messaging.mdc
  ✅ Removed: update-docs.md
📁 Directory .cursor/rules kept (contains other files)
📁 Directory .cursor/commands kept (contains other files)

🎉 Cleanup complete!
  • Removed: 5 files
  • Not found: 0 files
```

## 🔗 Integration

### With Cursor IDE

After running the apply command, your Cursor IDE will automatically detect the rules in `.cursor/rules/` and commands in `.cursor/commands/`, making them available for use in your project.

### With CI/CD

Add to your CI/CD pipeline to ensure consistent rules and commands across environments:

```yaml
# GitHub Actions example
- name: Setup Cursor Rules
  run: npx @orbitant/cursor-rules apply
```

## 🧪 Testing

The package includes comprehensive unit and integration tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Unit Tests**: Test individual methods and error handling
- **Integration Tests**: Test real file operations with temporary directories
- **CLI Tests**: Test command-line interface structure and functionality

## 📝 Requirements

- Node.js >= 14.0.0
- npm or yarn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your template files to `templates/rules/`
4. Test your changes
5. Submit a pull request

## 📄 License

UNLICENSED - See package.json for details

## 🐛 Issues

Report issues at: https://github.com/weorbitant/cursor-rules/issues

## 🏠 Homepage

https://github.com/weorbitant/cursor-rules

