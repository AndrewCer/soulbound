
import { FilterQuery } from 'mongoose';

import Document, { DocumentPropertyFilter } from '../../models/db/document.model';

class DocumentDbService {
    /*
    * START: CRUD
    */
    // Create

    // Read
    async exists(filterQuery: FilterQuery<any>) {
        return await Document.exists(filterQuery);
    }

    async findOne(filterQuery: FilterQuery<any>, propertyFilter: DocumentPropertyFilter) {
        return await Document.findOne(filterQuery).select(propertyFilter).exec();
    }
    async findOneLean(filterQuery: FilterQuery<any>, propertyFilter: DocumentPropertyFilter) {
        return await Document.findOne(filterQuery).select(propertyFilter).lean().exec();
    }

    // Update

    // Delete

    /*
    * END: CRUD
    */
}

export = new DocumentDbService();
