"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Operations", "totalPrice", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("Freights", "price", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("CustomerForms", "cash", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("Operations", "userIds", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      }),
      queryInterface.addColumn("Logs", "users", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Operations", "notIds", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      }),
      queryInterface.removeColumn("CustomerForms", "faxNr"),
      queryInterface.addColumn("Operations", "cPaymentDate", {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Operations", "totalPrice", {
        type: Sequelize.DECIMAL(10, 4),
      }),
      queryInterface.changeColumn("Freights", "price", {
        type: Sequelize.DECIMAL(10, 4),
      }),
      queryInterface.changeColumn("CustomerForms", "cash", {
        type: Sequelize.DECIMAL(10, 4),
      }),
      queryInterface.removeColumn("Operations", "userIds"),
      queryInterface.removeColumn("Logs", "users"),
      queryInterface.removeColumn("Operations", "notIds"),
      queryInterface.addColumn("CustomerForms", "faxNr", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("Operations", "cPaymentDate"),
    ]);
  },
};
