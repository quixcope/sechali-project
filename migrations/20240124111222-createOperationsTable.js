"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Operations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      operationName: {
        type: Sequelize.STRING,
      },
      creatorId: {
        type: Sequelize.INTEGER,
      },
      freightId: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATE,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      vehiclePlate: {
        type: Sequelize.STRING,
      },
      driverNo: {
        type: Sequelize.STRING,
      },
      driverName: {
        type: Sequelize.STRING,
      },
      driverIdNo: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      mId: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      vat: {
        type: Sequelize.INTEGER,
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 4),
      },
      outgoingInvoiceNo: {
        type: Sequelize.STRING,
      },
      incomingInvoiceNo: {
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
    return queryInterface.dropTable("Operations");
  },
};
