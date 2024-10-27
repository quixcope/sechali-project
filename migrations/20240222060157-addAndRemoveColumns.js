"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("CustomerForms", "cash"),
      queryInterface.removeColumn("CustomerForms", "maturityDay"),
      queryInterface.removeColumn("CustomerForms", "paymentMethod"),
      queryInterface.removeColumn("CustomerForms", "currency"),
      queryInterface.removeColumn("CustomerForms", "maturity"),
      queryInterface.removeColumn("CustomerForms", "companyName"),
      queryInterface.removeColumn("CustomerForms", "companyAddress"),
      queryInterface.removeColumn("CustomerForms", "addressCityTown"),
      queryInterface.removeColumn("CustomerForms", "phone"),
      queryInterface.removeColumn("CustomerForms", "fax"),
      queryInterface.removeColumn("CustomerForms", "taxOffice"),
      queryInterface.removeColumn("CustomerForms", "taxNumber"),
      queryInterface.addColumn("CustomerForms", "customerId", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("Freights", "cash", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("Freights", "maturityDay", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "paymentMethod", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("Freights", "maturity", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("CustomerForms", "cash", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("CustomerForms", "maturityDay", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "paymentMethod", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "currency", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "maturity", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "companyName", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("CustomerForms", "companyAddress", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "addressCityTown", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "phone", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "fax", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "taxOffice", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("CustomerForms", "taxNumber", {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn("CustomerForms", "customerId"),
      queryInterface.removeColumn("Freights", "cash"),
      queryInterface.removeColumn("Freights", "maturityDay"),
      queryInterface.removeColumn("Freights", "paymentMethod"),
      queryInterface.removeColumn("Freights", "maturity"),
    ]);
  },
};
