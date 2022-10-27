import { IUser, UserTokenData } from "../../models/db/user.model";


const profileImageDefaults = [
    'blue',
    'green',
    'pink',
    'almost-purple',
    'light-blue',
    'light-purple',
    'peach',
    'star',
    'teal',
    'up,'
];

class UserHelperService {
    public formatUserTokenData(user: IUser): UserTokenData {
        return {
            created: user.created,
            credits: user.credits,
            creditsBonus: user.creditsBonus,
            id: user.id,
            email: user.email,
            membership: user.membership,
            membershipGranted: user.membershipGranted,
            membershipExpires: user.membershipExpires,
            paymentFrequency: user.paymentFrequency,
            subscriptionId: user.subscriptionId,
        }
    }

    public getRandomProfilImage(): string {
        const randomIndex = Math.floor(Math.random() * profileImageDefaults.length);
        return profileImageDefaults[randomIndex];
    }
}

export = new UserHelperService();
