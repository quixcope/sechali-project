"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "deliveryCompany", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "referanceCode", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "deliveryCompany"),
      queryInterface.removeColumn("Operations", "referanceCode"),
    ]);
  },
};
