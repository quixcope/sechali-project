"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Freights", "loadPoint"),
      queryInterface.removeColumn("Freights", "deliveryAddress"),
      queryInterface.addColumn("Freights", "addresses", {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "loadPoint", {
        type: Sequelize.JSON,
      }),
      queryInterface.addColumn("Freights", "deliveryAddress", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Freights", "addresses"),
    ]);
  },
};
