const psqlAPM = require('./psqlAPM');

export class schedulerModel {

    constructor() { };

    async getPOISchedule() {
        let queryText = "SELECT pis.*, MAX(rs.received_on) AS last_ran_on FROM waka.po_ingestion_schedule pis LEFT JOIN waka.poi_scheduler_running_status rs ON rs.pois_id = pis.pois_id WHERE pis.is_active = true AND pis.is_delete = false GROUP BY pis.pois_id;;"
        //let queryText = "SELECT pis.*, MAX(rs.received_on) AS last_received_on FROM waka.po_ingestion_schedule pis LEFT JOIN waka.poi_scheduler_running_status rs ON rs.pois_id = pis.pois_id  WHERE pis.is_active = true AND pis.is_delete = false GROUP BY pis.pois_id;"
        return await psqlAPM.fnDbQuery('getPOISchedule', queryText, []);
    };
    
    async insScheduleRunningStatus(param: any) {
        const queryText = "INSERT INTO waka.poi_scheduler_running_status(pois_id, poi_id, company_id, testurl, filepath, success, response, is_schema_proceed, scheduler_uid) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8);";
        const queryParam: any = [param.pois_id, param.poi_id, param.company_id, param.testurl, param.relativePath, true, 'File succefully fetched from ' + param.testurl, param.scheduler_uid];
        return await psqlAPM.fnDbQuery('insScheduleRunningStatus', queryText, queryParam);
    };

    async updFailedScheduleStatus(param: any, validationData: any) {
        let response = "Error - " + validationData.code + ", " + validationData.msg + " At Line Number: " + validationData.line
        const queryText = "INSERT INTO waka.poi_scheduler_running_status(pois_id, poi_id, company_id, testurl, success, response, scheduler_uid) VALUES ($1, $2, $3, $4, $5, $6, $7);";
        const queryParam: any = [param.pois_id, param.poi_id, param.company_id, param.testurl, false, response, param.scheduler_uid];
        return await psqlAPM.fnDbQuery('updScheduleRunning', queryText, queryParam);
    };

    async updErrorScheduleStatus(param: any, code: any, text:any) {
        let response = "Error - " + param.testurl + " returned with " + code + " - " + text
        const queryText = "INSERT INTO waka.poi_scheduler_running_status(pois_id, poi_id, company_id, testurl, success, response, scheduler_uid) VALUES ($1, $2, $3, $4, $5, $6, $7);";
        const queryParam: any = [param.pois_id, param.poi_id, param.company_id, param.testurl, false, response, param.scheduler_uid];
        return await psqlAPM.fnDbQuery('updScheduleRunning', queryText, queryParam);
    };

    // async updPOISchedule(param: any) {
    //     const queryText = "UPDATE waka.po_ingestion_schedule SET is_schema_proceed = true, last_received_filepath = $1 WHERE pois_id = $2";
    //     const queryParam: any = [param.relativePath, param.pois_id];
    //     return await psqlAPM.fnDbQuery('updPOISchedule', queryText, queryParam);
    // };
}