import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private backendURL = environment.backendUrl;
  constructor(private http: HttpClient) {}

  async exportCSV(csvData: any): Promise<void> {
    console.log('Sending data (async):', csvData);
    try {
      await this.http
        .post<void>(`${this.backendURL}/api/global/exportcsv`, csvData, {
          headers: { 'Content-Type': 'application/json' },
        })
        .toPromise(); // Convert Observable to Promise
      console.log('HTTP POST request (async) was successful');
    } catch (error) {
      console.error('Error during HTTP POST request (async):', error);
      throw error;
    }
  }
}
