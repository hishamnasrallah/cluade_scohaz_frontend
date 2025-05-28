// // login.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import {
//   MatCard,
//   MatCardActions,
//   MatCardContent,
//   MatCardHeader,
//   MatCardSubtitle,
//   MatCardTitle
// } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
//
// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCard,
//     MatCardHeader,
//     MatCardTitle,
//     MatCardSubtitle,
//     MatCardContent,
//     MatCardActions,
//     MatButtonModule,
//     MatInputModule,
//     MatFormFieldModule,
//     MatIconModule
//   ],
//   template: `
//     <div class="login-container">
//       <mat-card class="login-card">
//         <mat-card-header>
//           <mat-card-title>Login</mat-card-title>
//           <mat-card-subtitle>Access your low-code platform</mat-card-subtitle>
//         </mat-card-header>
//
//         <mat-card-content>
//           <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
//             <mat-form-field appearance="fill" class="full-width">
//               <mat-label>Username</mat-label>
//               <input matInput formControlName="username" placeholder="Enter your username">
//               <mat-icon matSuffix>person</mat-icon>
//               <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
//                 Username is required
//               </mat-error>
//             </mat-form-field>
//
//             <mat-form-field appearance="fill" class="full-width">
//               <mat-label>Password</mat-label>
//               <input matInput
//                      [type]="hidePassword ? 'password' : 'text'"
//                      formControlName="password"
//                      placeholder="Enter your password">
//               <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
//                 <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
//               </button>
//               <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
//                 Password is required
//               </mat-error>
//               <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
//                 Password must be at least 6 characters long
//               </mat-error>
//             </mat-form-field>
//           </form>
//         </mat-card-content>
//
//         <mat-card-actions>
//           <button mat-raised-button
//                   color="primary"
//                   (click)="onLogin()"
//                   [disabled]="!loginForm.valid || isLoading"
//                   class="full-width">
//             {{ isLoading ? 'Logging in...' : 'Login' }}
//           </button>
//         </mat-card-actions>
//       </mat-card>
//     </div>
//   `,
//   styles: [`
//     .login-container {
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       min-height: calc(100vh - 64px);
//       padding: 20px;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//     }
//
//     .login-card {
//       width: 100%;
//       max-width: 400px;
//       box-shadow: 0 8px 24px rgba(0,0,0,0.12);
//     }
//
//     .full-width {
//       width: 100%;
//       margin-bottom: 16px;
//     }
//
//     mat-card-header {
//       text-align: center;
//       padding-bottom: 16px;
//     }
//
//     mat-card-actions {
//       padding: 16px;
//     }
//
//     button[mat-raised-button] {
//       height: 48px;
//       font-size: 16px;
//     }
//   `]
// })
// export class LoginComponent {
//   loginForm: FormGroup;
//   hidePassword = true;
//   isLoading = false;
//
//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private snackBar: MatSnackBar
//   ) {
//     this.loginForm = this.fb.group({
//       username: ['', [Validators.required]],
//       password: ['', [Validators.required, Validators.minLength(6)]]
//     });
//   }
//
//   onLogin(): void {
//     if (this.loginForm.valid) {
//       this.isLoading = true;
//
//       // Simulate API call
//       setTimeout(() => {
//         const { username, password } = this.loginForm.value;
//
//         // Replace with your actual authentication logic
//         if (username && password) {
//           this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
//           this.router.navigate(['/dashboard']);
//         } else {
//           this.snackBar.open('Invalid credentials', 'Close', { duration: 3000 });
//         }
//
//         this.isLoading = false;
//       }, 1500);
//     } else {
//       this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
//     }
//   }
// }

// components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service'; // ✅ Use real service

import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Access your low-code platform</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter your username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password"
                     placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters long
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button
                  color="primary"
                  (click)="onLogin()"
                  [disabled]="!loginForm.valid || isLoading"
                  class="full-width">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-card-header {
      text-align: center;
      padding-bottom: 16px;
    }

    mat-card-actions {
      padding: 16px;
    }

    button[mat-raised-button] {
      height: 48px;
      font-size: 16px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService // ✅ Inject real service
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.snackBar.open('✅ Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Login error:', err);
          this.snackBar.open('❌ Login failed. Please check your credentials.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });

    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }
}
