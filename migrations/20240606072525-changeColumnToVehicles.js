"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Vehicles", "vehiclePlate"),
      queryInterface.addColumn("Vehicles", "frontPlate", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Vehicles", "trailerPlate", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Vehicles", "vehiclePlate", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Vehicles", "frontPlate"),
      queryInterface.removeColumn("Vehicles", "trailerPlate"),
    ]);
  },
};
