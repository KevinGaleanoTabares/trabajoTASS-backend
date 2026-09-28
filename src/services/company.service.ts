import { CompanyModel } from '../models/company.js';

export const findCompanyByNit = async (nit: string) => {
    try {

        return await CompanyModel.findOne({
            nit,
            estado: 'ACTIVA'
        });

    } catch (error: unknown) {
        
        console.error('Error buscando empresa por NIT: ', error);
        throw error
    }

};