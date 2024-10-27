"use strict";

module.exports = (sequelize, DataTypes) => {
  const Mails = sequelize.define(
    "Mails",
    {
      creatorId: DataTypes.INTEGER,
      uid: DataTypes.INTEGER,
      opId: DataTypes.INTEGER,
      references: DataTypes.STRING(65025),
      path: DataTypes.STRING,
    },
    {}
  );
  Mails.associate = (models) => {
    Mails.belongsTo(models.Operations, { foreignKey: "opId" });
  };
  return Mails;
};
