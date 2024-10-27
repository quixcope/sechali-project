"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Freights", "supplierOffer", {
        type: Sequelize.DECIMAL(20, 4),
      }),
      queryInterface.changeColumn("Freights", "cash", {
        type: Sequelize.DECIMAL(20, 4),
      }),
      queryInterface.changeColumn("Freights", "price", {
        type: Sequelize.DECIMAL(20, 4),
      }),
      queryInterface.changeColumn("ShipmentForms", "domesticTPrice", {
        type: Sequelize.DECIMAL(20, 4),
      }),
      queryInterface.changeColumn("ShipmentForms", "totalDomTPrice", {
        type: Sequelize.DECIMAL(20, 4),
      }),
      queryInterface.changeColumn("ShipmentForms", "ydgAmount", {
        type: Sequelize.DECIMAL(20, 4),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Freights", "supplierOffer", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("Freights", "cash", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("Freights", "price", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("ShipmentForms", "domesticTPrice", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("ShipmentForms", "totalDomTPrice", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("ShipmentForms", "ydgAmount", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};
