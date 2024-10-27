"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "colour", {
        type: Sequelize.STRING,
      }),
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
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "colour"),
      queryInterface.removeColumn("Operations", "customInformation"),
      queryInterface.removeColumn("Operations", "documentDelivery"),
      queryInterface.removeColumn("Operations", "borderCrossing"),
      queryInterface.removeColumn("Operations", "domesticTransp"),
      queryInterface.removeColumn("Operations", "domesticTPrice"),
      queryInterface.removeColumn("Operations", "totalDomTPrice"),
    ]);
  },
};
