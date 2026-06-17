import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as translations from '../translations/master.json';

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  private readonly logger = new Logger(I18nInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang = request.headers['x-lang'] || 'en'; // Default to English

    return next.handle().pipe(
      map(data => this.translateRecursive(data, lang))
    );
  }

  private translateRecursive(data: any, lang: string): any {
    if (!data) return data;
    if (typeof data === 'string') return this.translate(data, lang);
    if (Array.isArray(data)) return data.map(i => this.translateRecursive(i, lang));
    if (typeof data === 'object') {
      const result = {};
      for (const key in data) {
        result[key] = this.translateRecursive(data[key], lang);
      }
      return result;
    }
    return data;
  }

  private translate(key: string, lang: string): string {
    // If the string is a key (e.g. AUTH.OTP_SENT)
    const keys = key.split('.');
    let current = translations;
    
    for (const k of keys) {
      if (current[k]) {
        current = current[k];
      } else {
        return key; // Return as is if key not found
      }
    }

    if (current && current[lang]) {
      return current[lang];
    }

    return key;
  }
}
