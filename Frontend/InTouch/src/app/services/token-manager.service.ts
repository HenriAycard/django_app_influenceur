import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {

  private readonly ACCESS = "access"
  private readonly REFRESH = "refresh"

  constructor() { }

  public getAccessToken() : string | null {
    return this.getItem(this.ACCESS)
  }

  public getRefreshToken() : string | null {
    return this.getItem(this.REFRESH)
  }

  public setAccessToken(value: any) {
    this.setItem(this.ACCESS, value)
  }

  public setRefreshToken(value: any) {
    this.setItem(this.REFRESH, value)
  }

  public isTokenSave() : boolean {
    return this.getAccessToken() != null && this.getRefreshToken() != null
  }

  private setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getItem(key: string): string | null {
    try {
      const item = localStorage.getItem(key);

      return JSON.parse(item!);
    } catch (e) {
      return "";
    }
  }

  removeItem(key: string): any {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
