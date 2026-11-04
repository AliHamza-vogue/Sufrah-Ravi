import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auto-Translation Endpoint: Translates any English/Urdu text into Saudi Qassim Province Dialect (اللهجة القصيمية)
  app.post('/api/translate/qassimi', async (req, res) => {
    try {
      const { texts } = req.body as { texts?: string[] };
      if (!Array.isArray(texts) || texts.length === 0) {
        res.json({ translations: [] });
        return;
      }

      const sanitizedTexts = texts.slice(0, 40).map((t) => {
        const raw = String(t || '').trim();
        // If the string has both English and Arabic (e.g. "Our Menu · قائمة الطعام"), remove the part that is already in Arabic
        if (/[a-zA-Z]/.test(raw) && /[\u0600-\u06FF]/.test(raw)) {
          return raw
            .replace(/[\u0600-\u06FF]+/g, '')
            .replace(/[·•|()[\]]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        return raw;
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Translate the following array of restaurant website strings/reviews into authentic, warm Saudi local dialect from the Qassim region.
Use natural Qassimi expressions where appropriate (such as بالحيل، على الكيف، يا هلا والله، وش تشتهي، الحين، مضبوط، مقرمش، زين، إلخ) while keeping food names, prices (SAR / ريال), and order numbers accurate and clear.
IMPORTANT RULES:
1. NEVER mention "Al Qasim", "Qassim", or "القصيم" in the translated text.
2. If any input string contains text that was already in Arabic alongside English, do not repeat or duplicate it—output a single clean Arabic translation.
3. Return a JSON array of translated strings in the exact same order and length as the input array.

Input JSON array:
${JSON.stringify(sanitizedTexts)}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a native speaker from Saudi Arabia and a culinary localization expert for Sufrah Ravi (سفرة راوي). Always output natural, hospitable Qassimi Saudi Arabic dialect without ever mentioning the word القصيم or Qassim.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);
      const translations = Array.isArray(parsed) ? parsed : sanitizedTexts;

      res.json({ translations });
    } catch (error) {
      console.error('Qassimi translation error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to translate text to Qassimi Arabic dialect.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sufrah Ravi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
