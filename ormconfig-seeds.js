const fs = require('fs');
const dotenv = require('dotenv');
const path = `./config/${process.env.NODE_ENV}.env`;
let config;

if (fs.existsSync(path)) {
  config = dotenv.parse(fs.readFileSync(path));
} else {
  config = { ...process.env };
}

module.exports = {
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  dropSchema: true,
  synchronize: true,
  entities: ['./src/**/domain/**.ts'],
  factories: ['./src/modules/database/factories/**.ts'],
  seeds: ['./src/modules/database/seeds/**.ts'],
};
