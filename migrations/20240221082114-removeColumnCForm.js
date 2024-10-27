"use strict";

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("CustomerForms", "paymentDay"),
      queryInterface.removeColumn("CustomerForms", "lastPaymentDay"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("CustomerForms", "paymentDay", {
        type: Sequelize.DATEONLY,
      }),
      queryInterface.addColumn("CustomerForms", "lastPaymentDay", {
        type: Sequelize.DATEONLY,
      }),
    ]);
  },
};
