import { Module } from '@nestjs/common';
import { IntegratedService } from './integrated.service';
import { FfmpegService } from '../shared/ffmpeg/ffmpeg.service';
import { TtsService } from '../shared/tts/tts.service';
import { SubtitleService } from '../shared/subtitle/subtitle.service';

@Module({
  providers: [IntegratedService, FfmpegService, TtsService, SubtitleService],
  exports: [IntegratedService],
})
export class IntegrationModule {}
