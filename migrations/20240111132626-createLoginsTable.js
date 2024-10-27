"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Logins", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      email: {
        type: Sequelize.STRING,
      },
      count: {
        type: Sequelize.INTEGER,
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("Logins");
  },
};
