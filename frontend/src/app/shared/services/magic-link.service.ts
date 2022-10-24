import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Magic } from 'magic-sdk';

@Injectable({
    providedIn: 'root'
})
export class MagicLinkService {
    private magicLink = new Magic(environment.magicPublicKey);

    constructor() {
        this.magicLink.preload();
    }

    public loginWithMagicLink(email: string, showUI: boolean) {
        return this.magicLink.auth.loginWithMagicLink({email, showUI});
    }

    public logout() {
        return this.magicLink.user.logout();
    }
}
