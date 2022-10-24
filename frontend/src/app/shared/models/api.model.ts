import { ErrorCode } from "./error-code.model";
import { SuccessCode } from "./success-code.model";

export enum RequestMethod {
    delete = 'delete',
    get = 'get',
    patch = 'patch',
    post = 'post',
}

export interface ApiResponse<T> {
    error?: any,
    errorCode?: ErrorCode,
    success?: T;
    successCode?: SuccessCode;
}
