// src/app/reports/components/report-templates/report-templates.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../services/report.service';
import { Report } from '../../../models/report.models';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  tags: string[];
  config: {
    dataSources: Array<{
      model: string;
      alias: string;
      is_primary?: boolean;
    }>;
    fields: Array<{
      path: string;
      display_name: string;
      aggregation?: string;
    }>;
    filters?: Array<{
      field_path: string;
      operator: string;
      value: any;
    }>;
    parameters?: Array<{
      name: string;
      display_name: string;
      parameter_type: string;
      is_required: boolean;
      default_value?: any;
    }>;
  };
}

@Component({
  selector: 'app-report-templates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatGridListModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'report-templates.component.html',
  styleUrl: 'report-templates.component.scss'
})
export class ReportTemplatesComponent implements OnInit {
  router = Router;

  templates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Sales Summary Report',
      description: 'Comprehensive sales analysis with revenue breakdowns by region, product, and time period',
      category: 'Sales',
      icon: 'trending_up',
      color: '#34C5AA',
      tags: ['sales', 'revenue', 'analytics'],
      config: {
        dataSources: [
          { model: 'Order', alias: 'order', is_primary: true }
        ],
        fields: [
          { path: 'order_date', display_name: 'Date', aggregation: 'group_by' },
          { path: 'region', display_name: 'Region', aggregation: 'group_by' },
          { path: 'product_category', display_name: 'Category', aggregation: 'group_by' },
          { path: 'total_amount', display_name: 'Revenue', aggregation: 'sum' },
          { path: 'id', display_name: 'Order Count', aggregation: 'count' }
        ],
        filters: [
          { field_path: 'status', operator: 'eq', value: 'completed' }
        ],
        parameters: [
          {
            name: 'date_range',
            display_name: 'Date Range',
            parameter_type: 'date_range',
            is_required: true,
            default_value: { start: 'current_month_start', end: 'current_month_end' }
          }
        ]
      }
    },
    {
      id: 'customer-analysis',
      name: 'Customer Analytics',
      description: 'Analyze customer demographics, purchase behavior, and lifetime value',
      category: 'Customers',
      icon: 'people',
      color: '#3B82F6',
      tags: ['customers', 'analytics', 'clv'],
      config: {
        dataSources: [
          { model: 'Customer', alias: 'customer', is_primary: true },
          { model: 'Order', alias: 'order' }
        ],
        fields: [
          { path: 'customer.segment', display_name: 'Customer Segment', aggregation: 'group_by' },
          { path: 'customer.id', display_name: 'Customer Count', aggregation: 'count_distinct' },
          { path: 'order.total_amount', display_name: 'Avg Order Value', aggregation: 'avg' },
          { path: 'order.total_amount', display_name: 'Total Revenue', aggregation: 'sum' }
        ]
      }
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status Report',
      description: 'Track product inventory levels, movement, and reorder requirements',
      category: 'Inventory',
      icon: 'inventory',
      color: '#F59E0B',
      tags: ['inventory', 'stock', 'products'],
      config: {
        dataSources: [
          { model: 'Product', alias: 'product', is_primary: true },
          { model: 'Inventory', alias: 'inventory' }
        ],
        fields: [
          { path: 'product.name', display_name: 'Product Name' },
          { path: 'product.sku', display_name: 'SKU' },
          { path: 'inventory.quantity_on_hand', display_name: 'On Hand' },
          { path: 'inventory.reorder_point', display_name: 'Reorder Point' },
          { path: 'inventory.quantity_on_hand', display_name: 'Status' }
        ],
        filters: [
          { field_path: 'product.is_active', operator: 'eq', value: true }
        ]
      }
    },
    {
      id: 'employee-performance',
      name: 'Employee Performance Dashboard',
      description: 'Monitor employee productivity, KPIs, and team performance metrics',
      category: 'HR',
      icon: 'groups',
      color: '#EC4899',
      tags: ['hr', 'performance', 'employees'],
      config: {
        dataSources: [
          { model: 'Employee', alias: 'employee', is_primary: true },
          { model: 'Performance', alias: 'performance' }
        ],
        fields: [
          { path: 'employee.department', display_name: 'Department', aggregation: 'group_by' },
          { path: 'employee.id', display_name: 'Employee Count', aggregation: 'count' },
          { path: 'performance.score', display_name: 'Avg Performance', aggregation: 'avg' }
        ]
      }
    },
    {
      id: 'financial-overview',
      name: 'Financial Overview',
      description: 'Comprehensive financial reporting including P&L, cash flow, and key metrics',
      category: 'Finance',
      icon: 'account_balance',
      color: '#7C3AED',
      tags: ['finance', 'accounting', 'profit'],
      config: {
        dataSources: [
          { model: 'Transaction', alias: 'transaction', is_primary: true }
        ],
        fields: [
          { path: 'account_type', display_name: 'Account Type', aggregation: 'group_by' },
          { path: 'amount', display_name: 'Total Amount', aggregation: 'sum' },
          { path: 'id', display_name: 'Transaction Count', aggregation: 'count' }
        ],
        parameters: [
          {
            name: 'fiscal_period',
            display_name: 'Fiscal Period',
            parameter_type: 'select',
            is_required: true,
            default_value: 'current_quarter'
          }
        ]
      }
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign Analysis',
      description: 'Track campaign performance, ROI, and conversion metrics',
      category: 'Marketing',
      icon: 'campaign',
      color: '#16A34A',
      tags: ['marketing', 'campaigns', 'roi'],
      config: {
        dataSources: [
          { model: 'Campaign', alias: 'campaign', is_primary: true },
          { model: 'Lead', alias: 'lead' }
        ],
        fields: [
          { path: 'campaign.name', display_name: 'Campaign' },
          { path: 'campaign.channel', display_name: 'Channel', aggregation: 'group_by' },
          { path: 'lead.id', display_name: 'Leads Generated', aggregation: 'count' },
          { path: 'lead.conversion_value', display_name: 'Revenue', aggregation: 'sum' }
        ]
      }
    }
  ];

  filteredTemplates: ReportTemplate[] = [];
  selectedCategory = 'all';
  categories: string[] = [];
  isCreating = false;

  constructor(
    public router: Router,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.extractCategories();
    this.filteredTemplates = [...this.templates];
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.templates.forEach(template => {
      categorySet.add(template.category);
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;

    if (category === 'all') {
      this.filteredTemplates = [...this.templates];
    } else {
      this.filteredTemplates = this.templates.filter(t => t.category === category);
    }
  }

  useTemplate(template: ReportTemplate): void {
    if (this.isCreating) return;

    this.isCreating = true;

    // Create report from template
    const newReport: Partial<Report> = {
      name: template.name,
      description: template.description,
      report_type: 'template',
      category: template.category,
      tags: template.tags,
      is_active: true,
      is_public: false
    };

    this.reportService.createReport(newReport).subscribe({
      next: (report) => {
        // Navigate to editor to complete setup
        this.router.navigate(['/reports', report.id, 'edit'], {
          state: { template: template.config }
        });

        this.snackBar.open('Report created from template', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error creating report from template:', err);
        this.isCreating = false;

        this.snackBar.open('Error creating report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getTemplateIcon(icon: string): string {
    return icon;
  }

  getTemplateStyle(color: string): any {
    return {
      'background': `linear-gradient(135deg, ${color}15 0%, ${color}10 100%)`,
      'border-color': `${color}30`
    };
  }

  getIconStyle(color: string): any {
    return {
      'background': `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
      'color': 'white'
    };
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Sales': 'trending_up',
      'Customers': 'people',
      'Inventory': 'inventory',
      'HR': 'groups',
      'Finance': 'account_balance',
      'Marketing': 'campaign'
    };
    return icons[category] || 'category';
  }
}
