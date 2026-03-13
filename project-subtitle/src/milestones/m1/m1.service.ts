import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FfmpegService } from '../../shared/ffmpeg/ffmpeg.service';
import { TtsService } from '../../shared/tts/tts.service';
import { SubtitleService } from '../../shared/subtitle/subtitle.service';
import { M1_OUTPUT, SAMPLE_SCRIPT, SAMPLE_TITLE } from './m1.constants';

export interface M1Delivery {
  videoPath: string;
  srtPath: string;
  technicalNotePath: string;
  filesUsed: string[];
  filesCreated: string[];
}

@Injectable()
export class M1Service {
  constructor(
    private readonly ffmpeg: FfmpegService,
    private readonly tts: TtsService,
    private readonly subtitle: SubtitleService,
  ) {}

  async run(outputDir: string): Promise<M1Delivery> {
    const tempDir = path.join(outputDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const filesUsed: string[] = [];
    const filesCreated: string[] = [];

    // 1. Generate audio from sample script
    const { audioPath, subtitlesJson } = await this.tts.generate(SAMPLE_SCRIPT, tempDir);
    filesUsed.push('sample educational script (SAMPLE_SCRIPT constant)');
    filesCreated.push(audioPath);

    // 2. Get audio duration for visual
    const durationSeconds = await this.ffmpeg.getAudioDurationSeconds(audioPath);

    // 3. Create visual (solid dark bg + title)
    const visualPath = path.join(tempDir, 'visual.mp4');
    await this.ffmpeg.createVisualWithText(visualPath, {
      width: M1_OUTPUT.WIDTH,
      height: M1_OUTPUT.HEIGHT,
      durationSeconds,
      title: SAMPLE_TITLE,
    });
    filesUsed.push('generated visual (ffmpeg lavfi + drawtext)');
    filesCreated.push(visualPath);

    // 4. Convert subtitles JSON to SRT
    const srtPath = path.join(tempDir, 'subtitles.srt');
    await this.subtitle.jsonToSrt(subtitlesJson, srtPath);
    filesCreated.push(srtPath);

    // 5. Compose final video
    const videoPath = path.join(outputDir, 'm1-output.mp4');
    await this.ffmpeg.compose(
      visualPath,
      audioPath,
      srtPath,
      videoPath,
      { width: M1_OUTPUT.WIDTH, height: M1_OUTPUT.HEIGHT },
    );
    filesCreated.push(videoPath);

    // 6. Copy SRT to output for delivery
    const srtDeliveryPath = path.join(outputDir, 'm1-subtitles.srt');
    await fs.copyFile(srtPath, srtDeliveryPath);
    filesCreated.push(srtDeliveryPath);

    // 7. Write technical note
    const technicalNotePath = path.join(outputDir, 'TECHNICAL_NOTE.txt');
    await this.writeTechnicalNote(technicalNotePath, {
      script: SAMPLE_SCRIPT,
      audioPath,
      visualPath,
      srtPath,
      filesUsed,
      filesCreated,
    });
    filesCreated.push(technicalNotePath);

    return {
      videoPath,
      srtPath: srtDeliveryPath,
      technicalNotePath,
      filesUsed,
      filesCreated,
    };
  }

  private async writeTechnicalNote(
    outputPath: string,
    ctx: {
      script: string;
      audioPath: string;
      visualPath: string;
      srtPath: string;
      filesUsed: string[];
      filesCreated: string[];
    },
  ): Promise<void> {
    const content = `MILESTONE 1 — TECHNICAL NOTE
========================

INPUT:
------
1. Script: Sample educational script (see below)
2. Audio: Generated via node-edge-tts (EdgeTTS, voice: en-US-AriaNeural)
3. Visual: Generated via ffmpeg (lavfi color + drawtext)

Sample script used:
---
${ctx.script}
---

SUBTITLE TIMING LOGIC:
----------------------
- TTS (node-edge-tts) outputs word-level timing in JSON (start/end ms)
- Segments merged into readable lines (~3 words, max ~32 chars, ~3.5s per line)
- Font size 18, horizontal margin 10% each side (~80% width)
- Converted to SRT format for ffmpeg subtitles filter

VISUAL SEQUENCING LOGIC:
------------------------
- Solid dark background (#1a1a2e)
- Title text centered at top (plain ASCII)
- Horizontal divider line in center area (60% width, subtle)
- Duration matches audio length

RENDER STEPS:
-------------
1. Generate audio (edge-tts) -> audio.mp3
2. Create visual (ffmpeg lavfi + drawtext) -> visual.mp4
3. Convert TTS JSON to SRT -> subtitles.srt
4. Compose: visual + audio + subtitles -> m1-output.mp4 (1080x1920, H.264, AAC)

FILES USED:
-----------
${ctx.filesUsed.map((f) => `- ${f}`).join('\n')}

FILES CREATED:
--------------
${ctx.filesCreated.map((f) => `- ${f}`).join('\n')}

SCOPE: One video, one subtitle execution, one clean output.
`;
    await fs.writeFile(outputPath, content, 'utf-8');
  }
}
