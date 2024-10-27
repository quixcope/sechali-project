"use strict";

module.exports = (sequelize, DataTypes) => {
  const PaymentTrackings = sequelize.define(
    "PaymentTrackings",
    {
      operationId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      exportCountry: DataTypes.STRING,
      exportCustomer: DataTypes.STRING,
    },
    {}
  );
  PaymentTrackings.associate = (models) => {
    PaymentTrackings.belongsTo(models.Operations, {
      foreignKey: "operationId",
    });
  };
  return PaymentTrackings;
};
