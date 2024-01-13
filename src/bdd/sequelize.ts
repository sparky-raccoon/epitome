import { Sequelize } from "sequelize";

const sequelize = new Sequelize("database", "username", "password", {
  dialect: "sqlite",
  host: "localhost",
  storage: process.env.NODE_ENV === "development" ? "database.dev.sqlite" : "database.sqlite",
  logging: false,
});

export default sequelize;
