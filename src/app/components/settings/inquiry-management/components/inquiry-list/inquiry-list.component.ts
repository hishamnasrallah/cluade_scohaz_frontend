// components/settings/inquiry-management/components/inquiry-list/inquiry-list.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InquiryConfiguration } from '../../../../../models/inquiry-config.models';
import { TranslatePipe } from '../../../../../pipes/translate.pipe';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    TranslatePipe,
    MatDivider
  ],
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.scss']
})
export class InquiryListComponent {
  @Input() inquiries: InquiryConfiguration[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() selectedInquiries: InquiryConfiguration[] = [];
  @Input() dataSource: any;

  @Output() selectionChange = new EventEmitter<InquiryConfiguration>();
  @Output() selectAllChange = new EventEmitter<void>();
  @Output() viewInquiry = new EventEmitter<InquiryConfiguration>();
  @Output() editInquiry = new EventEmitter<InquiryConfiguration>();
  @Output() duplicateInquiry = new EventEmitter<InquiryConfiguration>();
  @Output() toggleStatus = new EventEmitter<InquiryConfiguration>();
  @Output() exportInquiry = new EventEmitter<InquiryConfiguration>();
  @Output() deleteInquiry = new EventEmitter<InquiryConfiguration>();

  isAllSelected(): boolean {
    return this.selectedInquiries.length === this.inquiries.length && this.inquiries.length > 0;
  }

  isSomeSelected(): boolean {
    return this.selectedInquiries.length > 0 && this.selectedInquiries.length < this.inquiries.length;
  }

  isSelected(inquiry: InquiryConfiguration): boolean {
    return this.selectedInquiries.some(i => i.id === inquiry.id);
  }

  toggleSelection(inquiry: InquiryConfiguration): void {
    this.selectionChange.emit(inquiry);
  }

  toggleAllSelection(): void {
    this.selectAllChange.emit();
  }

  onViewInquiry(inquiry: InquiryConfiguration, event: Event): void {
    event.stopPropagation();
    this.viewInquiry.emit(inquiry);
  }

  onEditInquiry(inquiry: InquiryConfiguration): void {
    this.editInquiry.emit(inquiry);
  }

  onDuplicateInquiry(inquiry: InquiryConfiguration): void {
    this.duplicateInquiry.emit(inquiry);
  }

  onToggleStatus(inquiry: InquiryConfiguration): void {
    this.toggleStatus.emit(inquiry);
  }

  onExportInquiry(inquiry: InquiryConfiguration): void {
    this.exportInquiry.emit(inquiry);
  }

  onDeleteInquiry(inquiry: InquiryConfiguration): void {
    this.deleteInquiry.emit(inquiry);
  }

  getModelDisplay(inquiry: InquiryConfiguration): string {
    return inquiry.content_type ? `Model ${inquiry.content_type}` : 'Unknown Model';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
