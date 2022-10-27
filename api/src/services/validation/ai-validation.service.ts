import { NextFunction, Response, Request } from 'express';
import { validationResult } from "express-validator";

import { ErrorCode } from '../../models/error-code.model';
import { ReturnServiceType } from "../../models/return.model";
import { Membership, UserPropertyFilter, UserTokenData } from '../../models/db/user.model';
import userDbService from '../db/user.db.service';

import returnService from "../return/return.service";
import stringHelperService from '../string/string-helper.service';
import documentDbService from '../db/document.db.service';
import { DocumentPropertyFilter } from '../../models/db/document.model';

const onePoint = 500; // 500 words = 1 point;
const freeUserWordCountLimit = 1000;

class AiValidationService {

    public async validateDocumentSummarization(req: Request, res: Response, next: NextFunction) {
        const userTokenData = res.locals.token as UserTokenData;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const documentId = req.body.documentId;
        try {
            res.locals.documentId = documentId.trim();

            if (!documentId.includes('d_')) {
                throw new Error('Format mismatch');
            }
        } catch (error) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const document = await documentDbService.findOne({ id: documentId }, DocumentPropertyFilter.server);
        if (!document) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityDoesntExist, 404);
        }
        if (document.createdBy !== userTokenData.id) {
            return returnService.sendResponse(ReturnServiceType.unauthorized, res);
        }

        res.locals.document = document;

        return next();
    }

    public async validateDocumentUpload(req: Request, res: Response, next: NextFunction) {
        if (!req.file) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        return next();
    }

    public async validateDocumentVision(req: Request, res: Response, next: NextFunction) {
        const userTokenData = res.locals.token as UserTokenData;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const documentId = req.body.documentId;
        try {
            res.locals.documentId = documentId.trim();

            if (!documentId.includes('d_')) {
                throw new Error('Invalid documentId');
            }
        } catch (error) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const document = await documentDbService.findOneLean({ id: documentId }, DocumentPropertyFilter.server);
        if (!document) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityDoesntExist, 404);
        }
        if (document.createdBy !== userTokenData.id) {
            return returnService.sendResponse(ReturnServiceType.unauthorized, res);
        }

        res.locals.document = document;

        return next();
    }

    public async validateInputText(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const {
            text
        } = req.body;

        try {
            res.locals.text = text.trim();
        } catch (error) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }


        const userTokenData = res.locals.token as UserTokenData;
        const user = await userDbService.findOne({ email: userTokenData.email }, UserPropertyFilter.server);
        if (!user) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const wordCount = stringHelperService.getWordCount(text);
        if (wordCount < 50) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.inputTextTooShort, 400);
        }
        // TODO(nocs): only limit this to free users once the back end service is complete to handle larger batches.
        if (wordCount > freeUserWordCountLimit) {
            // Reduce the parsed text to 1000 words max.
            res.locals.text = res.locals.text.split(" ").splice(0, freeUserWordCountLimit).join(" ");
        }

        // Limit access based on user credits. Unless they are a pro member.
        const pointCost = Math.ceil(wordCount / onePoint);
        if (user.membership !== Membership.pro && pointCost > userTokenData.credits + userTokenData.creditsBonus) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.notEnoughPoints, 400);
        }

        res.locals.pointCost = pointCost;
        res.locals.user = user;

        return next();
    }
}

export = new AiValidationService();
