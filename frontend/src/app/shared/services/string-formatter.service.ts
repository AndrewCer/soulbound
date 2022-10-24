import { Injectable } from '@angular/core';
import { Membership } from '../models/user.model';


@Injectable({ providedIn: "root" })
export class StringFormatterService {

    public membershipText(membership: Membership): string {
        let membershipText = 'Free';
        switch (membership) {
            case Membership.free:
                membershipText = 'Free';
                break;
            case Membership.davinci:
                membershipText = 'Davinci';
                break
            case Membership.pro:
                membershipText = 'Pro';
                break;
        }

        return membershipText;
    }

}
