import { BurnAuth } from "./burn-auth.model";

export interface EventData {
    burnAuth: BurnAuth;
    count: number;
    limit: number;
    owner: string;
    restricted: boolean;
    uri: string;
}
