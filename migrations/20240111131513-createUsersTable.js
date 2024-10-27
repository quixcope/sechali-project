"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      authToken: {
        type: Sequelize.INTEGER,
      },
      lang: {
        type: Sequelize.STRING,
        defaultValue: "tr",
      },
      projectType: {
        type: Sequelize.STRING,
        defaultValue: "domestic",
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
    return queryInterface.dropTable("Users");
  },
};
