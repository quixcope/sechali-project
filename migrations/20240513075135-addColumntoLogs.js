"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Logs", "type", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "vehicleStatus", {
        type: Sequelize.STRING(65534),
      }),
      queryInterface.removeColumn("Freights", "referanceCode", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Logs", "type"),
      queryInterface.removeColumn("Operations", "vehicleStatus"),
      queryInterface.addColumn("Freights", "referanceCode", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
