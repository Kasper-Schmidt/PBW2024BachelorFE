import { CommonModule } from '@angular/common'; // Importerer Angulars fælles moduler til grundlæggende funktioner
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewEncapsulation,
  inject,
} from '@angular/core'; // Importerer Angular kernefunktioner og -typer
import { FullCalendarComponent } from '../full-calendar/full-calendar.component'; // Importerer en tilpasset fuld kalenderkomponent
import { GlobalStore } from '../../stores/global.store'; // Importerer en global lagerservice
import { ButtonModule } from 'primeng/button'; // Importerer PrimeNG knapmodul
import { TeamupStore } from '../../stores/teamup.store'; // Importerer lagerservice til TeamUp
import { ClickupStore } from '../../stores/clickup.store'; // Importerer lagerservice til ClickUp
import { userType } from '../../types/user.type'; // Importerer brugerdefineret type for brugere
import { forkJoin } from 'rxjs'; // Importerer værktøj til at kombinere flere observables
import { map } from 'rxjs/operators'; // Importerer map-operatoren til datatransformation
import { CalendarModule } from 'primeng/calendar'; // Importerer PrimeNG kalenderkomponent
import { FormsModule } from '@angular/forms'; // Importerer Angulars formularmodul
import { subcalendarType } from '../../types/teamup-subcalendar.type'; // Importerer type for TeamUp subkalendere
import { DeviceTypeStore } from '../../stores/deviceTypes.store'; // Importerer lagerservice for enhedstyper
import { ThemeChangeComponent } from '../theme-change/theme-change.component'; // Importerer en komponent til temaændring

@Component({
  selector: 'app-data-side', // Definerer selektoren for denne komponent
  standalone: true, // Marker komponenten som uafhængig (ingen krav om app.module.ts)
  imports: [
    CommonModule, // Importerer almindelige Angular-funktioner
    FullCalendarComponent, // Importerer den fulde kalenderkomponent
    ButtonModule, // Importerer knapmodulet fra PrimeNG
    CalendarModule, // Importerer kalendermodulet fra PrimeNG
    FormsModule, // Tilføjer understøttelse for Angular-formularer
    ThemeChangeComponent // Importerer komponenten til temaændringer
  ],
  templateUrl: './data-side.component.html', // Sti til HTML-skabelonen
  styleUrls: ['./data-side.component.scss'], // Sti til CSS-stilarket
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimerer ændringsregistrering
  encapsulation: ViewEncapsulation.None, // Tillader globale stilarter at påvirke denne komponent
})
export class DataSideComponent implements AfterViewInit {
  protected readonly globalStore = inject(GlobalStore); // Injicerer den globale lagerservice
  protected readonly clickupStore = inject(ClickupStore); // Injicerer ClickUp-lagerservice
  protected readonly teamupStore = inject(TeamupStore); // Injicerer TeamUp-lagerservice
  protected readonly deviceTypeStore = inject(DeviceTypeStore); // Injicerer enhedstype-lagerservice

  rangeDates: Date[] = [new Date(), new Date()]; // Initialiserer datointervallet med dagens dato

// Henter denne information fra `deviceTypeStore`. Om brugeren er på mobil eller desktop
  currentDevice: Signal<string> = this.deviceTypeStore.device; 

// Signal, der indeholder listen af aktuelt valgte brugere. Disse data hentes fra `clickupStore`.
  selectedUsers: Signal<userType[]> = this.clickupStore.activeMembers; 

  // her lige nu, men metoden kan bruges i fremtiden til at udføre DOM-relateret initialisering, som kræver, at visningen er færdigindlæst.
  ngAfterViewInit(): void {}

  // Konstruktøren initialiserer klassen. I denne komponent har den ingen direkte logik, 
  // da afhængigheder injiceres via Angular's DI (dependency injection). 
  // Dette design gør, at konstruktøren kun bruges som en oprettelsesmekanisme for komponenten.
  constructor() {} 

  parseData() {
    const startDate = this.rangeDates[0].toLocaleDateString(); // Henter startdatoen som en lokal dato-streng
    const endDate = this.rangeDates[1].toLocaleDateString(); // Henter slutdatoen som en lokal dato-streng

    const subCalendars = this.teamupStore.subcalendars(); // Henter alle subkalendere

    // Tjekker om der er valgt brugere
if (this.selectedUsers().length === 0) { 
  alert('please select at least one employee'); // Viser en advarsel, hvis ingen brugere er valgt
  return; // Stopper yderligere eksekvering, hvis ingen brugere er valgt
}

// Mapper de valgte brugere til observables
const userObservables = this.selectedUsers().map((user: userType) => { 
  const userEmail = user.email; // Henter brugerens email for at bruge den i API-kaldene

  // 'forkJoin' samler flere observables og venter på, at alle afsluttes, før den returnerer en samlet værdi
  return forkJoin({
    userEvents: this.teamupStore.fetchUserEvents( // Henter brugerens begivenheder fra TeamUp
      userEmail, 
      startDate, 
      endDate
    ), 
    userTasks: this.clickupStore.fetchTaskForUser(userEmail), // Henter brugerens opgaver fra ClickUp
  }).pipe( // 'pipe' bruges til at køre transformationer på den resulterende observable
    map(({ userEvents, userTasks }) => { // 'map' operatoren bruges til at transformere dataene, når de er hentet
      const formattedUserEvents = userEvents.map((event) => { // Mapper begivenheder til et format, der er lettere at bruge
        const start = new Date(event.startDate); // Opretter en Date-objekt for begivenhedens startdato
        const end = new Date(event.endDate); // Opretter en Date-objekt for begivenhedens slutdato
        const hours = (end.getTime() - start.getTime()) / 3600000; // Beregner timer mellem start og slutdato i timer

        // Finder den relevante subkalender baseret på kalenderens id
        const matchedCalendar = subCalendars.find(
          (calendar: subcalendarType) => calendar.id === event.subcalenderId
        );
        const subCalendarName = matchedCalendar ? matchedCalendar.name : 'Unknown'; // Henter subkalenderens navn eller 'Unknown' hvis den ikke findes

        // Returnerer den formaterede event med nødvendige detaljer
        return {
          email: userEmail, 
          startDate: event.startDate, 
          endDate: event.endDate, 
          eventHours: hours.toFixed(2), // Afrunder timerne til 2 decimaler
          subCalendarName, // Subkalenderens navn
        };
      });

      // Filtrerer opgaverne baseret på datoer, der er mellem start og slut
      const filteredTasks = userTasks.filter((task: any) => {
        const taskCreatedDate = new Date(task.formattedDate).toLocaleDateString(); // Konverterer opgaveoprettelsesdato til lokal dato-streng
        return taskCreatedDate >= startDate && taskCreatedDate <= endDate; // Sammenligner datoerne for at filtrere opgaverne
      });

      // Returnerer den sammensatte brugerdata med formaterede events og filtrerede opgaver
      return {
        userEmail,
        userName: user.name,
        userEvents: formattedUserEvents, // De formaterede begivenheder
        userTasks: filteredTasks, // De filtrerede opgaver
      };
    })
  );
});

// 'forkJoin' venter på, at alle observables (userEvents og userTasks) for alle brugere afsluttes
forkJoin(userObservables).subscribe({
  next: (results) => { // Når alle observables er afsluttet, kaldes 'next'
    this.globalStore.sendExportdata(results); // Sender de hentede og transformerede data til globalStore for eksport
  },
  error: (error) => { // Hvis der opstår en fejl under fetching eller transformation
    console.error('Error fetching user data:', error); // Logger fejlinformationen
  },
});
  
}
}