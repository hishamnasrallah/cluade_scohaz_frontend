// src/app/components/theme-creator/tests/theme-creator.spec.examples.ts
// Example test files showing how to test the refactored modules

// theme-preview.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ThemePreviewService } from '../services/theme-preview.service';
import { ThemeConfig } from '../../../models/theme.model';

describe('ThemePreviewService', () => {
  let service: ThemePreviewService;
  let mockElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemePreviewService]
    });
    service = TestBed.inject(ThemePreviewService);
    mockElement = document.createElement('div');
  });

  it('should apply core colors to element', () => {
    const theme: Partial<ThemeConfig> = {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      backgroundColor: '#0000FF'
    };

    service.applyThemeToPreview(mockElement, theme as ThemeConfig);

    expect(mockElement.style.getPropertyValue('--theme-primary')).toBe('#FF0000');
    expect(mockElement.style.getPropertyValue('--theme-secondary')).toBe('#00FF00');
    expect(mockElement.style.getPropertyValue('--theme-background')).toBe('#0000FF');
  });

  it('should apply typography settings', () => {
    const theme: Partial<ThemeConfig> = {
      fontFamily: 'Arial, sans-serif',
      fontSizeBase: 18,
      lineHeight: 1.6
    };

    service.applyThemeToPreview(mockElement, theme as ThemeConfig);

    expect(mockElement.style.getPropertyValue('--theme-font-family')).toBe('Arial, sans-serif');
    expect(mockElement.style.getPropertyValue('--theme-font-size')).toBe('18px');
    expect(mockElement.style.getPropertyValue('--theme-line-height')).toBe('1.6');
  });

  it('should apply performance classes', () => {
    const theme: Partial<ThemeConfig> = {
      enableAnimations: false,
      enableShadows: false,
      enableBlur: false
    };

    service.applyThemeToPreview(mockElement, theme as ThemeConfig);

    expect(mockElement.classList.contains('no-animations')).toBe(true);
    expect(mockElement.classList.contains('no-shadows')).toBe(true);
    expect(mockElement.classList.contains('no-blur')).toBe(true);
  });

  it('should apply accessibility classes', () => {
    const theme: Partial<ThemeConfig> = {
      reducedMotion: true,
      highContrast: true
    };

    service.applyThemeToPreview(mockElement, theme as ThemeConfig);

    expect(mockElement.classList.contains('motion-reduce')).toBe(true);
    expect(mockElement.classList.contains('high-contrast')).toBe(true);
  });
});

// theme-form.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ThemeFormService } from '../services/theme-form.service';

describe('ThemeFormService', () => {
  let service: ThemeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeFormService, FormBuilder]
    });
    service = TestBed.inject(ThemeFormService);
  });

  it('should create form with all required controls', () => {
    const form = service.createThemeForm();

    expect(form.get('primaryColor')).toBeDefined();
    expect(form.get('fontFamily')).toBeDefined();
    expect(form.get('spacingUnit')).toBeDefined();
    expect(form.get('borderRadius')).toBeDefined();
  });

  it('should have correct default values', () => {
    const form = service.createThemeForm();

    expect(form.get('primaryColor')?.value).toBe('#34C5AA');
    expect(form.get('fontSizeBase')?.value).toBe(16);
    expect(form.get('enableAnimations')?.value).toBe(true);
  });

  it('should update form values without emitting', () => {
    const form = service.createThemeForm();
    let emitted = false;

    form.valueChanges.subscribe(() => {
      emitted = true;
    });

    service.updateFormValues(form, {
      primaryColor: '#123456',
      fontSizeBase: 20
    });

    expect(form.get('primaryColor')?.value).toBe('#123456');
    expect(form.get('fontSizeBase')?.value).toBe(20);
    expect(emitted).toBe(false);
  });
});

// theme-import-export.util.spec.ts
import { ThemeImportExportUtil } from '../utils/theme-import-export.util';
import { ThemeConfig } from '../../../models/theme.model';

describe('ThemeImportExportUtil', () => {
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockClick: jest.Mock;

  beforeEach(() => {
    mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = jest.fn();
    mockClick = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return { click: mockClick } as any;
      }
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should export theme to JSON file', () => {
    const theme: Partial<ThemeConfig> = {
      brandName: 'Test Brand',
      primaryColor: '#FF0000'
    };

    ThemeImportExportUtil.exportTheme(theme as ThemeConfig);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should validate imported theme', () => {
    const validTheme = {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      fontFamily: 'Arial',
      fontSizeBase: 16,
      spacingUnit: 8,
      borderRadius: 4
    };

    const invalidTheme = {
      primaryColor: '#FF0000'
      // Missing required properties
    };

    expect(ThemeImportExportUtil.validateImportedTheme(validTheme)).toBe(true);
    expect(ThemeImportExportUtil.validateImportedTheme(invalidTheme)).toBe(false);
  });

  it('should import theme from file', async () => {
    const themeData = {
      primaryColor: '#FF0000',
      brandName: 'Imported Theme'
    };

    const file = new File([JSON.stringify(themeData)], 'theme.json', {
      type: 'application/json'
    });

    const result = await ThemeImportExportUtil.importTheme(file);

    expect(result.primaryColor).toBe('#FF0000');
    expect(result.brandName).toBe('Imported Theme');
  });

  it('should reject invalid JSON file', async () => {
    const file = new File(['invalid json'], 'theme.json', {
      type: 'application/json'
    });

    await expect(ThemeImportExportUtil.importTheme(file)).rejects.toThrow('Invalid theme file format');
  });
});

// theme-creator.view-model.spec.ts
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ThemeCreatorViewModel } from '../view-models/theme-creator.view-model';
import { ThemeService } from '../../../services/theme.service';
import { ThemeFormService } from '../services/theme-form.service';
import { ThemePreviewService } from '../services/theme-preview.service';
import { ThemeDefaults } from '../../../models/theme.model';

describe('ThemeCreatorViewModel', () => {
  let viewModel: ThemeCreatorViewModel;
  let mockThemeService: jest.Mocked<ThemeService>;
  let mockThemeFormService: jest.Mocked<ThemeFormService>;
  let mockThemePreviewService: jest.Mocked<ThemePreviewService>;

  beforeEach(() => {
    mockThemeService = {
      currentTheme$: of(ThemeDefaults.DEFAULT_THEME),
      getTheme: jest.fn(() => ThemeDefaults.DEFAULT_THEME),
      saveTheme: jest.fn(() => Promise.resolve()),
      applyTheme: jest.fn()
    } as any;

    mockThemeFormService = {
      createThemeForm: jest.fn(() => new FormBuilder().group({})),
      updateFormValues: jest.fn()
    } as any;

    mockThemePreviewService = {
      applyThemeToPreview: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ThemeCreatorViewModel,
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ThemeFormService, useValue: mockThemeFormService },
        { provide: ThemePreviewService, useValue: mockThemePreviewService }
      ]
    });

    viewModel = TestBed.inject(ThemeCreatorViewModel);
  });

  it('should initialize with default theme', () => {
    expect(viewModel.currentTheme).toBeDefined();
    expect(mockThemeFormService.createThemeForm).toHaveBeenCalled();
  });

  it('should apply preset and update form', () => {
    const preset = {
      id: 'test',
      name: 'Test Preset',
      icon: '🎨',
      config: {
        primaryColor: '#123456'
      }
    };

    viewModel.applyPreset(preset);

    expect(viewModel.currentTheme.primaryColor).toBe('#123456');
    expect(mockThemeFormService.updateFormValues).toHaveBeenCalled();
  });

  it('should save theme', async () => {
    await viewModel.saveTheme();

    expect(mockThemeService.saveTheme).toHaveBeenCalledWith(viewModel.currentTheme);
    expect(mockThemeService.applyTheme).toHaveBeenCalledWith(viewModel.currentTheme);
    expect(viewModel.isSaving).toBe(false);
  });

  it('should toggle mode between light and dark', () => {
    viewModel.currentTheme.mode = 'light';
    viewModel.toggleMode();
    expect(viewModel.currentTheme.mode).toBe('dark');

    viewModel.toggleMode();
    expect(viewModel.currentTheme.mode).toBe('light');
  });

  it('should clean up on destroy', () => {
    const destroySpy = jest.spyOn(viewModel['destroy$'], 'next');
    const completeSpy = jest.spyOn(viewModel['destroy$'], 'complete');

    viewModel.destroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});

// Integration test example
describe('ThemeCreator Integration Tests', () => {
  it('should update preview when theme changes', () => {
    // This would be an E2E test in a real application
    // Using Cypress or similar tool

    // Example Cypress test:
    /*
    cy.visit('/theme-creator');
    cy.get('[data-test=color-picker-primary]').click();
    cy.get('[data-test=color-input]').clear().type('#FF0000');
    cy.get('[data-test=preview-container]')
      .should('have.css', '--theme-primary', '#FF0000');
    */
  });
});
