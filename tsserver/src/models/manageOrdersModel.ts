const psqlAPM = require('./psqlAPM');

export class manageOrdersModel {
    constructor(){ };

    async getCompaniesForPO (userId:number) {
        const queryText = "select array_agg(distinct(company_id)) as company_ids from waka.supplier_ref WHERE waka_ref_supplier_id IN (SELECT company_id FROM waka.company WHERE owned_by = $1);";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getPurchaseOrders', queryText, queryParam);
    }

    async getPurchaseOrders (companyIds:any, userId:number){
        let queryText = `SELECT product, product_description, SUM(item_qty) AS item_qty, MIN(ship_date) AS ship_date, supplier_ref_id, CONCAT(to_char(ship_date , 'Mon'),' ',extract(year from ship_date::timestamp)) as date FROM (`
        for(let idx  in companyIds){
            queryText += `select product, product_description, SUM(item_qty) AS item_qty, MIN(ship_date) AS ship_date, supplier_ref_id FROM waka.po_${companyIds[idx]} WHERE supplier_ref_id IN (SELECT company_id FROM waka.company WHERE owned_by = ${userId}) GROUP BY 1,2,5`;
            if (parseInt(idx) < companyIds.length - 1){
                queryText += " UNION ALL ";
            }
        }
        queryText += ") AS data GROUP BY 1,2,5,6 ORDER BY 4 ASC;";
        return await psqlAPM.fnDbQuery('getPurchaseOrders', queryText, []);
    };

    async getPurchaseOrdersCompanywise (param:any){
        let queryText = '';
        for(let idx  in param.company_ids){
            queryText += `select po_${param.company_ids[idx]}.order_number, po_${param.company_ids[idx]}.item_qty, po_${param.company_ids[idx]}.ship_date, 0 as actual_quantity ,c.company_name FROM waka.po_${param.company_ids[idx]} as po_${param.company_ids[idx]} JOIN waka.company c ON c.company_id = ${param.company_ids[idx]} WHERE supplier_ref_id IN (SELECT company_id FROM waka.company WHERE owned_by = ${param.userId}) AND product = '${param.product}' AND product_description = '${param.product_description}'`;
            if (parseInt(idx) < param.company_ids.length - 1){
                queryText += " UNION ALL ";
            }
        }
        queryText += ";"
        return await psqlAPM.fnDbQuery('getPurchaseOrdersCompanywise', queryText, []);
    };

    async addOrdersTransaction (param:any){
        const queryText = "INSERT INTO waka.po_transactions(product, product_description, supplier_ref_id, transaction_date, shift_batch, mfg_qty, attachment_file_path, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";
        const queryParam = [param.product, param.product_description, param.supplier_ref_id, param.date, param.shift_batch, param.mq, param.relative_path, param.userId];
        return await psqlAPM.fnDbQuery('addOrdersTransaction', queryText, queryParam);
    };

    async updOrdersTransaction (param:any){
        const queryText = "UPDATE waka.po_transactions SET transaction_date = $1, shift_batch = $2, mfg_qty = $3, attachment_file_path = $4 WHERE pot_id = $5;";
        const queryParam = [param.transaction_date, param.shift_batch, param.mq, param.relative_path, param.pot_id];
        return await psqlAPM.fnDbQuery('updOrdersTransaction', queryText, queryParam);
    };

    async delTransaction (param:any){
        const queryText = "DELETE FROM waka.po_transactions WHERE pot_id = $1;";
        const queryParam = [param.pot_id];
        return await psqlAPM.fnDbQuery('delTransaction', queryText, queryParam);
    };

    async getOrderTransactions (param:any){
        const queryText = "SELECT * FROM waka.po_transactions WHERE supplier_ref_id = $1 AND product = $2 AND product_description = $3";
        const queryParam = [param.supplier_ref_id, param.product, param.product_description];
        return await psqlAPM.fnDbQuery('getOrderTransactions', queryText, queryParam);
    };
}
