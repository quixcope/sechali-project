"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CustomerForms", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      companyName: {
        type: Sequelize.STRING,
      },
      companyAddress: {
        type: Sequelize.STRING,
      },
      addressCityTown: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      fax: {
        type: Sequelize.STRING,
      },
      taxOffice: {
        type: Sequelize.STRING,
      },
      taxNumber: {
        type: Sequelize.STRING,
      },
      relatedPersonMail: {
        type: Sequelize.STRING,
      },
      relatedPersonMail2: {
        type: Sequelize.STRING,
      },
      mobilePhone: {
        type: Sequelize.STRING,
      },
      taxPayer: {
        type: Sequelize.STRING,
      },
      invoiceSendingEA: {
        type: Sequelize.STRING,
      },
      currentReconliation: {
        type: Sequelize.STRING,
      },
      kepAddress: {
        type: Sequelize.STRING,
      },
      webAddress: {
        type: Sequelize.STRING,
      },
      requestingPerson: {
        type: Sequelize.STRING,
      },
      relatedDepartment: {
        type: Sequelize.STRING,
      },
      serviceProvided: {
        type: Sequelize.STRING,
      },
      paymentTerm: {
        type: Sequelize.STRING,
      },
      creditLimit: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      uuId: {
        type: Sequelize.STRING,
      },
      contactId: {
        type: Sequelize.INTEGER,
      },
      paymentMethod: {
        type: Sequelize.STRING,
      },
      paymentDay: {
        type: Sequelize.DATEONLY,
      },
      lastPaymentDay: {
        type: Sequelize.DATEONLY,
      },
      maturity: {
        type: Sequelize.STRING,
      },
      maturityDay: {
        type: Sequelize.STRING,
      },
      cash: {
        type: Sequelize.DECIMAL(10, 4),
      },
      currency: {
        type: Sequelize.STRING,
      },
      faxNr: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable("CustomerForms");
  },
};
