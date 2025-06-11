// components/shared/validation-display/validation-display.component.ts - NEW SHARED COMPONENT
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-validation-display',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="validation-display" *ngIf="control && control.invalid && (control.dirty || control.touched)">
      <div class="validation-errors">
        <div class="error-item" *ngFor="let error of getErrorMessages()">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Success state -->
    <div class="validation-success" *ngIf="control && control.valid && control.touched && showSuccess">
      <div class="success-item">
        <mat-icon>check_circle_outline</mat-icon>
        <span>{{ successMessage || 'Valid' }}</span>
      </div>
    </div>

    <!-- Field requirements/hints -->
    <div class="validation-hints" *ngIf="showHints && hints.length > 0">
      <div class="hint-item" *ngFor="let hint of hints">
        <mat-icon>info_outline</mat-icon>
        <span>{{ hint }}</span>
      </div>
    </div>
  `,
  styles: [`
    .validation-display {
      margin-top: 8px;
      animation: slideDown 0.3s ease-out;
    }

    .validation-errors {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .error-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #dc2626;
      padding: 6px 12px;
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.2);
      border-radius: 8px;
      animation: fadeIn 0.2s ease-out;
    }

    .error-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .validation-success {
      margin-top: 8px;
      animation: slideDown 0.3s ease-out;
    }

    .success-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #16a34a;
      padding: 6px 12px;
      background: rgba(22, 163, 74, 0.1);
      border: 1px solid rgba(22, 163, 74, 0.2);
      border-radius: 8px;
      animation: fadeIn 0.2s ease-out;
    }

    .success-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .validation-hints {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hint-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #64748b;
      padding: 4px 8px;
      background: rgba(100, 116, 139, 0.1);
      border: 1px solid rgba(100, 116, 139, 0.2);
      border-radius: 6px;
    }

    .hint-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class ValidationDisplayComponent {
  @Input() control: AbstractControl | null = null;
  @Input() showSuccess: boolean = false;
  @Input() successMessage: string = '';
  @Input() showHints: boolean = false;
  @Input() hints: string[] = [];
  @Input() customMessages: { [key: string]: string } = {};

  getErrorMessages(): string[] {
    if (!this.control || !this.control.errors) {
      return [];
    }

    const errors: string[] = [];
    const controlErrors = this.control.errors;

    // Standard validation errors
    if (controlErrors['required']) {
      errors.push(this.customMessages['required'] || 'This field is required');
    }

    if (controlErrors['email']) {
      errors.push(this.customMessages['email'] || 'Please enter a valid email address');
    }

    if (controlErrors['minlength']) {
      const requiredLength = controlErrors['minlength'].requiredLength;
      errors.push(this.customMessages['minlength'] || `Minimum length is ${requiredLength} characters`);
    }

    if (controlErrors['maxlength']) {
      const requiredLength = controlErrors['maxlength'].requiredLength;
      errors.push(this.customMessages['maxlength'] || `Maximum length is ${requiredLength} characters`);
    }

    if (controlErrors['min']) {
      const min = controlErrors['min'].min;
      errors.push(this.customMessages['min'] || `Minimum value is ${min}`);
    }

    if (controlErrors['max']) {
      const max = controlErrors['max'].max;
      errors.push(this.customMessages['max'] || `Maximum value is ${max}`);
    }

    if (controlErrors['pattern']) {
      errors.push(this.customMessages['pattern'] || 'Please enter a valid format');
    }

    if (controlErrors['uniqueUsername']) {
      errors.push(this.customMessages['uniqueUsername'] || 'This username is already taken');
    }

    if (controlErrors['uniqueEmail']) {
      errors.push(this.customMessages['uniqueEmail'] || 'This email is already registered');
    }

    if (controlErrors['passwordMatch']) {
      errors.push(this.customMessages['passwordMatch'] || 'Passwords do not match');
    }

    if (controlErrors['strongPassword']) {
      errors.push(this.customMessages['strongPassword'] || 'Password must contain uppercase, lowercase, numbers, and special characters');
    }

    if (controlErrors['url']) {
      errors.push(this.customMessages['url'] || 'Please enter a valid URL');
    }

    if (controlErrors['phone']) {
      errors.push(this.customMessages['phone'] || 'Please enter a valid phone number');
    }

    if (controlErrors['ipAddress']) {
      errors.push(this.customMessages['ipAddress'] || 'Please enter a valid IP address');
    }

    if (controlErrors['json']) {
      errors.push(this.customMessages['json'] || 'Please enter valid JSON');
    }

    if (controlErrors['dateRange']) {
      errors.push(this.customMessages['dateRange'] || 'End date must be after start date');
    }

    if (controlErrors['fileSize']) {
      const maxSize = controlErrors['fileSize'].maxSize;
      errors.push(this.customMessages['fileSize'] || `File size must be less than ${maxSize}MB`);
    }

    if (controlErrors['fileType']) {
      const allowedTypes = controlErrors['fileType'].allowedTypes.join(', ');
      errors.push(this.customMessages['fileType'] || `Allowed file types: ${allowedTypes}`);
    }

    // Custom error messages
    Object.keys(controlErrors).forEach(key => {
      if (this.customMessages[key] && !errors.some(error => error === this.customMessages[key])) {
        errors.push(this.customMessages[key]);
      }
    });

    return errors;
  }
}

// Validation Helper Service
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationHelperService {

  // Custom validators
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const valid = hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;

      return valid ? null : { strongPassword: true };
    };
  }

  static uniqueUsername(existingUsernames: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const exists = existingUsernames.includes(value.toLowerCase());
      return exists ? { uniqueUsername: true } : null;
    };
  }

  static uniqueEmail(existingEmails: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const exists = existingEmails.includes(value.toLowerCase());
      return exists ? { uniqueEmail: true } : null;
    };
  }

  static passwordMatch(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const passwordControl = formGroup.get(passwordControlName);
      if (!passwordControl) return null;

      const password = passwordControl.value;
      const confirmPassword = control.value;

      return password === confirmPassword ? null : { passwordMatch: true };
    };
  }

  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      try {
        new URL(value);
        return null;
      } catch {
        return { url: true };
      }
    };
  }

  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Simple phone validation - can be customized
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value) ? null : { phone: true };
    };
  }

  static ipAddress(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(value) ? null : { ipAddress: true };
    };
  }

  static json(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      try {
        JSON.parse(value);
        return null;
      } catch {
        return { json: true };
      }
    };
  }

  static dateRange(startDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const startDateControl = formGroup.get(startDateControlName);
      if (!startDateControl) return null;

      const startDate = new Date(startDateControl.value);
      const endDate = new Date(control.value);

      return endDate > startDate ? null : { dateRange: true };
    };
  }

  static fileSize(maxSizeMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file || !(file instanceof File)) return null;

      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB <= maxSizeMB ? null : { fileSize: { maxSize: maxSizeMB } };
    };
  }

  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file || !(file instanceof File)) return null;

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAllowed = allowedTypes.some(type =>
        type.toLowerCase() === fileExtension ||
        file.type.toLowerCase() === type.toLowerCase()
      );

      return isAllowed ? null : { fileType: { allowedTypes } };
    };
  }

  // Helper methods
  static getFieldHints(fieldType: string): string[] {
    const hints: { [key: string]: string[] } = {
      'password': [
        'Must be at least 8 characters long',
        'Include uppercase and lowercase letters',
        'Include at least one number',
        'Include at least one special character'
      ],
      'email': [
        'Enter a valid email address',
        'This will be used for account notifications'
      ],
      'phone': [
        'Enter phone number with country code',
        'Example: +1234567890'
      ],
      'url': [
        'Must start with http:// or https://',
        'Example: https://example.com'
      ],
      'json': [
        'Must be valid JSON format',
        'Use double quotes for strings'
      ]
    };

    return hints[fieldType] || [];
  }

  static getCustomMessages(fieldName: string, fieldType: string): { [key: string]: string } {
    return {
      required: `${fieldName} is required`,
      email: `Please enter a valid ${fieldName.toLowerCase()}`,
      minlength: `${fieldName} is too short`,
      maxlength: `${fieldName} is too long`,
      pattern: `${fieldName} format is invalid`,
      strongPassword: `${fieldName} must be stronger`,
      uniqueUsername: `This ${fieldName.toLowerCase()} is already taken`,
      uniqueEmail: `This ${fieldName.toLowerCase()} is already registered`
    };
  }
}
