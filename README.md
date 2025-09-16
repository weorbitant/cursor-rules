# @weorbitant/cursor-rules

A Node.js package for generating and managing Cursor IDE rules from templates. This package allows you to easily copy predefined Cursor rules to your project's `.cursor/rules` directory.

## 🚀 Features

- **Template-based Rule Generation**: Copy Cursor rules from predefined templates
- **Selective File Management**: Only manages files from this package, preserving user's custom rules
- **CLI Interface**: Easy-to-use command-line interface
- **Safe Operations**: Non-destructive clean operations that preserve user files
- **Smart Directory Management**: Automatically handles directory creation and cleanup

## 📦 Installation

Install as a dev dependency in your project:

```bash
npm install --save-dev @weorbitant/cursor-rules
```

## 🎯 Usage

### Available Commands

#### Copy Rules
Copy all rule templates to your project's `.cursor/rules` directory:

```bash
npx @weorbitant/cursor-rules copy
```

#### List Templates
View all available rule templates:

```bash
npx @weorbitant/cursor-rules list
```

#### Clean Rules
Remove only the rules that were copied from this package (preserves user's custom rules):

```bash
npx @weorbitant/cursor-rules copy
```

#### Show Help
Display available commands and usage information:

```bash
npx @weorbitant/cursor-rules
# or
npx @weorbitant/cursor-rules --help
```

### Package.json Scripts

Add to your `package.json` for easy access:

```json
{
  "scripts": {
    "cursor:rules": "npx @weorbitant/cursor-rules copy",
    "cursor:rules:list": "npx @weorbitant/cursor-rules list",
    "cursor:rules:clean": "npx @weorbitant/cursor-rules clean"
  }
}
```

Then run:
```bash
npm run cursor:rules
```

## 📁 Available Templates

This package includes the following Cursor rule templates:

1. **readme-async-messaging.mdc** - Auto-update README with async messaging architecture
2. **readme-config.mdc** - Auto-update README with configuration section
3. **readme-content.mdc** - Auto-update README with content management rules
4. **readme-data-model.mdc** - Auto-update README with data model documentation

## 🔧 How It Works

1. **Template Discovery**: Scans the `templates/rules/` directory for `.mdc` files
2. **Destination Management**: Creates `.cursor/rules/` directory if it doesn't exist
3. **File Copying**: Copies each template file, preserving directory structure
4. **Safe Cleanup**: Only removes files that were originally copied from this package

## 🛡️ Safety Features

- **Non-destructive**: Clean operations only remove files from this package
- **Preserves User Files**: Keeps any custom rules you've added to `.cursor/rules/`
- **Smart Directory Management**: Only removes empty directories
- **Error Handling**: Comprehensive error handling with clear messages

## 📋 Example Output

### Copy Command
```
🚀 WeOrbitant Cursor Rules Generator
================================
✅ Created directory: .cursor/rules
📁 Found 4 template files:
  ✅ Copied: readme-data-model.mdc
  ✅ Copied: readme-content.mdc
  ✅ Copied: readme-config.mdc
  ✅ Copied: readme-async-messaging.mdc

🎉 Successfully copied 4 rule files to .cursor/rules/
You can now use these rules in your Cursor IDE!
```

### Clean Command
```
🧹 Cleaning WeOrbitant Cursor Rules
================================
  ✅ Removed: readme-data-model.mdc
  ✅ Removed: readme-content.mdc
  ✅ Removed: readme-config.mdc
  ✅ Removed: readme-async-messaging.mdc
📁 Directory .cursor/rules kept (contains other files)

🎉 Cleanup complete!
  • Removed: 4 files
  • Not found: 0 files
```

## 🔗 Integration

### With Cursor IDE

After running the copy command, your Cursor IDE will automatically detect the rules in `.cursor/rules/` and apply them to your project.

### With CI/CD

Add to your CI/CD pipeline to ensure consistent rules across environments:

```yaml
# GitHub Actions example
- name: Setup Cursor Rules
  run: npx @weorbitant/cursor-rules copy
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

