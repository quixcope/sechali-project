"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "notIds"),
      queryInterface.removeColumn("Operations", "mId"),
      queryInterface.addColumn("GeneralNotes", "opId", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.removeColumn("Operations", "referanceCode"),
      queryInterface.addColumn("Freights", "referanceCode", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Freights", "orderNo"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "notIds", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      }),
      queryInterface.removeColumn("GeneralNotes", "opId"),
      queryInterface.addColumn("Operations", "mId", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      }),
      queryInterface.addColumn("Operations", "referanceCode", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.removeColumn("Freights", "referanceCode"),
      queryInterface.addColumn("Freights", "orderNo", {
        type: Sequelize.BIGINT,
      }),
    ]);
  },
};
