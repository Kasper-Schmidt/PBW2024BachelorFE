import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClickupService {
  private backendURL = environment.backendUrl;
  constructor(private http: HttpClient) {}

  clickupFetchMembers() {
    return this.http.get<any[]>(`${this.backendURL}/api/clickup/members`);
  }

  clickupFetchTasks(email: string) {
    return this.http.get<any[]>(
      `${this.backendURL}/api/clickup/tasks/${email}`
    );
  }
}
