import { FilterQuery } from 'mongoose';
import EventToken, { EventTokenPropertyFilter } from '../../models/event-token.model';

class EventTokenDbService {
    /*
    * START: CRUD
    */
    // Create

    // Read
    async exists(filterQuery: FilterQuery<any>) {
        return await EventToken.exists(filterQuery);
    }

    async findOne(filterQuery: FilterQuery<any>, propertyFilter: EventTokenPropertyFilter) {
        return await EventToken.findOne(filterQuery).select(propertyFilter).exec();
    }
    async findOneLean(filterQuery: FilterQuery<any>, propertyFilter: EventTokenPropertyFilter) {
        return await EventToken.findOne(filterQuery).select(propertyFilter).lean().exec();
    }

    // Update

    // Delete

    /*
    * END: CRUD
    */
}

export = new EventTokenDbService();
