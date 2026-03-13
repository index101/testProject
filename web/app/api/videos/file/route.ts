import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';


const ALLOWED_FILES = [
  'video-low-priority.mp4',
  'video-high-priority.mp4',
  'video-low-priority-subtitles-reference.srt',
  'video-high-priority-subtitles-reference.srt',
];

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

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name || !ALLOWED_FILES.includes(name)) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  const projectSubtitlePath = findProjectSubtitle();
  const outputPath = name.endsWith('.srt')
    ? path.join(projectSubtitlePath, 'subtitles-reference', name)
    : path.join(projectSubtitlePath, 'output', name);
  if (!fs.existsSync(outputPath)) {
    return NextResponse.json({ error: 'File not found. Generate videos first.' }, { status: 404 });
  }

  const buffer = fs.readFileSync(outputPath);
  const isVideo = name.endsWith('.mp4');
  const contentType = isVideo ? 'video/mp4' : 'text/plain';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${name}"`,
    },
  });
}
