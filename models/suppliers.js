"use strict";

module.exports = (sequelize, DataTypes) => {
  const Suppliers = sequelize.define(
    "Suppliers",
    {
      supplierName: DataTypes.STRING,
      address: DataTypes.STRING,
      postcode: DataTypes.STRING,
      email: DataTypes.STRING,
      sCode: DataTypes.STRING,
      phone: DataTypes.STRING,
      fax: DataTypes.STRING,
      taxnr: DataTypes.STRING,
      taxoffice: DataTypes.STRING,
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      contacts: DataTypes.JSON,
    },
    {}
  );
  Suppliers.associate = (models) => {
    Suppliers.hasMany(models.Operations, { foreignKey: "carrierCompany" });
  };
  return Suppliers;
};
