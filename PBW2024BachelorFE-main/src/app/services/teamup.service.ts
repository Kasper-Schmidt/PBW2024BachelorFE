import { HttpClient } from '@angular/common/http'; // Importerer HttpClient til at sende HTTP-anmodninger
import { Injectable } from '@angular/core'; // Importerer Injectable-dekoren for at gøre servicen tilgængelig i hele applikationen
import { BehaviorSubject, Observable } from 'rxjs'; // Importerer RxJS-klasser til håndtering af asynkrone data
import { environment } from '../../environments/environment'; // Importerer miljøkonfigurationen (som backend-URL)

@Injectable({
  providedIn: 'root', // Gør servicen tilgængelig globalt i applikationen via Dependency Injection
})
export class TeamupService {
  private backendURL = environment.backendUrl; // Læser backend-URL fra miljøkonfigurationen

  listID = 'eqv4en'; // Sætter en ID for listen (teamup liste ID)
  private authenticationToken = ''; // Holder på autentificeringstokenet (tomt som standard)

  isAuthenticated = new BehaviorSubject<boolean>(false); // En BehaviorSubject til at håndtere autentificeringstilstanden

  constructor(private http: HttpClient) {} // Injicerer HttpClient i konstruktøren

  // Funktion til at autentificere bruger via TeamUp API'et
  teamupAuthenticate(): Observable<void> {
    return new Observable<void>((observer) => {
      this.http.post(`${this.backendURL}/api/teamup/auth`, {}).subscribe({
        next: (response: any) => {
          this.authenticationToken = response.auth_token;       // Sætter authentication token
          this.isAuthenticated.next(true);                      // Opdaterer autentificeringstilstanden til true
          observer.next();                                      // Emit success til observatøren
          observer.complete();                                  // Afslutter observable
        },
        error: (error) => {
          console.error('Error authenticating teamup:', error); // Logger fejl ved autentificering
          this.isAuthenticated.next(false); // Opdaterer autentificeringstilstanden til false
          observer.error(error); // Emit error til observatøren
        },
      });
    });
  }

  // Funktion til at hente brugere fra TeamUp API
  teamupFetchUsers() {
    const headers = {
      Authorization: `Bearer ${this.authenticationToken}`, // Indsætter authentication token i headeren
    };

    return this.http.get<any[]>(
      `${this.backendURL}/api/teamup/searchUser/${this.listID}`,
      { headers }
    ); // Sender GET-anmodning til TeamUp API'et for at hente brugere
  }

  // Funktion til at hente en brugers kalenderdata
  teamupFetchUserCalendar(email: string, startDate?: string, endDate?: string) {
    const headers = {
      Authorization: `Bearer ${this.authenticationToken}`, // Indsætter authentication token i headeren
    };
    const url = `${this.backendURL}/api/teamup/userEvents/${email}`; // Bygger URL'en til at hente brugerens kalender
    const params: string[] = [];

    // Tilføjer startDate og endDate som parametre, hvis de er givet
    if (startDate && endDate) {
      params.push(`startDate=${encodeURIComponent(startDate)}`);
      params.push(`endDate=${encodeURIComponent(endDate)}`);
    }

    // Bygger den fulde URL med eventuelle parametre
    const fullUrl = params.length ? `${url}?${params.join('&')}` : url;
    return this.http.get<any[]>(fullUrl, { headers }); // Sender GET-anmodning til TeamUp API'et for at hente kalenderdata
  }

  // Funktion til at hente alle begivenheder fra TeamUp API
  teamupFetchCalendar() {
    const headers = {
      Authorization: `Bearer ${this.authenticationToken}`, // Indsætter authentication token i headeren
    };

    return this.http.get<any[]>(`${this.backendURL}/api/teamup/events`, {
      headers,
    }); // Sender GET-anmodning til TeamUp API'et for at hente alle begivenheder
  }

  // Funktion til at hente subcalendars fra TeamUp API
  teamupFetchSubCalendar() {
    const headers = {
      Authorization: `Bearer ${this.authenticationToken}`, // Indsætter authentication token i headeren
    };

    return this.http.get<any[]>(`${this.backendURL}/api/teamup/subcalendars`, {
      headers,
    }); // Sender GET-anmodning til TeamUp API'et for at hente subcalendars
  }
}
