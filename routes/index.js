// models/index.js - ARCHIVO SIMPLE DE CONVENIENCIA
const Product = require("./Product");
const Category = require("./Category");
const AppConfig = require("./appConfig");
const User = require("./User");
const FeaturedProducts = require("./featuredProducts");

module.exports = {
  Product,
  Category,
  AppConfig,
  User,
  FeaturedProducts,
};
