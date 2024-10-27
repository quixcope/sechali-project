"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("session", {
      sid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      sess: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      expire: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("session");
  },
};
