// lib/i18n-db.ts - Database-based i18n helper

interface Translation {
  key: string;
  value: string;
  locale: string;
}

interface TranslationCache {
  [locale: string]: {
    [key: string]: string;
  };
}

class DatabaseI18n {
  private cache: TranslationCache = {};
  
  // Load all translations for a locale
  async loadTranslations(locale: string): Promise<void> {
    if (this.cache[locale]) return; // Already loaded
    
    const translations = await db.translation.findMany({
      where: { locale },
      include: { key: true }
    });
    
    this.cache[locale] = {};
    translations.forEach(t => {
      this.cache[locale][t.key.keyPath] = t.value;
    });
  }
  
  // Get translation by key
  async t(key: string, locale: string): Promise<string> {
    await this.loadTranslations(locale);
    return this.cache[locale][key] || key;
  }
  
  // Batch get multiple translations
  async getTranslations(keys: string[], locale: string): Promise<Record<string, string>> {
    await this.loadTranslations(locale);
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.cache[locale][key] || key;
    });
    return result;
  }
  
  // Update translation
  async updateTranslation(key: string, locale: string, value: string): Promise<void> {
    await db.translation.upsert({
      where: { 
        keyId_locale: { 
          keyId: await this.getKeyId(key), 
          locale 
        } 
      },
      update: { value },
      create: { 
        keyId: await this.getKeyId(key), 
        locale, 
        value 
      }
    });
    
    // Update cache
    if (this.cache[locale]) {
      this.cache[locale][key] = value;
    }
  }
  
  private async getKeyId(keyPath: string): Promise<number> {
    const key = await db.translationKey.upsert({
      where: { keyPath },
      update: {},
      create: { keyPath, category: 'dynamic' }
    });
    return key.id;
  }
}

export const dbI18n = new DatabaseI18n();
