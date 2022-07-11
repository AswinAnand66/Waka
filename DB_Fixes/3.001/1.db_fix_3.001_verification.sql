SELECT '1.DB-Fix - 3.001 Verification Started - '||now();

SELECT '-- siddiq - 2022-04-26 - [';

\d waka.po_raw

\d waka.company_invite

\d waka.poi_master_error_temp

\d waka.map_services_temp

\d waka.po_transactions

\d waka.sub_modules;

SELECT '-- siddiq - 2022-04-26 - ]';

SELECT '1.DB-Fix - 3.001 Verification Completed - '||now();