import { RateLimit } from "./rate-limit.model";

export interface LocalStorageSnapshot extends Storage {
    /*
    * START: Theming
    */
    /*
    * END: Theming
    */

    /*
    * START: User Data
    */
    accessToken: string;
    didToken: string;
    rateLimit: RateLimit;
    /*
    * END: User Data
    */
}

export interface LocalStorage {
    /*
    * START: User Data
    */
    accessToken: string;
    didToken: string;
    rateLimit: RateLimit;
    /*
    * END: User Data
    */
}
