-- AgroSense AI — Database-per-service init script
-- Runs automatically when the postgres container first starts.
-- Each service owns its DB and connects ONLY to its own.

CREATE DATABASE auth_db;
CREATE DATABASE farm_db;
CREATE DATABASE weather_db;
CREATE DATABASE soil_db;
CREATE DATABASE ai_db;
CREATE DATABASE notification_db;
CREATE DATABASE analytics_db;
