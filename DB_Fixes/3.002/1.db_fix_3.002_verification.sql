SELECT '1.DB-Fix - 3.002 Verification Started - '||now();

SELECT '-- Balaji - 2022-06-28 - [';

\d waka.scheduler_availability_status

\d waka.sb_scheduler_running_status

SELECT '-- Balaji - 2022-06-28 - ]';

SELECT '1.DB-Fix - 3.002 Verification Completed - '||now();