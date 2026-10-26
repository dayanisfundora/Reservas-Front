import { api } from '../../../boot/axios'

/*
*************************************************
               EXCEL REPORTE
*************************************************
*/
export const operations1 = async (ids) => {
    try {
        const response = await api.post(`Operation1/Excel`, { ids } , {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}