import express from 'express';

export interface RawBodyRequest extends express.Request {
    rawBody: Buffer;
}
