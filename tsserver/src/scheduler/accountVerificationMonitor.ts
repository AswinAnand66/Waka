const psqlAPM = require('../../src/models/psqlAPM');

async function deleteInactiveAccounts() {

   let queryText = "DELETE FROM waka.login_user WHERE active_flag = false AND created_on < now() - interval '48 hours'"; // Make Sure active_flag set to true for old Users
   await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, []);
}

export = { deleteInactiveAccounts }