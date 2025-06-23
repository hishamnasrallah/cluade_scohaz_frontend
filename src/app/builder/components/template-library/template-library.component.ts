// src/app/builder/components/template-library/template-library.component.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { ComponentConfig } from '../../models/component-config.model';
import {NgFor, NgIf, TitleCasePipe} from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'personal' | 'survey' | 'application' | 'event';
  icon: string;
  tags: string[];
  thumbnail?: string;
  components: ComponentConfig[];
  popularity: number;
  createdAt: Date;
}

@Component({
  selector: 'app-template-library',
  template: `
    <div class="template-library">
      <div class="library-header">
        <h2>Form Templates</h2>
        <p>Choose from pre-built templates to get started quickly</p>
      </div>

      <mat-tab-group>
        <mat-tab label="All Templates">
          <div class="template-grid">
            <mat-card *ngFor="let template of templates" class="template-card">
              <mat-card-header>
                <div mat-card-avatar>
                  <mat-icon [style.color]="getCategoryColor(template.category)">
                    {{ template.icon }}
                  </mat-icon>
                </div>
                <mat-card-title>{{ template.name }}</mat-card-title>
                <mat-card-subtitle>{{ template.category | titlecase }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="template-description">{{ template.description }}</p>

                <div class="template-tags">
                  <mat-chip *ngFor="let tag of template.tags.slice(0, 3)">
                    {{ tag }}
                  </mat-chip>
                  <span *ngIf="template.tags.length > 3" class="more-tags">
                    +{{ template.tags.length - 3 }} more
                  </span>
                </div>

                <div class="template-stats">
                  <span>
                    <mat-icon>widgets</mat-icon>
                    {{ template.components.length }} fields
                  </span>
                  <span>
                    <mat-icon>star</mat-icon>
                    {{ template.popularity }}% popular
                  </span>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button color="primary" (click)="previewTemplate(template)">
                  <mat-icon>visibility</mat-icon>
                  Preview
                </button>
                <button mat-raised-button color="accent" (click)="useTemplate(template)">
                  <mat-icon>add</mat-icon>
                  Use Template
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Business">
          <div class="template-grid">
            <mat-card *ngFor="let template of getTemplatesByCategory('business')" class="template-card">
              <!-- Same template card content -->
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Surveys">
          <div class="template-grid">
            <mat-card *ngFor="let template of getTemplatesByCategory('survey')" class="template-card">
              <!-- Same template card content -->
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Applications">
          <div class="template-grid">
            <mat-card *ngFor="let template of getTemplatesByCategory('application')" class="template-card">
              <!-- Same template card content -->
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  imports: [
    NgFor,
    NgIf,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    TitleCasePipe
  ],
  styles: [`
    .template-library {
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .library-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .library-header h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .library-header p {
      color: #64748b;
      font-size: 16px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      padding: 24px 0;
    }

    .template-card {
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .mat-mdc-card-avatar {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border-radius: 12px;
    }

    .mat-mdc-card-avatar mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .template-description {
      color: #475569;
      margin-bottom: 16px;
      min-height: 48px;
    }

    .template-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .more-tags {
      color: #94a3b8;
      font-size: 14px;
    }

    .template-stats {
      display: flex;
      gap: 16px;
      color: #64748b;
      font-size: 14px;
      margin-top: auto;
    }

    .template-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .template-stats mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class TemplateLibraryComponent {
  @Output() templateSelected = new EventEmitter<FormTemplate>();
  @Output() templatePreview = new EventEmitter<FormTemplate>();

  templates: FormTemplate[] = [
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Simple contact form with name, email, and message fields',
      category: 'business',
      icon: 'contact_mail',
      tags: ['contact', 'basic', 'email', 'support'],
      popularity: 95,
      createdAt: new Date(),
      components: [
        {
          id: 'mat_input',
          name: 'Full Name',
          category: 'Form',
          icon: 'person',
          component: 'mat-form-field > input',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Full Name' },
            { name: 'placeholder', type: 'string', defaultValue: 'John Doe' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_email',
          name: 'Email',
          category: 'Form',
          icon: 'email',
          component: 'mat-form-field > input[type="email"]',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Email Address' },
            { name: 'placeholder', type: 'string', defaultValue: 'john@example.com' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_textarea',
          name: 'Message',
          category: 'Form',
          icon: 'message',
          component: 'mat-form-field > textarea',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Your Message' },
            { name: 'placeholder', type: 'string', defaultValue: 'Tell us how we can help...' },
            { name: 'required', type: 'boolean', defaultValue: true },
            { name: 'rows', type: 'number', defaultValue: 5 }
          ]
        },
        {
          id: 'mat_button',
          name: 'Submit',
          category: 'Button',
          icon: 'send',
          component: 'button[mat-button]',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Send Message' },
            { name: 'color', type: 'select', defaultValue: 'primary' },
            { name: 'icon', type: 'string', defaultValue: 'send' }
          ]
        }
      ]
    },
    {
      id: 'job-application',
      name: 'Job Application',
      description: 'Comprehensive job application form with personal details and file upload',
      category: 'application',
      icon: 'work',
      tags: ['hr', 'recruitment', 'application', 'employment'],
      popularity: 88,
      createdAt: new Date(),
      components: [
        // Personal Information Section
        {
          id: 'mat_card',
          name: 'Personal Information',
          category: 'Layout',
          icon: 'person',
          component: 'mat-card',
          inputs: [
            { name: 'title', type: 'string', defaultValue: 'Personal Information' }
          ]
        },
        {
          id: 'mat_input',
          name: 'First Name',
          category: 'Form',
          icon: 'person',
          component: 'mat-form-field > input',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'First Name' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_input',
          name: 'Last Name',
          category: 'Form',
          icon: 'person',
          component: 'mat-form-field > input',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Last Name' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_email',
          name: 'Email',
          category: 'Form',
          icon: 'email',
          component: 'mat-form-field > input[type="email"]',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Email Address' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_input',
          name: 'Phone',
          category: 'Form',
          icon: 'phone',
          component: 'mat-form-field > input',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Phone Number' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        // Position Section
        {
          id: 'mat_divider',
          name: 'Divider',
          category: 'Layout',
          icon: 'horizontal_rule',
          component: 'mat-divider',
          inputs: []
        },
        {
          id: 'mat_select',
          name: 'Position',
          category: 'Form',
          icon: 'work',
          component: 'mat-form-field > mat-select',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Position Applied For' },
            { name: 'required', type: 'boolean', defaultValue: true },
            { name: 'options', type: 'string', defaultValue: 'Software Engineer,Product Manager,Designer,Marketing Manager' }
          ]
        },
        {
          id: 'mat_datepicker',
          name: 'Available Date',
          category: 'Form',
          icon: 'calendar_today',
          component: 'mat-form-field > input[matDatepicker]',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Available Start Date' },
            { name: 'required', type: 'boolean', defaultValue: true }
          ]
        },
        {
          id: 'mat_textarea',
          name: 'Cover Letter',
          category: 'Form',
          icon: 'description',
          component: 'mat-form-field > textarea',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Cover Letter' },
            { name: 'placeholder', type: 'string', defaultValue: 'Tell us why you are a great fit...' },
            { name: 'rows', type: 'number', defaultValue: 6 }
          ]
        }
      ]
    },
    {
      id: 'customer-survey',
      name: 'Customer Satisfaction Survey',
      description: 'Gather customer feedback with ratings and comments',
      category: 'survey',
      icon: 'poll',
      tags: ['feedback', 'survey', 'customer', 'satisfaction'],
      popularity: 92,
      createdAt: new Date(),
      components: [
        {
          id: 'mat_card',
          name: 'Survey Header',
          category: 'Layout',
          icon: 'poll',
          component: 'mat-card',
          inputs: [
            { name: 'title', type: 'string', defaultValue: 'Customer Satisfaction Survey' },
            { name: 'subtitle', type: 'string', defaultValue: 'Your feedback helps us improve' }
          ]
        },
        {
          id: 'mat_radio',
          name: 'Overall Satisfaction',
          category: 'Form',
          icon: 'star',
          component: 'mat-radio-group',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'How satisfied are you with our service?' },
            { name: 'required', type: 'boolean', defaultValue: true },
            { name: 'options', type: 'string', defaultValue: 'Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied' }
          ]
        },
        {
          id: 'mat_slider',
          name: 'Recommendation Score',
          category: 'Form',
          icon: 'thumb_up',
          component: 'mat-slider',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'How likely are you to recommend us? (0-10)' },
            { name: 'min', type: 'number', defaultValue: 0 },
            { name: 'max', type: 'number', defaultValue: 10 },
            { name: 'step', type: 'number', defaultValue: 1 }
          ]
        },
        {
          id: 'mat_checkbox',
          name: 'Subscribe',
          category: 'Form',
          icon: 'mail',
          component: 'mat-checkbox',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Send me updates about new features' }
          ]
        },
        {
          id: 'mat_textarea',
          name: 'Comments',
          category: 'Form',
          icon: 'comment',
          component: 'mat-form-field > textarea',
          inputs: [
            { name: 'label', type: 'string', defaultValue: 'Additional Comments' },
            { name: 'placeholder', type: 'string', defaultValue: 'Share your thoughts...' },
            { name: 'rows', type: 'number', defaultValue: 4 }
          ]
        }
      ]
    },
    {
      id: 'event-registration',
      name: 'Event Registration',
      description: 'Register attendees for conferences, workshops, or events',
      category: 'event',
      icon: 'event',
      tags: ['event', 'registration', 'conference', 'workshop'],
      popularity: 85,
      createdAt: new Date(),
      components: [
        {
          id: 'mat_stepper',
          name: 'Registration Steps',
          category: 'Navigation',
          icon: 'linear_scale',
          component: 'mat-stepper',
          inputs: [
            { name: 'steps', type: 'string', defaultValue: 'Personal Info,Event Selection,Payment' },
            { name: 'orientation', type: 'select', defaultValue: 'horizontal' }
          ]
        }
      ]
    },
    {
      id: 'product-feedback',
      name: 'Product Feedback',
      description: 'Collect detailed product feedback with ratings',
      category: 'survey',
      icon: 'rate_review',
      tags: ['feedback', 'product', 'review', 'rating'],
      popularity: 78,
      createdAt: new Date(),
      components: []
    },
    {
      id: 'newsletter-signup',
      name: 'Newsletter Signup',
      description: 'Simple email subscription form with preferences',
      category: 'business',
      icon: 'mail_outline',
      tags: ['newsletter', 'email', 'marketing', 'subscription'],
      popularity: 90,
      createdAt: new Date(),
      components: []
    }
  ];

  getTemplatesByCategory(category: string): FormTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      business: '#4f46e5',
      personal: '#10b981',
      survey: '#f59e0b',
      application: '#3b82f6',
      event: '#ec4899'
    };
    return colors[category] || '#6b7280';
  }

  useTemplate(template: FormTemplate): void {
    this.templateSelected.emit(template);
  }

  previewTemplate(template: FormTemplate): void {
    this.templatePreview.emit(template);
  }
}
