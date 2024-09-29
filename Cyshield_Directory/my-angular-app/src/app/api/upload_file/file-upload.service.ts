import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:9040/api/FileUpload/upload';
  private verifyTokenPOSTAPIUrl = 'http://localhost:9040/api/Auth/verify-token';
  jwtToken: string | null = null;
  user: { username: string, email: string, password: string, role: string } | null = null;


  constructor(private http: HttpClient, private authService: AuthService) {
    this.jwtToken = this.authService.getToken();
    this.user = this.authService.getUserData();
  }

  uploadFile(file: File): Observable<any> {
    console.log('File to upload:', file);
    console.log('JWT Token:', this.jwtToken);

    if (!this.jwtToken) {
      console.error('JWT token is missing. Please log in.');
      return throwError('JWT token is missing. Please log in.');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

   

    return this.verifyToken().pipe(
      switchMap(() => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.jwtToken}`);
        return this.http.post(`${this.baseUrl}/${this.user?.username}`, formData, { headers, responseType: 'text' }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  private verifyToken(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body = { token: token };
    return this.http.post(this.verifyTokenPOSTAPIUrl, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}