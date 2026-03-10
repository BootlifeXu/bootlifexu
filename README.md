# Simple Cartesia Voice Cloner

A simple web app where you can:

- Upload your own voice sample and request a cloned voice.
- Type/paste text and synthesize speech with your cloned voice.
- Choose an emotion style for speech generation.
- Download the generated `.wav` audio file.

> Important: no API can guarantee "99% exact" cloning for every input. Quality depends on your sample quality, model behavior, and API limits.

## Requirements

- Node.js 18+
- A Cartesia API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
CARTESIA_API_KEY=your_api_key_here
PORT=3000
# Optional overrides if Cartesia updates endpoints/version:
# CARTESIA_BASE_URL=https://api.cartesia.ai
# CARTESIA_VERSION=2024-06-10
# CARTESIA_CLONE_ENDPOINT=/voices/clone
# CARTESIA_TTS_ENDPOINT=/tts/bytes
```

3. Run the app:

```bash
npm start
```

4. Open `http://localhost:3000`

## Notes

- If Cartesia changes endpoint contracts, update env overrides and payloads in `server.js`.
- Generated files are stored in `downloads/`.
- Uploaded temp files are stored in `tmp/` and removed after cloning call.
