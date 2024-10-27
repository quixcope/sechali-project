"use strict";

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE "Freights"
      ALTER COLUMN "orderNo" TYPE BIGINT
      USING ("orderNo"::BIGINT)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Freights", "orderNo", {
      type: Sequelize.STRING,
    });
  },
};
