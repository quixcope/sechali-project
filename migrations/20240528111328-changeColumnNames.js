"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("Freights", "paymentDate", "cLastPayDay"),
      queryInterface.renameColumn("Freights", "sPaymentDate", "sLastPayDay"),
      queryInterface.renameColumn("Freights", "maturityDay", "cMaturityDay"),
      queryInterface.renameColumn("Freights", "maturity", "cMaturity"),
      queryInterface.renameColumn(
        "Freights",
        "paymentMethod",
        "cPaymentMethod"
      ),
      queryInterface.addColumn("Operations", "cPaidDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("Operations", "sPaidDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.removeColumn("Operations", "cPaymentStatus"),
      queryInterface.removeColumn("Operations", "sPaymentStatus"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("Freights", "cLastPayDay", "paymentDate"),
      queryInterface.renameColumn("Freights", "sLastPayDay", "sPaymentDate"),
      queryInterface.renameColumn("Freights", "cMaturityDay", "maturityDay"),
      queryInterface.renameColumn("Freights", "cMaturity", "maturity"),
      queryInterface.renameColumn(
        "Freights",
        "cPaymentMethod",
        "paymentMethod"
      ),
      queryInterface.removeColumn("Operations", "cPaidDate"),
      queryInterface.removeColumn("Operations", "sPaidDate"),
      queryInterface.addColumn("Operations", "cPaymentStatus", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "sPaymentStatus", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
