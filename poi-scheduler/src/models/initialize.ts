const psqlAPM = require('./psqlAPM');

export class Initialize {

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
}