// src/main.ts - ENHANCED VERSION WITH PRODUCTION FEATURES

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/components/app.component';
import { enableProdMode, isDevMode } from '@angular/core';

// Check if we should enable production mode
if (!isDevMode()) {
  enableProdMode();
}

// Performance monitoring
if ('performance' in window && 'measure' in window.performance) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      if (isDevMode()) {
        console.log('=== Performance Metrics ===');
        console.log(`Page Load Time: ${pageLoadTime}ms`);
        console.log(`Connect Time: ${connectTime}ms`);
        console.log(`Render Time: ${renderTime}ms`);
        console.log('========================');
      }

      // Send to analytics if available
      if ('gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'timing_complete', {
          'name': 'load',
          'value': pageLoadTime,
          'event_category': 'Performance'
        });
      }
    }, 0);
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, send to error tracking service
  if (!isDevMode() && 'gtag' in window) {
    (window as any).gtag('event', 'exception', {
      'description': event.error?.message || 'Unknown error',
      'fatal': true
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, send to error tracking service
  if (!isDevMode() && 'gtag' in window) {
    (window as any).gtag('event', 'exception', {
      'description': event.reason?.message || 'Unhandled promise rejection',
      'fatal': false
    });
  }
});

// Service Worker Registration (for PWA) - only in production
if ('serviceWorker' in navigator && !isDevMode()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version available! Refresh to update.');
                // You could show a notification to the user here
              }
            });
          }
        });
      })
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}

// Enhanced local storage with error handling
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('LocalStorage setItem failed:', e);
      // Handle quota exceeded or other errors
    }
  },
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('LocalStorage getItem failed:', e);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage removeItem failed:', e);
    }
  }
};

// Make safe localStorage available globally
(window as any).safeLocalStorage = safeLocalStorage;

// Browser compatibility check
const checkBrowserCompatibility = () => {
  const requiredFeatures = [
    'Promise',
    'fetch',
    'Symbol',
    'Object.assign',
    'Array.from',
    'Map',
    'Set'
  ];

  const missingFeatures = requiredFeatures.filter(feature => {
    try {
      return !eval(feature);
    } catch {
      return true;
    }
  });

  if (missingFeatures.length > 0) {
    console.warn('Missing browser features:', missingFeatures);
    // Show compatibility warning if needed
  }
};

checkBrowserCompatibility();

// Bootstrap Application with enhanced error handling
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('%c🚀 Form Builder Pro - Application bootstrapped successfully',
      'color: #4f46e5; font-size: 14px; font-weight: bold;');

    if (isDevMode()) {
      console.log('%c⚠️ Running in development mode',
        'color: #f59e0b; font-size: 12px;');
    }

    // Remove loading spinner with fade effect
    const loader = document.querySelector('.app-loading');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 300);
    }

    // Initialize any third-party services
    initializeThirdPartyServices();
  })
  .catch(err => {
    console.error('❌ Application bootstrap error:', err);

    // Remove loader even on error
    const loader = document.querySelector('.app-loading');
    if (loader) {
      loader.remove();
    }

    // Show user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: 'Roboto', Arial, sans-serif;
        background: #f8fafc;
      ">
        <div style="
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <div style="
            width: 80px;
            height: 80px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          ">
            <svg width="40" height="40" fill="#ef4444" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 style="color: #1e293b; margin: 0 0 12px; font-size: 24px;">
            Application Error
          </h1>
          <p style="color: #64748b; margin: 0 0 24px; line-height: 1.5;">
            We're sorry, but something went wrong while loading the application.
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 32px;">
            Error: ${err.message || 'Unknown error occurred'}
          </p>
          <button onclick="location.reload()" style="
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;
          " onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
            Refresh Page
          </button>
          <div style="margin-top: 16px;">
            <a href="/config" style="
              color: #4f46e5;
              text-decoration: none;
              font-size: 14px;
            ">Go to Configuration</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(errorContainer);
  });

// Initialize third-party services
function initializeThirdPartyServices() {
  // Initialize any analytics, monitoring, or other services
  if (!isDevMode()) {
    // Production-only services
    console.log('Initializing production services...');
  }

  // Development tools
  if (isDevMode()) {
    // Enable debug tools
    console.log('Development mode: Debug tools enabled');
  }
}

// Export for use in other modules if needed
export { safeLocalStorage };
