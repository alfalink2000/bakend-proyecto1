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
      validate: {
        len: [1, 255],
      },
    },
    app_description: {
      type: DataTypes.TEXT,
      defaultValue: "Tu tienda de confianza",
    },
    theme: {
      type: DataTypes.STRING(20),
      defaultValue: "blue",
      validate: {
        isIn: {
          args: [["blue", "green", "purple", "orange", "rose"]],
          msg: "El tema debe ser uno de: blue, green, purple, orange, rose",
        },
      },
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      defaultValue: "+5491112345678",
      validate: {
        len: [1, 20],
      },
    },
    business_hours: {
      type: DataTypes.STRING(100),
      defaultValue: "Lun-Vie: 8:00 - 20:00",
      validate: {
        len: [1, 100],
      },
    },
    business_address: {
      type: DataTypes.TEXT,
      defaultValue: "Av. Principal 123",
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida",
          protocols: ["http", "https"],
          require_protocol: true,
        },
        len: [0, 500],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
