"use strict";

module.exports = (sequelize, DataTypes) => {
  const Logs = sequelize.define(
    "Logs",
    {
      operationId: DataTypes.INTEGER,
      creatorId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      fileName: DataTypes.STRING,
      users: DataTypes.STRING,
      type: DataTypes.STRING,
    },
    {}
  );
  Logs.associate = (models) => {
    Logs.belongsTo(models.Users, { foreignKey: "creatorId" });
    Logs.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return Logs;
};
