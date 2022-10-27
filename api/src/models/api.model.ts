import { ErrorCode } from "./error-code.model";
import { SuccessCode } from "./success-code.model";

export interface ApiResponse<T> {
    errorCode?: ErrorCode,
    success?: T;
    successCode?: SuccessCode;
}
