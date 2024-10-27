"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("PaymentTrackings", "paymentStatus"),
      queryInterface.removeColumn("PaymentTrackings", "logisticSalesFee"),
      queryInterface.removeColumn(
        "PaymentTrackings",
        "agreedTransportationFee"
      ),
      queryInterface.removeColumn("PaymentTrackings", "profit"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("PaymentTrackings", "paymentStatus", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("PaymentTrackings", "logisticSalesFee", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("PaymentTrackings", "agreedTransportationFee", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("PaymentTrackings", "profit", {
        type: Sequelize.DATE,
      }),
    ]);
  },
};
