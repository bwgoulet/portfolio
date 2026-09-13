export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'hoverTablets'
  | 'hoverIntroduction'
  | 'hoverChasing50'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup'
  | 'dartboardCloseup'
  | 'tabletsCloseup'
  | 'introductionCloseup'
  | 'chasing50Closeup';

export type InteractiveTarget = 'billboard' | 'cabin' | 'tablets' | 'introduction' | 'chasing50';
