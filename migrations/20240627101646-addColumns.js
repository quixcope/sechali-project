"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "deliveryDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("Freights", "operationManager", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "deliveryDate"),
      queryInterface.removeColumn("Freights", "operationManager"),
    ]);
  },
};
