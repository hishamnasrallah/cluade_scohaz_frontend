// src/app/components/inquiry/components/data-visualizer/data-visualizer.component.ts

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DynamicColumn, DataVisualization } from '../../../../models/inquiry-execution.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-data-visualizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatRadioModule,
    TranslatePipe
  ],
  templateUrl: './data-visualizer.component.html',
  styleUrls: ['./data-visualizer.component.scss']
})
export class DataVisualizerComponent implements OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: any[] = [];
  @Input() columns: DynamicColumn[] = [];
  @Input() visualizations: DataVisualization[] = [];
  @Output() configChange = new EventEmitter<DataVisualization>();

  chart: Chart | null = null;

  // Configuration
  selectedVisualization: DataVisualization = {
    type: 'bar',
    xAxis: '',
    yAxis: '',
    groupBy: '',
    aggregation: 'count',
    title: 'Data Visualization'
  };

  // Available options
  chartTypes: { value: DataVisualization['type']; label: string; icon: string }[] = [
    { value: 'bar', label: 'Bar Chart', icon: 'bar_chart' },
    { value: 'line', label: 'Line Chart', icon: 'show_chart' },
    { value: 'pie', label: 'Pie Chart', icon: 'pie_chart' },
    { value: 'donut', label: 'Donut Chart', icon: 'donut_small' },
    { value: 'area', label: 'Area Chart', icon: 'area_chart' },
    { value: 'scatter', label: 'Scatter Plot', icon: 'scatter_plot' }
  ];

  aggregations = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
  ];

  numericColumns: DynamicColumn[] = [];
  categoricalColumns: DynamicColumn[] = [];

  ngAfterViewInit(): void {
    if (this.data.length > 0) {
      this.initializeChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['data']) {
      this.categorizeColumns();

      if (this.chartCanvas && this.data.length > 0) {
        this.updateChart();
      }
    }
  }

  private categorizeColumns(): void {
    this.numericColumns = this.columns.filter(col =>
      col.type === 'number' || col.type === 'decimal'
    );

    this.categoricalColumns = this.columns.filter(col =>
      col.type === 'string' || col.type === 'boolean' || col.type === 'date'
    );

    // Set default axes if not set
    if (!this.selectedVisualization.xAxis && this.categoricalColumns.length > 0) {
      this.selectedVisualization.xAxis = this.categoricalColumns[0].field;
    }

    if (!this.selectedVisualization.yAxis && this.numericColumns.length > 0) {
      this.selectedVisualization.yAxis = this.numericColumns[0].field;
    }
  }

  onChartTypeChange(): void {
    this.updateChart();
    this.configChange.emit(this.selectedVisualization);
  }

  onAxisChange(): void {
    this.updateChart();
    this.configChange.emit(this.selectedVisualization);
  }

  private initializeChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.updateChart();
  }

  private updateChart(): void {
    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const chartData = this.prepareChartData();
    if (!chartData) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.getChartType(),
      data: chartData,
      options: this.getChartOptions()
    };

    this.chart = new Chart(ctx, config);
  }

  private getChartType(): ChartType {
    switch (this.selectedVisualization.type) {
      case 'area':
        return 'line';
      case 'donut':
        return 'doughnut';
      case 'scatter':
        return 'scatter';
      default:
        return this.selectedVisualization.type as ChartType;
    }
  }

  private prepareChartData(): any {
    if (!this.selectedVisualization.xAxis || !this.data.length) {
      return null;
    }

    const aggregatedData = this.aggregateData();

    // Prepare data based on chart type
    if (this.selectedVisualization.type === 'pie' || this.selectedVisualization.type === 'donut') {
      return {
        labels: Object.keys(aggregatedData),
        datasets: [{
          data: Object.values(aggregatedData),
          backgroundColor: this.generateColors(Object.keys(aggregatedData).length)
        }]
      };
    }

    return {
      labels: Object.keys(aggregatedData),
      datasets: [{
        label: this.getDatasetLabel(),
        data: Object.values(aggregatedData),
        backgroundColor: this.selectedVisualization.type === 'bar'
          ? 'rgba(52, 197, 170, 0.6)'
          : 'transparent',
        borderColor: 'rgba(52, 197, 170, 1)',
        borderWidth: 2,
        fill: this.selectedVisualization.type === 'area',
        tension: 0.4
      }]
    };
  }

  private aggregateData(): Record<string, number> {
    const grouped: Record<string, any[]> = {};

    // Group data by x-axis
    this.data.forEach(row => {
      const key = String(row[this.selectedVisualization.xAxis] || 'N/A');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(row);
    });

    // Aggregate based on selected method
    const aggregated: Record<string, number> = {};

    Object.entries(grouped).forEach(([key, values]) => {
      if (this.selectedVisualization.aggregation === 'count') {
        aggregated[key] = values.length;
      } else if (this.selectedVisualization.yAxis) {
        const numericValues = values
          .map(v => parseFloat(v[this.selectedVisualization.yAxis]))
          .filter(v => !isNaN(v));

        switch (this.selectedVisualization.aggregation) {
          case 'sum':
            aggregated[key] = numericValues.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregated[key] = numericValues.length > 0
              ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
              : 0;
            break;
          case 'min':
            aggregated[key] = Math.min(...numericValues);
            break;
          case 'max':
            aggregated[key] = Math.max(...numericValues);
            break;
          default:
            aggregated[key] = values.length;
        }
      } else {
        aggregated[key] = values.length;
      }
    });

    return aggregated;
  }

  private getDatasetLabel(): string {
    if (this.selectedVisualization.yAxis) {
      const column = this.columns.find(c => c.field === this.selectedVisualization.yAxis);
      return `${this.selectedVisualization.aggregation} of ${column?.header || this.selectedVisualization.yAxis}`;
    }
    return 'Count';
  }

  private generateColors(count: number): string[] {
    const colors = [
      'rgba(52, 197, 170, 0.8)',    // Ocean mint primary
      'rgba(43, 169, 155, 0.8)',    // Ocean mint secondary
      'rgba(102, 126, 234, 0.8)',   // Purple
      'rgba(255, 159, 64, 0.8)',    // Orange
      'rgba(255, 99, 132, 0.8)',    // Red
      'rgba(54, 162, 235, 0.8)',    // Blue
      'rgba(255, 206, 86, 0.8)',    // Yellow
      'rgba(75, 192, 192, 0.8)',    // Teal
      'rgba(153, 102, 255, 0.8)',   // Purple
      'rgba(255, 159, 243, 0.8)'    // Pink
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  private getChartOptions(): any {
    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.selectedVisualization.type === 'pie' || this.selectedVisualization.type === 'donut',
          position: 'bottom'
        },
        title: {
          display: true,
          text: this.selectedVisualization.title,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    };

    // Add scales for non-pie charts
    if (!['pie', 'donut'].includes(this.selectedVisualization.type)) {
      options.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      };
    }

    return options;
  }

  exportChart(): void {
    if (this.chart) {
      const url = this.chart.toBase64Image();
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = url;
      link.click();
    }
  }
}
