"use strict";

module.exports = (sequelize, DataTypes) => {
  const Customers = sequelize.define(
    "Customers",
    {
      customerName: DataTypes.STRING,
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
    },
    {}
  );
  Customers.associate = (models) => {
    Customers.hasMany(models.CustomerForms, { foreignKey: "customerId" });
  };
  return Customers;
};
