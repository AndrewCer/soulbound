import express from 'express';
import { body } from 'express-validator';
import EventToken, { IEventToken } from '../../../models/event-token.model';
import eventTokenValidationService from '../../../services/validation/event-token-validation.service';

const router = express.Router();

/*
* START: CRUD
*/
// Create
router.post(
    '/',
    body('id').notEmpty().isString().isLength({ min: 21, max: 21 }),
    body('owner').notEmpty().isString(),
    body('restricted').notEmpty().isBoolean(),
    body('issuedTo').isArray(),
    eventTokenValidationService.validateNewEvent,
    async (req: express.Request, res: express.Response) => {
        let eventToken = res.locals.eventToken as IEventToken;

        const currentDate = Date.now();
        eventToken = new EventToken({
            created: currentDate,
            id: eventToken.id,
            issuedTo: eventToken.issuedTo,
            owner: eventToken.owner,
            restricted: eventToken.restricted
        });
        await eventToken.save();

        res.json({ success: true });
    });

// Read

// Update
// TODO(nocs): when a user claims a token, update our DB. First verify that this request is valid by checking ethers.js
// Use alchemy for this - see event-token-validation.service
// Maybe this is a cron job that fires off a check to the alchemy api every 10 minutes?
// Or this opens up a temporary websocket to alchemy and closes it once we see the event or after x amount of time
router.patch(
    '/',
    eventTokenValidationService.validatePatchEvent,
    body('id').notEmpty().isString().isLength({ min: 21, max: 21 }),
    async (req: express.Request, res: express.Response) => {
        res.json({});
    });

// Delete

/*
* END: CRUD
*/

/*
* START: Helper methods
*/

/*
* END: Helper methods
*/

export { router }
