import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Recursively handle nested objects to convert date strings to Date objects
          this.convertDateStringsToDate(event.body);
        }
        return event;
      })
    );
  }

  private convertDateStringsToDate(obj: any): void {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string' && this.isValidDateString(obj[key])) {
          obj[key] = new Date(obj[key]);
        } else if (typeof obj[key] === 'object') {
          this.convertDateStringsToDate(obj[key]);
        }
      });
    }
  }

  private isValidDateString(value: string): boolean {
    // Strict ISO 8601 date format validation
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?$/;

    return iso8601Regex.test(value);
  }
}
