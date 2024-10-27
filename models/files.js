"use strict";

module.exports = (sequelize, DataTypes) => {
  const Files = sequelize.define(
    "Files",
    {
      path: DataTypes.STRING,
      relatedId: DataTypes.INTEGER,
      seen: DataTypes.BOOLEAN,
    },
    {}
  );
  Files.associate = (models) => {
    Files.belongsTo(models.CustomerForms, { foreignKey: "relatedId" });
  };
  return Files;
};
