"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("PaymentTrackings", "logisticCName"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("PaymentTrackings", "logisticCName", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
