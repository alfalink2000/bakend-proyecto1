// models/FeaturedProducts.js
const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const FeaturedProducts = db.define(
  "featured_products",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    popular: {
      type: DataTypes.JSON, // Almacenamos array de IDs como JSON
      allowNull: false,
      defaultValue: [],
    },
    on_sale: {
      type: DataTypes.JSON, // Almacenamos array de IDs como JSON
      allowNull: false,
      defaultValue: [],
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
