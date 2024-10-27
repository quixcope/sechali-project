"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Vehicles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      driverName: {
        type: Sequelize.STRING,
      },
      driverNo: {
        type: Sequelize.STRING,
      },
      driverIdNo: {
        type: Sequelize.STRING,
      },
      vehiclePlate: {
        type: Sequelize.STRING,
      },
      operationId: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable("Vehicles");
  },
};
