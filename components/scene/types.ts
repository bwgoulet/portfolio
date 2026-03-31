export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'hoverTablets'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup'
  | 'tabletsCloseup';

export type InteractiveTarget = 'billboard' | 'cabin' | 'tablets';
