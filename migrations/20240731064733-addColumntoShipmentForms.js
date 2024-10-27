"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("ShipmentForms", "customsLocation", {
        type: Sequelize.STRING,
      }),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("ShipmentForms", "customsLocation"),
    ]);
  },
};
