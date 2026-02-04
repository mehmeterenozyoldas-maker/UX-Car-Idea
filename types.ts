import { Mesh } from 'three';
import { MutableRefObject } from 'react';

export type DriveMode = 'SPORT' | 'COMFORT' | 'ECO';

export interface TileProps {
  position: [number, number, number];
  effectorRef: MutableRefObject<Mesh | null>;
  mode: DriveMode;
}

export interface GridConfig {
  rows: number;
  cols: number;
  gap: number;
  tileSize: number;
}