"use strict";

module.exports = (sequelize, DataTypes) => {
  const Vehicles = sequelize.define(
    "Vehicles",
    {
      driverName: DataTypes.STRING,
      driverNo: DataTypes.STRING,
      driverIdNo: DataTypes.STRING,
      operationId: DataTypes.INTEGER,
      frontPlate: DataTypes.STRING,
      trailerPlate: DataTypes.STRING,
    },
    {}
  );
  Vehicles.associate = (models) => {
    Vehicles.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return Vehicles;
};
