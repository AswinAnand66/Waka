const psqlAPM = require('./psqlAPM');

export class schedulerModel {
    constructor() { };
    async checkDB() {
        let queryText = "SELECT now()";
        return await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, []);
    }

    async registerScheduler(param:any) {
        let queryText = "INSERT INTO waka.scheduler_availability_status(scheduler_uid, scheduler_name, current_status, registered_by) VALUES ($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT scheduler_availability_status_pkey DO NOTHING;";
        return await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, [param.scheduler_uid, param.scheduler_name, param.status, 1]);
    }

    async updateSchedulerStatus(param:any) {
        let queryText = "UPDATE waka.scheduler_availability_status SET last_responded_on = now() WHERE scheduler_uid = $1 AND scheduler_name = $2";
        return await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, [param.scheduler_uid, param.scheduler_name]);
    }
    
    async getSbSchedule() {
        let queryText = "SELECT s.sop_id, s.principal_id, s.ff_id, pbd.generate_date FROM waka.sop s JOIN waka.po_booking_details pbd ON pbd.sop_id = s.sop_id WHERE pbd.generate_date IS NOT NULL;"
        return await psqlAPM.fnDbQuery('getSbSchedule', queryText, []);
    };

    async getShipmentBookingLastProcessedDate(consignee_id:number, ff_id:number, ref_type:string) {
        let queryText = "SELECT CAST (MAX(ref_date) AS DATE) as ref_date FROM waka.shipment_booking WHERE consignee_id = $1 AND ff_id = $2 AND ref_type = $3;"
        return await psqlAPM.fnDbQuery('getShipmentBookingLastProcessedDate', queryText, [consignee_id, ff_id, ref_type]);
    }

    async getPoData(company_id: number, ff_id:number, column:any, value:any, maxDate:any) {
        let plusMinus = '+'
        let whereCondition = maxDate == null ? '<= now()' : "BETWEEN '"+ maxDate +"' AND now()"
        let queryText = "SELECT supplier_ref_id AS supplier_id, "+company_id+" AS consignee_id, "+ff_id+" AS ff_id, origin_port_ref_id AS origin_port_id, dest_port_ref_id AS dest_port_id, null as shipment_group, "+column+" AS ref_date, '"+column+"' AS ref_type, null AS total_cbm, null AS total_weight_kgs, po_id, order_number, item_qty, product, product_description, cargo_ready_date, delivery_date, ship_date FROM waka.po_"+company_id+" WHERE " + column + " " + whereCondition + " "+ plusMinus +" INTERVAL '"+value+" days' ORDER BY 7"
        return await psqlAPM.fnDbQuery('getPoData', queryText, []);
    }

    async insShipmentBookingDetails(param: any) {
        const queryText = "WITH sb as ( INSERT INTO waka.shipment_booking(supplier_id, consignee_id, ff_id, origin_port_id, dest_port_id, shipment_group, ref_date, ref_type, total_cbm, total_weight_kgs, cargo_ready_date, delivery_date, ship_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1) RETURNING sb_id ) INSERT INTO waka.shipment_booking_details (sb_id, po_id, order_number, product, product_description, product_category, po_qty, shipment_qty, unit, weight, cbm, created_by) SELECT sb_id,"+ param.po_id +", "+ param.order_number+", '"+ param.product+"', '"+ param.product_description+"', null AS product_category, "+param.item_qty+", "+param.item_qty+", null as unit, null as weight, null as cbm, 1 as created_by from sb;"
        const queryParam = [param.supplier_id, param.consignee_id, param.ff_id, param.origin_port_id, param.dest_port_id, param.shipment_group, param.ref_date, param.ref_type, param.total_cbm, param.total_weight_kgs, param.cargo_ready_date, param.delivery_date, param.ship_date]
        return await psqlAPM.fnDbQuery('insShipmentBookingDetails', queryText, queryParam);
    };

   async updShipmentBookingStatus(sop_id:number, principal_id:number, po_id:number, success:boolean, response:string, scheduler_uid:string) {
    let queryText = "INSERT INTO waka.sb_scheduler_running_status(sop_id, principal_id, po_id, success, response, scheduler_uid) VALUES ($1, $2, $3, $4, $5, $6);"
    return await psqlAPM.fnDbQuery('getShipmentBookingLastProcessedDate', queryText, [sop_id, principal_id, po_id, success, response, scheduler_uid]);
   }
}