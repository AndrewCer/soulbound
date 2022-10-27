import { NextFunction, Response, Request } from 'express';
import { validationResult } from "express-validator";
import { Magic } from '@magic-sdk/admin';

import { ErrorCode } from '../../models/error-code.model';
import { ReturnServiceType } from "../../models/return.model";
import { IUser, UserPropertyFilter, UserTokenData } from '../../models/db/user.model';
import userDbService from '../db/user.db.service';

import returnService from "../return/return.service";



class UserValidationService {

    /*
    * START: Account Methods
    */
    public async validateLogIn(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }
        const mAdmin = new Magic(process.env.MAGIC_SECRET);

        const didHeader = req.headers['x-did-token'] as string | undefined;
        if (!didHeader) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }
        try {
            const issuer = mAdmin.token.getIssuer(didHeader);
            const metadata = await mAdmin.users.getMetadataByIssuer(issuer);
            const email = metadata.email;

            mAdmin.token.validate(didHeader);

            const user = await userDbService.findOneLean({ email }, UserPropertyFilter.server);
            if (!user) {
                res.locals.newUser = metadata;
            }
            else {
                res.locals.user = user;
            }

            return next();
        } catch (error) {
            console.log('error: ', error);

            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        // tap into magic sdk here

        // let { email } = req.body as IUser;
        // const userExists = await userDbService.exists({ email });
        // if (userExists) {
        //     return returnService.sendCustomResponse(ReturnServiceType.custom, res, ErrorCode.entityExists, 409);
        // }
    }

    public async validateRefreshToken(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const userTokenData = res.locals.token as UserTokenData;
        const user = await userDbService.findOneLean({ email: userTokenData.email }, UserPropertyFilter.public);
        if (!user) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        res.locals.user = user;

        return next();
    }

    /*
    * END: Account Methods
    */

    /*
    * START: User Methods
    */
    /*
    * END: User Methods
    */

}

export = new UserValidationService();
