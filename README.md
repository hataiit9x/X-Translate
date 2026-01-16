# X-Translate

A desktop application for LLM-powered file translation built with Tauri and React.

## Features

- **Multi-LLM Support**: Configure multiple LLM accounts (OpenAI, Anthropic, etc.) for parallel translation
- **Chunk-based Processing**: Splits large files into manageable chunks for efficient translation
- **Worker Pool**: Distributes translation tasks across multiple workers for faster processing
- **Real-time Progress**: Visual progress tracking with chunk grid and activity logs
- **Pause/Resume**: Control translation jobs with pause, resume, and retry capabilities
- **Language Selection**: Support for multiple source and target languages

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Zustand
- **Backend**: Tauri 2 (Rust)
- **Build**: Vite 7

## Prerequisites

- Node.js (v18+)
- Rust (1.77.2+)
- Tauri CLI

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm run tauri:dev` | Run Tauri in development mode |
| `npm run tauri:build` | Build Tauri application |

## Usage

1. Open the application and configure LLM accounts in Settings
2. Upload a text file for translation
3. Select source and target languages
4. Click "Translate" to start the translation process
5. Monitor progress via the chunk grid and activity log
6. Save the translated file when complete

## License

[MIT License](LICENSE)
