import { GoogleGenAI } from '@google/genai';
import chalk from 'chalk';

export interface AskOptions {
  provider?: 'api' | 'local';
  model?: string;
  ollamaHost?: string;
}

/**
 * Universal AI query interface supporting dual mode:
 * 1. API: Google Gemini API hosting Gemma
 * 2. Local: Ollama (100% offline air-gapped)
 */
export async function queryGemma(
  prompt: string,
  systemInstruction?: string,
  options?: AskOptions
): Promise<string> {
  const provider = options?.provider ?? (process.env.CLOAK_PROVIDER === 'local' ? 'local' : 'api');

  if (provider === 'local') {
    return queryLocalOllama(prompt, systemInstruction, options);
  }

  return queryGeminiApi(prompt, systemInstruction, options);
}

/**
 * Cloud API implementation using official Google GenAI SDK.
 */
async function queryGeminiApi(
  prompt: string,
  systemInstruction?: string,
  options?: AskOptions
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set.\n' +
      '  Set it via: export GEMINI_API_KEY="your-key"\n' +
      '  Or run locally offline using: cloak ask --local "..."'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = options?.model ?? 'gemma-4-26b-a4b-it';
  const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

  async function executeCall(m: string): Promise<string> {
    const res = await ai.models.generateContent({
      model: m,
      contents
    });
    return res.text ?? '';
  }

  try {
    if (modelName === 'gemma-4-31b-it') {
      // Race 31B against a 12s timeout; if congested, seamlessly failover to 26B-A4B MoE
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('31B server queue timeout (12s)')), 12000)
      );
      try {
        return await Promise.race([executeCall(modelName), timeoutPromise]);
      } catch (raceErr) {
        console.log(chalk.dim(`  cloak › gemma-4-31b-it congested, auto-routing to fast gemma-4-26b-a4b-it MoE...`));
        return await executeCall('gemma-4-26b-a4b-it');
      }
    }

    return await executeCall(modelName);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Gemini API Error (${modelName}): ${errMsg}`);
  }
}

/**
 * Detect available local Gemma model from Ollama, defaulting to gemma2:2b.
 */
export async function getLocalGemmaModel(
  host = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434'
): Promise<string> {
  try {
    const listRes = await fetch(`${host}/api/tags`).catch(() => null);
    if (listRes && listRes.ok) {
      const data = (await listRes.json()) as { models?: Array<{ name: string }> };
      const installed = data.models?.map((m) => m.name) ?? [];
      if (installed.length > 0) {
        const match = installed.find((m) => m.toLowerCase().includes('gemma')) ?? installed[0];
        if (match) {
          return match;
        }
      }
    }
  } catch {
    // Fall back
  }
  return 'gemma2:2b';
}

/**
 * 100% local, offline implementation via Ollama REST API.
 */
async function queryLocalOllama(
  prompt: string,
  systemInstruction?: string,
  options?: AskOptions
): Promise<string> {
  const host = options?.ollamaHost ?? process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434';
  const model = options?.model ?? (await getLocalGemmaModel(host));

  try {
    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemInstruction,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { response: string };
    return data.response ?? '';
  } catch (err) {
    throw new Error(
      `Local Ollama Error (${host}): ${err instanceof Error ? err.message : String(err)}.\n` +
      '  Make sure Ollama is running (`ollama serve`) or run via API (`cloak ask --api`)'
    );
  }
}
