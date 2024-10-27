"use strict";

module.exports = (sequelize, DataTypes) => {
  const Invoices = sequelize.define(
    "Invoices",
    {
      ficheNo: DataTypes.STRING,
      guid: DataTypes.STRING,
      type: DataTypes.STRING,
      operationId: DataTypes.INTEGER,
      invoiceCategory: DataTypes.STRING,
    },
    {}
  );
  Invoices.associate = (models) => {
    Invoices.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return Invoices;
};
