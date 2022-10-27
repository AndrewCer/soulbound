
import { FilterQuery } from 'mongoose';

import User, { UserPropertyFilter } from '../../models/db/user.model';

class UserDbService {
    /*
    * START: CRUD
    */
    // Create

    // Read
    async exists(filterQuery: FilterQuery<any>) {
        return await User.exists(filterQuery);
    }

    async findOne(filterQuery: FilterQuery<any>, propertyFilter: UserPropertyFilter) {
        return await User.findOne(filterQuery).select(propertyFilter).exec();
    }
    async findOneLean(filterQuery: FilterQuery<any>, propertyFilter: UserPropertyFilter) {
        return await User.findOne(filterQuery).select(propertyFilter).lean().exec();
    }

    // Update
   
    // Delete

    /*
    * END: CRUD
    */
}

export = new UserDbService();
