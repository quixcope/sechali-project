"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Fines", "finesPrice", {
        type: Sequelize.DECIMAL(20, 4),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Fines", "notIds", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};
