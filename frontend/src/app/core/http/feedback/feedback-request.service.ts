import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { DocumentUploadReturn } from 'src/app/shared/models/ai.model';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';
import { Document, FeedbackRank } from 'src/app/shared/models/document.model';

@Injectable({
    providedIn: 'root'
})
export class FeedbackRequestService {
    private basePath = 'feedback';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    /**
     * 
     * @param documentId 
     * @param feedbackRank
     * @param feedbackText 
     * @returns Returns documentId, feedbackRank, feedbackText
     */
    public postFeedback(documentId: string, feedbackRank: FeedbackRank, feedbackText: string): Observable<ApiResponse<DocumentUploadReturn>> {
        return this.apiService.request(RequestMethod.patch, this.versionPath, {
            documentId,
            feedbackRank,
            feedbackText,
        });
    }
}
