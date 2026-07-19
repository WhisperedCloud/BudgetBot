import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing_openai_key',
});

async function run() {
  try {
    const buffer = fs.readFileSync('package.json'); // Dummy file, will fail but give an error
    const file = await toFile(buffer, 'package.json');
    console.log('toFile worked:', !!file);

    await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run();
