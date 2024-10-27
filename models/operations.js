"use strict";

module.exports = (sequelize, DataTypes) => {
  const Operations = sequelize.define(
    "Operations",
    {
      creatorId: DataTypes.INTEGER,
      freightId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      date: DataTypes.DATE,
      active: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      userIds: DataTypes.ARRAY(DataTypes.INTEGER),
      cPaymentDate: DataTypes.DATE,
      sPaymentDate: DataTypes.DATE,
      carrierCompany: DataTypes.INTEGER,
      vehicleStatus: DataTypes.STRING(65534),
      colour: DataTypes.STRING,
      cPaidDate: DataTypes.DATE,
      sPaidDate: DataTypes.DATE,
      deliveryDate: DataTypes.DATE,
      isCancelled: DataTypes.BOOLEAN,
    },
    {}
  );
  Operations.associate = (models) => {
    Operations.belongsTo(models.Freights, { foreignKey: "freightId" });
    Operations.belongsTo(models.Suppliers, { foreignKey: "carrierCompany" });
    Operations.hasMany(models.PaymentTrackings, { foreignKey: "operationId" });
    Operations.hasMany(models.GeneralNotes, { foreignKey: "opId" });
    Operations.hasMany(models.Logs, { foreignKey: "operationId" });
    Operations.hasMany(models.Mails, { foreignKey: "opId" });
    Operations.hasMany(models.Vehicles, { foreignKey: "operationId" });
    Operations.hasOne(models.ShipmentForms, { foreignKey: "operationId" });
    Operations.hasMany(models.Locations, { foreignKey: "operationId" });
    Operations.hasMany(models.Fines, { foreignKey: "operationId" });
    Operations.hasMany(models.Invoices, { foreignKey: "operationId" });
  };
  return Operations;
};
