"use strict";

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
    ALTER TABLE "Operations"
    ALTER COLUMN "referanceCode" TYPE BIGINT
    USING ("referanceCode"::BIGINT)
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Operations", "referanceCode", {
      type: Sequelize.STRING,
    });
  },
};
