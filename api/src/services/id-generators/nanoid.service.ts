/*
* Service for generating random ids.
* 14 characters with the below alphabet would require ~57 thousands years to have a 1% probability of at least one collision.
*/

import { customAlphabet } from 'nanoid';
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 14)

class NanoidService {

    public generate() {
        return nanoid();
    }
}

export = new NanoidService();
