import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

function msToSrtTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * Merge small word-level segments into readable subtitle lines
 * Pacing affects segment length: fast = shorter, slow = longer
 */
function mergeSegments(
  segments: Array<{ part: string; start: number; end: number }>,
  pacing: 'fast' | 'normal' | 'slow' = 'normal',
): Array<{ text: string; start: number; end: number }> {
  const merged: Array<{ text: string; start: number; end: number }> = [];
  let current: string[] = [];
  let startMs = 0;
  const config = {
    fast: { targetWords: 2, maxDurationMs: 2000, maxChars: 25 },
    normal: { targetWords: 3, maxDurationMs: 2800, maxChars: 25 },
    slow: { targetWords: 4, maxDurationMs: 3500, maxChars: 25 },
  }[pacing];
  const { targetWords, maxDurationMs, maxChars } = config;

  for (const seg of segments) {
    const words = seg.part.trim().split(/\s+/).filter(Boolean);
    for (const word of words) {
      const prevLen = current.length > 0 ? current.join(' ').length : 0;
      const withNew = current.length > 0 ? current.join(' ') + ' ' + word : word;
      const overflow = withNew.length > maxChars;

      if (overflow && current.length > 0) {
        merged.push({
          text: current.join(' '),
          start: startMs,
          end: seg.start,
        });
        current = [word];
        startMs = seg.start;
      } else {
        current.push(word);
        if (startMs === 0) startMs = seg.start;
        const endMs = seg.end;
        if (
          current.length >= targetWords ||
          endMs - startMs >= maxDurationMs ||
          current.join(' ').length > maxChars
        ) {
          merged.push({
            text: current.join(' '),
            start: startMs,
            end: endMs,
          });
          current = [];
          startMs = 0;
        }
      }
    }
  }
  if (current.length > 0 && segments.length > 0) {
    merged.push({
      text: current.join(' '),
      start: startMs,
      end: segments[segments.length - 1].end,
    });
  }
  return merged;
}

@Injectable()
export class SubtitleService {
  /**
   * Convert TTS JSON segments to SRT format
   */
  async jsonToSrt(
    segments: Array<{ part: string; start: number; end: number }>,
    outputPath: string,
    pacing: 'fast' | 'normal' | 'slow' = 'normal',
  ): Promise<string> {
    const merged = mergeSegments(segments, pacing);
    const lines: string[] = [];
    merged.forEach((seg, i) => {
      lines.push(String(i + 1));
      lines.push(`${msToSrtTime(seg.start)} --> ${msToSrtTime(seg.end)}`);
      lines.push(seg.text);
      lines.push('');
    });
    const srt = lines.join('\n');
    await fs.writeFile(outputPath, srt, 'utf-8');
    return outputPath;
  }
}
