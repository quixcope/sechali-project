"use strict";

module.exports = (sequelize, DataTypes) => {
  const Confirmations = sequelize.define(
    "Confirmations",
    {
      name: DataTypes.STRING,
      ip: DataTypes.STRING,
      freightId: DataTypes.STRING,
    },
    {}
  );
  Confirmations.associate = (models) => {
    Confirmations.belongsTo(models.Freights, { foreignKey: "freightId" });
  };
  return Confirmations;
};
