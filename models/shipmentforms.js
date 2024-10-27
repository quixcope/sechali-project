"use strict";

module.exports = (sequelize, DataTypes) => {
  const ShipmentForms = sequelize.define(
    "ShipmentForms",
    {
      operationId: DataTypes.INTEGER,
      customInformation: DataTypes.STRING,
      documentDelivery: DataTypes.STRING,
      borderCrossing: DataTypes.STRING,
      domesticTransp: DataTypes.STRING,
      deliveryCompany: DataTypes.STRING,
      ydg: DataTypes.STRING,
      ydgCurrency: DataTypes.STRING,
      customsLocation: DataTypes.STRING,
      domesticTPrice: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("domesticTPrice"));
        },
      },
      totalDomTPrice: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("totalDomTPrice"));
        },
      },
      ydgAmount: {
        type: DataTypes.DECIMAL(20, 4),
        get() {
          return Number(this.getDataValue("ydgAmount"));
        },
      },
    },
    {}
  );
  ShipmentForms.associate = (models) => {
    ShipmentForms.belongsTo(models.Operations, { foreignKey: "operationId" });
  };
  return ShipmentForms;
};
