"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Customers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customerName: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      postcode: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      sCode: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      fax: {
        type: Sequelize.STRING,
      },
      taxnr: {
        type: Sequelize.STRING,
      },
      taxoffice: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("Customers");
  },
};
