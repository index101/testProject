import { Module } from '@nestjs/common';
import { M1Service } from './m1.service';
import { FfmpegService } from '../../shared/ffmpeg/ffmpeg.service';
import { TtsService } from '../../shared/tts/tts.service';
import { SubtitleService } from '../../shared/subtitle/subtitle.service';

@Module({
  providers: [M1Service, FfmpegService, TtsService, SubtitleService],
  exports: [M1Service],
})
export class M1Module {}
