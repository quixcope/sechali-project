"use strict";

module.exports = (sequelize, DataTypes) => {
  const IpBlocks = sequelize.define(
    "IpBlocks",
    {
      ip: DataTypes.STRING,
    },
    {}
  );

  return IpBlocks;
};
