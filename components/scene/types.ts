export type InteractionState =
  | 'idleOverview'
  | 'hoverBillboard'
  | 'hoverCabin'
  | 'hoverTablets'
  | 'hoverIntroduction'
  | 'hoverTimeline'
  | 'transitioning'
  | 'billboardCloseup'
  | 'cabinCloseup'
  | 'dartboardCloseup'
  | 'tabletsCloseup'
  | 'introductionCloseup'
  | 'timelineCloseup';

export type InteractiveTarget = 'billboard' | 'cabin' | 'tablets' | 'introduction' | 'timeline';
