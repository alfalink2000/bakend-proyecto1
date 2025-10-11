// models/FeaturedProducts.js
const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const FeaturedProducts = db.define(
  "FeaturedProducts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    popular: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidJSON(value) {
          try {
            if (typeof value === "string") {
              JSON.parse(value);
            } else if (!Array.isArray(value)) {
              throw new Error("Debe ser un array JSON");
            }
          } catch (error) {
            throw new Error("Formato JSON inválido para popular");
          }
        },
      },
    },
    on_sale: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidJSON(value) {
          try {
            if (typeof value === "string") {
              JSON.parse(value);
            } else if (!Array.isArray(value)) {
              throw new Error("Debe ser un array JSON");
            }
          } catch (error) {
            throw new Error("Formato JSON inválido para on_sale");
          }
        },
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "featured_products",
  }
);

module.exports = FeaturedProducts;
