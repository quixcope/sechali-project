"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Settings", "colorSettings", {
        type: Sequelize.JSON,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Settings", "colorSettings"),
    ]);
  },
};
