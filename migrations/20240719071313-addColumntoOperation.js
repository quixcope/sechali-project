"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "isCancelled", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "isCancelled"),
    ]);
  },
};
