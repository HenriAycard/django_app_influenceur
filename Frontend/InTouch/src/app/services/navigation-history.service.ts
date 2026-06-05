import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  private history: string[] = [];

  constructor() {}

  // Add a URL to the history
  addToHistory(url: string): void {
    this.history.push(url);
    console.log("PUSH")
    console.log(this.history)
  }

  // Get the last visited URL
  getLastUrl(): string | null {
    console.log("GET LAST")
    console.log(this.history)
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  // Remove the last URL (for going back)
  removeLastUrl(): void {
    if (this.history.length > 0) {
      this.history.pop();
    }
    console.log("REMOVE")
    console.log(this.history)
  }

  // Clear history if needed (e.g., user logs out)
  clearHistory(): void {
    this.history = [];
  }

  getPreviousUrl(): string {
    const lastUrl = this.getLastUrl();
    if (!lastUrl) {
      return '';
    }
    this.removeLastUrl();
    return lastUrl; // Return the last URL
  }
}
