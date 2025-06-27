import { Component, OnInit } from '@angular/core';
import {NgStyle} from '@angular/common';

interface SvgData {
  [key: string]: string;
}

@Component({
  selector: 'logo-info',
  templateUrl: './logo.component.html',
  imports: [
    NgStyle
  ],
  styles: [`
    /* Add any component-specific styles here */
  `]
})
export class LogoComponent implements OnInit {
  currentLogo = '';
  selectedSize = 512;
  selectedBackground = 'transparent';
  viewMode = 'grid';
  activeTab = 'symbols';

  // SVG Data Storage
  svgData: SvgData = {
    'p-colored': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34C5AA;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2BA99B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5FD3C4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="url(#grad1)" />
  <rect x="30" y="20" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#2F4858" opacity="0.3" />
</svg>`,
    'p-black': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="#000000" />
  <rect x="30" y="20" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#000000" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#000000" opacity="0.3" />
</svg>`,
    'p-white': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="#FFFFFF" />
  <rect x="30" y="20" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#FFFFFF" opacity="0.3" />
</svg>`,
    'x-colored': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34C5AA;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2BA99B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5FD3C4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 15 15 L 30 30 L 30 35 L 35 35 L 35 30 L 50 15 L 65 15 L 50 30 L 50 35 L 45 35 L 45 30 L 30 45 L 45 60 L 45 50 L 50 50 L 50 45 L 65 60 L 65 65 L 50 65 L 35 50 L 35 45 L 30 45 L 30 50 L 15 65 L 15 60 L 30 45 L 15 30 L 15 15 Z" fill="url(#grad1)" />
  <rect x="36" y="33" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="33" y="37" width="14" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="36" y="41" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="55" y="38" width="18" height="2" fill="#5FD3C4" opacity="0.6" />
  <rect x="58" y="42" width="15" height="2" fill="#5FD3C4" opacity="0.4" />
  <rect x="60" y="46" width="10" height="2" fill="#5FD3C4" opacity="0.2" />
</svg>`,
    'x-black': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 15 L 30 30 L 30 35 L 35 35 L 35 30 L 50 15 L 65 15 L 50 30 L 50 35 L 45 35 L 45 30 L 30 45 L 45 60 L 45 50 L 50 50 L 50 45 L 65 60 L 65 65 L 50 65 L 35 50 L 35 45 L 30 45 L 30 50 L 15 65 L 15 60 L 30 45 L 15 30 L 15 15 Z" fill="#000000" />
  <rect x="36" y="33" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="33" y="37" width="14" height="3" fill="#000000" opacity="0.3" />
  <rect x="36" y="41" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="55" y="38" width="18" height="2" fill="#000000" opacity="0.6" />
  <rect x="58" y="42" width="15" height="2" fill="#000000" opacity="0.4" />
  <rect x="60" y="46" width="10" height="2" fill="#000000" opacity="0.2" />
</svg>`,
    'x-white': `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 15 L 30 30 L 30 35 L 35 35 L 35 30 L 50 15 L 65 15 L 50 30 L 50 35 L 45 35 L 45 30 L 30 45 L 45 60 L 45 50 L 50 50 L 50 45 L 65 60 L 65 65 L 50 65 L 35 50 L 35 45 L 30 45 L 30 50 L 15 65 L 15 60 L 30 45 L 15 30 L 15 15 Z" fill="#FFFFFF" />
  <rect x="36" y="33" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="33" y="37" width="14" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="36" y="41" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="55" y="38" width="18" height="2" fill="#FFFFFF" opacity="0.6" />
  <rect x="58" y="42" width="15" height="2" fill="#FFFFFF" opacity="0.4" />
  <rect x="60" y="46" width="10" height="2" fill="#FFFFFF" opacity="0.2" />
</svg>`,
    'px-colored': `<svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34C5AA;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2BA99B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5FD3C4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="url(#grad1)" />
  <path d="M 50 15 L 65 30 L 65 35 L 70 35 L 70 30 L 85 15 L 100 15 L 85 30 L 85 35 L 80 35 L 80 30 L 65 45 L 80 60 L 80 50 L 85 50 L 85 45 L 100 60 L 100 65 L 85 65 L 70 50 L 70 45 L 65 45 L 65 50 L 50 65 L 50 60 L 65 45 L 50 30 L 50 15 Z" fill="url(#grad1)" />
  <rect x="30" y="20" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="71" y="33" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="68" y="37" width="14" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="71" y="41" width="8" height="3" fill="#2F4858" opacity="0.3" />
  <rect x="90" y="38" width="20" height="2" fill="#5FD3C4" opacity="0.6" />
  <rect x="93" y="42" width="17" height="2" fill="#5FD3C4" opacity="0.4" />
  <rect x="95" y="46" width="13" height="2" fill="#5FD3C4" opacity="0.2" />
</svg>`,
    'px-black': `<svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="#000000" />
  <path d="M 50 15 L 65 30 L 65 35 L 70 35 L 70 30 L 85 15 L 100 15 L 85 30 L 85 35 L 80 35 L 80 30 L 65 45 L 80 60 L 80 50 L 85 50 L 85 45 L 100 60 L 100 65 L 85 65 L 70 50 L 70 45 L 65 45 L 65 50 L 50 65 L 50 60 L 65 45 L 50 30 L 50 15 Z" fill="#000000" />
  <rect x="30" y="20" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#000000" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#000000" opacity="0.3" />
  <rect x="71" y="33" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="68" y="37" width="14" height="3" fill="#000000" opacity="0.3" />
  <rect x="71" y="41" width="8" height="3" fill="#000000" opacity="0.3" />
  <rect x="90" y="38" width="20" height="2" fill="#000000" opacity="0.6" />
  <rect x="93" y="42" width="17" height="2" fill="#000000" opacity="0.4" />
  <rect x="95" y="46" width="13" height="2" fill="#000000" opacity="0.2" />
</svg>`,
    'px-white': `<svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="#FFFFFF" />
  <path d="M 50 15 L 65 30 L 65 35 L 70 35 L 70 30 L 85 15 L 100 15 L 85 30 L 85 35 L 80 35 L 80 30 L 65 45 L 80 60 L 80 50 L 85 50 L 85 45 L 100 60 L 100 65 L 85 65 L 70 50 L 70 45 L 65 45 L 65 50 L 50 65 L 50 60 L 65 45 L 50 30 L 50 15 Z" fill="#FFFFFF" />
  <rect x="30" y="20" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="30" y="26" width="12" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="30" y="32" width="6" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="71" y="33" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="68" y="37" width="14" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="71" y="41" width="8" height="3" fill="#FFFFFF" opacity="0.3" />
  <rect x="90" y="38" width="20" height="2" fill="#FFFFFF" opacity="0.6" />
  <rect x="93" y="42" width="17" height="2" fill="#FFFFFF" opacity="0.4" />
  <rect x="95" y="46" width="13" height="2" fill="#FFFFFF" opacity="0.2" />
</svg>`,
    'full-colored': `<svg width="230" height="80" viewBox="0 0 230 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34C5AA;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2BA99B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5FD3C4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(0, 5) scale(0.8)">
    <path d="M 15 10 L 15 70 L 25 70 L 25 45 L 40 45 Q 55 45 55 30 Q 55 15 40 15 L 25 15 L 25 35 L 40 35 Q 45 35 45 30 Q 45 25 40 25 L 25 25" fill="url(#grad1)" />
    <rect x="30" y="20" width="8" height="3" fill="#2F4858" opacity="0.3" />
    <rect x="30" y="26" width="12" height="3" fill="#2F4858" opacity="0.3" />
    <rect x="30" y="32" width="6" height="3" fill="#2F4858" opacity="0.3" />
  </g>
  <text x="44" y="52" font-family="Rajdhani, sans-serif" font-size="48" font-weight="600" fill="url(#grad1)">ra</text>
  <g transform="translate(84, 5) scale(0.8)">
    <path d="M 15 15 L 30 30 L 30 35 L 35 35 L 35 30 L 50 15 L 65 15 L 50 30 L 50 35 L 45 35 L 45 30 L 30 45 L 45 60 L 45 50 L 50 50 L 50 45 L 65 60 L 65 65 L 50 65 L 35 50 L 35 45 L 30 45 L 30 50 L 15 65 L 15 60 L 30 45 L 15 30 L 15 15 Z" fill="url(#grad1)" />
    <rect x="36" y="33" width="8" height="3" fill="#2F4858" opacity="0.3" />
    <rect x="33" y="37" width="14" height="3" fill="#2F4858" opacity="0.3" />
    <rect x="36" y="41" width="8" height="3" fill="#2F4858" opacity="0.3" />
    <rect x="55" y="38" width="18" height="2" fill="#5FD3C4" opacity="0.6" />
    <rect x="58" y="42" width="15" height="2" fill="#5FD3C4" opacity="0.4" />
    <rect x="60" y="46" width="10" height="2" fill="#5FD3C4" opacity="0.2" />
  </g>
  <text x="144" y="52" font-family="Rajdhani, sans-serif" font-size="48" font-weight="600" fill="url(#grad1)">elo</text>
</svg>`,
    // Add all other SVG data here...
  };

  // State for modals
  showDownloadModal = false;
  showSvgModal = false;
  svgCodeToShow = '';
  toastMessage = '';
  showToast = false;

  // State for dropdowns
  openDropdowns: { [key: string]: boolean } = {};

  // State for preview backgrounds
  previewBackgrounds: { [key: string]: boolean } = {};

  ngOnInit() {
    // Initialize any needed data
  }

  // Tab switching
  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  // Toggle view mode
  toggleView(mode: string) {
    this.viewMode = mode;
  }

  // Toggle background
  toggleBackground(previewId: string) {
    this.previewBackgrounds[previewId] = !this.previewBackgrounds[previewId];
  }

  // Toggle dropdown
  toggleDropdown(dropdownId: string, event: Event) {
    event.stopPropagation();

    // Close all other dropdowns
    Object.keys(this.openDropdowns).forEach(key => {
      if (key !== dropdownId) {
        this.openDropdowns[key] = false;
      }
    });

    // Toggle current dropdown
    this.openDropdowns[dropdownId] = !this.openDropdowns[dropdownId];
  }

  // Check if dropdown is open
  isDropdownOpen(dropdownId: string): boolean {
    return this.openDropdowns[dropdownId] || false;
  }

  // Close all dropdowns
  closeAllDropdowns() {
    Object.keys(this.openDropdowns).forEach(key => {
      this.openDropdowns[key] = false;
    });
  }

  // Open download modal
  openDownloadModal(logoType: string) {
    this.currentLogo = logoType;
    this.showDownloadModal = true;
  }

  // Select size
  selectSize(size: number) {
    this.selectedSize = size;
  }

  // Select background
  selectBackground(bg: string) {
    this.selectedBackground = bg;
  }

  // Get preview background style
  getPreviewBackgroundStyle(): any {
    const styles: any = {};

    if (this.selectedBackground === 'transparent') {
      styles['background-image'] = `
        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
      `;
      styles['background-size'] = '20px 20px';
      styles['background-position'] = '0 0, 0 10px, 10px -10px, -10px 0px';
    } else if (this.selectedBackground === 'black') {
      styles['background'] = '#1d1d1f';
    } else if (this.selectedBackground === 'white') {
      styles['background'] = '#ffffff';
    } else if (this.selectedBackground === 'custom') {
      styles['background'] = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    return styles;
  }

  // Download selected logo
  downloadSelected() {
    const size = this.selectedSize;
    const bg = this.selectedBackground;
    const fileName = `praxelo-${this.currentLogo}-${size}px.png`;

    this.downloadSVGAsPNG(this.currentLogo, fileName, size, bg);
    this.showDownloadModal = false;
  }

  // Download SVG as PNG
  downloadSVGAsPNG(type: string, fileName: string, size: number, background: string) {
    const svgString = this.svgData[type];
    const svgElement = new DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    // Get original SVG dimensions
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ') || ['0', '0', '100', '100'];
    const originalWidth = parseInt(viewBox[2]);
    const originalHeight = parseInt(viewBox[3]);
    const aspectRatio = originalHeight / originalWidth;

    // Calculate canvas dimensions
    canvas.width = size;
    canvas.height = Math.round(size * aspectRatio);

    img.onload = () => {
      // Apply background
      if (background === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === 'black') {
        ctx.fillStyle = '#1d1d1f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === 'custom') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToastMessage('Logo downloaded successfully!');
      });
    };

    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  }

  // Download SVG file
  downloadSVG(type: string) {
    const svgString = this.svgData[type];
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `praxelo-${type}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToastMessage('SVG downloaded successfully!');
  }

  // Download PDF
  downloadPDF(type: string) {
    this.showToastMessage('PDF export requires a PDF generation library. SVG downloaded instead.');
    this.downloadSVG(type);
  }

  // Copy SVG code
  copySVG(type: string) {
    this.svgCodeToShow = this.svgData[type];
    this.showSvgModal = true;
  }

  // Copy code from modal
  copyCode() {
    navigator.clipboard.writeText(this.svgCodeToShow).then(() => {
      this.showToastMessage('SVG code copied to clipboard!');
      this.showSvgModal = false;
    });
  }

  // Show toast notification
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Close modals
  closeModal(modalType: 'download' | 'svg') {
    if (modalType === 'download') {
      this.showDownloadModal = false;
    } else {
      this.showSvgModal = false;
    }
  }

  // Handle custom size input
  onCustomSizeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (value && value >= 16 && value <= 4096) {
      this.selectedSize = value;
    }
  }

  // Download favicon set
  downloadFaviconSet() {
    const sizes = [16, 32, 64];
    sizes.forEach((size, index) => {
      setTimeout(() => {
        this.downloadSVGAsPNG('p-colored', `favicon-${size}x${size}.png`, size, 'transparent');
      }, 100 * index);
    });

    this.showToastMessage('Favicon set downloading...');
  }

  // Download ICO
  downloadICO() {
    this.showToastMessage('ICO generation requires conversion. Use an online tool to convert the PNG files to ICO format.');
  }

  // Download social media size
  downloadSocialSize(type: string, size: number) {
    this.downloadSVGAsPNG(type, `praxelo-social-${size}x${size}.png`, size, 'transparent');
  }

  // Download HTML for email signature
  downloadHTML(type: string) {
    const htmlContent = `
<!-- PraXelo Email Signature -->
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="padding-right: 10px;">
            <img src="https://yourdomain.com/praxelo-email-logo.png" alt="PraXelo" width="200" height="40" style="display: block;">
        </td>
    </tr>
</table>
<!-- End PraXelo Email Signature -->
`;

    const blob = new Blob([htmlContent], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'praxelo-email-signature.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToastMessage('Email signature HTML downloaded!');
  }
}
