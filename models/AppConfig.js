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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Minimarket Digital",
    },
    app_description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Tu tienda de confianza",
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "blue",
    },
    whatsapp_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_hours: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: "es",
    },
  },
  {
    tableName: "app_configs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = AppConfig;
