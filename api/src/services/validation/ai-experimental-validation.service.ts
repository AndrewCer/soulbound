import { NextFunction, Response, Request } from 'express';
import { validationResult } from "express-validator";

import { ErrorCode } from '../../models/error-code.model';
import { ReturnServiceType } from "../../models/return.model";
import { Membership, UserPropertyFilter, UserTokenData } from '../../models/db/user.model';
import userDbService from '../db/user.db.service';

import returnService from "../return/return.service";
import stringHelperService from '../string/string-helper.service';

const onePoint = 500; // 500 words = 1 point;
const freeUserWordCountLimit = 1000;

class AiExperimentalValidationService {

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
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.inputTextTooLong, 400);
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

export = new AiExperimentalValidationService();
