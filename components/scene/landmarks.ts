import type { Vector3Tuple } from 'three';
import type { FocusTarget } from '@/config/sceneConfig';
import { SCENE_ANCHORS } from '@/config/sceneConfig';

export type DetailRendererKey = 'project' | 'experience' | 'none';

export type Landmark = {
  id: 'billboard' | 'cabin' | 'tablets';
  anchor: Vector3Tuple;
  focusPresetKey: FocusTarget;
  hoverCopy: string;
  detailRendererKey: DetailRendererKey;
};

export const LANDMARKS: Landmark[] = [
  {
    id: 'billboard',
    anchor: SCENE_ANCHORS.billboard,
    focusPresetKey: 'billboard',
    hoverCopy: 'Projects',
    detailRendererKey: 'project'
  },
  {
    id: 'cabin',
    anchor: SCENE_ANCHORS.cabin,
    focusPresetKey: 'cabinInterior',
    hoverCopy: 'About/Gallery',
    detailRendererKey: 'none'
  },
  {
    id: 'tablets',
    anchor: SCENE_ANCHORS.tabletsStart,
    focusPresetKey: 'tablets',
    hoverCopy: 'Experience',
    detailRendererKey: 'experience'
  }
];
