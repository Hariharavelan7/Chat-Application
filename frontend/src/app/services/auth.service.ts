import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    console.log('Attempting registration with:', { email, name, password: '***' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      email,
      password,
      name
    }).pipe(
      tap(response => {
        console.log('Registration successful, setting user:', response);
        this.setUser(response);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('Attempting login with:', { email, password: '***' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        console.log('Login successful, setting user:', response);
        this.setUser(response);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('lastSelectedUserId');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private setUser(response: AuthResponse): void {
    // Use sessionStorage instead of localStorage for tab-specific sessions
    const sessionId = this.generateSessionId();
    sessionStorage.setItem('token', response.access_token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    sessionStorage.setItem('sessionId', sessionId);
    this.currentUserSubject.next(response.user);
  }
}

