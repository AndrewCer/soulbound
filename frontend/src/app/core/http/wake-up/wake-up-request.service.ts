import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';

@Injectable({
    providedIn: 'root'
})
export class WakeUpRequestService {
    private basePath = 'wake-up';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    public wakeUp(): Observable<ApiResponse<any>> {
        const path = `${this.versionPath}`;
        return this.apiService.request(RequestMethod.get, path);
    }
}
