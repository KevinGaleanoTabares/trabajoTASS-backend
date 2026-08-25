import { CompanyModel } from '../models/company.js';

export const findCompanyByNit = async (nit: string) => {

    return CompanyModel.findOne({
        nit,
        estado: 'ACTIVA'
    });
};