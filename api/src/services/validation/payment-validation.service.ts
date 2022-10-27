import { NextFunction, Response, Request } from 'express';
import { validationResult } from 'express-validator';
import { ErrorCode } from '../../models/error-code.model';
import { Price } from '../../models/payment.model';
import { ReturnServiceType } from '../../models/return.model';
import { UserPropertyFilter, UserTokenData } from '../../models/db/user.model';
import userDbService from '../db/user.db.service';
import returnService from '../return/return.service';


class PaymentValidationService {

    public async validateCheckoutSession(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const price = req.body.price as string;

        if (!Price[price]) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityDoesntExist, 404);
        }

        res.locals.price = Price[price];
        res.locals.priceKey = price;

        return next();
    }

    public async validateSubscription(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const userTokenData = res.locals.token as UserTokenData;

        const subscriptionId = req.params.subscriptionId;
        if (!subscriptionId.includes('sub_')) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const user = await userDbService.findOne({id: userTokenData.id}, UserPropertyFilter.server);
        if (!user) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityDoesntExist, 404);
        }

        if (!user.subscriptionId || subscriptionId !== user.subscriptionId) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        res.locals.user = user;
        res.locals.subscriptionId = subscriptionId;

        return next();
    }

    public async validateUpdateSubscription(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const newPriceType = req.body.newPriceType as string;
        const newPrice = Price[newPriceType];
        if (!Price[newPriceType]) {
            return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityDoesntExist, 404);
        }

        res.locals.price = newPrice;

        return next();
    }

}

export = new PaymentValidationService();
