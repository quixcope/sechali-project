"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Freights", "referanceCode", {
        type: Sequelize.BIGINT,
      }),
      queryInterface.renameColumn(
        "Freights",
        "procurementOfficer",
        "purchasingRep"
      ),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Freights", "referanceCode"),
      queryInterface.renameColumn(
        "Freights",
        "purchasingRep",
        "procurementOfficer"
      ),
    ]);
  },
};
