import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';
import { EventToken } from 'src/app/shared/models/event-token.model';

@Injectable({
    providedIn: 'root'
})
export class EventTokenRequestService {
    private basePath = 'event';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    public create(data: EventToken): Observable<ApiResponse<boolean>> {
        const path = `${this.versionPath}`;
        return this.apiService.request(RequestMethod.post, path, data);
    }
}
