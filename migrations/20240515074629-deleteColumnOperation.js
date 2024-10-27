"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "operationName"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "operationName", {
        type: Sequelize.ARRAY(Sequelize.STRING),
      }),
    ]);
  },
};
