// pipes/translate.pipe.ts
import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure so it updates when translations change
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastParams: any = {};
  private lastTranslation: string = '';
  private subscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  transform(key: string, params?: { [key: string]: any }): string {
    // Check if key or params changed
    const paramsChanged = JSON.stringify(params) !== JSON.stringify(this.lastParams);

    if (key !== this.lastKey || paramsChanged) {
      this.lastKey = key;
      this.lastParams = params || {};
      this.updateTranslation();
    }

    return this.lastTranslation;
  }

  private updateTranslation(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.translationService.translateAsync(this.lastKey, this.lastParams)
      .subscribe(translation => {
        this.lastTranslation = translation;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

// Usage examples:
// {{ 'welcome_message' | translate }}
// {{ 'user_greeting' | translate: {name: userName} }}
// {{ 'item_count' | translate: {count: items.length} }}

// For the template with parameters, your translation would be:
// "user_greeting": "Hello {{name}}, welcome back!"
// "item_count": "You have {{count}} items"
