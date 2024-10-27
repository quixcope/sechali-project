"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("Freights", "addresses")]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "addresses", {
        type: Sequelize.JSON,
      }),
    ]);
  },
};
