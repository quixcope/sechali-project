"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Freights", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      relatedPerson: {
        type: Sequelize.STRING,
      },
      companyName: {
        type: Sequelize.STRING,
      },
      companyAddress: {
        type: Sequelize.STRING,
      },
      procurementOfficer: {
        type: Sequelize.INTEGER,
      },
      YDG: {
        type: Sequelize.BOOLEAN,
      },
      productType: {
        type: Sequelize.STRING,
      },
      deliveryAddress: {
        type: Sequelize.STRING,
      },
      weightType: {
        type: Sequelize.STRING,
      },
      currency: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL(10, 4),
      },
      loadDate: {
        type: Sequelize.DATEONLY,
      },
      orderDate: {
        type: Sequelize.DATEONLY,
      },
      deliveryDate: {
        type: Sequelize.STRING,
      },
      shippingType: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      region: {
        type: Sequelize.STRING,
      },
      orderNo: {
        type: Sequelize.STRING,
      },
      cFormId: {
        type: Sequelize.INTEGER,
      },
      type: {
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
    return queryInterface.dropTable("Freights");
  },
};
