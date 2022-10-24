import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { DocumentSummarizationReturn, DocumentUploadReturn, DocumentVisionReturn, TldrReturn } from 'src/app/shared/models/ai.model';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';

@Injectable({
    providedIn: 'root'
})
export class AiRequestService {
    private basePath = 'ai';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    /**
     * 
     * @param text input text to send to AI.
     * @returns AI response string. Currently formatted in a bulletted list. (easy to split on)
     */
    public postText(text: string): Observable<ApiResponse<TldrReturn>> {
        const path = `${this.versionPath}/tldr`;
        return this.apiService.request(RequestMethod.post, path, { text });
    }

    public uploadDocument(formData: FormData): Observable<ApiResponse<DocumentUploadReturn>> {
        const path = `${this.versionPath}/document-upload`;
        return this.apiService.requestMultipart(RequestMethod.post, path, formData);
    }

    public extractDocumentText(documentId: string): Observable<ApiResponse<DocumentVisionReturn>> {
        const path = `${this.versionPath}/document-vision`;
        return this.apiService.request(RequestMethod.post, path, { documentId });
    }

    public documentSummarization(documentId: string): Observable<ApiResponse<DocumentSummarizationReturn>> {
        const path = `${this.versionPath}/document-summarization`;
        return this.apiService.request(RequestMethod.post, path, { documentId });
    }
}
