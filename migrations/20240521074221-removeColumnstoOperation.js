"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "vehiclePlate"),
      queryInterface.removeColumn("Operations", "driverNo"),
      queryInterface.removeColumn("Operations", "driverIdNo"),
      queryInterface.removeColumn("Operations", "driverName"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "vehiclePlate", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "driverNo", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "driverIdNo", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "driverName", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
