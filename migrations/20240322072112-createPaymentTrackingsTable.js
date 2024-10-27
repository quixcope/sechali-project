"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("PaymentTrackings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      operationId: {
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATE,
      },
      exportCountry: {
        type: Sequelize.STRING,
      },
      exportCustomer: {
        type: Sequelize.STRING,
      },
      logisticCName: {
        type: Sequelize.STRING,
      },
      logisticSalesFee: {
        type: Sequelize.INTEGER,
      },
      agreedTransportationFee: {
        type: Sequelize.INTEGER,
      },
      profit: {
        type: Sequelize.INTEGER,
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: "unpaid",
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
    return queryInterface.dropTable("PaymentTrackings");
  },
};
