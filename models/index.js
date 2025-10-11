// models/index.js
const { db } = require("../database/connection");

// Importar modelos
const Product = require("./Product");
const Category = require("./Category");
const AppConfig = require("./AppConfig");
const User = require("./User");
const FeaturedProducts = require("./FeaturedProducts");

// Crear objeto de modelos
const models = {
  Product,
  Category,
  AppConfig,
  User,
  FeaturedProducts,
};

// Ejecutar asociaciones en cada modelo
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
