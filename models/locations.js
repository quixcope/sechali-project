"use strict";

module.exports = (sequelize, DataTypes) => {
  const Locations = sequelize.define(
    "Locations",
    {
      operationId: DataTypes.INTEGER,
      loc: DataTypes.GEOMETRY("POINT", 4326),
      map: DataTypes.JSON,
      plate: DataTypes.STRING,
    },
    {}
  );

  Locations.associate = (models) => {
    Locations.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return Locations;
};
