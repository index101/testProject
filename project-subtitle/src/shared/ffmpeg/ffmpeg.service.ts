import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

@Injectable()
export class FfmpegService {
  async getAudioDurationSeconds(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) return reject(err);
        const dur = metadata.format.duration;
        resolve(dur ? Math.ceil(dur) + 1 : 30);
      });
    });
  }

  /**
   * Create a solid color video with title text (for M1 visual)
   * Priority-based styling: header accent, badges, background tone, watermark
   */
  async createVisualWithText(
    outputPath: string,
    options: {
      width: number;
      height: number;
      durationSeconds: number;
      title: string;
      routingLabel?: string;
      visualIntensity?: 'low' | 'medium' | 'high';
      topicKeyword?: string;
      priorityBadge?: string;
      headerBarColor?: string;
      backgroundColor?: string;
      progressBarColor?: string;
      moduleWatermark?: string;
    },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const {
        priorityBadge = '',
        headerBarColor = '0xffffff',
        backgroundColor = '#1a1a2e',
        progressBarColor = '0x22d3ee',
      } = options;
      const progressBarColorHex = backgroundColor.replace('#', '0x');
      const width = options.width;
      const height = options.height;
      const durationSeconds = options.durationSeconds;
      const title = options.title;

      const escapedTitle = title.replace(/'/g, "'\\''").replace(/:/g, '\\:');
      const inputStr = `color=c=${backgroundColor}:s=${width}x${height}:d=${durationSeconds}`;

      const titleY = 80;
      const headerBarY = 148;
      const progressBarY = height - 6;
      const progressBarH = 4;

      const fontPath = process.platform === 'win32'
        ? 'C\\:/Windows/Fonts/arial.ttf'
        : '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf';

      let vf = `drawtext=text='${escapedTitle}':fontfile='${fontPath}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=${titleY}`;

      vf += `,drawbox=x=0:y=${headerBarY}:w=${width}:h=4:color=${headerBarColor}@0.85`;

      if (priorityBadge) {
        const escapedBadge = priorityBadge.replace(/'/g, "'\\''").replace(/:/g, '\\:');
        const badgeColor = priorityBadge.includes('HIGH') ? '0xff4444' : priorityBadge.includes('LOW') ? '0x44aaff' : '0xaaaaaa';
        vf += `,drawtext=text='${escapedBadge}':fontfile='${fontPath}':fontsize=14:fontcolor=${badgeColor}:x=w-text_w-24:y=90`;
      }

      vf += `,drawbox=x=0:y=${progressBarY}:w='min(${width}*t/${durationSeconds},${width})':h=${progressBarH}:color=${progressBarColorHex}@0.99`;

      ffmpeg()
        .input(inputStr)
        .inputFormat('lavfi')
        .inputOptions(['-f lavfi'])
        .outputOptions([
          '-vf',
          vf,
          '-t',
          String(durationSeconds),
          '-pix_fmt',
          'yuv420p',
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Compose final video: visual + audio + subtitles
   */
  private escapeSubtitlePath(p: string): string {
    const normalized = p.replace(/\\/g, '/');
    return normalized.replace(/^([A-Za-z]):/, '$1\\:');
  }

  async compose(
    visualPath: string,
    audioPath: string,
    srtPath: string,
    outputPath: string,
    options: { width: number; height: number; subtitleFontSize?: number },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const fontSize = options.subtitleFontSize ?? 18;
      const escapedSrt = this.escapeSubtitlePath(srtPath);
      const subtitlesFilter = `subtitles='${escapedSrt}':force_style='Alignment=2,MarginV=150,FontSize=72,FontName=Arial,PrimaryColour=&H00FFFFFF&,OutlineColour=&H000000&,Outline=1,Shadow=0,PlayResX=1080,PlayResY=1920,MarginL=108,MarginR=108'`;

      ffmpeg()
        .input(visualPath)
        .input(audioPath)
        .outputOptions([
          `-vf`,
          subtitlesFilter,
          `-c:v`,
          `libx264`,
          `-preset`,
          `medium`,
          `-crf`,
          `23`,
          `-c:a`,
          `aac`,
          `-b:a`,
          `128k`,
          `-shortest`,
          `-pix_fmt`,
          `yuv420p`,
        ])
        .size(`${options.width}x${options.height}`)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }
}
