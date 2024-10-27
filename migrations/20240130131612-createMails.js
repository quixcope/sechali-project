"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Mails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      creatorId: {
        type: Sequelize.INTEGER,
      },
      uid: {
        type: Sequelize.INTEGER,
      },
      opId: {
        type: Sequelize.INTEGER,
      },
      references: {
        type: Sequelize.STRING(65025),
      },
      path: {
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
    return queryInterface.dropTable("Mails");
  },
};
