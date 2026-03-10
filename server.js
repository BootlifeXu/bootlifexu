import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3000;

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY;
const CARTESIA_BASE_URL = process.env.CARTESIA_BASE_URL || 'https://api.cartesia.ai';
const CARTESIA_VERSION = process.env.CARTESIA_VERSION || '2024-06-10';
const CLONE_ENDPOINT = process.env.CARTESIA_CLONE_ENDPOINT || '/voices/clone';
const TTS_ENDPOINT = process.env.CARTESIA_TTS_ENDPOINT || '/tts/bytes';

const upload = multer({ dest: 'tmp/' });

app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));
app.use('/downloads', express.static('downloads'));

function ensureApiKey(res) {
  if (!CARTESIA_API_KEY) {
    res.status(500).json({
      error: 'Missing CARTESIA_API_KEY in environment. Add it to your .env file.'
    });
    return false;
  }
  return true;
}

app.post('/api/clone-voice', upload.single('voiceSample'), async (req, res) => {
  if (!ensureApiKey(res)) return;

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a voice sample audio file.' });
  }

  const tempPath = req.file.path;

  try {
    const formData = new FormData();
    formData.append('name', req.body.voiceName || `My Voice ${new Date().toISOString()}`);
    formData.append('description', req.body.voiceDescription || 'Voice clone created from uploaded sample');
    formData.append('audio', new Blob([await fs.readFile(tempPath)]), req.file.originalname || 'sample.wav');

    const cloneResponse = await fetch(`${CARTESIA_BASE_URL}${CLONE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'X-API-Key': CARTESIA_API_KEY,
        'Cartesia-Version': CARTESIA_VERSION
      },
      body: formData
    });

    const cloneText = await cloneResponse.text();
    let cloneJson;
    try {
      cloneJson = JSON.parse(cloneText);
    } catch {
      cloneJson = { raw: cloneText };
    }

    if (!cloneResponse.ok) {
      return res.status(cloneResponse.status).json({
        error: 'Voice cloning failed at Cartesia API.',
        details: cloneJson
      });
    }

    const voiceId = cloneJson.voice_id || cloneJson.id;
    if (!voiceId) {
      return res.status(500).json({ error: 'Clone succeeded but no voice_id was returned.', details: cloneJson });
    }

    res.json({
      message: 'Voice cloned successfully.',
      voiceId,
      rawResponse: cloneJson
    });
  } catch (error) {
    res.status(500).json({ error: 'Unexpected clone error', details: String(error) });
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
});

app.post('/api/generate-speech', async (req, res) => {
  if (!ensureApiKey(res)) return;

  const { voiceId, text, emotion = 'neutral', speed = 1 } = req.body;

  if (!voiceId || !text) {
    return res.status(400).json({ error: 'voiceId and text are required.' });
  }

  try {
    const payload = {
      model_id: 'sonic-2',
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId
      },
      output_format: {
        container: 'wav',
        encoding: 'pcm_s16le',
        sample_rate: 44100
      },
      language: 'en',
      controls: {
        speed: Number(speed),
        emotion: [emotion]
      }
    };

    const ttsResponse = await fetch(`${CARTESIA_BASE_URL}${TTS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CARTESIA_API_KEY,
        'Cartesia-Version': CARTESIA_VERSION
      },
      body: JSON.stringify(payload)
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      return res.status(ttsResponse.status).json({
        error: 'Speech generation failed at Cartesia API.',
        details: errText
      });
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const fileName = `${randomUUID()}.wav`;
    const filePath = path.join('downloads', fileName);
    await fs.writeFile(filePath, audioBuffer);

    res.json({
      message: 'Speech generated successfully.',
      audioUrl: `/downloads/${fileName}`,
      fileName
    });
  } catch (error) {
    res.status(500).json({ error: 'Unexpected generate-speech error', details: String(error) });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Voice cloner app running at http://localhost:${port}`);
});
