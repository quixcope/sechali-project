"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "supplierOffer", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Freights", "supplierOffer"),
    ]);
  },
};
