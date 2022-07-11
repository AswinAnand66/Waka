CREATE DATABASE waka;
\c waka
CREATE SCHEMA waka;
CREATE TABLE waka.login_user (
	user_id SERIAL PRIMARY KEY,
	email VARCHAR UNIQUE NOT NULL,
	mobile_country VARCHAR,
	mobile VARCHAR,
	full_name VARCHAR NOT NULL,
	hash_password VARCHAR NOT NULL,
	profile_photo_relative_path VARCHAR,
	is_admin BOOLEAN default false,
	is_active BOOLEAN NOT NULL DEFAULT true,
	is_deleted BOOLEAN NOT NULL DEFAULT false,
	created_by INT,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	is_invited_user BOOLEAN DEFAULT false,
	invite_accepted_on timestamptz,
	salt VARCHAR NOT NULL,
	wechat_id VARCHAR
);

create table waka.login_history(
	id bigserial not null, 
	session_id varchar,  
	email varchar not null, 
	status varchar, 
	remarks varchar, 
	accessed_on timestamp with time zone default now(), 
	ip_address varchar, 
	lat numeric, 
	lon numeric, 
	logout_at timestamp with time zone
);

DROP TABLE IF EXISTS waka.country;
CREATE TABLE waka.country (
	country_id int PRIMARY KEY,
	name varchar,iso3 varchar,
	iso2 varchar,
	phone_code varchar,
	capital varchar,
	currency varchar,
	tld varchar,
	region varchar,
	subregion varchar,
	latitude numeric,
	longitude numeric,
	emojiu varchar, 
	created_on timestamp with time zone default now()
);

CREATE TABLE waka.state (
	state_id int PRIMARY KEY,
	name varchar,
	country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	country_code_iso2 varchar,
	state_code VARCHAR,
	latitude numeric,
	longitude numeric, 
	created_on timestamp with time zone default now()
);

CREATE TABLE waka.city(
	city_id bigint PRIMARY KEY,
	name varchar,
	state_id INT NOT NULL REFERENCES waka.state(state_id) ON DELETE CASCADE,
	state_code varchar,
	country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	country_code varchar,
	latitude numeric,
	longitude numeric, 
	created_on timestamp with time zone default now()
);

--UPDATE login_user SET is_admin = true WHERE user_id = 1;
DROP TABLE IF EXISTS waka.lookup_type;
CREATE TABLE waka.lookup_type (
	lookup_type_id SERIAL PRIMARY KEY,
	lookup_type VARCHAR NOT NULL UNIQUE,
	description VARCHAR,
	display_name VARCHAR NOT NULL,
	is_admin_owned BOOLEAN DEFAULT true,
	is_active BOOLEAN NOT NULL DEFAULT false,
	is_deleted BOOLEAN NOT NULL DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

CREATE TABLE waka.lookup_name (
	lookup_name_id SERIAL PRIMARY KEY,
	lookup_type_id INT NOT NULL REFERENCES waka.lookup_type(lookup_type_id) ON DELETE CASCADE,
	company_id INT, 
	lookup_name VARCHAR NOT NULL,
	display_name VARCHAR NOT NULL,
	description VARCHAR,
	seq INT,
	is_active BOOLEAN NOT NULL DEFAULT true,
	is_deleted BOOLEAN NOT NULL DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(lookup_type_id,company_id, lookup_name)
);

CREATE TABLE waka.modules (
	module_id SERIAL PRIMARY KEY,
	module_name VARCHAR NOT NULL UNIQUE,
	seq INT NOT NULL,
	is_visible BOOLEAN NOT NULL DEFAULT true,
	is_licensed BOOLEAN NOT NULL DEFAULT true,
	icon VARCHAR,
	svg VARCHAR,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE waka.sub_modules (
	sub_module_id SERIAL PRIMARY KEY,
	sub_module_name VARCHAR NOT NULL,
	module_id INT NOT NULL REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	sub_module_description VARCHAR,
	is_admin_owned BOOLEAN DEFAULT false,
	is_visible BOOLEAN DEFAULT true,
	route_name VARCHAR,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (module_id, sub_module_name)
);

DROP TABLE IF EXISTS waka.port;
CREATE TABLE waka.port (
	port_id SERIAL PRIMARY KEY,
	port_name VARCHAR NOT NULL,
	region VARCHAR,
	subregion VARCHAR,
	country VARCHAR NOT NULL,
	country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	latitude NUMERIC,
	longitude NUMERIC,
	is_deleted BOOLEAN NOT NULL DEFAULT false,
	is_visible BOOLEAN NOT NULL DEFAULT true,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (port_name,country)
);

CREATE TABLE waka.company (
	company_id SERIAL PRIMARY KEY,
	company_name VARCHAR NOT NULL,
	company_local_name VARCHAR NOT NULL,
	company_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	office_category_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	parent_company_id INT REFERENCES waka.company(company_id) ON DELETE CASCADE,
	company_logo_path VARCHAR,
	website_address VARCHAR,
	owned_by INT,
	company_invite_id INT,
	is_deleted BOOLEAN NOT NULL DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.role CASCADE;
CREATE TABLE waka.role (
	role_id SERIAL PRIMARY KEY,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	role_name VARCHAR NOT NULL,
	module_id INT NOT NULL REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	sub_module_id INT NOT NULL REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	permission varchar NOT NULL,
	is_default BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (company_id, role_name, module_id, sub_module_id)
);

CREATE TABLE waka.company_address(
	comp_add_id SERIAL PRIMARY KEY,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	address_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	name VARCHAR,
	email VARCHAR,
	address VARCHAR, 
	country_id INT REFERENCES waka.country(country_id) ON DELETE CASCADE,
	state_id INT REFERENCES waka.state(state_id) ON DELETE CASCADE,
	city_id INT REFERENCES waka.city(city_id) ON DELETE CASCADE,
	city VARCHAR,
	zip_code VARCHAR,
	mobile VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

CREATE TABLE waka.company_registration(
	comp_reg_id SERIAL PRIMARY KEY,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	reg_name VARCHAR,
	reg_number VARCHAR, 
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.company_contact cascade;
CREATE TABLE waka.company_contact(
	cc_id SERIAL NOT NULL,
	user_id INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	designation VARCHAR,
	department VARCHAR,
	role_id INT,
	name VARCHAR NOT NULL,
	address VARCHAR,
	email VARCHAR,
	country_id INT REFERENCES waka.country(country_id) ON DELETE CASCADE,
	state_id INT REFERENCES waka.state(state_id) ON DELETE CASCADE,
	city_id INT REFERENCES waka.city(city_id) ON DELETE CASCADE,
	city VARCHAR,
	zip_code VARCHAR,
	mobile_country_id INT NOT NULL,
	mobile VARCHAR NOT NULL,
	phone_country_id INT NOT NULL,
	phone VARCHAR NOT NULL,
	wechatid VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.company_invite CASCADE;
CREATE TABLE waka.company_invite (
	company_invite_id SERIAL NOT NULL PRIMARY KEY,
	invited_company_id int NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	invited_user_id int NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	invited_company_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	invitee_company_id INT REFERENCES waka.company(company_id) ON DELETE CASCADE,
	invitee_company_name varchar NOT NULL,
	invitee_contact_name VARCHAR NOT NULL,
	invitee_email VARCHAR NOT NULL,
	invitee_user_id int REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	invitee_company_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	is_accepted BOOLEAN DEFAULT false,
	accepted_on TIMESTAMPTZ,
	is_denied BOOLEAN DEFAULT false,
	denied_on TIMESTAMPTZ,
	is_revoked BOOLEAN DEFAULT false,
	revoked_on TIMESTAMPTZ,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (invited_company_id, invitee_company_name)
);

DROP TABLE IF EXISTS waka.contact_invite CASCADE;
CREATE TABLE waka.contact_invite (
	contact_invite_id SERIAL Primary Key NOT NULL,
	company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	contact_name VARCHAR NOT NULL, 
	email VARCHAR NOT NULL,
	is_accepted BOOLEAN DEFAULT false,
	accepted_on TIMESTAMPTZ,
	is_denied BOOLEAN DEFAULT false,
	denied_on TIMESTAMPTZ,
	is_revoked BOOLEAN DEFAULT false,
	revoked_on TIMESTAMPTZ,
	designation VARCHAR NOT NULL,
	department VARCHAR NOT NULL,
	role_id INT,
	mobile VARCHAR,
	invitee_user_id INT, 
	is_deleted BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (company_id, email)
);

DROP TABLE IF EXISTS waka.company_invited_modules CASCADE;
CREATE TABLE waka.company_invited_modules (
	cim_id serial PRIMARY KEY NOT NULL,
	company_invite_id int NOT NULL REFERENCES waka.company_invite(company_invite_id) ON DELETE CASCADE,
	module_id int NOT NULL REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	UNIQUE (company_invite_id,module_id)
);

DROP TABLE IF EXISTS waka.invitee_roles CASCADE;
CREATE TABLE waka.invitee_roles (
	invite_role_id SERIAL,
	contact_invite_id int NOT NULL REFERENCES waka.contact_invite(contact_invite_id) ON DELETE CASCADE,
	email VARCHAR NOT NULL,
	role_id int NOT NULL
);

DROP TABLE IF EXISTS waka.user_company CASCADE;
CREATE TABLE waka.user_company (
	id serial PRIMARY KEY NOT NULL,
	company_invite_id INT REFERENCES waka.company_invite(company_invite_id) ON DELETE CASCADE,
	contact_invite_id INT REFERENCES waka.contact_invite(contact_invite_id) ON DELETE CASCADE,
	user_id int REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	company_id int REFERENCES waka.company(company_id) ON DELETE CASCADE,
	invited_company_id int REFERENCES waka.company(company_id) ON DELETE CASCADE,
	is_company_owner BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.company_license CASCADE;
CREATE TABLE waka.company_license (
	cl_id serial PRIMARY KEY NOT NULL,
	company_id int REFERENCES waka.company(company_id) ON DELETE CASCADE,
	is_approved BOOLEAN default false,
	valid_from timestamptz,
	valid_to timestamptz,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.company_lic_module CASCADE;
CREATE TABLE waka.company_lic_module (
	clm_id serial PRIMARY KEY NOT NULL,
	cl_id INT REFERENCES waka.company_license(cl_id) ON DELETE CASCADE,
	module_id INT REFERENCES waka.modules(module_id) ON DELETE CASCADE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS waka.sop cascade;
CREATE TABLE waka.sop (
	sop_id SERIAL PRIMARY KEY,
	principal_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	pp_type_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	ff_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	ff_type_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	date_of_sop TIMESTAMPTZ DEFAULT now(),
	remarks VARCHAR,
	valid_from timestamp with time zone NOT NULL,
	valid_to timestamp with time zone NOT NULL,
	sop_status_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	is_deleted BOOLEAN default false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);
 
DROP TABLE IF EXISTS waka.sop_company;
CREATE TABLE waka.sop_company(
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	company_type_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(), 
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, company_id)
);

DROP TABLE IF EXISTS waka.sop_country;
CREATE TABLE waka.sop_country(
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	origin_dest VARCHAR CONSTRAINT country_point_check CHECK (origin_dest = 'origin' OR origin_dest = 'destination'),
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(), 
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, country_id, origin_dest)
);

DROP TABLE IF EXISTS waka.documents;
CREATE TABLE waka.documents (
	doc_id SERIAL PRIMARY KEY,
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	doc_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	doc_seq INT,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	is_deleted BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.sop_document;
CREATE TABLE waka.sop_document(
	sop_doc_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	origin_country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
	destination_country_id INT NOT NULL REFERENCES waka.country(country_id) ON DELETE CASCADE,
    doc_id INT NOT NULL REFERENCES waka.documents(doc_id) ON DELETE CASCADE,
	fields JSON NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, origin_country_id,destination_country_id,doc_id)
);

DROP TABLE IF EXISTS waka.po_booking CASCADE;
CREATE TABLE waka.po_booking(
	pob_id SERIAL PRIMARY KEY,
	html_template VARCHAR DEFAULT 'template1',
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	pob_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	pob_seq INT,
	ui_img_file_name varchar,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	view_text VARCHAR,
	is_deleted BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.sop_pob;
CREATE TABLE waka.sop_pob(
	sop_pob_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    pob_id INT NOT NULL REFERENCES waka.po_booking(pob_id) ON DELETE CASCADE,
	fields JSON NULL,
	is_selected boolean default false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, pob_id)
);

DROP TABLE IF EXISTS waka.cargo_handling;
CREATE TABLE waka.cargo_handling(
	ch_id SERIAL PRIMARY KEY,
	html_template VARCHAR DEFAULT 'template1',
	grp VARCHAR NOT NULL,
	grp_seq INT,
	sub_grp VARCHAR,
	sub_grp_seq INT,
	ch_name VARCHAR NOT NULL,
	control_name VARCHAR NOT NULL UNIQUE,
	ch_seq INT,
	ui_img_file_name varchar,
	has_child BOOLEAN NOT NULL default false,
	fields JSON,
	view_text VARCHAR,
	is_deleted BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.sop_ch;
CREATE TABLE waka.sop_ch(
	sop_ch_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
    ch_id INT NOT NULL REFERENCES waka.cargo_handling(ch_id) ON DELETE CASCADE,
	fields JSON NULL,
	is_selected boolean default false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (sop_id, ch_id)
);

DROP TABLE IF EXISTS waka.container_first_character;
CREATE TABLE waka.container_first_character (
	code VARCHAR NOT NULL PRIMARY KEY,
	length_ft VARCHAR NOT NULL,
	length_mm VARCHAR NOT NULL
);

DROP TABLE IF EXISTS waka.container_second_character;
CREATE TABLE waka.container_second_character (
	code VARCHAR NOT NULL PRIMARY KEY,
	width_ft VARCHAR NOT NULL,
	width_mm VARCHAR NOT NULL,
	height_ft VARCHAR NOT NULL,
	height_mm VARCHAR NOT NULL
);

DROP TABLE IF EXISTS waka.container_type_desc;
CREATE TABLE waka.container_type_desc (
	code VARCHAR NOT NULL PRIMARY KEY,
	description VARCHAR NOT NULL
);

DROP TABLE IF EXISTS waka.container_sizes CASCADE;
CREATE TABLE waka.container_sizes(
	container_id serial PRIMARY KEY,
	iso_type_code VARCHAR NOT NULL,
	iso_size_code VARCHAR NOT NULL,
	description VARCHAR,
	first_character VARCHAR REFERENCES waka.container_first_character(code) ON DELETE CASCADE,
	second_character VARCHAR REFERENCES waka.container_second_character(code) ON DELETE CASCADE,
	type_desc VARCHAR REFERENCES waka.container_type_desc(code) ON DELETE CASCADE,
	max_cbm NUMERIC,
	tare_weight_kgs INT,
	max_weight_kgs INT,
	is_visible BOOLEAN DEFAULT true,
	remarks_required BOOLEAN DEFAULT false,
	port_id_exception INT[] DEFAULT '{}'
);

DROP TABLE IF EXISTS waka.sop_container CASCADE;
CREATE TABLE waka.sop_container (
	sop_container_id serial PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	container_id INT NOT NULL REFERENCES waka.container_sizes(container_id) ON DELETE CASCADE,
	fcl_min NUMERIC,
	min_cbm NUMERIC,
	optimal_cbm NUMERIC,
	max_cbm NUMERIC,
	preference INT,
	remarks varchar,
	port_id_exception INT[] DEFAULT '{}',
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id, container_id)
);

DROP TABLE IF EXISTS waka.sop_carrier_allocations CASCADE;
CREATE TABLE waka.sop_carrier_allocations(
	sca_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	origin_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	dest_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	carrier_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	contract_number VARCHAR,
	allocation_percent INT NOT NULL DEFAULT 0,
	remarks VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id, origin_port_id,dest_port_id,carrier_id)
);

DROP TABLE IF EXISTS waka.sop_carrier_preference CASCADE;
CREATE TABLE waka.sop_carrier_preference(
	scp_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	origin_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	dest_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	carrier_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	contract_number VARCHAR,
	preference smallint NOT NULL DEFAULT 0,
	remarks VARCHAR,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id, origin_port_id,dest_port_id,carrier_id)
);
CREATE TABLE waka.sop_carrier_forecast(
	scf_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	forecast_weeks VARCHAR NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id)
);

DROP TABLE IF EXISTS waka.services CASCADE;
CREATE TABLE waka.services(
	service_id SERIAL PRIMARY KEY,
	service_type_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	service_name VARCHAR NOT NULL,
	unq_name VARCHAR GENERATED ALWAYS AS (REGEXP_REPLACE(LOWER(service_name),'\W','','g')) STORED,
	parent_service_id INT,
	input_required BOOLEAN DEFAULT false,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(service_type_id,unq_name)
);

DROP TABLE IF EXISTS waka.sop_services;
CREATE TABLE waka.sop_services(
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	service_id INT REFERENCES waka.services(service_id) ON DELETE CASCADE,
	service_name VARCHAR NOT NULL,
	unq_name VARCHAR GENERATED ALWAYS AS (REGEXP_REPLACE(LOWER(service_name),'\W','','g')) STORED,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id,unq_name)
);

CREATE TABLE waka.communication(
	communication_id SERIAL PRIMARY KEY,
	instruction VARCHAR NOT NULL,
	instruction_type VARCHAR NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	unique(instruction)
);
CREATE TABLE waka.shared_license(
	sl_id SERIAL PRIMARY KEY,
	cl_id INT REFERENCES waka.company_license(cl_id) ON DELETE CASCADE,            
	licensed_company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	shared_company_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	valid_from TIMESTAMPTZ,
	valid_to TIMESTAMPTZ,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

CREATE TABLE  waka.shared_lic_module(
	slm_id SERIAL PRIMARY KEY,
	sl_id INT REFERENCES waka.shared_license(sl_id) ON DELETE CASCADE,     
	cl_id INT REFERENCES waka.company_license(cl_id) ON DELETE CASCADE,       
	module_id INT REFERENCES waka.modules(module_id) ON DELETE CASCADE,  
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ
 );

DROP TABLE IF EXISTS waka.sop_communication;
CREATE TABLE waka.sop_communication(
	sop_communication_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	communication_id INT,
	instruction VARCHAR NOT NULL,
	instruction_type VARCHAR NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

TRUNCATE TABLE waka.communication restart identity; 
INSERT INTO waka.communication(instruction, instruction_type, created_by)VALUES('Principal advise all its suppliers of the appointment of Forwarder as its origin service provider. All new suppliers are to be advised accordingly when Principal starts to place POs with them.','communication',1),('Forwarder representatives and their appointed agents have the Principal authority to contact the suppliers via E-mail or phone in relation to the shipping documentation or any other queries with reference to Principal shipments','communication',1),('All origin matters are to be communicated directly between Forwarder and Principal, with a copy to Destination Agent/Office if required','communication',1),('All destination matters are to be communicated between Destination Agent/Office and Principal','communication',1),('A Monthly KPI Pack of Services will be provided by Forwarder to Principal and followed by a review meeting. Principal Key Personnel, Forwarder Account Management team will attend these monthly review meetings, and Destination Agent/Office team will attend per request.','communication',1),('A Quarterly Review Meeting will be held among Forwarder Account Management team, Destination Agent/Office and Principal','communication',1),
('Containers must be inspected internally and externally to ensure that they are seaworthy, free of odour, dirt, soil, mud, sand, leaf, tree litter, grain, insects, debris and contamination. No holes, dents and excess rust, door seals intact, locking mechanism in working condition must prevail. If any of these conditions cannot be met with, the container must be rejected.','LCL Consolidation',1),
('Any overflow cargoes at any origin, from one sailing, will be prioritised for the next sailing, or subject to approval for under-utilised container or LCL shipment','LCL Consolidation',1),
('No wet cargoes are allowed to be consolidated into containers. All wet cargoes must be changed into new cartons at the expense of the suppliers','LCL Consolidation',1),
('Any containers which are subject to export Customs inspections in China must be alerted to Principal. A new Customs seal may replace the container seal used by Forwarder or its CFS','LCL Consolidation',1),
('Suppliers must check for container quality, including free of odour, dirt, soil, mud, sand, leaf, tree litter, grain, insects, debris and contamination. No holes, dents and excess rust, door seals intact, etc. All containers should be checked for holes, e.g., by conducting a light test, and swept clean of debris, dirt, mud, soil, sand, leaf, tree litter, grain, insects and residues prior to loading. All damages to the goods by loading a dirty or damaged container will be the responsibility of the suppliers','FCL Program',1),
('Containers should be packed safely and restrained if goods are susceptible to shifting en route, e.g., cartons should not be column stacked.','FCL Program',1),
('Suppliers are required to take at least 4 photos of inner container during loading, one photo before loading, one photo when half of loading finished, one photo with container manifest after loading finished but before container door closed and one with clear view on container seal# after container door closed. All loading pictures must be reserved at least 3 months and should be presented to Forwarder or Principal per request','FCL Program',1),
('Suppliers to prepare Container Manifest','FCL Program',1);

INSERT INTO waka.lookup_type (lookup_type, display_name, description, is_admin_owned, created_by) VALUES ('account_type', 'Account Type', 'To understand the type of account like consignee, shipper,carrier, freight forwarder or agent', true, 1),('sop_status','SOP Status', 'SOP Status',false,1), ('office_category','office category','office category',true,1), ('address_type','address type','address type',false,1), ('registration_type','registration type','registration type',true,1), ('service_type','service type','service type',true,1);


INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Company',0,true);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Admin',1,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('SOP',2,true);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Order Confirmation',3,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Supply Chain',4,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Freight Forecast',5,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Progress Check',6,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Booking Confirmation to Supplier',7,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Carrier Booking',8,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Cargo Handling',9,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Destination Services',10,false);
INSERT INTO waka.modules (module_name, seq,is_visible) VALUES ('Invoices',11,false);

INSERT INTO waka.sub_modules (sub_module_name,module_id, is_admin_owned, is_visible) VALUES 
('User', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), false, true),
('Roles', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), false, true),
('License', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Lookup', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), false, true),
('Email Setup', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('SMS Setup', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Third Party Services', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), false, true),
('Document', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), false, true),
('Cargo Handling', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('PO & Booking', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Carrier Management', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Service Charges', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Port', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true),
('Location', (SELECT module_id FROM waka.modules where module_name = 'Admin' LIMIT 1), true, true);

\COPY waka.country(name,country_id,iso3,iso2,phone_code,capital,currency,tld,region,subregion,latitude,longitude,emojiu) FROM 'C:\waka\datafiles\country.csv' DELIMITER ',' CSV HEADER;
\COPY waka.state(state_id,name,country_id,country_code_iso2,state_code,latitude,longitude) FROM 'C:\waka\datafiles\state.csv' DELIMITER ',' CSV HEADER;
\copy waka.city (city_id,name,state_id,state_code,country_id,country_code,latitude,longitude) FROM 'C:\waka\datafiles\city.csv' DELIMITER ',' CSV HEADER;
\copy waka.port (port_name, country, latitude, longitude, region, subregion, country_id, created_by) FROM 'C:\waka\datafiles\CountryWithPortName.csv' DELIMITER ',' CSV HEADER;

TRUNCATE TABLE waka.documents restart identity cascade;
INSERT INTO waka.documents (grp, grp_seq, sub_grp, sub_grp_seq, doc_name, control_name, doc_seq, has_child, fields, created_by) VALUES 
('Government Documents',1,'General',1,'Certificate of Origin','CertOfOrigin',1,false,null,1),
('Government Documents',1,'General',1,'GSP Form A','GSPFormA',2, false,null,1),
('Government Documents',1,'General',1,'S/A Approval','SAApproval',3,false,null,1),
('Government Documents',1,'Commodity-specific',2,'Food Products','FoodProducts',1, true,'[{"type":"textarea", "fieldname":"Commodity","value":null, "controlname":"FPCommodity"}]',1),
('Government Documents',1,'Commodity-specific',2,'Electrical Licence','EL',2, true,'[{"type":"textarea", "fieldname":"Commodity","value":null,"controlname":"ELCommodity"}]',1),
('Government Documents',1,'Commodity-specific',2,'Fumigation Certificate','FumigationCert',3, true,'[{"type":"textarea", "fieldname":"Commodity", "value":null, "controlname":"FCCommodity"}]',1),
('Commercial Documents',3,'nosubgrp',1,'Commercial Invoice','CommercialInv',1,true, '[{"type":"numsmall","fieldname":"Original","range":[0,10],"value":"1","controlname":"CIOriginal"},{"type":"numsmall","fieldname":"Copy","value":"1","range":[0,10],"controlname":"CICopy"}]',1),
('Commercial Documents',3,'nosubgrp',2,'Packing List','PackingList',2, true, '[{"type":"numsmall","fieldname":"Original","value":"1","range":[0,10],"controlname":"PLOriginal"},{"type":"numsmall","fieldname":"Copy","value":"1","range":[0,10],"controlname":"PLCopy"}]',1),
('Commercial Documents',3,'nosubgrp',3,'MSDS (Material Safety Data Sheet)','MSDS',1, true,'[{"type":"textarea", "fieldname":"Commodity","value":null, "controlname":"MSDSCommodity"}]',1),
('Shipping Documents',2,'nosubgrp',1,'Forwarders Cargo Receipt/House Bill of Lading/House Sea Waybill','FCBOL',1,true,'[{"type":"multi","fieldname":"Shipper","contact_type":"shipper","value":null,"controlname":"FCShipper"},{"type":"multi","fieldname":"Consignee","contact_type":"principal","value":null,"controlname":"FCPrincipal"},{"type":"multi","fieldname":"Notify Party","contact_type":"all","value":null,"controlname":"FCNotifyList"}]',1),
('Shipping Documents',2,'nosubgrp',1,'House Air Waybill','HAWBL',5,true,'[{"type":"multi","fieldname":"Shipper","contact_type":"shipper","value":null,"controlname":"HAWBLShipper"},{"type":"multi","fieldname":"Consignee","contact_type":"principal","value":null,"controlname":"HAWBLPrincipal"},{"type":"multi","fieldname":"Notify Party","contact_type":"all","value":null,"controlname":"HAWBLNotifyList"}]',1),
('Shipping Documents',2,'nosubgrp',1,'Master Air Waybill','MAWL',4,true,'[{"type":"multi","fieldname":"shipper","contact_type":"shipper","value":null,"controlname":"MAWLShipper"},{"type":"multi","fieldname":"Consignee","contact_type":"principal","value":null,"controlname":"MAWLPrincipal"},{"type":"multi","fieldname":"Notify Party","contact_type":"all","value":null,"controlname":"MAWLNotifyList"}]',1),
('Shipping Documents',2,'nosubgrp',1,'Master Bill of Lading/Sea Waybill','MBOL',2,true,'[{"type":"multi","fieldname":"shipper","contact_type":"shipper","value":null,"controlname":"MBLShipper"},{"type":"multi","fieldname":"Consignee","contact_type":"principal","value":null,"controlname":"MBLPrincipal"},{"type":"multi","fieldname":"Notify Party","contact_type":"all","value":null,"controlname":"MBLNotifyList"}]',1),
('Shipping Documents',2,'nosubgrp',1,'House Bill of Lading from Coloader','HBOLCOL',3,true,'[{"type":"multi","fieldname":"shipper","contact_type":"shipper","value":null,"controlname":"HBOLCOLShipper"},{"type":"multi","fieldname":"Consignee","contact_type":"principal","value":null,"controlname":"HBOLCOLPrincipal"},{"type":"multi","fieldname":"Notify Party","contact_type":"all","value":null,"controlname":"HBOLCOLNotifyList"}]',1),
('Shipping Documents',2,'Container Manifest',2,'Require a Copy affix onto the inside of the door of container','RCAID',1,false,null,1),
('Document Dispatch',4,'nosubgrp',1,'Document Dispatch','DocumentDispatch',1,true, '[{"type":"numsmall","fieldname":"Days after Vessel Departure","value":"5","range":[0,30],"controlname":"DaysAfterVesselDeparture"}]',1),
('Document Dispatch',4,'nosubgrp',1,'Dispatch Parties','DispatchParties',2,true,'[{"type":"multi","fieldname":"Principal ","contact_type":"principal","value":null,"controlname":"DPPrincipal"},{"type":"multi","fieldname":"Oversea Agent", "contact_type":"all", "value":null,"controlname":"DPOAgent"},{"type":"multi","fieldname":"Others","contact_type":"all","value":null,"controlname":"DPAllList"}]',1);

truncate table waka.sop_pob restart identity;
truncate table waka.po_booking restart identity cascade;
INSERT INTO waka.po_booking (grp, grp_seq, html_template, sub_grp, sub_grp_seq, pob_name, control_name, pob_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES
('Order Placement',2,'template2','PO Posting',1,'PO Posting','POToWAKA',1,'vas_storeallocations.webp', true,'$$DatePriorCRD$$ prior to Cargo Ready Date','[{"group":"PO to WAKA", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Days prior to Cargo Ready Date","options":["As per PO Date","7 Days", "14 Days", "Others"],"Others":"$$val$$ Days","value":"14 Days", "range":[0,30], "controlname":"DatePriorCRD", "child":[]}]}}]',1),
('PO Booking',3,'template2','PO Confirmation',1,'PO Confirmation','POConfirmation',1,'vas_storeallocations.webp', true,'Date of Confirming the PO: $$DateOfConfirmingPO$$','[{"group":"PO Confirmation", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Date of Confirming the PO","options":["7 Days","14 Days","Others"],"Others":"$$val$$ Days","value":"21 Days", "range":[0,30], "controlname":"DateOfConfirmingPO", "child":[]}]}}]',1),
('PO Booking',3,'template2','Supply Chain',2,'Supply Chain','Supply Chain',1,'vas_storeallocations.webp',false,null,null,1),
('PO Booking',3,'template2','Progress Check',3,'Progress Check','ProgressCheck',1,'vas_storeallocations.webp', true,'Date of Progress Check: $$DateOfProgressCheck$$','[{"group":"Progress Check", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Date of Progress Check","options":["21 Days","14 Days","Others"],"Others":"$$val$$ Days","value":"14 Days", "controlname":"DateOfProgressCheck", "range":[0,30], "child":[]}]}}]',1),
('Inspection Requirements',1,'template2','Inspection or Testing Requirements',1,'Inspection or Testing Requirements','TestingRequirements',4,'vas_storeallocations.webp', true,null,'[{"group":"Inspection or Testing Requirements", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Sampling", "value":true, "controlname":"ITRSampling", "child":[]},{"fieldname":"Production", "value":true, "controlname":"ITRProduction", "child":[]},{"fieldname":"Shipment", "value":true, "controlname":"ITRShipment", "child":[]}]}},{"group":"Applicable To", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Applicable To","options":["Applicable to all PO","Follow PO instruction"],"Others":"$$val$$ Days","value":"Applicable to all PO", "controlname":"ApplyAbvSeleTo", "child":[]}]}}]',1),
('PO Booking',3,'template2','Data from Booking Confirmation',4,'Data from Booking Confirmation','DataBookingConfirmation',4,'vas_storeallocations.webp', true,null,'[{"group":"Data from Booking Confirmation", "fields":["field0","field1","field2","field3","field4","field5","field6","field7","field8","field9","field10","field11","field12","field13","field14","field15"], "field0":{"type":"multi", "field":[{"fieldname":"Forwarder Booking Confirmation Number", "value":true, "controlname":"ForwarderBookingConfirmationNumber", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Factory Name", "value":true, "controlname":"FactoryName", "child":[]}]}, "field2":{"type":"multi", "field":[{"fieldname":"Factory Contact Person", "value":true, "controlname":"FactoryContactPerson", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"PO Number", "value":true, "controlname":"PONumber", "child":[]}]},"field4":{"type":"multi", "field":[{"fieldname":"Item Number/SKU Number", "value":true, "controlname":"ItemNumber", "child":[]}]},"field5":{"type":"multi", "field":[{"fieldname":"Product Description ", "value":true, "controlname":"ProductDescription ", "child":[]}]},"field6":{"type":"multi", "field":[{"fieldname":"Quantity per each Item Number", "value":true, "controlname":"QuantityPerEachItem", "child":[]}]},"field7":{"type":"multi", "field":[{"fieldname":"Number of Cartons per each Item Number", "value":false, "controlname":"NumberCartonsPerEachItem", "child":[]}]},"field8":{"type":"multi", "field":[{"fieldname":"Ship Mode", "value":true, "controlname":"ShipMode", "child":[]}]},"field9":{"type":"multi", "field":[{"fieldname":"Volume per each Item Number", "value":true, "controlname":"VolumePerEachItem", "child":[]}]},"field10":{"type":"multi", "field":[{"fieldname":"Total Volume per FCL Container (for FCL Shipment)", "value":true, "controlname":"TotalVolumePerFCLContainer", "child":[]}]},"field11":{"type":"multi", "field":[{"fieldname":"Total Number of Container and Size (for FCL Shipment)", "value":true, "controlname":"TotalNumberContainerSize", "child":[]}]},"field12":{"type":"multi", "field":[{"fieldname":"Cargo Ready Date", "value":true, "controlname":"CargoReadyDate", "child":[]}]},"field13":{"type":"multi", "field":[{"fieldname":"Loading Port", "value":true, "controlname":"LoadingPort", "child":[]}]},"field14":{"type":"multi", "field":[{"fieldname":"Discharging Port", "value":true, "controlname":"DischargingPort", "child":[]}]}, "field15":{"type":"multi", "field":[{"fieldname":"Place of Destination", "value":false, "controlname":"PlaceOfDestination", "child":[]}]}}]',1),
('PO Booking',3,'template2','Booking Confirmation in Grouping Of',5,'Booking Confirmation in Grouping Of','BookingConfirmationGroupingOf',4,'vas_storeallocations.webp', true,null,'[{"group":"Booking Confirmation in Grouping Of", "fields":["field0","field1","field2","field3","field4","field5","field6","field7"], "field0":{"type":"multi", "field":[{"fieldname":"Supplier", "value":true, "controlname":"BGCGSupplier", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Loading Port", "value":true, "controlname":"BGCGLoadingPort", "child":[]}]}, "field2":{"type":"multi", "field":[{"fieldname":"Discharging Port", "value":true, "controlname":"BGCGDischargingPort", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"Shipment Windows", "value":true, "controlname":"BGCGShipmentWindows", "child":[]}]},"field4":{"type":"multi", "field":[{"fieldname":"Transport Mode", "value":true, "controlname":"BGCGTransportMode", "child":[]}]},"field5":{"type":"multi", "field":[{"fieldname":"Ship Mode", "value":true, "controlname":"BGCGShipMode", "child":[]}]},"field6":{"type":"multi", "field":[{"fieldname":"Incoterms", "value":true, "controlname":"BGCGIncoterms", "child":[]}]},"field7":{"type":"multi", "field":[{"fieldname":"Others", "value":false, "controlname":"BGCGOthers", "child":[{"type":"text","field":[{"fieldname":"PO Fields", "value":"Comma Separated PO Fields","controlname":"POFields", "child":[]}]}]}]}}]',1),
('PO Booking',3,'template2','Require Confirmation when Discrepancy between Booking Confirmation and PO',6,'Require Confirmation when Discrepancy between Booking Confirmation and PO','RequireConfirmationDiscrepancyBookingConfirmationPO',4,'vas_storeallocations.webp', true,null,'[{"group":"Require Confirmation when Discrepancy between Booking Confirmation and PO", "fields":["field0","field1","field2","field3","field4"], "field0":{"type":"multi", "field":[{"fieldname":"Loading Port", "value":true, "controlname":"RCDBPLoadingPort", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Discharging Port", "value":true, "controlname":"RCDBPDischargingPort", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"Quantity", "value":true, "controlname":"RCDBPQuantity", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"Cargo Ready Date", "value":true, "controlname":"RCDBPCargoReadyDate", "child":[]}]},"field4":{"type":"multi", "field":[{"fieldname":"Others", "value":false, "controlname":"RCDBPOthers", "child":[{"type":"text","field":[{"fieldname":"PO Fields", "value":"Comma Separated PO Fields","controlname":"POFields", "child":[]}]}]}]}}]',1),
('PO Booking',3,'template2','Booking Confirmation to Supplier',7,'Booking Confirmation to Supplier','BookingConfirmationToSupplier',4,'vas_storeallocations.webp', true,null,'[{"group":"Booking Confirmation to Supplier", "fields":["field0","field1","field2"], "field0":{"type":"multi", "field":[{"fieldname":"Deadline for Booking Confirmation", "value":true, "controlname":"BCSDeadlineForBookingConfirmation", "child":[{"type":"text","field":[{"fieldname":"___ Days prior to Cargo Ready Date", "value":"14", "dispname":"$$BCSDaysPriorToCargoReadyDate$$ Days prior to Cargo Ready Date", "range":[0,30], "controlname":"BCSDaysPriorToCargoReadyDate", "child":[]}]}]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Late Booking Confirmation Reminder to Supplier", "value":true, "controlname":"BCSLateBookingConfirmationReminderToSupplier", "child":[{"type":"text","field":[{"fieldname":"If not receive Supplier confirmation on the Booking in ___ Days prior to Cargo Ready Date", "value":"10", "dispname":"If not receive Supplier confirmation on the Booking in $$BCSNotReceiveSupplierConf$$ Days prior to Cargo Ready Date", "range":[0,30],"controlname":"BCSNotReceiveSupplierConf", "child":[]}]}]}]},"field2":{"type":"multi", "field":[{"fieldname":"Others", "value":false, "controlname":"BCSOthers", "child":[{"type":"text","field":[{"fieldname":"Another Date", "value":"PO Date Field","controlname":"BCSAnotherDate", "child":[]}]}]}]}}]',1);

INSERT INTO waka.po_booking (grp, grp_seq, html_template, sub_grp, sub_grp_seq, pob_name, control_name, pob_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES
('PO Booking',3,'template2','Allow Early Delivery',8,'Allow Early Delivery', 'POBAllowEarlyDelivery', 1,'vas_storeallocations.webp', true,'$$radAllowEarlyDelivery$$','[{"group":"Allow Early Delivery", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Allow Early Delivery","options":["Always Allow","Upon Principal''s Approval"],"Others":null,"value":"Upon Principal''s Approval", "controlname":"radAllowEarlyDelivery", "child":[]}]}}]',1);

INSERT INTO waka.po_booking (grp, grp_seq, html_template, sub_grp, sub_grp_seq, pob_name, control_name, pob_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES('Supplier Booking Reconfirmation',4,'template2','Quantity Variance at Booking Confirmation',1,'Quantity Variance at Booking Confirmation', 'SBRQuantityVarianceBookingConfirmation', 1,'vas_storeallocations.webp', true,'-$$QVBCMin$$% to $$QVBCMax$$% of the Quantity','[{"group":"Quantity Variance at Booking Confirmation", "fields":["field0"], "field0":{"type":"numsmall", "field":[{"fieldname":"Shortfall(%)", "value":5, "unit":"%", "controlname":"QVBCMin", "range":[0,20], "child":[]},{"fieldname":"Overage(%)", "value":5, "controlname":"QVBCMax", "unit":"%", "range":[0,20], "child":[]}]}}]',1),
('Supplier Booking Reconfirmation',4,'template2','Final Booking Confirmation Release to Supplier',2,'Final Booking Confirmation Release to Supplier', 'SBRFinalBookingConfirmationReleaseSupplier', 1,'vas_storeallocations.webp', true,null,'[{"group":"Final Booking Confirmation Release to Supplier", "fields":["field0","field1"], "field0":{"type":"numsmall", "field":[{"fieldname":"FCL: No earlier than ___ Days prior to ETD of Vessel", "value":7, "dispname":"FCL: No earlier than $$SBRFBCETDDays$$ Days prior to ETD of Vessel", "range":[0,30], "controlname":"SBRFBCETDDays", "child":[]}]}, "field1":{"type":"numsmall", "field":[{"fieldname":"LCL: No earlier than ___ Days prior to CFS of Vessel", "value":7, "dispname":"LCL: No earlier than $$SBRFBCCFSDays$$ Days prior to CFS of Vessel", "range":[0,30], "controlname":"SBRFBCCFSDays", "child":[]}]}}]',1),
('Supplier Booking Reconfirmation',4,'template2','Reconfirmation of Volume',3,'Reconfirmation of Volume', 'SBRReconfirmationVolume', 1,'vas_storeallocations.webp', true,null,'[{"group":"Reconfirmation of Volume", "msg":"System allows only variance of +/- different % of PO Data with respect of different products/buying department", "fields":["field0","field1","field2"], "field0":{"type":"multi", "field":[{"fieldname":"Quantity", "value":true, "controlname":"SBRRCVQty", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Volume", "value":true, "controlname":"SBRRCVVol", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"Gross Weight", "value":true, "controlname":"SBRRCVGW", "child":[]}]}}]',1),
('Supplier Booking Reconfirmation',4,'template2','Alert to Principal for Shortfall of Cargo',4,'Alert to Principal for Shortfall of Cargo', 'SBRAlertPrincipalShortfallCargo', 1,'vas_storeallocations.webp', true,null,'[{"group":"Alert to Principal for Shortfall of Cargo", "msg":"Only shortfall over 5% needs alert", "fields":["field0","field1","field2","field3","field4","field5"],"field0":{"type":"multi", "field":[{"fieldname":"PO Number", "value":true, "controlname":"SBRAPSPONumber", "child":[]}]},"field1":{"type":"multi", "field":[{"fieldname":"Item Number", "value":true, "controlname":"SBRAPSItemNumber", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"Contract Shipment Date", "value":true, "controlname":"SBRAPSContractShipDate", "child":[]}]}, "field3":{"type":"multi", "field":[{"fieldname":"Original Cargo Data", "value":true, "controlname":"SBRAPSOriginalCargoData", "child":[{"type":"multi", "field":[{"fieldname":"Quantity", "value":true, "controlname":"SBROCDQty", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Volume", "value":true, "controlname":"SBROCDVol", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Gross Weight", "value":true, "controlname":"SBROCDGW", "child":[]}]}]}]},"field4":{"type":"multi", "field":[{"fieldname":"Reconfirmed Cargo Data", "value":true, "controlname":"SBRAReconfirmedCargoData", "child":[{"type":"multi", "field":[{"fieldname":"Quantity", "value":true, "controlname":"SBRRCDQty", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Volume", "value":true, "controlname":"SBRRCDVol", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Gross Weight", "value":true, "controlname":"SBRRCDGW", "child":[]}]}]}]},"field5":{"type":"multi", "field":[{"fieldname":"Principal Reconfirmation for Shortfall Cargo", "value":true, "controlname":"SBRPrincipalReconfirmShortCargo", "child":[{"type":"multi", "field":[{"fieldname":"Quantity", "value":true, "controlname":"SBRPRSCQty", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Volume", "value":true, "controlname":"SBRPRSCVol", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Gross Weight", "value":true, "controlname":"SBRPRSCGW", "child":[]}]},{"type":"text", "field":[{"fieldname":"Postponement of Delivery To: ___", "value":"IN MMDD", "dispname":"Postponement of Delivery To: $$SBRPRSCPDT$$", "controlname":"SBRPRSCPDT", "child":[]}]},{"type":"multi", "field":[{"fieldname":"Cancellation of PO", "value":true, "controlname":"SBRPRSCCPO", "child":[]}]}]}]}}]',1),
('Supplier Booking Reconfirmation',4,'template2','Information to be shared in Booking Reconfirmation',5,'Information to be shared in Booking Reconfirmation', 'SBRInformationSharedBookingReconfirmation', 1,'vas_storeallocations.webp', true,null,'[{"group":"FCL", "fields":["field0","field1","field2","field3","field4"], "field0":{"type":"multi", "field":[{"fieldname":"VGM Cutoff", "value":true, "controlname":"SBRFCLVGMCutOff", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"ENS/AMS Cutoff", "value":true, "controlname":"SBRFCLENSCutoff", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"Shipping Instruction Cutoff", "value":true, "controlname":"SBRFCLShippingInstCutoff", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"CY Cutoff", "value":true, "controlname":"SBRFCLCYCutoff", "child":[]}]},"field4":{"type":"text", "field":[{"fieldname":"Others", "value":null, "controlname":"SBRFCLOthers", "child":[]}]}},{"group":"LCL", "fields":["field0","field1","field2","field3","field4"], "field0":{"type":"multi", "field":[{"fieldname":"VGM Cutoff", "value":true, "controlname":"SBRLCLVGMCutOff", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"ENS/AMS Cutoff", "value":true, "controlname":"SBRLCLENSCutoff", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"Shipping Instruction Cutoff", "value":true, "controlname":"SBRLCLShippingInstCutoff", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"CFS Cutoff", "value":true, "controlname":"SBRLCLCFSCutoff", "child":[]}]},"field4":{"type":"text", "field":[{"fieldname":"Others", "value":null, "controlname":"SBRLCLOthers", "child":[]}]}}]',1);

TRUNCATE TABLE waka.cargo_handling restart identity cascade;
INSERT INTO waka.cargo_handling (grp, grp_seq, html_template, sub_grp, sub_grp_seq, ch_name, control_name, ch_seq, ui_img_file_name, has_child, view_text, fields, created_by) VALUES 
('Cargo Handling',1,'template2','LCL Free Storage',1,'LCL Free Storage','LCLFreeStorage',1,'vas_compliancecheck.webp', true,'$$RadLCLFreeStorage$$ Days before LCL Closing','[{"group":"LCL Free Storage", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"LCL Free Storage","options":["3 Days before LCL Closing","5 Days before LCL Closing","7 Days before LCL Closing","10 Days before LCL Closing","14 Days before LCL Closing","Others"],"Others":"$$val$$ Days before LCL Closing","value":"10 Days before LCL Closing", "range":[0,30], "controlname":"RadLCLFreeStorage", "child":[]}]}}]',1),
('Cargo Handling',1,'template2','LCL Closing',2,'LCL Closing','LCLClosing',1,'vas_compliancecheck.webp', true,'$$RadLCLClosing$$ Days before CY Closing','[{"group":"LCL Closing", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"LCL Closing","options":["1 Day before CY Closing","2 Days before CY Closing","3 Days before CY Closing","Others"],"Others":"$$val$$ Days before CY Closing","value":"3 Days before CY Closing", "range":[0,14], "controlname":"RadLCLClosing", "child":[]}]}}]',1),
('Cargo Handling',1,'template2','Scan-and-Pack/Palletisation Closing',3,'Scan-and-Pack/Palletisation Closing','LCLScanPackPalletisationClosing',1,'vas_compliancecheck.webp', true,'$$RadScanPackPalletisationClosing$$ Days before LCL Closing','[{"group":"Scan-and-Pack/Palletisation Closing", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Scan-and-Pack/Palletisation Closing","options":["1 Day before LCL Closing","2 Days before LCL Closing","3 Days before LCL Closing"],"Others":"$$val$$ Days before LCL Closing","value":"3 Days before LCL Closing", "controlname":"RadScanPackPalletisationClosing", "child":[]}]}}]',1),
('Cargo Handling',1,'template2','LCL Receiving Conditions',4,'LCL Receiving Conditions', 'LCLReceivingConditions', 1, 'vas_compliancecheck.webp', true, null, '[{"group":"Partial Shipment", "fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"Partial Shipment", "value":true, "controlname":"LRCPartialShipment", "child":[]}]}},{"group":"LCL Receiving Quantity Variance Tolerance", "fields":["field0","field1"], "field0":{"type":"numsmall", "field":[{"fieldname":"Shortfall(%)", "value":5, "range":[0,20], "controlname":"MinQtyCQT", "child":[]}]}, "field1":{"type":"numsmall", "field":[{"fieldname":"Overage(%)", "value":5, "range":[0,20], "controlname":"MaxQtyCQT", "child":[]}]}},{"group":"Instructions", "fields":["field0","field1","field2","field3"], "field0":{"type":"multi", "field":[{"fieldname":"No cargo with metal strapping around the outer cartons can be accepted","value":true,"controlname":"NOCARWithMetalStrap", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Deliver cargo to Forwarder''s nominated CFS premises, with required document by the advised Cargo Ready Date on the booking form", "value":true, "controlname":"DeliverCargoCFSPremises", "child":[]}]},"field2":{"type":"multi", "field":[{"fieldname":"All export cartons must show Shipping Marks per Principal requirement", "value":true, "controlname":"AllExpCarShippingMarks", "child":[]}]},"field3":{"type":"multi", "field":[{"fieldname":"Others", "value":false, "controlname":"LCLReceivingOthers", "child":[{"type":"text","field":[{"fieldname":"Others", "value":null,"controlname":"LCLROthers", "child":[]}]}]}]}}]',1),
('Cargo Handling',1,'template2','Shortfall Or No Show',7,'Shortfall Or No Show','LCLShortfallOrNoShow',1,'vas_compliancecheck.webp', true,null,'[{"group":"Shortfall or No-show against Booking from Suppliers, notify Principal in", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"No show","options":["48 hours in prior", "Others"],"Others":"$$val$$ Days before LCL Closing","value":"48 hours in prior", "range":[24,72], "controlname":"LCLShortFallNoShow", "child":[]}]}}]',1),
('Cargo Handling',1,'template2','Cargo Damage',8,'Cargo Damage','LCLCargoDamage',1,'vas_compliancecheck.webp', true,'$$radLCLCargoDamage$$','[{"group":"Cargo Damage", "fields":["field0"], "field0":{"type":"radio", "field":[{"fieldname":"Cargo Damage","options":["Require Principal Approval", "Allow Forwarder Operation to Judge"],"Others":"$$val$$ Days before LCL Closing","value":"Require Principal Approval", "controlname":"radLCLCargoDamage", "child":[]}]}}]',1),
('Cargo Handling',1,'template2','QC Centre Set-up',9,'QC Centre Set-up','QCCentreSetup',1,'vas_compliancecheck.webp', true,null,'[{"group":"QC Centre Set-up", "fields":["field0","field1"], "field0":{"type":"multi", "field":[{"fieldname":"Area", "value":true, "controlname":"QCSArea", "child":[]}]}, "field1":{"type":"multi", "field":[{"fieldname":"Inspector Employment", "value":true, "controlname":"QCSInspEmp", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Fumigation',1,'Fumigation','Fumigation',1,'vas_fumigation.webp',false,null,null,1),
('Value-Added Services',2,'template2','Scan-and-Pack',2,'Scan-and-Pack','ScanAndPack',2,'vas_storeallocations.webp', true,null,'[{"group":"Store Allocations","fields":["field0"], "field0":{"type":"multi", "field":[{"fieldname":"By SKU","value":true, "controlname":"BySKU", "child":[]},{"fieldname":"By Store","value":true, "controlname":"ByStore", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Compliance Check',3,'Compliance Check','ComplianceCheck',3,'vas_compliancecheck.webp', true,null,'[{"group":"Compliance Check","fields":["field0","field1"],"field0":{"type":"numsmall", "field":[{"fieldname":"Quantity % for Check","value":5,"range":[0,100],"controlname":"QtyForCheck", "child":[]},{"fieldname":"Result % Accepted","value":98,"range":[0,100],"controlname":"ResultAccepted", "child":[]}]},"field1":{"type":"textarea","field":[{"fieldname":"Check Instructions", "value":null, "controlname":"CheckInstructions", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Re-labelling',6,'Re-labelling','Relabelling',4,'vas_relabelling.webp', true,null,'[{"group":"Re-labelling","fields":["field0","field1"], "field0": {"type":"textarea", "field":[{"fieldname":"Supply of New Label","value":null,"controlname":"SupplyNewLabel", "child":[]}]},"field1":{"type":"textarea","field":[{ "fieldname":"Re-labelling Instructions", "value":null,"controlname":"RelabellingInstructions", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Repackaging',7,'Repackaging','Repackaging',6,'vas_repackaging.webp', true,null,'[{"group":"Repackaging", "fields":["field0","field1"], "field0":{"type":"textarea", "field":[{"fieldname":"Supply of New Packages","value":null,"controlname":"SupplyNewPackages", "child":[]}]}, "field1":{"type":"textarea", "field":[{"fieldname":"Repackaging Instructions", "value":null, "controlname":"RepackagingInstructions", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Palletisation/Slipsheeting',4,'Palletisation/Slipsheeting','PalletisationOrSlipsheeting', 7, 'vas_palletisation.webp', true, null, '[{"group":"Supply of Pallets or Slipsheets", "fields":["field0","field1","field2","field3"], "field0": {"type":"multi", "field":[{"fieldname":"Wooden Pallet","value":true, "controlname":"WoodenPallet", "child":[{"type":"numsmall","field":[{"fieldname":"Length(cm)", "value":"100", "range":[0,210], "controlname":"WoodenPalletSizeLength", "child":[]},{"fieldname":"Width(cm)", "value":"100", "range":[0,210], "controlname":"WoodenPalletSizeWidth", "child":[]},{"fieldname":"Height(cm)", "value":"120", "range":[0,210], "controlname":"WoodenPalletSizeHt", "child":[]}]},{"type":"multi", "field":[{"fieldname":"4 Way Pallet", "value" :"true" ,"controlname":"Pallet4Way","child":[]}, {"fieldname":"2 Way Pallet", "value":"true", "controlname":"Pallet2Way","child":[]}]}]}]}, "field1": {"type":"multi", "field":[{"fieldname":"Plastic Pallet","value":true, "controlname":"PlasticPallet", "child":[{"type":"numsmall","field":[{"fieldname":"Length(cm)", "value":"100", "range":[0,210], "controlname":"PlasticPalletLength", "child":[]},{"fieldname":"Width(cm)", "value":"100", "range":[0,210], "controlname":"PlasticPalletWidth", "child":[]},{"fieldname":"Height(cm)", "value":"120", "range":[0,210], "controlname":"PlasticPalletHt", "child":[]}]}, {"type":"multi", "field":[{"fieldname":"4 Way Pallet", "value" :"true" ,"controlname":"Pallet4Way","child":[]}, {"fieldname":"2 Way Pallet", "value":"true", "controlname":"Pallet2Way","child":[]}]}]}]}, "field2":{"type":"multi", "field":[{"fieldname":"Pallet Box","value":true, "controlname":"PalletBox","child":[{"type":"numsmall","field":[{"fieldname":"Length(cm)", "value":"100", "range":[0,210], "controlname":"PalletBoxLength", "child":[]},{"fieldname":"Width(cm)", "value":"100", "range":[0,210], "controlname":"PalletBoxWidth", "child":[]},{"fieldname":"Height(cm)", "range":[0,210], "value":"120", "controlname":"PalletBoxHt", "child":[]}]},{"type":"multi", "field":[{"fieldname":"4 Way Pallet", "value" :"true" ,"controlname":"Pallet4Way", "child":[]}, {"fieldname":"2 Way Pallet", "value":"true","controlname":"Pallet2Way", "child":[]}]}]}]},"field3":{"type":"multi", "field":[{"fieldname":"Slipsheet","value":true, "controlname":"Slipsheet","child":[{"type":"numsmall","field":[{"fieldname":"Length(cm)", "value":"100", "range":[0,210], "controlname":"SlipsheetLength", "child":[]},{"fieldname":"Width(cm)", "value":"100", "range":[0,210], "controlname":"SlipsheetWidth", "child":[]},{"fieldname":"Height(cm)", "range":[0,210], "value":"120", "controlname":"SlipsheetHt", "child":[]}]}]}]}}, {"group":"Palletisation Instructions", "fields":["field0","field1"], "field0":{"type":"multi", "field":[{"fieldname":"By SKU","value":true, "controlname":"BySKU"},{"fieldname":"By Store","value":true, "controlname":"ByStore"},{"fieldname":"By Quantity","value":true, "controlname":"ByQuantity"}]},"field1":{"type":"text", "field":[{"fieldname":"Instruction","value":null,"controlname":"Instruction","child":[]}]}}]',1),
('Value-Added Services',2,'template2','GOH',5,'GOH','GOH',8,'vas_goh.webp',true,null,'[{"group":"GOH Equipment", "fields":["field0","field1"], "field0":{"type":"multi", "field":[{"fieldname":"String System","value":true,"controlname":"StringSystem", "child":[]},{"fieldname":"BAR System","value":true,"controlname":"BarSystem", "child":[]},{"fieldname":"Mobile Trolley","value":true,"controlname":"MobileTrolley", "child":[]},{"fieldname":"GOH Carton ","value":true,"controlname":"GOHCarton ", "child":[]}]}, "field1":{"type":"text", "field":[{"fieldname":"Others","value":null,"controlname":"Others", "child":[]}]}}]',1),
('Value-Added Services',2,'template2','Crating',8,'Crating','Crating',9,'vas_crating.webp', true,null,'[{"group":"Crating", "fields":["field0","field1"], "field0":{"type":"multi", "field":[{"fieldname":"Supply of Crates","value":true,"controlname":"SupplyCrates", "child":[]}]}, "field1":{"type":"textarea", "field":[{"fieldname":"Crating Instructions","value":null,"controlname":"CratingInstructions", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Split PO into Multiple Container',1,'Split PO into Multiple Container','SplitPO',1,'vas_crating.webp',false,null,null,1),
('Cargo Consolidations',3,'template2','Light Load',2,'Light Load','LightLoad',2,'vas_crating.webp', true,null,'[{"group":"Instruction", "fields":["field0"], "field0":{"type":"textarea","field":[{"fieldname":"Instruction", "value":null,"controlname":"TxtLLInst", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Mix Load',3,'Mix Load','MixLoad',3,'vas_crating.webp', true,null,'[{"group":"Mix Load", "fields":["field0"], "field0":{"type":"textarea", "field":[{"fieldname":"Instruction", "value":null, "controlname":"MixLoadInst", "child":[]}]}}]',1),
('Cargo Consolidations',3,'template2','Allow Loading with Mix-packaging',4,'Allow Loading with Mix-packaging','MixPackaging',4,'vas_crating.webp',false,null,null,1),
('Cargo Consolidations',3,'template2','Other Consolidation Instruction',5,'Other Consolidation Instruction','OthConsInstM',5,'vas_crating.webp', true,null,'[{"group":"Other Consolidation Instruction", "fields":["field0"], "field0":{"type":"textarea", "field":[{"fieldname":"Other Consolidation Instruction", "value":null, "controlname":"txtOtherConsInst", "child":[]}]}}]',1);

truncate table waka.container_first_character restart identity;
\COPY waka.container_first_character(code, length_ft, length_mm) FROM 'C:\waka\datafiles\containerfirstcharacter.csv' DELIMITER ',' CSV HEADER;
truncate table waka.container_second_character restart identity;
\COPY waka.container_second_character(code, width_ft, width_mm, height_ft, height_mm) FROM 'C:\waka\datafiles\containersecondcharacter.csv' DELIMITER ',' CSV HEADER;
truncate table waka.container_type_desc restart identity;
\COPY waka.container_type_desc(code, description) FROM 'C:\waka\datafiles\containertypedesc.csv' DELIMITER ',' CSV HEADER;
truncate table waka.container_sizes restart identity;
\COPY waka.container_sizes(iso_type_code,iso_size_code,description, first_character, second_character, type_desc, max_weight_kgs, max_cbm,is_visible, remarks_required) FROM 'C:\waka\datafiles\containeriso6436list.csv' DELIMITER ',' CSV HEADER;

--truncate table waka.container_first_character CASCADE;
--\COPY waka.container_first_character(code, length_ft, length_mm) FROM C:\waka\datafiles\containerfirstcharacter.csv' DELIMITER ',' CSV HEADER;
--truncate table waka.container_second_character CASCADE;
--\COPY waka.container_second_character(code, width_ft, width_mm, height_ft, height_mm) FROM C:\waka\datafiles\containersecondcharacter.csv' DELIMITER ',' CSV HEADER;
--truncate table waka.container_type_desc CASCADE;
--\COPY waka.container_type_desc(code, description) FROM C:\waka\datafiles\containertypedesc.csv' DELIMITER ',' CSV HEADER;
--truncate table waka.container_sizes CASCADE;
--\COPY waka.container_sizes(iso_type_code,iso_size_code,description, first_character, second_character, type_desc, max_weight_kgs, max_cbm,is_visible, remarks_required) FROM C:\waka\datafiles\containeriso6436list.csv' DELIMITER ',' CSV HEADER;

Truncate TABLE waka.services restart identity CASCADE;
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'PO Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Carrier Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Booking Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'CFS Consolidation Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Documentation Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Less-than-Container Load (CFS/CFS)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Buyer Consolidation (CFS/CY)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Full Container Load (CY/CY)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Supply Chain Control Service',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Warehousing',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Fumigation',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Scan-and-Pack',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Re-labelling',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Repackaging',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Compliance Check',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Palletisation and Slipsheeting',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Garment-on-Hanger (GOH)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Crating',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'U-turn Handling of Goods in China',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Reverse Logistics',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Carrier and Merchant Haulage',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Export Customs Clearance',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Group-buy of Inner and Export Cartons',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Origin Logistics Services'),'Other Ex-Works Services',true,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Vendor Management'),'Deliver In Full On Time (DIFOT)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Vendor Management'),'Documentation Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Vendor Management'),'Quality Check',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='QC Centre at Origin '),'QA/QC Sites Availability',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'Ocean Freight',false,1);
INSERT INTO waka.services (service_type_id, service_name, parent_service_id,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'Carrier',(SELECT service_id FROM waka.services WHERE service_name='Ocean Freight' LIMIT 1),1);
INSERT INTO waka.services (service_type_id, service_name, parent_service_id,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'NVOCC',(SELECT service_id FROM waka.services WHERE service_name='Ocean Freight' LIMIT 1),1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'Air Freight',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'Rail Freight',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Freight Management'),'Road Freight',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Documentation Management',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Import Cargo/Container Handling',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Import Tariff Consultancy and Valuation Services',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Import Tariff Classification',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Import Customs Clearance',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Import Duty Refunds',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Warehousing',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Fumigation',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Scan-and-Pack',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Re-labelling',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Repackaging',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Compliance Check',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Palletisation and Slipsheeting',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Garment-on-Hanger (GOH)',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Crating',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Reverse Logistics',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Destination Services'),'Hub and Distribution',false,1);
INSERT INTO waka.services (service_type_id, service_name, input_required,created_by) VALUES((SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name='Others' AND lookup_type_id=12),'Others',true,1);

-----26-08-2021
DROP TABLE IF EXISTS waka.communication;
CREATE TABLE waka.communication(
	communication_id SERIAL PRIMARY KEY,
	instruction VARCHAR NOT NULL,
	instruction_type VARCHAR NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	unique(instruction)
);

DROP TABLE IF EXISTS waka.sop_communication;
CREATE TABLE waka.sop_communication(
	sop_communication_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	communication_id INT,
	instruction VARCHAR NOT NULL,
	instruction_type VARCHAR NOT NULL,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ
);

TRUNCATE TABLE waka.communication restart identity; 
INSERT INTO waka.communication(instruction, instruction_type, created_by)VALUES('Principal advise all its suppliers of the appointment of Forwarder as its origin service provider. All new suppliers are to be advised accordingly when Principal starts to place POs with them.','communication',1),('Forwarder representatives and their appointed agents have the Principal authority to contact the suppliers via E-mail or phone in relation to the shipping documentation or any other queries with reference to Principal shipments','communication',1),('All origin matters are to be communicated directly between Forwarder and Principal, with a copy to Destination Agent/Office if required','communication',1),('All destination matters are to be communicated between Destination Agent/Office and Principal','communication',1),('A Monthly KPI Pack of Services will be provided by Forwarder to Principal and followed by a review meeting. Principal Key Personnel, Forwarder Account Management team will attend these monthly review meetings, and Destination Agent/Office team will attend per request.','communication',1),('A Quarterly Review Meeting will be held among Forwarder Account Management team, Destination Agent/Office and Principal','communication',1),
('Containers must be inspected internally and externally to ensure that they are seaworthy, free of odour, dirt, soil, mud, sand, leaf, tree litter, grain, insects, debris and contamination. No holes, dents and excess rust, door seals intact, locking mechanism in working condition must prevail. If any of these conditions cannot be met with, the container must be rejected.','LCL Consolidation',1),
('Any overflow cargoes at any origin, from one sailing, will be prioritised for the next sailing, or subject to approval for under-utilised container or LCL shipment','LCL Consolidation',1),
('No wet cargoes are allowed to be consolidated into containers. All wet cargoes must be changed into new cartons at the expense of the suppliers','LCL Consolidation',1),
('Any containers which are subject to export Customs inspections in China must be alerted to Principal. A new Customs seal may replace the container seal used by Forwarder or its CFS','LCL Consolidation',1),
('Suppliers must check for container quality, including free of odour, dirt, soil, mud, sand, leaf, tree litter, grain, insects, debris and contamination. No holes, dents and excess rust, door seals intact, etc. All containers should be checked for holes, e.g., by conducting a light test, and swept clean of debris, dirt, mud, soil, sand, leaf, tree litter, grain, insects and residues prior to loading. All damages to the goods by loading a dirty or damaged container will be the responsibility of the suppliers','FCL Program',1),
('Containers should be packed safely and restrained if goods are susceptible to shifting en route, e.g., cartons should not be column stacked.','FCL Program',1),
('Suppliers are required to take at least 4 photos of inner container during loading, one photo before loading, one photo when half of loading finished, one photo with container manifest after loading finished but before container door closed and one with clear view on container seal# after container door closed. All loading pictures must be reserved at least 3 months and should be presented to Forwarder or Principal per request','FCL Program',1),
('Suppliers to prepare Container Manifest','FCL Program',1);

DROP TABLE IF EXISTS waka.sop_services;
CREATE TABLE waka.sop_services(
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	service_id INT REFERENCES waka.services(service_id) ON DELETE CASCADE,
	service_name VARCHAR NOT NULL,
	unq_name VARCHAR GENERATED ALWAYS AS (REGEXP_REPLACE(LOWER(service_name),'\W','','g')) STORED,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(sop_id,unq_name)
);

---15/09/2021 /*SOP_port & Contract & PO tables*/

DROP TABLE IF EXISTS waka.sop_port;
CREATE TABLE waka.sop_port (
	sop_port_id SERIAL PRIMARY KEY,
	sop_id INT NOT NULL REFERENCES waka.sop(sop_id) ON DELETE CASCADE,
	principal_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	ff_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,
	origin_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	dest_port_id INT NOT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE (principal_id, origin_port_id, dest_port_id)
);	

DROP TABLE IF EXISTS waka.contract;
CREATE TABLE waka.contract (
	contract_id SERIAL PRIMARY KEY,
	principal_id INT REFERENCES waka.company(company_id) ON DELETE CASCADE,
	stakeholder_id INT REFERENCES waka.company(company_id) ON DELETE CASCADE,
	stakeholder_type_id INT REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,
	valid_from TIMESTAMPTZ,
	valid_to TIMESTAMPTZ,
	contract_no VARCHAR,
	uploaded_files VARCHAR[],
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	modified_on TIMESTAMPTZ,
	UNIQUE(principal_id, stakeholder_id, stakeholder_type_id, contract_no)
);

DROP TABLE IF EXISTS waka.contract_files;
CREATE TABLE waka.contract_files (
	c_f_id SERIAL PRIMARY KEY,
	contract_id INT REFERENCES waka.contract(contract_id) ON DELETE CASCADE,
	valid_from TIMESTAMPTZ,
	valid_to TIMESTAMPTZ,
	contract_no VARCHAR,
	uploaded_files VARCHAR[],
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS waka.raw_purchase_order;
CREATE TABLE waka.raw_purchase_order (
	raw_po_id bigserial primary key,
	raw_parent_po_id bigint,
	customer_po_no varchar,
	order_date timestamptz,
	status_cd int,
	is_blanket_order boolean,
	is_allocate_order boolean,
	is_bulk_order boolean,
	is_priority boolean,
	cbm decimal,
	supplier_name varchar,
	supplier_code varchar,
	customer_supplier_code varchar,
	origin_country varchar,
	port_of_loading varchar,
	port_of_discharge varchar,
	buyer_name varchar,
	buyer_dept varchar,
	buyer_agent_name varchar,
	payment_term varchar,
	usance_term varchar,
	season varchar,
	fty_name varchar,
	fty_cp_name varchar,
	fty_cp_phone_mob varchar,
	fty_cp_phone_work varchar,
	fty_cp_email varchar,
	fty_cp_wechatid varchar,
	fty_loc_country varchar,
	fty_loc_city varchar,
	fty_loc_addr varchar,
	currency_cd varchar,
	shimpent_mode varchar,	
	transport_type varchar,
	tpc varchar,
	created_on timestamptz not null default now()
);

DROP TABLE IF EXISTS waka.raw_purchase_order_items;
CREATE TABLE waka.raw_purchase_order_items (
	raw_poi_id bigserial primary key,
	raw_po_id bigint references waka.raw_purchase_order(raw_po_id) on delete cascade,
	item_no varchar,
	item_desc varchar,
	dest_cd varchar,
	dest_dc_cd varchar,
	incoterm varchar,
	incoterm_location varchar,
	item_article_no varchar,
	item_qty int NOT NULL,
	packing_unit decimal NOT NULL,
	volume varchar,
	item_wt varchar,
	uom_measurement varchar,
	unit_measurement decimal,
	uom_weight varchar,
	unit_weight decimal,
	pack_type varchar,
	colour varchar,
	size varchar,
	customer_sku varchar,
	unit_price decimal,
	tariff varchar,
	customer_ref_id varchar,
	product_category varchar,
	cargo_ready_date timestamptz,
	earliest_cargo_ready_date timestamptz,
	latest_cargo_ready_date timestamptz,
	delivery_date timestamptz,
	earliest_delivery_date timestamptz,
	latest_delivery_date timestamptz,
	promotion_no varchar,
	advertising_no varchar,
	ex_fty_date timestamptz,
	ship_not_before_date timestamptz,
	cancel_after_date timestamptz,
	carton_width_cm int,
	carton_depth_cm int,
	warehouse varchar,
	pcsperinner varchar,
	innersperouter varchar,
	seq int,
	supplier_sku varchar,
	is_dg boolean,
	is_fumigation boolean,
	is_scanpack boolean,
	is_compliance_check boolean,
	is_relabelling boolean,
	is_sewing boolean,
	is_repackaging boolean,
	is_slipsheet boolean,
	is_goh boolean,
	is_crating boolean,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS waka.principal_supplier_ref;
CREATE TABLE waka.principal_supplier_ref (
	psr_id bigserial primary key,
	buyer_name varchar,
	buyer_code varchar,
	waka_principal_cmp_id int not null references waka.company(company_id),
	name varchar,
	code varchar,
	waka_cmp_id int not null references waka.company(company_id),
	waka_account_type_id int not null references waka.company(company_id), /*supplier or factory or agent.*/
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.principal_port_ref;
CREATE TABLE waka.principal_port_ref (
	ppr_id bigserial primary key,
	port_name varchar,
	waka_port_id int not null references waka.port(port_id),
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.principal_country_ref;
CREATE TABLE waka.principal_country_ref (
	pcr_id bigserial primary key,
	country_name varchar,
	waka_country_id int not null references waka.country(country_id) on delete cascade,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.principal_shipment_ref;
CREATE TABLE waka.principal_shipment_ref (
	psi_id bigserial primary key,
	waka_principal_cmp_id int not null references waka.company(company_id),
	shimpent_mode varchar,
	waka_shimpent_mode_id int not null references waka.lookup_name(lookup_name_id), /*train or air or sea.*/
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.process_po_raw_history;
CREATE TABLE waka.process_po_raw_history (
	pprh_id bigserial primary key,
	raw_po_id bigint not null references waka.raw_purchase_order(raw_po_id),
	waka_company_id int not null references waka.company(company_id),
	port_name varchar[],
	country_name varchar[],
	shimpent_mode varchar[],
	is_processed boolean default false,
	failure_reason varchar,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.process_po;
CREATE TABLE waka.process_po (
	pp_id bigserial primary key,
	raw_po_id bigint not null references waka.raw_purchase_order(raw_po_id),
	waka_company_id int not null references waka.company(company_id),
	is_processed boolean default false,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.waka.purchase_order;
CREATE TABLE waka.waka.purchase_order (
	po_id bigserial primary key,
	raw_po_id bigint not null references waka.raw_purchase_order(raw_po_id),
	waka_principal_cmp_id int not null references waka.company(company_id),
	waka_supplier_cmp_id int not null references waka.company(company_id),
	waka_factory_cmp_id int references waka.company(company_id),
	waka_agent_cmp_id int references waka.company(company_id),
	waka_loading_port_id int not null references waka.port(port_id),
	waka_destination_port_id int not null references waka.port(port_id),
	waka_loading_country_id int not null references waka.country(country_id),
	waka_destination_country_id int not null references waka.country(country_id),
	waka_shimpent_mode_id int not null references waka.lookup_name(lookup_name_id),
	is_canceled boolean default false,
	is_amended boolean default false,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.purchase_order_items;
CREATE TABLE waka.purchase_order_items (
	poi_id bigserial primary key,
	po_id bigint references waka.purchase_order(po_id) on delete cascade,
	item_no varchar,
	item_desc varchar,
	dest_cd varchar,
	dest_dc_cd varchar,
	incoterm varchar,
	incoterm_location varchar,
	item_article_no varchar,
	item_qty int NOT NULL,
	packing_unit decimal NOT NULL,
	volume varchar,
	item_wt varchar,
	uom_measurement varchar,
	unit_measurement decimal,
	uom_weight varchar,
	unit_weight decimal,
	pack_type varchar,
	colour varchar,
	size varchar,
	customer_sku varchar,
	unit_price decimal,
	tariff varchar,
	customer_ref_id varchar,
	product_category varchar,
	cargo_ready_date timestamptz,
	earliest_cargo_ready_date timestamptz,
	latest_cargo_ready_date timestamptz,
	delivery_date timestamptz,
	earliest_delivery_date timestamptz,
	latest_delivery_date timestamptz,
	promotion_no varchar,
	advertising_no varchar,
	ex_fty_date timestamptz,
	ship_not_before_date timestamptz,
	cancel_after_date timestamptz,
	carton_width_cm int,
	carton_depth_cm int,
	warehouse varchar,
	pcsperinner varchar,
	innersperouter varchar,
	seq int,
	supplier_sku varchar,
	is_dg boolean,
	is_fumigation boolean,
	is_scanpack boolean,
	is_compliance_check boolean,
	is_relabelling boolean,
	is_sewing boolean,
	is_repackaging boolean,
	is_slipsheet boolean,
	is_goh boolean,
	is_crating boolean,
	created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE,
	created_on TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_by INT,
	modified_on TIMESTAMPTZ
);

DROP TABLE IF EXISTS waka.purchase_order_remarks;
CREATE TABLE waka.purchase_order_remarks (
	por_id bigserial primary key,
	po_id bigint references waka.purchase_order(po_id) on delete cascade,
	por_text varchar,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

DROP TABLE IF EXISTS waka.purchase_order_item_remarks;
CREATE TABLE waka.purchase_order_item_remarks (
	pir_id bigserial primary key,
	po_id bigint references waka.purchase_order(po_id) on delete cascade,
	pir_text varchar,
	created_by int not null references waka.login_user(user_id) on delete cascade,
	created_on timestamptz not null default now(),
	modified_by int,
	modified_on timestamptz
);

