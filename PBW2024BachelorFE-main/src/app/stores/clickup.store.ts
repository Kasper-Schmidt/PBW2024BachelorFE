import {
  signalStore,
  withComputed,
  withState,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { TeamupService } from '../services/teamup.service';
import { ClickupService } from '../services/clickup.service';
import { userType } from '../types/user.type';
import { clickupTaskType } from '../types/clickup-task.type';

type clickupState = {
  members: userType[];
  tasks: clickupTaskType[];
  activeMembers: userType[];
};

const initialState: clickupState = {
  members: [],
  tasks: [],
  activeMembers: [],
};

export const ClickupStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store) => {
    const clickupService = inject(ClickupService);

    return {
      setMembers: () => {
        clickupService.clickupFetchMembers().subscribe({
          next: (res: any) => {
            patchState(store, { members: res });
          },
          error: (error) => {
            console.error('Error fetching users:', error);
          },
        });
      },
      setTasks: (email: string) => {
        clickupService.clickupFetchTasks(email).subscribe({
          next: (res: any) => {
            // Filter tasks for the provided email
            const updatedTasks = store
              .tasks()
              .filter((task: clickupTaskType) => task.loggedBy !== email);
            patchState(store, { tasks: [...updatedTasks, ...res] });
          },
          error: (error) => {
            console.error('Error fetching tasks for user:', error);
          },
        });
      },

      // only fetches data, does not patch it
      fetchTaskForUser: (email: string) => {
        return clickupService.clickupFetchTasks(email);
      },

      toggleActiveMember: (member: userType) => {
        const currentMembers = store.activeMembers();
        const isMemberActive = currentMembers.some(                   // "some" bruges for at kontrollere, om mindst én værdi opfylder en bestemt betingelse
          (m) => m.email === member.email
        );

        console.log('member: ', member);

        patchState(store, {
          activeMembers: isMemberActive
            ? currentMembers.filter((m) => m.email !== member.email)  // (m) er en parameter i callback-funktionen for filter(). Det repræsenterer hvert enkelt medlem i currentMembers arrayet under iterationen. (tror det er ligesom en key)
            : [...currentMembers, member],                            // Add if not selected
        });

        return isMemberActive;
      },
    };
  })
);
