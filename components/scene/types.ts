import type { FocusTarget } from '@/config/sceneConfig';

export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup';

export type InteractiveTarget = Exclude<FocusTarget, 'overview'>;
