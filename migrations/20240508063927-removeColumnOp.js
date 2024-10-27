"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "vat"),
      queryInterface.removeColumn("Operations", "totalPrice"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "vat", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("Operations", "totalPrice", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};
