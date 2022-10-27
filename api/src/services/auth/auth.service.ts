import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorCode } from '../../models/error-code.model';
import { ReturnServiceType } from '../../models/return.model';

import { UserTokenData } from '../../models/db/user.model';
import returnService from '../return/return.service';

class AuthService {


    public async authenticateToken(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['x-access-token'];
        const token = authHeader as string;

        if (!token) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const key = process.env.TOKEN_SECRET as string;
        const secret = Buffer.from(key, 'base64');

        jwt.verify(token, secret, { algorithms: ['HS256'] }, (err: any, token: any) => {

            if (err) {
                console.log('jwt verify error: ', err);
                return returnService.sendCustomResponse(ReturnServiceType.unauthorized, res, ErrorCode.invalidToken, 400);
            }

            res.locals.token = token;

            return next();
        });
    }

    public async signToken(userTokenData: UserTokenData) {
        const key = process.env.TOKEN_SECRET as string;
        const secret = Buffer.from(key, 'base64');

        return jwt.sign(userTokenData, secret);
    }
}

export = new AuthService();