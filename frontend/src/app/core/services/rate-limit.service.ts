import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, take } from 'rxjs';
import { RateLimit } from 'src/app/shared/models/rate-limit.model';
import { User } from 'src/app/shared/models/user.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class RateLimitService {
    public $rateLimitChanges = new BehaviorSubject<RateLimit | undefined>(undefined);
    private set rateLimitChanges(value) {
        this.$rateLimitChanges.next(value);
    };
    private get rateLimitChanges() {
        return this.$rateLimitChanges.getValue();
    }

    constructor(
        private localStorageService: LocalStorageService,
    ) { }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set rateLimit(rateLimit: RateLimit | undefined) {
        if (rateLimit) {
            this.localStorageService.setData('rateLimit', JSON.stringify(rateLimit));
        }
        else {
            this.localStorageService.removeData('rateLimit');
        }

        this.rateLimitChanges = rateLimit;
    }
    get rateLimit(): RateLimit | undefined {
        const localStorageSnapshot = this.localStorageService.localStorage;

        if (!localStorageSnapshot || !localStorageSnapshot.rateLimit) {
            return;
        }

        return localStorageSnapshot.rateLimit;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Helpers
    // -----------------------------------------------------------------------------------------------------
    public throttleTimeout: ReturnType<typeof setTimeout> | undefined;
    public startThrottleTimer() {
        if (this.throttleTimeout) {
            clearTimeout(this.throttleTimeout);
        }

        this.throttleTimeout = setTimeout(() => {
            if (this.rateLimit) {
                this.rateLimit.totalRequests = 0;
            }

            if (this.throttleTimeout) {
                clearTimeout(this.throttleTimeout);
            }
        }, 60000);
    }
}
