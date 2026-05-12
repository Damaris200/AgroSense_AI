-- AgroSense AI — PostgreSQL initialization
-- Runs once on first boot when the data volume is empty.
-- farm_db is already created via POSTGRES_DB env var.

\c postgres

CREATE DATABASE auth_db;
CREATE DATABASE weather_db;
CREATE DATABASE soil_db;
CREATE DATABASE ai_db;
CREATE DATABASE notification_db;
CREATE DATABASE analytics_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db         TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE farm_db         TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE weather_db      TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE soil_db         TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE ai_db           TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO agrosense;
GRANT ALL PRIVILEGES ON DATABASE analytics_db    TO agrosense;
