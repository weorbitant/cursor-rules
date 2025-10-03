# Update Documentation

This file contains commands and instructions for updating project documentation.

## README.md table of content

**When:** Always
**Apply rules:** `readme-summary.mdc`

**When:** RabbitMQ config found in `src/config/*.ts`
**Apply rules:** `readme-async-messaging.mdc`

**When:** Domain models exist in `src/domain/models/`
**Apply rules:** `readme-data-model.mdc`

**When:** Config files detected (`src/config/`, `.env`, etc.)
**Apply rules:** `readme-config.mdc`

**When:** Project wide files changed (`.nvmrc`, `package.json`, `src/app.module.ts`, `Dockerfile`, `.github/workflows/*.yml`, etc)
**Apply rules:** `readme-development.mdc`
