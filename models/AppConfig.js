// models/AppConfig.js
const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const AppConfig = db.define(
  "AppConfigs",
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
    initialinfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:
        "🌟 **Bienvenido a nuestro Minimarket Digital** 🌟\n\n¡Estamos encantados de tenerte aquí! En nuestro minimarket encontrarás productos de calidad, horario extendido y servicio personalizado.",
    },
    show_initialinfo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
