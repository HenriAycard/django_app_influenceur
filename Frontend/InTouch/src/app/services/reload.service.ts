import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ReloadService {
    private reloadSource = new Subject<void>();
    reload$ = this.reloadSource.asObservable();

    triggerReload() {
        this.reloadSource.next();
    }
}