import express from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { PaymentFrequency, PendingUpdate } from '../payment.model';

export enum UserPropertyFilter {
    public = '-_id -__v -issuer -paymentFrequency',
    server = '',
}

export enum Membership {
    free,
    davinci,
    pro
}

export interface UserTokenData {
    // Excludes all mongodb props and email, nameCased, and pwd
    created: number;
    credits: number;
    creditsBonus: number;
    email: string;
    id: string;
    membership: Membership;
    membershipGranted: number;
    paymentFrequency: PaymentFrequency;
    membershipExpires?: number;
    paymentFailed?: PendingUpdate;
    subscriptionId?: string;
}

export interface IUser extends Document {
    created: number;
    credits: number;
    creditsBonus: number; // NOTE(nocs): Any extra credis get applied here. New user, referals, compensation, etc.
    email: string;
    id: string;
    issuer: string; // NOTE(nocs): DID id produced by magic.
    membership: Membership;
    membershipGranted: number; // NOTE(nocs): Used on all pricing modeles. Date for when the credits were recieved. If the user is not a pro user and if it's longer than one month ago and credits < 5, make credits = 5.
    paymentFrequency: PaymentFrequency;
    membershipExpires?: number; // NOTE(nocs): Only available after a user triggers "Cancel" on a subscription.
    paymentFailed?: PendingUpdate; // NOTE(nocs): when a subscription is update but fails, this is added to the user object.
    subscriptionId?: string; // NOTE(nocs): Stripe generated Id for the users current subscription. If membership status is higher than Membership.free this should be available.
}

const UserSchema = new Schema<IUser>({
    created: {
        type: Number,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
    },
    creditsBonus: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        index: true,
    },
    id: {
        type: String,
        required: true,
        index: true,
    },
    issuer: {
        type: String,
        required: true,
    },
    membership: {
        type: Number,
        required: true,
    },
    membershipGranted: {
        type: Number,
        required: true,
    },
    membershipExpires: Number,
    paymentFrequency: {
        type: Number,
        required: true,
    },
    paymentFailed: Schema.Types.Mixed,
    subscriptionId: {
        type: String,
        sparse: true,
    },
});

async function lowercaseEmail(this: IUser, next: express.NextFunction) {
    const user = this;

    if (!user.isModified('email')) return next();

    user.email = user.email.toLowerCase();

    return next();
}

UserSchema.pre('save', lowercaseEmail as any);

export default mongoose.model<IUser>('User', UserSchema);
