import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { DocumentSummarizationReturn, DocumentUploadReturn, DocumentVisionReturn, TldrReturn } from 'src/app/shared/models/ai.model';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';

@Injectable({
    providedIn: 'root'
})
export class TokenRequestService {

    constructor(private apiService: ApiService) { }

    public get(url: string): Observable<any> {
        return this.apiService.request(RequestMethod.get, url);
    }
}
