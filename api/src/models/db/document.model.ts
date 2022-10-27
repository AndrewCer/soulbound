import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export enum DocumentPropertyFilter {
    public = '-_id -__v',
    server = '',
}

export enum FeedbackRank {
    thumbDown,
    thumbUp
}

export interface Document {
    // Excludes all mongodb props and email, nameCased, and pwd
    created: number;
    createdBy: string;
    displayName: string;
    feedbackRank: FeedbackRank;
    feedbackText: string;
    id: string;
    mimetype: string;
    summary: string;
    uriInput: string;
    uriOutput: string;
}

export interface IDocument extends MongooseDocument {
    created: number;
    createdBy: string;
    displayName: string; // User given file name - NEVER use in storage. For front end UX use only.
    feedbackRank: FeedbackRank;
    feedbackText: string;
    id: string;
    mimetype: string; // Currently allowing 'application/pdf' and 'image/tiff'
    summary: string;
    uriInput: string; // Direct link to source file in google cloud storage
    uriOutput: string; // Direct link to json ouput folder that contains .json files in google cloud storage
}

const DocumentSchema = new Schema<IDocument>({
    created: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
        index: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    feedbackRank: Number,
    feedbackText: String,
    id: {
        type: String,
        required: true,
        index: true,
    },
    summary: String,
    mimetype: {
        type: String,
        required: true,
    },
    uriInput: {
        type: String,
        required: true,
    },
    uriOutput: String,
});


export default mongoose.model<IDocument>('Document', DocumentSchema);
