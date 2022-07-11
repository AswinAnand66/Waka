let settings = {
    pgDbConfig:{
        user: process.env.WAKA_DATABASE_USERNAME,
        database: process.env.WAKA_DATABASE_NAME,
        port: process.env.WAKA_DATABASE_PORT,
        host: process.env.WAKA_DATABASE_HOST,
        password: process.env.WAKA_DATABASE_PASSWORD,
        max: process.env.WAKA_DATABASE_MAX_CONNECTION, //50
        idleTimeoutMillis: process.env.WAKA_DATABASE_IDLE_TIMEOUT, //300000
    },
    abortRequestTimeOutInMs: process.env.WAKA_ABORT_REQUEST_TIMEOUT,
    poiSchedulerRunningMode: true,
    schemaValidationRunningMode: true,
    masterValidationRunningMode: true,
    uploadPath: '../../poi-scheduler/fileuploads/'
};

module.exports = { settings };