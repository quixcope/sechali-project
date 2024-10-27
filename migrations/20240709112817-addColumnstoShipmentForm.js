"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("ShipmentForms", "ydg", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("ShipmentForms", "ydgAmount", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("ShipmentForms", "ydgCurrency", {
        type: Sequelize.STRING,
      }),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("ShipmentForms", "ydg"),
      queryInterface.removeColumn("ShipmentForms", "ydgAmount"),
      queryInterface.removeColumn("ShipmentForms", "ydgCurrency"),
    ]);
  },
};
