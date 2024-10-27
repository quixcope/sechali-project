"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "customInformation"),
      queryInterface.removeColumn("Operations", "documentDelivery"),
      queryInterface.removeColumn("Operations", "borderCrossing"),
      queryInterface.removeColumn("Operations", "domesticTransp"),
      queryInterface.removeColumn("Operations", "domesticTPrice"),
      queryInterface.removeColumn("Operations", "totalDomTPrice"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "customInformation", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "documentDelivery", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "borderCrossing", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "domesticTransp", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "domesticTPrice", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("Operations", "totalDomTPrice", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};
