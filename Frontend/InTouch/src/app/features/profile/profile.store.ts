import { Injectable, inject, signal } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from 'src/app/models/users';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';

/** Holds the signed-in user's profile as a signal for the profile screens. */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
    private readonly api = inject(ApiAuthService);

    private readonly _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();

    /** (Re)loads the current user. */
    refresh(): void {
        this.api.findUser().subscribe({
            next: user => this._user.set(user),
        });
    }

    /** Uploads a new avatar and updates the cached user on the final response. */
    updateAvatar(formData: FormData): Observable<HttpEvent<User>> {
        const id = this._user()?.id ?? '';
        return this.api.updateAvatar(id, formData).pipe(
            tap(event => {
                if (event.type === HttpEventType.Response) {
                    this._user.set(event.body as User);
                }
            })
        );
    }
}
