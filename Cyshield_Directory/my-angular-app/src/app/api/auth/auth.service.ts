import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, catchError } from 'rxjs';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';  
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

export interface Credentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  RegisterApiUrl: string = "http://localhost:9040/api/Auth/Register"; 
  loginApiUrl: string = "http://localhost:9040/api/Auth/login";

  constructor(private http: HttpClient, private router : Router) {
    // Initialize the login state based on the presence of a token
    this.isLoggedInSubject.next(!!this.getToken());
  }

  register(user: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.RegisterApiUrl, JSON.stringify(user), { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    errorMessage = `Error: ${error.error.message}`;
    
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  login(credentials: Credentials): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.loginApiUrl, JSON.stringify(credentials), { headers });
  }

  logout(): void {
    this.removeToken();
    this.removeUserData();
    this.isLoggedInSubject.next(false);
    if (this.router.url === '/dashboard') {
      // Navigate to the same route to trigger a refresh
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        window.location.reload();
      });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  storeToken(token: string): void {
    localStorage.setItem('jwt', token);
    this.isLoggedInSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  removeToken(): void {
    localStorage.removeItem('jwt');
  }

  storeUserData(user: { username: string, email: string, password: string, role: string }): void {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  getUserData(): { username: string, email: string, password: string, role: string } | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  removeUserData(): void {
    localStorage.removeItem('userData');
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);  // Correct function usage
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}