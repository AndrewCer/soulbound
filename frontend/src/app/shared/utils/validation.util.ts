import { AbstractControl } from '@angular/forms';
import validator from 'validator';

export default class Validation {
    static validateEmail(control: AbstractControl): { [key: string]: any } | null {
        if (control.value && !validator.isEmail(control.value)) {
            return { 'email': true };
        }
        return null;
    }
}
