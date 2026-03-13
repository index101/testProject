/**
 * Integrated pipeline: Signal chain → Video params → Video output
 * Backend logic influences media output
 */
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { SignalOrchestrator } from '@signal/orchestrator/signal-orchestrator';
import { signalToVideoParams } from '../shared/signal-to-video/signal-to-video.service';
import { FfmpegService } from '../shared/ffmpeg/ffmpeg.service';
import { TtsService } from '../shared/tts/tts.service';
import { SubtitleService } from '../shared/subtitle/subtitle.service';
import { M1_OUTPUT, SAMPLE_SCRIPT, SAMPLE_TITLE } from '../milestones/m1/m1.constants';
import { SignalInput } from '@signal/models/signal-input.model';

export interface IntegratedDelivery {
  signalPipelineResult: unknown;
  videoParams: unknown;
  videoPath: string;
  srtPath: string;
  technicalNotePath: string;
}

@Injectable()
export class IntegratedService {
  constructor(
    private readonly ffmpeg: FfmpegService,
    private readonly tts: TtsService,
    private readonly subtitle: SubtitleService,
  ) {}

  async run(
    outputDir: string,
    signalInput: SignalInput,
    outputFilename = 'integrated-output.mp4',
  ): Promise<IntegratedDelivery> {
    const tempDir = path.join(outputDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // 1. Run signal pipeline
    const orchestrator = new SignalOrchestrator();
    const pipelineResult = orchestrator.run(signalInput);

    // 2. Map signal → video params
    const videoParams = signalToVideoParams(pipelineResult);

    // 3. Generate audio
    const { audioPath, subtitlesJson } = await this.tts.generate(SAMPLE_SCRIPT, tempDir);
    const durationSeconds = await this.ffmpeg.getAudioDurationSeconds(audioPath);

    // 4. Create visual (priority styling, routing badge, watermark, accent colors)
    const visualPath = path.join(tempDir, 'visual.mp4');
    await this.ffmpeg.createVisualWithText(visualPath, {
      width: M1_OUTPUT.WIDTH,
      height: M1_OUTPUT.HEIGHT,
      durationSeconds,
      title: SAMPLE_TITLE,
      routingLabel: videoParams.routingLabel,
      visualIntensity: videoParams.visualIntensity,
      topicKeyword: 'Consistency',
      priorityBadge: videoParams.priorityBadge,
      headerBarColor: videoParams.headerBarColor,
      backgroundColor: videoParams.backgroundColor,
      progressBarColor: videoParams.progressBarColor,
      moduleWatermark: videoParams.moduleWatermark,
    });

    // 5. Subtitles (pacing from signal)
    const srtPath = path.join(tempDir, 'subtitles.srt');
    await this.subtitle.jsonToSrt(subtitlesJson, srtPath, videoParams.pacing);

    // 6. Compose (font size from signal)
    const videoPath = path.join(outputDir, outputFilename);
    await this.ffmpeg.compose(visualPath, audioPath, srtPath, videoPath, {
      width: M1_OUTPUT.WIDTH,
      height: M1_OUTPUT.HEIGHT,
      subtitleFontSize: videoParams.subtitleFontSize,
    });

    // 7. Copy SRT (use -reference suffix so players don't auto-load and duplicate burned-in subs)
    const srtDeliveryPath = path.join(outputDir, outputFilename.replace('.mp4', '-subtitles-reference.srt'));
    await fs.copyFile(srtPath, srtDeliveryPath);

    // 8. Technical note
    const technicalNotePath = path.join(outputDir, 'INTEGRATION_NOTE.txt');
    await this.writeIntegrationNote(technicalNotePath, {
      pipelineResult,
      videoParams,
      videoPath,
      srtPath: srtDeliveryPath,
    });

    return {
      signalPipelineResult: pipelineResult,
      videoParams,
      videoPath,
      srtPath: srtDeliveryPath,
      technicalNotePath,
    };
  }

  private async writeIntegrationNote(
    outputPath: string,
    ctx: { pipelineResult: unknown; videoParams: unknown; videoPath: string; srtPath: string },
  ): Promise<void> {
    const content = `INTEGRATION — Signal → Video
============================

BACKEND (Signal Pipeline):
-------------------------
Full chain executed: Registry → Classification → Priority → Weighting → Routing →
Conflict Resolution → Expiration → Silence Filter → Escalation → Integrity Check

Key outputs used for video:
- Priority level → pacing (fast/normal/slow), header bar color, badge, background tone
- Classification → layout variant (computed, not displayed)
- Routing → routing label (computed in params, not displayed on video)
- Escalation → affects pacing when escalated

VIDEO PARAMS (from signal):
--------------------------
${JSON.stringify(ctx.videoParams, null, 2)}

CONNECTION PROOF:
-----------------
When signal priority changes → video pacing, header color (red/blue), badge, background tone change
When escalation triggers → pacing becomes "fast"

OUTPUT:
-------
Video: ${ctx.videoPath}
SRT: ${ctx.srtPath}
`;
    await fs.writeFile(outputPath, content, 'utf-8');
  }
}
