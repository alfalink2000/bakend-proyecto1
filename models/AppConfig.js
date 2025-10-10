// models/AppConfig.js
const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const AppConfig = db.define(
  "AppConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    app_name: {
      type: DataTypes.STRING(255),
      defaultValue: "Minimarket Digital",
    },
    app_description: {
      type: DataTypes.TEXT,
      defaultValue: "Tu tienda de confianza",
    },
    theme: {
      type: DataTypes.ENUM("blue", "green", "purple", "orange", "rose"),
      defaultValue: "blue",
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      defaultValue: "+5491112345678",
    },
    business_hours: {
      type: DataTypes.STRING(100),
      defaultValue: "Lun-Vie: 8:00 - 20:00",
    },
    business_address: {
      type: DataTypes.TEXT,
      defaultValue: "Av. Principal 123",
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "app_config",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = AppConfig;
