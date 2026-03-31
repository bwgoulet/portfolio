import type { FocusTarget } from '@/config/sceneConfig';
import type { Landmark } from './landmarks';
import type { InteractionState } from './types';

export type LandmarkInteractionConfig = {
  hoverState: InteractionState;
  closeupState: InteractionState;
  nudgeRotationDelta: number;
};

const LANDMARK_INTERACTION_CONFIG: Record<Landmark['id'], LandmarkInteractionConfig> = {
  billboard: {
    hoverState: 'hoverBillboard',
    closeupState: 'billboardCloseup',
    nudgeRotationDelta: -0.12
  },
  cabin: {
    hoverState: 'hoverCabin',
    closeupState: 'cabinCloseup',
    nudgeRotationDelta: 0.09
  },
  tablets: {
    hoverState: 'hoverTablets',
    closeupState: 'tabletsCloseup',
    nudgeRotationDelta: 0.05
  }
};

const FOCUS_TO_CLOSEUP_STATE: Record<Exclude<FocusTarget, 'overview'>, InteractionState> = {
  billboard: 'billboardCloseup',
  cabinInterior: 'cabinCloseup',
  tablets: 'tabletsCloseup'
};

export function isOverviewState(state: InteractionState) {
  return state === 'idleOverview' || state === 'hoverBillboard' || state === 'hoverCabin' || state === 'hoverTablets';
}

export function getHoverStateForLandmark(id: Landmark['id']) {
  return LANDMARK_INTERACTION_CONFIG[id].hoverState;
}

export function getCloseupStateForFocus(target: FocusTarget) {
  if (target === 'overview') return 'idleOverview';
  return FOCUS_TO_CLOSEUP_STATE[target];
}

export function getNudgeRotationDelta(id: Landmark['id']) {
  return LANDMARK_INTERACTION_CONFIG[id].nudgeRotationDelta;
}
