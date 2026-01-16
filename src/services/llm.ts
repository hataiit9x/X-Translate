import type { LLMAccount } from "../types";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const isTauri = () => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

export class LLMService {
  private account: LLMAccount;

  constructor(account: LLMAccount) {
    this.account = account;
  }

  async translate(
    text: string,
    targetLanguage: string,
    temperature: number = 0.6,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const prompt = this.buildTranslationPrompt(text, targetLanguage);

    const request: ChatCompletionRequest = {
      model: this.account.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature,
      top_p: 1,
      top_k: 40,
      presence_penalty: 0,
      frequency_penalty: 0,
    };

    if (onProgress) onProgress(10);

    let response: Response;

    if (isTauri()) {
      const baseUrl = this.account.baseUrl.replace(/\/$/, "");
      const url = `${baseUrl}/chat/completions`;

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.account.apiKey}`,
        },
        body: JSON.stringify(request),
      });
    } else {
      response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Base-URL": this.account.baseUrl,
          "X-API-Key": this.account.apiKey,
        },
        body: JSON.stringify(request),
      });
    }

    if (onProgress) onProgress(80);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new RateLimitError("Rate limit exceeded", errorText);
      }
      throw new LLMError(`API error: ${response.status}`, errorText);
    }

    const data: ChatCompletionResponse = await response.json();

    if (onProgress) onProgress(100);

    if (!data.choices || data.choices.length === 0) {
      throw new LLMError("No response from API", JSON.stringify(data));
    }

    return data.choices[0].message.content.trim();
  }

  private buildTranslationPrompt(text: string, targetLanguage: string): string {
    const languageNames: Record<string, string> = {
      vi: "Vietnamese",
      en: "English",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      fr: "French",
      de: "German",
      es: "Spanish",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
      th: "Thai",
    };

    const targetName = languageNames[targetLanguage] || targetLanguage;

    return `Translate the following text into ${targetName}.

Rules:
- Preserve the original formatting (line breaks, spacing, punctuation, markdown, etc.)
- Do not add any explanation or commentary
- Only output the translated text

Text:
${text}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.translate("Hello", "vi", 0.1);
      return true;
    } catch {
      return false;
    }
  }
}

export class LLMError extends Error {
  details: string;
  constructor(message: string, details: string) {
    super(message);
    this.name = "LLMError";
    this.details = details;
  }
}

export class RateLimitError extends LLMError {
  constructor(message: string, details: string) {
    super(message, details);
    this.name = "RateLimitError";
  }
}
