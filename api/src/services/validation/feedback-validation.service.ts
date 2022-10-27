import { NextFunction, Response, Request } from 'express';
import { validationResult } from 'express-validator';
import { DocumentPropertyFilter, FeedbackRank } from '../../models/db/document.model';
import { UserTokenData } from '../../models/db/user.model';
import { ErrorCode } from '../../models/error-code.model';
import { ReturnServiceType } from '../../models/return.model';
import documentDbService from '../db/document.db.service';
import returnService from '../return/return.service';


class FeedbackValidationService {

    public async validateUpdateFeedback(req: Request, res: Response, next: NextFunction) {
        const userTokenData = res.locals.token as UserTokenData;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const { 
            documentId,
            feedbackRank,
            feedbackText,
         } = req.body;
        try {
            res.locals.documentId = documentId.trim();

            if ((feedbackRank !== FeedbackRank.thumbDown && feedbackRank !== FeedbackRank.thumbUp)) {
                throw new Error('Incorrect feedback rank.');
            }

            if (!documentId.includes('d_')) {
                throw new Error('Format mismatch.');
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
        res.locals.feedbackRank = feedbackRank;
        res.locals.feedbackText = feedbackText;

        return next();
    }

}

export = new FeedbackValidationService();
