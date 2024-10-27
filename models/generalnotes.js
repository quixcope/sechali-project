"use strict";

module.exports = (sequelize, DataTypes) => {
  const GeneralNotes = sequelize.define(
    "GeneralNotes",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      creatorId: DataTypes.INTEGER,
      userIds: DataTypes.ARRAY(DataTypes.INTEGER),
      type: DataTypes.STRING,
      opId: DataTypes.INTEGER,
    },
    {}
  );
  GeneralNotes.associate = (models) => {
    GeneralNotes.belongsTo(models.Operations, { foreignKey: "opId" });
  };
  return GeneralNotes;
};
