"use strict";

module.exports = (sequelize, DataTypes) => {
  const Addresses = sequelize.define(
    "Addresses",
    {
      address: DataTypes.STRING,
      type: DataTypes.STRING,
      freightId: DataTypes.INTEGER,
    },
    {}
  );
  Addresses.associate = (models) => {
    Addresses.belongsTo(models.Freights, { foreignKey: "freightId" });
  };
  return Addresses;
};
