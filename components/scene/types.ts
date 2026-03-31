import type { FocusTarget } from '@/config/sceneConfig';

export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'hoverTablets'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup'
  | 'tabletsCloseup';

export type InteractiveTarget = Exclude<FocusTarget, 'overview'>;
