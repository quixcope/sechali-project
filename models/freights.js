"use strict";

module.exports = (sequelize, DataTypes) => {
  const Freights = sequelize.define(
    "Freights",
    {
      relatedPerson: DataTypes.STRING,
      companyName: DataTypes.STRING,
      companyAddress: DataTypes.STRING,
      purchasingRep: DataTypes.INTEGER,
      YDG: DataTypes.BOOLEAN,
      productType: DataTypes.STRING,
      weightType: DataTypes.STRING,
      currency: DataTypes.STRING,
      loadDate: DataTypes.DATEONLY,
      orderDate: DataTypes.DATEONLY,
      deliveryDate: DataTypes.STRING,
      shippingType: DataTypes.STRING,
      cFormId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      cPaymentMethod: DataTypes.STRING,
      cMaturity: DataTypes.STRING,
      sMaturity: DataTypes.STRING,
      cMaturityDay: DataTypes.STRING,
      cLastPayDay: DataTypes.DATEONLY,
      active: DataTypes.BOOLEAN,
      sLastPayDay: DataTypes.DATEONLY,
      sMaturityDay: DataTypes.STRING,
      sPaymentMethod: DataTypes.STRING,
      supplierOffer: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("supplierOffer"));
        },
      },
      cash: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("cash"));
        },
      },
      price: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("price"));
        },
      },
      referanceCode: DataTypes.BIGINT,
      deliveryCompany: DataTypes.STRING,
      operationManager: DataTypes.INTEGER,
    },
    {}
  );
  Freights.associate = (models) => {
    Freights.hasMany(models.Operations, { foreignKey: "freightId" });
    Freights.belongsTo(models.CustomerForms, { foreignKey: "cFormId" });
    Freights.belongsTo(models.Users, {
      foreignKey: "purchasingRep",
      as: "PurchasingRep",
    });
    Freights.belongsTo(models.Users, {
      foreignKey: "operationManager",
      as: "OperationManager",
    });
    Freights.hasMany(models.Addresses, { foreignKey: "freightId" });
    Freights.hasOne(models.Confirmations, { foreignKey: "freightId" });
  };
  return Freights;
};
