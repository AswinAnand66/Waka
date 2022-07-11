SELECT '1.DB-Fix - 3.002 Downtime Started - '||now();

SELECT '-- Balaji - 2022-06-28 - [';

DROP TABLE IF EXISTS waka.scheduler_availability_status;
CREATE TABLE waka.scheduler_availability_status (
	scheduler_uid VARCHAR PRIMARY KEY,
	scheduler_name VARCHAR NOT NULL,
	current_status VARCHAR,
	last_responded_on TIMESTAMPTZ,
	registered_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	registered_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS waka.sb_scheduler_running_status;
CREATE TABLE waka.sb_scheduler_running_status (
	sb_rs_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	principal_id INT,
	po_id INT,
	success BOOLEAN,
	response TEXT,
	scheduler_uid VARCHAR NOT NULL REFERENCES waka.scheduler_availability_status(scheduler_uid) ON DELETE CASCADE,
	received_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT '-- Balaji - 2022-06-28 - ]';

SELECT '1.DB-Fix - 3.002 Downtime Completed - '||now();
