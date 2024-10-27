"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Invoices", "invoiceCategory", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Operations", "incomingInvoiceNo", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Operations", "outgoingInvoiceNo", {
        type: Sequelize.STRING,
      }),
    ]);
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Invoices", "invoiceCategory"),
      queryInterface.addColumn("Operations", "incomingInvoiceNo"),
      queryInterface.addColumn("Operations", "outgoingInvoiceNo"),
    ]);
  },
};
