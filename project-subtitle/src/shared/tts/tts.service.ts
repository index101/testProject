import { Injectable } from '@nestjs/common';
import { EdgeTTS } from 'node-edge-tts';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TtsResult {
  audioPath: string;
  subtitlesJson: Array<{ part: string; start: number; end: number }>;
}

@Injectable()
export class TtsService {
  private tts: EdgeTTS;

  constructor() {
    this.tts = new EdgeTTS({
      voice: 'en-US-AriaNeural',
      lang: 'en-US',
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      saveSubtitles: true,
    });
  }

  async generate(text: string, outputDir: string): Promise<TtsResult> {
    const audioPath = path.join(outputDir, 'audio.mp3');
    await this.tts.ttsPromise(text, audioPath);

    const jsonPath = path.join(outputDir, 'audio.mp3.json');
    let subtitlesJson: Array<{ part: string; start: number; end: number }> = [];
    try {
      const raw = await fs.readFile(jsonPath, 'utf-8');
      subtitlesJson = JSON.parse(raw);
      await fs.unlink(jsonPath);
    } catch {
      // No subtitles from TTS - fallback: create single segment
      subtitlesJson = [{ part: text, start: 0, end: 10000 }];
    }

    return { audioPath, subtitlesJson };
  }
}
