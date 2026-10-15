import { CompanyModel } from '../models/company.js';
import { logError } from '../utils/logger.js';

export const findCompanyByNit = async (nit: string) => {
    try {

        return await CompanyModel.findOne({
            nit,
            estado: 'ACTIVA'
        });

    } catch (error: unknown) {
        
        logError('company.lookup.failed', error);
        throw error
    }

};