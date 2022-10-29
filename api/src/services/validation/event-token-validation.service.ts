import { Network, Alchemy } from 'alchemy-sdk';
import { ethers } from "ethers";
import { NextFunction, Response, Request } from 'express';
import { validationResult } from "express-validator";

import { ErrorCode } from '../../models/error-code.model';
import { ClaimStatus } from "../../models/event-token.model";
import { ReturnServiceType } from "../../models/return.model";
import eventTokenDbService from "../db/event-token.db.service";

import returnService from "../return/return.service";


const alchemySettings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: process.env.NODE_ENV === 'development' ? Network.MATIC_MUMBAI : Network.MATIC_MAINNET,
};
const alchemy = new Alchemy(alchemySettings);


class EventTokenValidationService {

    /*
    * START: Account Methods
    */
    public async validateNewEvent(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const {
            id,
            issuedTo,
            owner,
            restricted,
        } = req.body;

        if (!ethers.utils.isAddress(owner)) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        if (restricted && !Array.isArray(issuedTo) && !issuedTo.length) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }
        if (!restricted && issuedTo.length) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        let issuedToSanitized = []
        if (restricted) {
            for (const person of issuedTo) {
                if (person.label && ClaimStatus[person.status]) {
                    let personSanitized = {
                        label: person.label,
                        status: person.status,
                        code: person.code,
                    }
                    if (!personSanitized.code) {
                        delete personSanitized.code;
                    }
    
                    issuedToSanitized.push(personSanitized);
                }
                else {
                    return returnService.sendResponse(ReturnServiceType.invalid, res);
                }
            }
        }

        const exists = await eventTokenDbService.exists({ id });
        if (exists) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }


        res.locals.eventToken = {
            id,
            issuedTo: issuedToSanitized,
            owner,
            restricted
        }


        return next();
    }


    public async validatePatchEvent(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnService.sendResponse(ReturnServiceType.invalid, res);
        }

        const {
            id,
        } = req.body

        // const nfts = await alchemy.nft.getNftsForOwner('0x70a2d674cF9F503ac3cb45915Be248961128EF5f');
        // console.log('nfts: ', nfts);

        alchemy.core
            .getLogs({
                address: '0xD530700A1438FfcF7b59BBe739d4724BEb005E99',
                topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                ],
                blockHash: 'latest',
            })
            .then(console.log);



        return next();
    }

}

export = new EventTokenValidationService();
