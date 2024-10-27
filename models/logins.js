"use strict";

module.exports = (sequelize, DataTypes) => {
  const Logins = sequelize.define(
    "Logins",
    { email: DataTypes.STRING, count: DataTypes.INTEGER },
    {}
  );

  return Logins;
};
