import { ContentFilterLabel } from "./content-filter.model";
import { Document } from "./document.model";

// Doc upload and text extraction
export interface DocumentUploadReturn {
    document: Document;
}

export interface DocumentVisionReturn {
    documentId: string;
}

export interface DocumentSummarizationReturn {
    pageCount: number;
    sourceWordCount: number;
    summarizationWordCount: number;
    text: string,
}

// Raw text summary
export interface TldrReturn {
    contentFilterLabel: ContentFilterLabel;
    document: Document;
    text: string;
}
