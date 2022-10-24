export enum FeedbackRank {
    thumbDown,
    thumbUp
}

export interface Document {
    created: number;
    createdBy: string;
    displayName: string;
    feedbackRank: FeedbackRank;
    feedbackText: string;
    id: string;
    mimetype: string;
    summary: string;
}