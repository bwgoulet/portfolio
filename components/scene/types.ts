export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'hoverTablets'
  | 'hoverIntroduction'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup'
  | 'tabletsCloseup'
  | 'introductionCloseup';

export type InteractiveTarget = 'billboard' | 'cabin' | 'tablets' | 'introduction';
