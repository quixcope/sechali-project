"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Operations", "cPaymentStatus", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "sPaymentDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("Operations", "sPaymentStatus", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "sMaturityDay", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "sPaymentMethod", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "sPaymentDate", {
        type: Sequelize.DATEONLY,
      }),
      queryInterface.addColumn("Freights", "sMaturity", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Operations", "cPaymentStatus"),
      queryInterface.removeColumn("Operations", "sPaymentDate"),
      queryInterface.removeColumn("Operations", "sPaymentStatus"),
      queryInterface.removeColumn("Freights", "sMaturityDay"),
      queryInterface.removeColumn("Freights", "sPaymentMethod"),
      queryInterface.removeColumn("Freights", "sPaymentDate"),
      queryInterface.removeColumn("Freights", "sMaturity"),
    ]);
  },
};
