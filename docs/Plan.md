## Tổng quan

Ứng dụng desktop dịch thuật file text/markdown dài sử dụng LLM API, hỗ trợ cấu hình nhiều tài khoản để xử lý rate limit.

---

## 1. Khởi tạo dự án

### 1.1 Setup Tauri v2 + React 19 + TypeScript
- Sử dụng `create-tauri-app` với template React + TypeScript
- Cấu hình Vite + TailwindCSS cho UI hiện đại
- Cài đặt dependencies cần thiết

### 1.2 Cấu trúc thư mục
```
X-Translate/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── FileUploader.tsx
│   │   ├── TranslationView.tsx
│   │   ├── SettingsModal.tsx
│   │   └── AccountManager.tsx
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   │   └── llm.ts          # LLM API caller
│   ├── stores/             # State management
│   │   ├── settingsStore.ts
│   │   └── translationStore.ts
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilities
│   │   └── fileChunker.ts  # Chia file dài
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/       # Tauri commands
│   │       ├── file.rs     # File operations
│   │       └── translate.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

---

## 2. Thiết kế giao diện (GUI)

### 2.1 Layout chính
```
┌─────────────────────────────────────────────────────────┐
│  X-Translate                              [Settings] ⚙️  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  📁 Files  │   ┌─────────────────────────────────────┐  │
│            │   │  Drop file here or click to browse  │  │
│  History   │   └─────────────────────────────────────┘  │
│            │                                            │
│            │   Source Language: [Auto-detect ▼]         │
│            │   Target Language: [Vietnamese ▼]          │
│            │                                            │
│            │   [▶ Translate]                            │
│            │                                            │
│            │   ┌──────────────┬─────────────────────┐  │
│            │   │   Original   │    Translated       │  │
│            │   │              │                     │  │
│            │   │   (content)  │    (content)        │  │
│            │   │              │                     │  │
│            │   └──────────────┴─────────────────────┘  │
│            │                                            │
│            │   Progress: [████████░░░░] 65%             │
│            │                                            │
│            │   [💾 Save Translation]                    │
└────────────┴────────────────────────────────────────────┘
```

### 2.2 Settings Modal - Quản lý LLM Accounts
```
┌─────────────────────────────────────────────────────────┐
│  Settings                                         [X]   │
├─────────────────────────────────────────────────────────┤
│  LLM Accounts                         [+ Add Account]   │
│  ─────────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Account 1: Fireworks AI                    [Edit] │  │
│  │ URL: https://api.fireworks.ai/inference/v1/...    │  │
│  │ Model: deepseek-v3p2                              │  │
│  │ Status: ✅ Active                         [Delete]│  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Account 2: OpenRouter                      [Edit] │  │
│  │ URL: https://openrouter.ai/api/v1/...             │  │
│  │ Model: anthropic/claude-3                         │  │
│  │ Status: ✅ Active                         [Delete]│  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Translation Settings                                   │
│  ─────────────────────────────────────────────────────  │
│  Chunk Size:      [4000] characters                     │
│  Request Delay:   [1000] ms (avoid rate limit)          │
│  Max Retries:     [3]                                   │
│  Temperature:     [0.6]                                 │
│                                                         │
│                              [Cancel]  [Save Settings]  │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Add/Edit Account Modal
```
┌─────────────────────────────────────────────────────────┐
│  Add LLM Account                                  [X]   │
├─────────────────────────────────────────────────────────┤
│  Account Name:    [___________________________]         │
│                                                         │
│  API Base URL:    [___________________________]         │
│  Example: https://api.fireworks.ai/inference/v1         │
│                                                         │
│  API Key:         [___________________________]  👁️     │
│                                                         │
│  Model ID:        [___________________________]         │
│  Example: accounts/fireworks/models/deepseek-v3p2       │
│                                                         │
│  [Test Connection]                                      │
│                                                         │
│                              [Cancel]  [Save Account]   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Chức năng chính

### 3.1 Đọc và xử lý file
- **File types**: `.txt`, `.md`, `.markdown`
- **Chunking**: Chia file dài thành các đoạn ~2000-4000 ký tự (giữ nguyên paragraph)
- **Encoding**: Hỗ trợ UTF-8

### 3.2 Dịch thuật với LLM
- **API Format**: OpenAI-compatible chat completions
- **Rate Limit Handling**:
  - Round-robin qua các accounts
  - Auto-retry với exponential backoff
  - Delay giữa các requests
- **Prompt Template**:
  ```
  Translate the following text into {target_language}.
  
  Rules:
  - Preserve the original formatting (line breaks, spacing, punctuation, markdown, etc.)
  - Do not add any explanation or commentary
  - Only output the translated text
  
  Text:
  {chunk_content}
  ```

### 3.3 Quản lý LLM Accounts
- Thêm/sửa/xóa accounts
- Test connection
- Lưu trữ encrypted trong local storage (Tauri secure storage)
- Đánh dấu active/inactive

### 3.4 Lưu kết quả
- Export file đã dịch (giữ nguyên định dạng)
- Lưu lịch sử dịch

---

## 4. Các file cần tạo/sửa

| File | Mục đích |
|------|----------|
| `src-tauri/tauri.conf.json` | Cấu hình Tauri, permissions |
| `src-tauri/src/lib.rs` | Tauri commands (file ops, HTTP) |
| `src/types/index.ts` | TypeScript interfaces |
| `src/stores/settingsStore.ts` | Zustand store cho settings |
| `src/stores/translationStore.ts` | State quản lý quá trình dịch |
| `src/services/llm.ts` | LLM API service |
| `src/utils/fileChunker.ts` | Logic chia file thành chunks |
| `src/components/FileUploader.tsx` | Component upload file |
| `src/components/TranslationView.tsx` | Hiển thị original/translated |
| `src/components/SettingsModal.tsx` | Modal settings |
| `src/components/AccountManager.tsx` | Quản lý LLM accounts |
| `src/components/AccountForm.tsx` | Form thêm/sửa account |
| `src/App.tsx` | Main layout |

---

## 5. Dependencies cần cài đặt

### Frontend (npm)
- `zustand` - State management
- `@tauri-apps/api` - Tauri API
- `@tauri-apps/plugin-fs` - File system
- `@tauri-apps/plugin-http` - HTTP requests
- `@tauri-apps/plugin-store` - Secure storage
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `react-dropzone` - File upload

### Backend (Cargo.toml)
- `tauri` v2
- `tauri-plugin-fs`
- `tauri-plugin-http`
- `tauri-plugin-store`
- `serde`, `serde_json`

---

## 6. Luồng hoạt động

```
User upload file
       ↓
Read file content (Tauri FS)
       ↓
Split into chunks (preserve paragraphs)
       ↓
For each chunk:
  ├─ Select next available LLM account (round-robin)
  ├─ Call LLM API with translation prompt
  ├─ Handle rate limit (retry/switch account)
  ├─ Update progress bar
  └─ Append translated chunk
       ↓
Combine all translated chunks
       ↓
Display result (side-by-side view)
       ↓
User can save/export
```

---

## 7. Thứ tự thực hiện

1. **Khởi tạo project** - Tauri v2 + React + TypeScript + TailwindCSS
2. **Tạo types và stores** - Định nghĩa data structures
3. **Xây dựng UI components** - Layout, FileUploader, TranslationView
4. **Implement LLM service** - API calls, rate limit handling
5. **Settings & Account Manager** - Quản lý nhiều accounts
6. **File chunking logic** - Chia file dài
7. **Translation flow** - Kết nối tất cả
8. **Testing & Polish** - Xử lý edge cases

## Bổ sung vào kế hoạch gốc

---

## 8. Multi-threading Translation (Dịch song song)

### 8.1 Kiến trúc xử lý đa luồng

```
File Input (1000 chunks)
         ↓
    Chunk Queue
         ↓
┌────────┬────────┬────────┬────────┬────────┐
│Thread 1│Thread 2│Thread 3│Thread 4│Thread 5│
│ LLM-1  │ LLM-2  │ LLM-3  │ LLM-4  │ LLM-5  │
└────┬───┴────┬───┴────┬───┴────┬───┴────┬───┘
     │        │        │        │        │
     └────────┴────────┴────────┴────────┘
                      ↓
              Result Collector
              (Sắp xếp theo thứ tự)
                      ↓
              Final Translation
```

### 8.2 Cấu hình Concurrency Settings

```
┌─────────────────────────────────────────────────────────┐
│  Concurrency Settings                                   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Concurrent Threads:  [Auto ▼]  (= số accounts active)  │
│                       ├─ Auto (match active accounts)   │
│                       ├─ 1                              │
│                       ├─ 2                              │
│                       ├─ 3                              │
│                       ├─ 5                              │
│                       └─ 10                             │
│                                                         │
│  Request Delay per Thread: [500] ms                     │
│                                                         │
│  ⚠️ Note: More threads = faster, but higher rate limit  │
│           risk. Recommended: 1 thread per LLM account   │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Logic phân phối (Worker Pool Pattern)

```typescript
// src/services/translationWorker.ts

interface TranslationJob {
  chunkIndex: number;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  assignedAccount?: string;
}

interface WorkerState {
  accountId: string;
  busy: boolean;
  currentJob?: number;
  completedCount: number;
  errorCount: number;
}

// Mỗi worker gắn với 1 LLM account
// Workers chạy song song, lấy job từ queue
```

---

## 9. Giao diện tiến trình dịch (Translation Progress UI)

### 9.1 Progress Panel - Khi đang dịch

```
┌─────────────────────────────────────────────────────────────────┐
│  Translation Progress                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  File: document.md (125 chunks)                                 │
│                                                                 │
│  Overall Progress: ████████████████░░░░░░░░░░ 64% (80/125)     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Active Workers                                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🟢 Worker 1 (Fireworks-1)  │ Chunk #82  │ ████░ 80%    │   │
│  │  🟢 Worker 2 (Fireworks-2)  │ Chunk #83  │ ██░░░ 40%    │   │
│  │  🟢 Worker 3 (OpenRouter)   │ Chunk #84  │ █░░░░ 20%    │   │
│  │  🟡 Worker 4 (DeepSeek)     │ Waiting... │ Rate limited │   │
│  │  🟢 Worker 5 (Anthropic)    │ Chunk #85  │ ███░░ 60%    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Statistics:                                                    │
│  ├─ Completed: 80 chunks                                        │
│  ├─ In Progress: 4 chunks                                       │
│  ├─ Pending: 41 chunks                                          │
│  ├─ Failed: 0 chunks                                            │
│  ├─ Elapsed: 2m 34s                                             │
│  └─ Estimated: ~1m 30s remaining                                │
│                                                                 │
│  [⏸️ Pause]  [⏹️ Stop]                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Chunk Status Grid (Visual overview)

```
┌─────────────────────────────────────────────────────────────────┐
│  Chunk Status (hover for details)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅  1-20                │
│  ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅  21-40               │
│  ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅  41-60               │
│  ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅  61-80               │
│  🔄🔄🔄🔄⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳  81-100              │
│  ⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳  101-120             │
│  ⏳⏳⏳⏳⏳                                      121-125             │
│                                                                 │
│  Legend: ✅ Done  🔄 Processing  ⏳ Pending  ❌ Failed          │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Real-time Log Panel

```
┌─────────────────────────────────────────────────────────────────┐
│  Activity Log                                    [Clear] [📋]   │
├─────────────────────────────────────────────────────────────────┤
│  14:32:15  [Worker 1]  ✅ Chunk #80 completed (2.3s)            │
│  14:32:16  [Worker 3]  ✅ Chunk #81 completed (1.8s)            │
│  14:32:17  [Worker 4]  ⚠️ Rate limit hit, waiting 5s...         │
│  14:32:18  [Worker 2]  🔄 Processing chunk #83...               │
│  14:32:19  [Worker 1]  🔄 Processing chunk #82...               │
│  14:32:20  [Worker 5]  ✅ Chunk #79 completed (3.1s)            │
│  14:32:21  [Worker 5]  🔄 Processing chunk #85...               │
│  ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. State Management cho Progress

### 10.1 Translation Store (Zustand)

```typescript
// src/stores/translationStore.ts

interface TranslationState {
  // Job status
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  
  // File info
  fileName: string;
  totalChunks: number;
  
  // Progress
  chunks: ChunkStatus[];
  completedCount: number;
  failedCount: number;
  
  // Workers
  workers: WorkerState[];
  
  // Timing
  startTime: number;
  estimatedRemaining: number;
  
  // Logs
  logs: LogEntry[];
  
  // Actions
  startTranslation: (file: File, accounts: LLMAccount[]) => Promise<void>;
  pauseTranslation: () => void;
  resumeTranslation: () => void;
  stopTranslation: () => void;
  retryFailed: () => void;
}

interface ChunkStatus {
  index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  workerId?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
}

interface LogEntry {
  timestamp: number;
  workerId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
```

---

## 11. Components bổ sung

| File | Mục đích |
| --- | --- |
| `src/components/ProgressPanel.tsx` | Panel hiển thị tiến trình tổng quan |
| `src/components/WorkerStatus.tsx` | Hiển thị trạng thái từng worker |
| `src/components/ChunkGrid.tsx` | Grid visual của các chunks |
| `src/components/ActivityLog.tsx` | Log panel real-time |
| `src/services/workerPool.ts` | Logic quản lý worker pool |
| `src/services/translationQueue.ts` | Job queue management |

---

## 12. Flow xử lý đa luồng

```
1. User click "Translate"
         ↓
2. Chia file thành N chunks → Đưa vào Queue
         ↓
3. Tạo M workers (M = số active accounts hoặc config)
         ↓
4. Mỗi worker:
   ┌─────────────────────────────────────┐
   │  while (queue not empty):          │
   │    - Lấy chunk từ queue            │
   │    - Update UI: "Processing..."    │
   │    - Gọi LLM API                   │
   │    - Nếu rate limit:               │
   │      → Wait + retry                │
   │      → Update UI: "Rate limited"   │
   │    - Nếu thành công:               │
   │      → Lưu result                  │
   │      → Update UI: "Completed"      │
   │    - Nếu fail:                     │
   │      → Log error                   │
   │      → Đưa lại vào queue (retry)   │
   └─────────────────────────────────────┘
         ↓
5. Khi tất cả chunks done:
   - Ghép results theo thứ tự index
   - Hiển thị kết quả
   - Enable nút "Save"
```

---

## 13. Cập nhật thứ tự thực hiện

 1. **Khởi tạo project** - Tauri v2 + React + TypeScript + TailwindCSS
 2. **Tạo types và stores** - Định nghĩa data structures (bao gồm worker state)
 3. **Xây dựng UI cơ bản** - Layout, FileUploader
 4. **Implement Worker Pool** - Quản lý đa luồng
 5. **Implement Translation Queue** - Job queue system
 6. **LLM service** - API calls với rate limit handling
 7. **Progress UI components** - ProgressPanel, WorkerStatus, ChunkGrid, ActivityLog
 8. **Settings & Account Manager** - Quản lý accounts + concurrency config
 9. **Translation View** - Hiển thị kết quả
10. **Integration & Testing** - Kết nối tất cả, xử lý edge cases