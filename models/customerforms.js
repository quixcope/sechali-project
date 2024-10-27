"use strict";

module.exports = (sequelize, DataTypes) => {
  const CustomerForms = sequelize.define(
    "CustomerForms",
    {
      customerId: DataTypes.INTEGER,
      relatedPersonMail: DataTypes.STRING,
      relatedPersonMail2: DataTypes.STRING,
      mobilePhone: DataTypes.STRING,
      taxPayer: DataTypes.STRING,
      invoiceSendingEA: DataTypes.STRING,
      currentReconliation: DataTypes.STRING,
      kepAddress: DataTypes.STRING,
      webAddress: DataTypes.STRING,
      requestingPerson: DataTypes.STRING,
      relatedDepartment: DataTypes.STRING,
      serviceProvided: DataTypes.STRING,
      paymentTerm: DataTypes.STRING,
      creditLimit: DataTypes.STRING,
      date: DataTypes.DATEONLY,
      uuId: DataTypes.STRING,
      contactId: DataTypes.INTEGER,
      type: DataTypes.STRING,
    },
    {}
  );
  CustomerForms.associate = (models) => {
    CustomerForms.hasMany(models.Freights, { foreignKey: "cFormId" });
    CustomerForms.belongsTo(models.Contacts, { foreignKey: "contactId" });
    CustomerForms.belongsTo(models.Customers, { foreignKey: "customerId" });
    CustomerForms.hasMany(models.Files, { foreignKey: "relatedId" });
  };
  return CustomerForms;
};
