"use strict";

module.exports = (sequelize, DataTypes) => {
  const Fines = sequelize.define(
    "Fines",
    {
      finesPrice: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("finesPrice"));
        },
      },
      currency: DataTypes.STRING,
      operationId: DataTypes.INTEGER,
    },
    {}
  );
  Fines.associate = (models) => {
    Fines.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return Fines;
};
