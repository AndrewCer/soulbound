import { PaymentFrequency, PendingUpdate } from "./payment.model";

export enum Membership {
    free,
    davinci,
    pro
}


export interface UserRequest {
    email: string;
}

export interface User extends UserRequest {
    created: number;
    credits: number;
    creditsBonus: number;
    id: string;
    membership: Membership;
    membershipGranted: number;
    paymentFrequency: PaymentFrequency;
    membershipExpires?: number;
    paymentFailed?: PendingUpdate;
    subscriptionId?: string;
}
