ALTER TABLE waka.company ADD COLUMN country_id integer REFERENCES waka.country(country_id), ADD COLUMN state_id integer REFERENCES waka.state(state_id), ADD COLUMN city_id integer REFERENCES waka.city(city_id);

ALTER TABLE history.company ADD COLUMN country_id integer REFERENCES waka.country(country_id), ADD COLUMN state_id integer REFERENCES waka.state(state_id), ADD COLUMN city_id integer REFERENCES waka.city(city_id);

ALTER TABLE waka.login_user ADD column email_verified_on TIMESTAMPTZ;
ALTER TABLE history.login_user  ADD column email_verified_on TIMESTAMPTZ;

ALTER TABLE waka.login_user ADD active_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE history.login_user ADD active_flag BOOLEAN DEFAULT FALSE;
