import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LocalStorageSnapshot, LocalStorage } from 'src/app/shared/models/local-storage.model';

function getLocalStorage(): LocalStorageSnapshot {
    return localStorage as LocalStorageSnapshot;
}

@Injectable({ providedIn: "root" })
export class LocalStorageService {

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {}

    private parseLocalStorage(localStorage: LocalStorageSnapshot): LocalStorage {
        let localStorageReturn: { [key: string]: any } = {};
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                const storageElement = localStorage[key];
                try {
                    localStorageReturn[key] = JSON.parse(`${storageElement}`);
                    
                } catch (error) {
                    localStorageReturn[key] = storageElement;
                }

            }
        }

        return localStorageReturn as LocalStorage;
    }

    get localStorage(): LocalStorage | undefined{
        if (isPlatformBrowser(this.platformId)) {
            const localStorage = getLocalStorage();
            
            if (localStorage) {
                return this.parseLocalStorage(localStorage);
            }
            else {
                return;
            }
        }
        else {
            return;
        }
    }

    public setData(key: string, data: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(key, data);
        }
    }

    public removeData(key: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(key);
        }
    }

}
