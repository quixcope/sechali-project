"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("ShipmentForms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      operationId: {
        type: Sequelize.INTEGER,
      },
      customInformation: {
        type: Sequelize.STRING,
      },
      documentDelivery: {
        type: Sequelize.STRING,
      },
      borderCrossing: {
        type: Sequelize.STRING,
      },
      domesticTransp: {
        type: Sequelize.STRING,
      },
      domesticTPrice: {
        type: Sequelize.INTEGER,
      },
      totalDomTPrice: {
        type: Sequelize.INTEGER,
      },
      deliveryCompany: {
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
    return queryInterface.dropTable("ShipmentForms");
  },
};
