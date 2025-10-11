const { DataTypes } = require("sequelize");
const { db } = require("../database/connection");

const Product = db.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true,
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      validate: {
        min: 1,
      },
    },
    image_url: {
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
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "available",
      validate: {
        isIn: {
          args: [["available", "outOfStock"]],
          msg: "El estado debe ser 'available' o 'outOfStock'",
        },
      },
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true,
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
    tableName: "products",
    indexes: [
      {
        fields: ["category_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["name"],
      },
    ],
  }
);

// ✅ AGREGAR ASOCIACIÓN DESPUÉS de definir el modelo
Product.associate = function (models) {
  Product.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });
};

module.exports = Product;
