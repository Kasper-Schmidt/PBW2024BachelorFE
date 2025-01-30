import {
  signalStore,
  withComputed,
  withState,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { GlobalService } from '../services/global.service';

type globalState = {
  showingWeek: { startOfWeek: string; endOfWeek: string };
};

const initialState: globalState = {
  showingWeek: {
    startOfWeek: '',
    endOfWeek: '',
  },
};

export const GlobalStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store) => {
    const globalService = inject(GlobalService);
    return {

      // stores the start and end days of a week, to be used when fetching users
      // that way, the backend knows from when the data should be retrieved
      setShowingWeek: (startOfWeek: string, endOfWeek: string) => {
        patchState(store, { showingWeek: { startOfWeek, endOfWeek } });
      },

      // TODO Create type for csvData
      sendExportdata: async (csvData: any) => {
        await globalService.exportCSV(csvData);
      },
    };
  })
);
