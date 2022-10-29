import mongoose, { Schema, Document } from 'mongoose';

export enum EventTokenPropertyFilter {
    public = '-_id -__v',
    server = '',
}

export enum ClaimStatus {
    issued,
    claimed,
    emailed,
}

export interface IssuedTo {
    to: string; // email address or wallet addresses
    code: string; // secret code - for emails
    status: ClaimStatus;
}

export interface EventTokenData {
    // Excludes all mongodb props and email, nameCased, and pwd
    created: number;
    id: string; // eventId
    issuedTo: IssuedTo[]; // both email and wallet addresses live here
    owner: string; // owner wallet address
    restricted: boolean; // Pre-issued tokens = true
}

export interface IEventToken extends Document {
    created: number;
    id: string;
    issuedTo: IssuedTo[];
    owner: string;
    restricted: boolean;
}

const EventSchema = new Schema<IEventToken>({
    created: {
        type: Number,
        required: true,
    },
    id: {
        type: String,
        required: true,
        index: true,
    },
    issuedTo: Schema.Types.Mixed,
    owner: {
        type: String,
        required: true,
        index: true,
    },
    restricted: {
        type: Boolean,
        required: true,
    },
});


export default mongoose.model<IEventToken>('EventToken', EventSchema);
