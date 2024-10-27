"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "paymentDate", {
        type: Sequelize.DATEONLY,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Freights", "paymentDate"),
    ]);
  },
};
