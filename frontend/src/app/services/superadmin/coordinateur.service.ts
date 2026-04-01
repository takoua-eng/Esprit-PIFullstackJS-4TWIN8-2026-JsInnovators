import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Coordinator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoordinateurService {
  private apiUrl = 'http://localhost:3000/users/coordinators';

  constructor(private http: HttpClient) {}

  getCoordinators(): Observable<Coordinator[]> {
    return this.http.get<Coordinator[]>(this.apiUrl);
  }

  createCoordinator(coord: Partial<Coordinator>): Observable<Coordinator> {
    return this.http.post<Coordinator>(this.apiUrl, coord);
  }

  // ✅ DELETE COORDINATOR
  deleteCoordinator(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
