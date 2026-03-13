import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function findProjectSubtitle(): string {
  const candidates = [
    path.join(process.cwd(), '..', 'project-subtitle'),
    path.join(process.cwd(), '..', '..', 'project-subtitle'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, 'package.json'))) return p;
  }
  return candidates[0];
}

export async function POST() {
  try {
    const projectSubtitlePath = findProjectSubtitle();
    const outputDir = path.join(projectSubtitlePath, 'output');

    const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
      const proc = spawn('npm', ['run', 'integrated'], {
        cwd: projectSubtitlePath,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';
      proc.stderr?.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: stderr || `Exit code ${code}` });
        }
      });
      proc.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Video generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: [
        { name: 'Low Priority', file: 'video-low-priority.mp4' },
        { name: 'High Priority', file: 'video-high-priority.mp4' },
      ],
      srt: [
        { name: 'Low Priority SRT', file: 'video-low-priority-subtitles-reference.srt' },
        { name: 'High Priority SRT', file: 'video-high-priority-subtitles-reference.srt' },
      ],
    });
  } catch (error) {
    console.error('Video generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate videos' },
      { status: 500 }
    );
  }
}
