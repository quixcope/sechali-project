"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Freights", "country"),
      queryInterface.removeColumn("Freights", "region"),
      queryInterface.addColumn("Freights", "loadPoint", {
        type: Sequelize.JSON,
      }),
      queryInterface.addColumn("Freights", "active", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "country", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "region", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Freights", "loadPoint"),
      queryInterface.removeColumn("Freights", "active"),
    ]);
  },
};
