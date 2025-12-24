# A prototypal AI assistant for Visual Studio Code

<p align="center">
  <img src="media/icons/chatIcon.svg" alt="AI Assistant Logo" width="120" height="120">
</p>

<p align="center">
  <em>A customizable, extensible AI coding assistant for Visual Studio Code, developed as my Bachelor's Degree thesis project</em><br>
</p>

## Overview

This is a prototypal AI assistant extension for Visual Studio Code, inspired by GitHub Copilot. Built with extensibility in mind, it provides intelligent code completions, inline editing capabilities, and a full-featured chat interface.

## ✨ Features

### 🔮 Inline Code Completions
Context-aware code suggestions as you type. Configurable idle delay, built-in rate limiting, and support for a dedicated completion model.

### ✏️ Inline Code Editing
A series of commands that allows to transform the selected code in the current editor (or the whole document if no selection is made).

| Command | Description | Default Shortcut |
|---------|-------------|----------|
| **Edit** | Apply custom edits to selected code | `Ctrl+Shift+E` |
| **Refactor** | Intelligently refactor selected code | `Ctrl+Shift+R` |
| **Generate Docs** | Add documentation comments to code | — |

### 💬 Chat Panel
Sidebar panel for conversational interactions. Supports file attachments for context, optional web search grounding, conversation history, and markdown rendering with syntax highlighting.

## 🚀 Getting Started

### Prerequisites

- Visual Studio Code v1.74.0 or higher
- A Google AI API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to launch the extension in a new Extension Development Host window

### Configuration

Configure the extension via VS Code Settings (`Ctrl+,`) under "AI Assistant".
The minimum required settings are the AI provider (default is "google"), the API key and the base (default) model to use for the various extension features.

>***Note***: Currently only Google AI models are supported, but the extension's architecture is designed to easily add other AI providers if needed.

**Example minimal configuration:**
```json
{
  "ai-assistant.provider": "google",
  "ai-assistant.apiKey": "YOUR_API_KEY",
  "ai-assistant.baseModel": "gemini-2.0-flash", // this is an example
}
```

#### Additional Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `provider` | `string` | `"google"` | AI service provider |
| `apiKey` | `string` | — | API key for the AI services |
| `baseModel` | `string` | — | Default model for AI operations |
| `chatModel` | `string` | — | Model for chat (falls back to `baseModel`) |
| `temperature` | `number` | — | Controls response randomness (0 = deterministic) |
| `maxOutputTokens` | `number` | — | Maximum length of generated responses |
| `topK` | `number` | — | Limits token selection to top K candidates |
| `topP` | `number` | — | Nucleus sampling threshold |
| `enableInlineCompletions` | `boolean` | `true` | Enable/disable inline suggestions |
| `inlineCompletions.model` | `string` | — | Model for inline completions (falls back to `baseModel`) |
| `inlineCompletions.timeBetweenRequests` | `number` | `2000` | Minimum ms between completion requests |
| `inlineCompletions.idleDelay` | `number` | `600` | Ms to wait after typing before requesting |

## 🎨 Customization

### Custom Instructions

Personalize the assistant's behavior by creating an instructions file in your workspace:

```
your-project/
├── .ai/
│   └── agentInstructions.md    ← Your custom instructions
├── src/
└── ...
```

The contents of `.ai/agentInstructions.md` will be included in all AI interactions, allowing you to:

- Define coding style preferences
- Specify project-specific conventions
- Set response format guidelines
- Include domain-specific context

**Example:**
```markdown
# Project Guidelines

- Use TypeScript strict mode conventions
- Prefer functional programming patterns
- Always include JSDoc comments for public APIs
- Follow the existing naming conventions in the codebase
```

## 🛠️ Building the Extension

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run linter
npm run lint
```


