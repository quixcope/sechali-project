"use strict";

module.exports = (sequelize, DataTypes) => {
  const Contacts = sequelize.define(
    "Contacts",
    { contact: DataTypes.JSON },
    {}
  );
  Contacts.associate = (models) => {
    Contacts.hasMany(models.CustomerForms, { foreignKey: "contactId" });
  };
  return Contacts;
};
