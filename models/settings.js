"use strict";

module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define(
    "Settings",
    {
      userId: DataTypes.INTEGER,
      EMAIL: DataTypes.JSON,
      colorSettings: DataTypes.JSON,
    },
    {}
  );

  return Settings;
};
