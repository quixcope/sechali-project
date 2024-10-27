"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "deliveryCompany"),
      queryInterface.addColumn("Freights", "deliveryCompany", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "deliveryCompany", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Freights", "deliveryCompany"),
    ]);
  },
};
