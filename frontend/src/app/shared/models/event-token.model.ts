export enum ClaimStatus {
    issued,
    claimed,
    emailed
}

export interface IssuedTo {
    label: string; // email address or wallet address
    status: ClaimStatus;
    code?: string; // secret code - for emails
}

export interface EventToken {
    id: string; // eventId
    owner: string; // owner wallet address
    issuedTo: IssuedTo[]; // both email and wallet addresses live here
    created?: number;
}