import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  template: `
    <div class="auth-container">
      <div class="auth-form">
        <h2 class="text-center mb-3">{{ isLogin ? 'Login' : 'Register' }}</h2>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          <div class="form-group" *ngIf="!isLogin">
            <label for="name">Name<span>*</span></label>
            <input
              type="text"
              id="name"
              class="form-control"
              formControlName="name"
              placeholder="Enter your name"
            />
            <div *ngIf="authForm.get('name')?.invalid && authForm.get('name')?.touched" class="text-danger">
              Name is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email<span>*</span></label>
            <input
              type="email"
              id="email"
              class="form-control"
              formControlName="email"
              placeholder="Enter your email"
            />
            <div *ngIf="authForm.get('email')?.invalid && authForm.get('email')?.touched" class="text-danger">
              <div *ngIf="authForm.get('email')?.errors?.['required']">Email is required</div>
              <div *ngIf="authForm.get('email')?.errors?.['email']">Please enter a valid email</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password<span>*</span></label>
            <input
              type="password"
              id="password"
              class="form-control"
              formControlName="password"
              placeholder="Enter your password"
            />
            <div *ngIf="authForm.get('password')?.invalid && authForm.get('password')?.touched" class="text-danger">
              <div *ngIf="authForm.get('password')?.errors?.['required']">Password is required</div>
              <div *ngIf="authForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-block"
            [disabled]="isLoading"
            (click)="onSubmit()"
            (mousedown)="onButtonMouseDown()"
            (mouseup)="onButtonMouseUp()"
          >
            {{ isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register') }}
          </button>
          
          <!-- Debug info -->
          <div class="mt-2 small text-muted">
            Form valid: {{ authForm.valid }} | 
            Email valid: {{ authForm.get('email')?.valid }} | 
            Password valid: {{ authForm.get('password')?.valid }}
          </div>
          
        </form>

        <div class="text-center mt-3">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="toggleMode()"
            [disabled]="isLoading"
          >
            {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
    }
    
    .auth-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    span {
      color: red;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
    
    .btn-block {
      width: 100%;
    }
    
    .text-danger {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .alert {
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 4px;
    }
    
    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
  `]
})
export class AuthComponent {
  authForm: FormGroup;
  isLogin = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      name: [''],
      email: ['user1@example.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required, Validators.minLength(6)]]
    });
    
    // Debug form state
    console.log('Form initialized:', this.authForm.value);
    console.log('Form valid:', this.authForm.valid);
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';

    const nameControl = this.authForm.get('name');
    if (!nameControl) return;

    if (this.isLogin) {
      nameControl.clearValidators(); // Remove required validator in login mode
    } else {
      nameControl.setValidators([Validators.required]); // Add it in register mode
    }

    nameControl.updateValueAndValidity(); // Recalculate validity
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.authForm.valid);
    console.log('Form value:', this.authForm.value);
    
    if (this.authForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password, name } = this.authForm.value;

      const authObservable = this.isLogin
        ? this.authService.login(email, password)
        : this.authService.register(email, password, name);

      authObservable.subscribe({
        next: (response) => {
          console.log('Auth successful:', response);
          this.isLoading = false;
          this.router.navigate(['/chat']);
        },
        error: (error) => {
          console.error('Auth error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    } 
    // else {
    //   console.log('Form is invalid');
    //   this.errorMessage = 'Please fill in all required fields correctly.';
    // }
  }

  onButtonMouseDown(): void {
    console.log('Button mousedown');
  }

  onButtonMouseUp(): void {
    console.log('Button mouseup');
  }

  // onTestButtonClick(): void {
  //   console.log('Test button clicked!');
  //   alert('Test button works! This means buttons are clickable.');
  // }
}

