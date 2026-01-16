# X-Translate

A powerful LLM-powered file translation application that supports translating long text/markdown files with multi-threading capabilities.

## Features

- Translate `.txt`, `.md`, `.markdown` files
- Support for long documents (automatic chunking)
- Multi-threading translation (parallel processing with multiple LLM accounts)
- Real-time progress tracking with worker status
- Multiple LLM account management (handle rate limits)
- Configurable LLM settings (URL base, model, temperature, etc.)
- Support for any OpenAI-compatible API

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS v4, Zustand
- **Desktop**: Tauri v2 (optional)
- **Backend**: Node.js, Express (for web deployment)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/X-Translate.git
cd X-Translate

# Install dependencies
npm install

# Build the frontend
npm run build
```

## Deployment

### Option 1: Deploy to VPS

#### 1. Clone and build

```bash
git clone https://github.com/yourusername/X-Translate.git
cd X-Translate
npm install
npm run build
```

#### 2. Configure environment (optional)

```bash
cp env.example .env
# Edit .env if needed
```

#### 3. Run with PM2 (recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name x-translate

# Auto-start on system reboot
pm2 save
pm2 startup
```

#### 4. Configure Nginx reverse proxy

Create `/etc/nginx/sites-available/your-domain.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/your-domain.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate with Certbot
sudo certbot --nginx -d your-domain.com
```

### Option 2: Deploy to Vercel

#### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

#### 3. Configure custom domain

1. Go to your project's **Settings > Domains**
2. Add your custom domain (e.g., `dich.taiha.dev`)
3. Configure DNS:
   - Add CNAME record: `your-subdomain` → `cname.vercel-dns.com`

#### 4. Deploy via CLI (alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add custom domain
vercel domains add your-domain.com
```

## Development

### Run locally (frontend only)

```bash
npm run dev
```

### Run with backend server

```bash
npm run build
npm start
```

### Run as Tauri desktop app

Requires Rust and Visual Studio Build Tools installed.

```bash
npm run tauri:dev
```

## Configuration

### LLM Account Setup

1. Open the app and click **Settings**
2. Go to **LLM Accounts** tab
3. Click **Add Account**
4. Enter:
   - **Account Name**: e.g., "Fireworks AI"
   - **API Base URL**: e.g., `https://api.fireworks.ai/inference/v1`
   - **API Key**: Your API key
   - **Model ID**: e.g., `accounts/fireworks/models/deepseek-v3p2`
5. Click **Test Connection** to verify
6. Click **Save Account**

### Translation Settings

- **Concurrent Threads**: Number of parallel workers (auto = number of active accounts)
- **Request Delay**: Delay between requests to avoid rate limits
- **Chunk Size**: Maximum characters per translation chunk
- **Max Retries**: Retry count for failed chunks
- **Temperature**: LLM creativity (0 = deterministic, 1 = creative)

## API Compatibility

X-Translate works with any OpenAI-compatible API, including:

- OpenAI
- Fireworks AI
- OpenRouter
- Together AI
- Groq
- Local LLMs (Ollama, LM Studio, etc.)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm start` | Run production server |
| `npm run tauri:dev` | Run Tauri in development mode |
| `npm run tauri:build` | Build Tauri desktop application |

## License

MIT
