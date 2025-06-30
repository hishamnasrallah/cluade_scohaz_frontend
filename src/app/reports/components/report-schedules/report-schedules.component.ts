// src/app/reports/components/report-schedules/report-schedules.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Schedule, Report } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Group {
  id: number;
  name: string;
}

@Component({
  selector: 'app-report-schedules',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatAutocompleteModule
  ],
  templateUrl: 'report-schedules.component.html',
  styleUrl: 'report-schedules.component.scss'
})
export class ReportSchedulesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  schedules: Schedule[] = [];
  reports: Report[] = [];
  dataSource = new MatTableDataSource<Schedule>([]);
  displayedColumns = ['name', 'report', 'schedule_type', 'next_run', 'status', 'recipients', 'actions'];

  isLoading = false;
  showForm = false;
  editingSchedule: Schedule | null = null;

  // Form
  scheduleForm: FormGroup;

  // Available options
  scheduleTypes = [
    { value: 'daily', label: 'Daily', icon: 'today' },
    { value: 'weekly', label: 'Weekly', icon: 'date_range' },
    { value: 'monthly', label: 'Monthly', icon: 'calendar_month' }
  ];

  daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  outputFormats = [
    { value: 'csv', label: 'CSV', icon: 'table_chart' },
    { value: 'excel', label: 'Excel', icon: 'grid_on' },
    { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' }
  ];

  timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  // Recipients
  recipientEmails: string[] = [];
  availableUsers: User[] = [];
  availableGroups: Group[] = [];
  filteredUsers: Observable<User[]> | undefined;
  filteredGroups: Observable<Group[]> | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.scheduleForm = this.createScheduleForm();
  }

  ngOnInit(): void {
    this.loadReports();
    this.loadSchedules();
    this.loadUsersAndGroups();
    this.setupAutocomplete();

    // Check if coming from a specific report
    const reportId = this.route.snapshot.queryParamMap.get('reportId');
    if (reportId) {
      this.showCreateForm();
      this.scheduleForm.patchValue({ report: parseInt(reportId) });
    }
  }

  createScheduleForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      report: [null, Validators.required],
      schedule_type: ['daily', Validators.required],
      day_of_week: [1],
      day_of_month: [1],
      time_of_day: ['08:00', Validators.required],
      timezone: ['America/New_York', Validators.required],
      output_format: ['excel', Validators.required],
      recipient_emails: [[]],
      recipient_users: [[]],
      recipient_groups: [[]],
      email_subject: ['', Validators.required],
      email_body: [''],
      is_active: [true],
      retry_on_failure: [true],
      max_retries: [3],
      // For parameter values
      parameters: [{}]
    });
  }

  loadReports(): void {
    this.reportService.getReports({ is_active: true }).subscribe({
      next: (response) => {
        this.reports = response.results;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
      }
    });
  }

  loadSchedules(): void {
    this.isLoading = true;
    // In a real implementation, you would have a method to get all schedules
    // For now, we'll simulate this
    this.isLoading = false;
    this.dataSource.data = this.schedules;
  }

  loadUsersAndGroups(): void {
    // In a real implementation, you would load users and groups from your API
    // For demonstration:
    this.availableUsers = [
      { id: 1, username: 'john_doe', email: 'john@example.com', first_name: 'John', last_name: 'Doe' },
      { id: 2, username: 'jane_smith', email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith' }
    ];

    this.availableGroups = [
      { id: 1, name: 'Management' },
      { id: 2, name: 'Sales Team' },
      { id: 3, name: 'Finance' }
    ];
  }

  setupAutocomplete(): void {
    this.filteredUsers = this.scheduleForm.get('recipient_users')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );

    this.filteredGroups = this.scheduleForm.get('recipient_groups')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroups(value || ''))
    );
  }

  private _filterUsers(value: string | User[]): User[] {
    if (Array.isArray(value)) return this.availableUsers;

    const filterValue = value.toLowerCase();
    return this.availableUsers.filter(user =>
      user.username.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(filterValue)
    );
  }

  private _filterGroups(value: string | Group[]): Group[] {
    if (Array.isArray(value)) return this.availableGroups;

    const filterValue = value.toLowerCase();
    return this.availableGroups.filter(group =>
      group.name.toLowerCase().includes(filterValue)
    );
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingSchedule = null;
    this.scheduleForm.reset({
      schedule_type: 'daily',
      time_of_day: '08:00',
      timezone: 'America/New_York',
      output_format: 'excel',
      is_active: true,
      retry_on_failure: true,
      max_retries: 3,
      day_of_week: 1,
      day_of_month: 1
    });
    this.recipientEmails = [];
  }

  editSchedule(schedule: Schedule): void {
    this.showForm = true;
    this.editingSchedule = schedule;

    this.scheduleForm.patchValue({
      name: schedule.name,
      report: schedule.report,
      schedule_type: schedule.schedule_type,
      day_of_week: schedule.day_of_week || 1,
      day_of_month: schedule.day_of_month || 1,
      time_of_day: schedule.time_of_day,
      timezone: schedule.timezone,
      output_format: schedule.output_format,
      recipient_users: schedule.recipient_users,
      recipient_groups: schedule.recipient_groups,
      email_subject: schedule.email_subject,
      email_body: schedule.email_body,
      is_active: schedule.is_active,
      retry_on_failure: schedule.retry_on_failure,
      max_retries: schedule.max_retries,
      parameters: schedule.parameters || {}
    });

    this.recipientEmails = [...schedule.recipient_emails];
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingSchedule = null;
    this.scheduleForm.reset();
    this.recipientEmails = [];
  }

  saveSchedule(): void {
    if (!this.scheduleForm.valid) {
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.controls[key].markAsTouched();
      });
      return;
    }

    const formValue = this.scheduleForm.value;
    const scheduleData: Partial<Schedule> = {
      ...formValue,
      recipient_emails: this.recipientEmails
    };

    if (this.editingSchedule?.id) {
      // Update existing schedule
      this.reportService.updateSchedule(this.editingSchedule.id, scheduleData).subscribe({
        next: (updated) => {
          const index = this.schedules.findIndex(s => s.id === updated.id);
          if (index !== -1) {
            this.schedules[index] = updated;
          }
          this.dataSource.data = [...this.schedules];

          this.snackBar.open('Schedule updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.cancelForm();
        },
        error: (err) => {
          console.error('Error updating schedule:', err);
          this.snackBar.open('Error updating schedule', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Create new schedule
      this.reportService.createSchedule(scheduleData).subscribe({
        next: (created) => {
          this.schedules.push(created);
          this.dataSource.data = [...this.schedules];

          this.snackBar.open('Schedule created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.cancelForm();
        },
        error: (err) => {
          console.error('Error creating schedule:', err);
          this.snackBar.open('Error creating schedule', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  toggleScheduleStatus(schedule: Schedule): void {
    const newStatus = !schedule.is_active;

    this.reportService.updateSchedule(schedule.id!, { is_active: newStatus }).subscribe({
      next: (updated) => {
        schedule.is_active = newStatus;
        this.snackBar.open(
          newStatus ? 'Schedule activated' : 'Schedule deactivated',
          'Close',
          {
            duration: 2000,
            panelClass: ['info-snackbar']
          }
        );
      },
      error: (err) => {
        console.error('Error toggling schedule status:', err);
        this.snackBar.open('Error updating schedule status', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    if (!schedule.id) return;

    if (confirm(`Are you sure you want to delete the schedule "${schedule.name}"?`)) {
      this.reportService.deleteSchedule(schedule.id).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s.id !== schedule.id);
          this.dataSource.data = this.schedules;

          this.snackBar.open('Schedule deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Error deleting schedule:', err);
          this.snackBar.open('Error deleting schedule', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  runNow(schedule: Schedule): void {
    if (!schedule.report) return;

    // Navigate to report execution with schedule parameters
    this.router.navigate(['/reports', schedule.report, 'execute'], {
      queryParams: { scheduleId: schedule.id }
    });
  }

  addRecipientEmail(email: string): void {
    if (email && !this.recipientEmails.includes(email)) {
      this.recipientEmails.push(email);
    }
  }

  removeRecipientEmail(email: string): void {
    const index = this.recipientEmails.indexOf(email);
    if (index >= 0) {
      this.recipientEmails.splice(index, 1);
    }
  }

  displayUser(user: User): string {
    return user ? `${user.first_name} ${user.last_name} (${user.username})` : '';
  }

  displayGroup(group: Group): string {
    return group ? group.name : '';
  }

  getReportName(reportId: number): string {
    const report = this.reports.find(r => r.id === reportId);
    return report?.name || 'Unknown Report';
  }

  getNextRunTime(schedule: Schedule): string {
    // Calculate next run time based on schedule type
    const now = new Date();
    const scheduledTime = schedule.time_of_day.split(':');
    const nextRun = new Date();

    nextRun.setHours(parseInt(scheduledTime[0]), parseInt(scheduledTime[1]), 0, 0);

    switch (schedule.schedule_type) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = schedule.day_of_week || 0;
        const currentDay = now.getDay();
        let daysUntilTarget = targetDay - currentDay;

        if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }

        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        break;

      case 'monthly':
        const targetDate = schedule.day_of_month || 1;
        nextRun.setDate(targetDate);

        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun.toLocaleString();
  }

  formatRecipients(schedule: Schedule): string {
    const parts = [];

    if (schedule.recipient_emails.length > 0) {
      parts.push(`${schedule.recipient_emails.length} email${schedule.recipient_emails.length > 1 ? 's' : ''}`);
    }

    if (schedule.recipient_users.length > 0) {
      parts.push(`${schedule.recipient_users.length} user${schedule.recipient_users.length > 1 ? 's' : ''}`);
    }

    if (schedule.recipient_groups.length > 0) {
      parts.push(`${schedule.recipient_groups.length} group${schedule.recipient_groups.length > 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'No recipients';
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

