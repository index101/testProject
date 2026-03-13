/**
 * Signal-to-Video mapping — Backend logic influences media output
 * Priority, classification, routing → video parameters
 */
import { PipelineResult } from '@signal/orchestrator/signal-orchestrator';

export interface VideoParams {
  pacing: 'fast' | 'normal' | 'slow';
  subtitleFontSize: number;
  visualIntensity: 'low' | 'medium' | 'high';
  layoutVariant: string;
  routingLabel: string;
  priorityBadge: string;
  headerBarColor: string;
  backgroundColor: string;
  progressBarColor: string;
  moduleWatermark: string;
}

export function signalToVideoParams(result: PipelineResult): VideoParams {
  const priority = result.outputs['SignalPriorityEngine']?.priorityLevel ?? 2;
  const classification = result.outputs['SignalClassification']?.result ?? '';
  const routing = result.outputs['SignalRouting']?.result ?? '';
  const escalation = result.outputs['SignalEscalation']?.status ?? '';

  // Priority 4-5 → fast pacing, high intensity
  // Priority 1-2 → slow pacing, low intensity
  let pacing: 'fast' | 'normal' | 'slow' = 'normal';
  let visualIntensity: 'low' | 'medium' | 'high' = 'medium';
  if (priority >= 4 || escalation === 'ESCALATED') {
    pacing = 'fast';
    visualIntensity = 'high';
  } else if (priority <= 2) {
    pacing = 'slow';
    visualIntensity = 'low';
  }

  // Subtitle font: high intensity = slightly larger for emphasis
  const subtitleFontSize = visualIntensity === 'high' ? 20 : visualIntensity === 'low' ? 16 : 18;

  const layoutVariant = classification.includes('routing') ? 'routing' : 'default';
  const routingLabel = routing.replace('route_', '').replace(/_/g, ' ') || 'default';

  const isHigh = priority >= 4 || escalation === 'ESCALATED';
  const isLow = priority <= 2;

  const priorityBadge = isHigh ? '⚡ HIGH PRIORITY' : isLow ? '🔵 LOW PRIORITY' : 'NORMAL';
  const headerBarColor = isHigh ? '0xff3333' : isLow ? '0x3399ff' : '0xffffff';
  const backgroundColor = isHigh ? '#2a2a45' : isLow ? '#0f0f1e' : '#1a1a2e';
  const progressBarColor = isHigh ? '0xff4444' : isLow ? '0x44aaff' : '0x22d3ee';
  const moduleWatermark = 'Routing Module';

  return {
    pacing,
    subtitleFontSize,
    visualIntensity,
    layoutVariant,
    routingLabel,
    priorityBadge,
    headerBarColor,
    backgroundColor,
    progressBarColor,
    moduleWatermark,
  };
}
