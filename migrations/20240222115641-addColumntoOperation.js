"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "carrierCompany", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "carrierCompany"),
    ]);
  },
};
