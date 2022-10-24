import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, take } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';
import { AccountRequestService } from '../../http/account/account-request.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class UserAuthService {
    public $accessTokenChanges = new BehaviorSubject<string | undefined>(undefined);
    private set accessTokenChanges(value) {
        this.$accessTokenChanges.next(value);
    };
    private get accessTokenChanges() {
        return this.$accessTokenChanges.getValue();
    }

    constructor(
        private accountRequestService: AccountRequestService,
        private localStorageService: LocalStorageService,
        private router: Router,
    ) { }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for DID token
     */
    set didToken(didToken: string | null) {
        if (didToken) {
            this.localStorageService.setData('didToken', JSON.stringify(didToken))
        }
        else {
            this.localStorageService.removeData('didToken');
        }
    }
    get didToken(): string | null {
        const localStorageSnapshot = this.localStorageService.localStorage;

        if (!localStorageSnapshot || !localStorageSnapshot.didToken) {
            return null;
        }

        return localStorageSnapshot.didToken;
    }

    /**
     * Setter & getter for access token
     */
    set accessToken(accessToken: string | undefined) {
        if (accessToken) {
            this.localStorageService.setData('accessToken', JSON.stringify(accessToken))
        }
        else {
            this.localStorageService.removeData('accessToken');
        }

        this.accessTokenChanges = accessToken;
    }
    get accessToken(): string | undefined {
        const localStorageSnapshot = this.localStorageService.localStorage;

        if (!localStorageSnapshot || !localStorageSnapshot.accessToken) {
            return;
        }

        return localStorageSnapshot.accessToken;
    }

    get decodedToken(): User | undefined {
        const token = this.accessToken;
        if (!token) {
            return;
        }
        const _decodeToken = (token: string) => {
            try {
                return JSON.parse(atob(token));
            } catch {
                return;
            }
        };
        return token
            .split('.')
            .map(token => _decodeToken(token))
            .reduce((acc, curr) => {
                if (!!curr) acc = { ...acc, ...curr };
                return acc;
            }, Object.create(null));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Helpers
    // -----------------------------------------------------------------------------------------------------
    public logout() {
        this.accessToken = undefined;
        this.didToken = null;
    }

    public refreshToken() {
        this.accountRequestService.refreshToken().pipe(take(1)).subscribe((apiResponse) => {
            if (apiResponse.success) {
              this.accessToken = apiResponse.success;
            }
            else {
              this.accessToken = undefined;
              this.didToken = null;
      
              this.router.navigate(['/auth/login']);
            }
          });
    }
}
