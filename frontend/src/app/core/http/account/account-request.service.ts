import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';
import { UserRequest } from 'src/app/shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AccountRequestService {
    private basePath = 'account';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    /**
     * x-did-token required to make this call. 
     * didToken can be set in userAuthService.
     * @returns access token and sets x-access-token header
     */
    public login(): Observable<ApiResponse<string>> {
        const path = `${this.versionPath}/login`;
        return this.apiService.request(RequestMethod.post, path);
    }
    public refreshToken(): Observable<ApiResponse<string>> {
        const path = `${this.versionPath}/refresh-token`;
        return this.apiService.request(RequestMethod.get, path);
    }
}
