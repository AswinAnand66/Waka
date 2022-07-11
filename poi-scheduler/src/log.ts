const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

let schedulerLogger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ), 
  transports: [
    new (transports.DailyRotateFile)({
        filename: './log/scheduler/scheduler-error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new (transports.DailyRotateFile)({
        filename: './log/scheduler/scheduler-info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
    })
  ]
});

let schemaValidationLogger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ), 
  transports: [
    new (transports.DailyRotateFile)({
        filename: './log/schemaValidation/schema-error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new (transports.DailyRotateFile)({
        filename: './log/schemaValidation/schema-info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
    })
  ]
});

let masterValidationLogger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ), 
  transports: [
    new (transports.DailyRotateFile)({
        filename: './log/masterValidation/master-error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new (transports.DailyRotateFile)({
        filename: './log/masterValidation/master-info-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
    })
  ]
});

let dbServiceLog = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ), 
  transports: [
    new (transports.DailyRotateFile)({
        filename: './log/db/errordb-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
    }),
    new (transports.DailyRotateFile)({
        filename: './log/db/infodb-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
    })
  ]
});

function schedulerlogger (level:string, message:any):void{
  let dt = new Date();
  let date = dt.getFullYear()+"-"+(dt.getMonth()+1).toString().padStart(2,"0")+"-"+dt.getDate().toString().padStart(2,"0")+"T"+dt.getHours().toString().padStart(2,"0")+":"+dt.getMinutes().toString().padStart(2,"0")+":"+dt.getSeconds().toString().padStart(2,"0");
  schedulerLogger.log(level, `${date}, ${message}`);
}

function schemalogger (level:string, message:any):void{
  let dt = new Date();
  let date = dt.getFullYear()+"-"+(dt.getMonth()+1).toString().padStart(2,"0")+"-"+dt.getDate().toString().padStart(2,"0")+"T"+dt.getHours().toString().padStart(2,"0")+":"+dt.getMinutes().toString().padStart(2,"0")+":"+dt.getSeconds().toString().padStart(2,"0");
  schemaValidationLogger.log(level, `${date}, ${message}`);
}

function masterlogger (level:string, message:any):void{
  let dt = new Date();
  let date = dt.getFullYear()+"-"+(dt.getMonth()+1).toString().padStart(2,"0")+"-"+dt.getDate().toString().padStart(2,"0")+"T"+dt.getHours().toString().padStart(2,"0")+":"+dt.getMinutes().toString().padStart(2,"0")+":"+dt.getSeconds().toString().padStart(2,"0");
  masterValidationLogger.log(level, `${date}, ${message}`);
}

function dblogger (level:string, message:any):void{
  let dt = new Date();
  let date = dt.getFullYear()+"-"+(dt.getMonth()+1).toString().padStart(2,"0")+"-"+dt.getDate().toString().padStart(2,"0")+"T"+dt.getHours().toString().padStart(2,"0")+":"+dt.getMinutes().toString().padStart(2,"0")+":"+dt.getSeconds().toString().padStart(2,"0");
  dbServiceLog.log(level, `${date}, ${message}`);
}

export = {logger: schedulerlogger, schemalog: schemalogger, masterlog: masterlogger, dblog: dblogger};