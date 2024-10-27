"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      phone: DataTypes.STRING,
      authToken: DataTypes.INTEGER,
      lang: DataTypes.STRING,
      projectType: DataTypes.STRING,
    },
    {}
  );

  Users.beforeSave((user) => {
    if (user.changed("password")) {
      user.password = bcrypt.hashSync(
        user.password,
        bcrypt.genSaltSync(10),
        null
      );
    }
  });
  Users.prototype.comparePassword = (passw, cb) => {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };

  Users.associate = (models) => {
    Users.hasMany(models.Logs, { foreignKey: "creatorId" });
    Users.hasMany(models.Freights, {
      foreignKey: "purchasingRep",
      as: "PurchasingRep",
    });
    Users.hasMany(models.Freights, {
      foreignKey: "operationManager",
      as: "OperationManager",
    });
  };
  return Users;
};
