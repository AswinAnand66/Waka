const psqlAPM = require('./psqlAPM');

export class ShipmentBookingModel { 
    constructor(){ };

    async getShipmentBooking (userId:number) {
        //SELECT array_agg(po_raw_id) as pos FROM waka.po_raw WHERE company_id = consignee_id
        const queryText = "SELECT DISTINCT sb.sb_id as so_no, (CASE WHEN sb.sb_id %2=0 THEN 'Shipment Authorized' ELSE 'Awaiting Confirmation' END) as status, (SELECT array_agg(sbd.po_id) FROM waka.shipment_booking_details sbd WHERE sbd.sb_id = sb.sb_id) as pos, sb.ff_id as logistics_provider, sb.consignee_id as principal, sb.supplier_id as supplier, sb.total_cbm, sb.total_weight_kgs, total_teu, 'Out of tolerance' as quantity_tolerance, 'In tolerance' as cargo_ready_date_tolerance, sb.cargo_ready_date, sb.ship_date, sb.delivery_date,'LCL' as type, 'sea' as mode, (SELECT port_name FROM waka.port WHERE port_id = sb.origin_port_id) as loading_port, (SELECT port_name FROM waka.port WHERE port_id = sb.dest_port_id) as discharging_port, (SELECT full_name from waka.login_user WHERE user_id IN (SELECT owned_by FROM waka.company WHERE company_id = sb.ff_id)) as principal_contact_name, sb.created_by, sb.modified_by, sb.modified_on, sb.created_on FROM waka.shipment_booking sb WHERE sb.supplier_id IN (SELECT company_id FROM waka.company WHERE owned_by = $1);";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getPurchaseOrders', queryText, queryParam);
    }

    async getPOListforAddPOs (param:any) {
        const queryText = "SELECT product_description, product, po_id as po_no, 'QC Confirmed' as status, SUM(shipment_qty) as po_qty, 0 as mfg_qty, 0 as ready_qty, 0 as total_volume FROM waka.shipment_booking_details WHERE sb_id = $1 GROUP BY product,product_description, sb_id, po_id;"
        const queryParam = [param.so_no];
        return await psqlAPM.fnDbQuery('getPOListforAddPOs', queryText, queryParam);
    }

    async getCompanyLogoPaths (param:any) {
        const queryText = "SELECT company_logo_path  FROM waka.company WHERE company_id = $1;";
        const queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getCompanyLogoPaths', queryText, queryParam);
    }

    async updateTEUValue (param:any) {
        const queryText = "UPDATE waka.shipment_booking SET total_teu = $1 WHERE sb_id = $2";
        const queryParam = [param.total_teu, param.so_no];
        return await psqlAPM.fnDbQuery('updateTEUValue', queryText, queryParam);
    }

    async insCustomView (param:any) {
        const queryText = "INSERT INTO waka.shipment_booking_custom_view (view_name, is_default, display_columns, created_by) VALUES($1, $2, $3, $4);";
        const queryParam = [param.view_name, param.is_default, param.display_columns, param.userId]
        return await psqlAPM.fnDbQuery('insCustomView', queryText, queryParam);
    }

    async updCustomView (param:any) {
        const queryText = "UPDATE waka.shipment_booking_custom_view SET view_name = $1, is_default = $2, display_columns = $3, modified_by = $4, modified_on = NOW() WHERE sbcv_id = $5";
        const queryParam = [param.view_name, param.is_default, param.display_columns, param.userId, param.sbcv_id]
        return await psqlAPM.fnDbQuery('updCustomView', queryText, queryParam);
    }

    async getCustomViews (param:any) {
        const queryText = "SELECT sbcv_id, view_name, is_default, display_columns, created_by, created_on, modified_by, modified_on, false as is_selected FROM waka.shipment_booking_custom_view WHERE created_by = $1";
        const queryParam = [param.userId]
        return await psqlAPM.fnDbQuery('getCustomViews', queryText, queryParam);
    }

    async deleteCustomView (param:any) {
        const queryText = "DELETE FROM waka.shipment_booking_custom_view WHERE sbcv_id= $1";
        const queryParam = [param.sbcv_id]
        return await psqlAPM.fnDbQuery('deleteCustomView', queryText, queryParam);
    }
}