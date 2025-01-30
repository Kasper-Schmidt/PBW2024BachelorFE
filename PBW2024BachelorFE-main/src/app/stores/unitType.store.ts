// unitType.store.ts
import { signalStore, withState } from '@ngrx/signals';

type UnitTypeState = {
  mobile: number;
  tablet: number;
  desktop: number;
};

const initialUnitState: UnitTypeState = {
  mobile: 640,
  tablet: 768,
  desktop: 1280,
};

export const UnitTypeStore = signalStore(
  { providedIn: 'root' },
  withState(initialUnitState)
);
