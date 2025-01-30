// Importerer nødvendige funktioner og klasser fra Angular og @ngrx/signals biblioteket
import {
  signalStore,
  withComputed,
  withState,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { TeamupService } from '../services/teamup.service';
import { userType } from '../types/user.type';
import { subcalendarType } from '../types/teamup-subcalendar.type';
import { teamupEventType } from '../types/teamup-events.type';

// Definerer typen for komponentens state
type teamupState = {
  users: userType[]; // Liste over brugere
  subcalendars: subcalendarType[]; // Liste over underkalendere
  userCalendars: Record<string, teamupEventType[]>; // Kalenderdata pr. bruger (email som nøgle)
  userSearchString: string; // Søgestreng til filtrering af brugere
  parsedData: {
    userEmail: string; // Email for en bruger, hvis data er blevet hentet
    userEvents: any[]; // Hændelser for en specifik bruger
  };
};

// Initialiserer standardværdier for state
const initialState: teamupState = {
  users: [],
  subcalendars: [],
  userCalendars: {},
  userSearchString: '',
  parsedData: {
    userEmail: '',
    userEvents: [],
  },
};

// Definerer og eksporterer en SignalStore til Teamup-data
export const TeamupStore = signalStore(
  { providedIn: 'root' }, // Angiver, at denne store er global (root-level)

  // Tilføjer state til signalStore baseret på initialState
  withState(initialState),

  // Definerer beregnede (computed) værdier baseret på state
  withComputed((state) => ({
    // Henter kalenderdata for en specifik bruger baseret på email
    getCalendarByUser: computed(
      () => (email: string) => state.userCalendars()[email] || [] // Returnerer tom liste, hvis ingen data
    ),
    // Filtrerer brugere baseret på søgestrengen
    getSearchedUsers: computed(() =>
      state
        .users()
        .filter((user: userType) =>
          user.name
            .toLowerCase()
            .includes(state.userSearchString().toLowerCase())
        )
    ),
  })),

  // Definerer metoder, som kan manipulere state eller hente data fra en service
  withMethods((store) => {
    const teamupService = inject(TeamupService); // Injector TeamupService for datahåndtering

    return {
      // Henter brugere fra Teamup API og opdaterer state
      setUsers: () => {
        if (teamupService.isAuthenticated.value) {
          teamupService.teamupFetchUsers().subscribe({
            next: (res: any) => {
              res.map((user: userType) => {
                user.color = generateHexColorFromName(user.name); // Genererer en farve baseret på brugernavnet
              });
              patchState(store, { users: res }); // Opdaterer brugerliste i state
            },
            error: (error) => {
              console.error('Error fetching users:', error);
            },
          });
        } else {
          console.log('Authentication required before fetching users.');
        }
      },

      // Henter kalenderdata for en specifik bruger og opdaterer state
      setUserEvents: (email: string, startDate?: string, endDate?: string) => {
        if (!email) {
          console.log('No email provided to fetch user events');
          return;
        }

        teamupService
          .teamupFetchUserCalendar(email, startDate, endDate)
          .subscribe({
            next: (res: any) => {
              patchState(store, (currentState) => {
                const existingEvents = currentState.userCalendars || {};

                const newEvents = res || [];

                // Kombinerer eksisterende og nye events, fjerner dubletter
                const updatedUserEvents = [
                  ...(existingEvents[email] || []),
                  ...newEvents,
                ];
                const uniqueUserEvents = updatedUserEvents.filter(
                  (event, index, self) =>
                    self.findIndex((e) => e.id === event.id) === index
                );

                // Opdaterer state med de nye events
                return {
                  userCalendars: {
                    ...existingEvents,
                    [email]: uniqueUserEvents,
                  },
                };
              });
            },
            error: (error) => {
              console.log('Error fetching user calendar:', error);
            },
          });
      },

      // Henter og opdaterer subkalender-data
      setSubCalender: () => {
        teamupService.teamupFetchSubCalendar().subscribe({
          next: (res: any) => {
            patchState(store, { subcalendars: res });
          },
          error: (error) => {
            console.log('Error fetching user calendar');
          },
        });
      },

      // Opdaterer søgestreng for brugere
      setSearchUserString: (searchString: string) => {
        patchState(store, { userSearchString: searchString });
      },

      // Henter brugerhændelser uden at opdatere state
      fetchUserEvents: (
        userEmail: string,
        startDate?: string,
        endDate?: string
      ) => {
        return teamupService.teamupFetchUserCalendar(
          userEmail,
          startDate,
          endDate
        );
      },

      // Fjerner kalenderdata for en specifik bruger fra state
      removeUserEvents: (email: string) => {
        patchState(store, (currentState) => {
          const { userCalendars } = currentState;

          if (userCalendars[email]) {
            const updatedUserCalendars = { ...userCalendars };
            delete updatedUserCalendars[email]; // Fjerner brugerens data
            return { ...currentState, userCalendars: updatedUserCalendars };
          }

          return currentState; // Ingen ændringer, hvis brugeren ikke findes
        });
      },
    };
  })
);

// Genererer en unik farve baseret på en tekststreng (f.eks. brugernavn)
function generateHexColorFromName(name: string): string {
  if (!name) {
    return '#000000'; // Standardfarve
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + // hvert tegn i name hentes den numeriske kode for det pågældende tegn. F.eks. vil 'A' have koden 65, 'B' har koden 66, osv.
    ((hash << 5) - hash); // Dette trækker den oprindelige hash fra det venstre-shiftede resultat, hvilket svarer til at multiplicere hash med 31. Dette er en teknik til at få en unik værdi
  }

  // Konverterer hashværdi til en hex-farvekode
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff; // Flytter bit i hash til højre med i * 8 positioner. Dette isolerer de relevante 8 bit, der repræsenterer en farvekomponent
    color += value.toString(16).padStart(2, '0');
  }

  return color;
}
