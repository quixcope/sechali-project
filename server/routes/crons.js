require("dotenv").config({ path: "../../.env" });
const express = require("express");
const router = express.Router();
const { sendSMS, apiLog, suppliers } = require("../functions.js");
const { DateTime } = require("luxon");
const cron = require("node-cron");
const cluster = require("cluster");
const Operations = require("../../models").Operations;
const Freights = require("../../models").Freights;
const Customers = require("../../models").Customers;
const Suppliers = require("../../models").Suppliers;
const axios = require("axios");

cron.schedule("0 9 * * *", async () => {
  try {
    if (cluster.isMaster && process.env.DEV_ENV == "NO") {
      const data = await Operations.findAll({
        where: { active: true },
        attributes: ["cPaymentDate"],
        include: [
          { model: Freights, attributes: ["companyName", "referanceCode"] },
        ],
      });
      const currentDate = DateTime.fromJSDate(new Date()).toFormat(
        "yyyy-MM-dd"
      );
      let paymentTime;
      for (let i = 0; i < data.length; i++) {
        paymentTime = Math.round(
          DateTime.fromJSDate(data[i].cPaymentDate)
            .diff(DateTime.fromISO(currentDate), ["days"])
            .toObject().days
        );
        if (paymentTime < 8 && paymentTime > 0 && data[i].Freight) {
          sendSMS(
            process.env.AUTHORIZED_PERSON_PHONE,
            `${data[i].Freight.referanceCode} referans kodlu operasyon için  ${data[i].Freight.companyName} isimli müşterinin ödeme gününün bitmesine son ${paymentTime} gün.Son tarih ${DateTime.fromJSDate(data[i].cPaymentDate).toFormat("dd-MM-yyyy")}`
          );
        }
      }
    }
  } catch (err) {
    apiLog("cron", "cron", err, "error", "informationPayment", "cron");
    console.log(err);
  }
});

cron.schedule("0 */2 * * *", async () => {
  try {
    if (cluster.isMaster && process.env.DEV_ENV == "NO") {
      const logoNumber = process.env.COMPANY_LOGO_NUMBER;
      const supRes = await axios.post(`${process.env.API_URL}/getSuppliers`, {
        apiKey: process.env.API_KEY,
        logoNumber: logoNumber,
      });
      const suppliers = supRes.data.data;
      if (supRes.data.success) {
        for (let j = 0; j < suppliers.length; j++) {
          const supplier = await Suppliers.findOne({
            where: { sCode: suppliers[j].CODE },
            attributes: ["id", "supplierName"],
          });
          if (!supplier) {
            await Suppliers.create({
              supplierName: suppliers[j]?.DEFINITION_,
              address: suppliers[j]?.ADDR1,
              email: suppliers[j]?.EMAILADDR,
              postcode: suppliers[j]?.POSTCODE,
              phone: suppliers[j]?.TELNRS1,
              country: suppliers[j]?.COUNTRY,
              city: suppliers[j]?.CITY,
              sCode: suppliers[j]?.CODE,
              taxnr: suppliers[j]?.TAXNR,
              taxoffice: suppliers[j]?.TAXOFFICE,
              fax: suppliers[j]?.FAXNR,
              contacts: [],
            });
          } else if (
            supplier &&
            supplier.supplierName !== suppliers[j]?.DEFINITION_
          ) {
            await Suppliers.update(
              {
                supplierName: suppliers[j]?.DEFINITION_,
                address: suppliers[j]?.ADDR1,
                email: suppliers[j]?.EMAILADDR,
                postcode: suppliers[j]?.POSTCODE,
                phone: suppliers[j]?.TELNRS1,
                country: suppliers[j]?.COUNTRY,
                city: suppliers[j]?.CITY,
                sCode: suppliers[j]?.CODE,
                taxnr: suppliers[j]?.TAXNR,
                taxoffice: suppliers[j]?.TAXOFFICE,
                fax: suppliers[j]?.FAXNR,
                contacts: [],
              },
              { where: { id: supplier.id } }
            );
          }
        }
      }
      const cusRes = await axios.post(`${process.env.API_URL}/getCustomers`, {
        apiKey: process.env.API_KEY,
        logoNumber: logoNumber,
      });
      const customers = cusRes.data.data;
      if (cusRes.data.success) {
        for (let l = 0; l < customers.length; l++) {
          const customer = await Customers.findOne({
            where: { sCode: customers[l].CODE },
            attributes: ["id", "customerName"],
          });
          if (!customer) {
            await Customers.create({
              customerName: customers[l]?.DEFINITION_,
              address: customers[l]?.ADDR1,
              email: customers[l]?.EMAILADDR,
              postcode: customers[l]?.POSTCODE,
              phone: customers[l]?.TELNRS1,
              country: customers[l]?.COUNTRY,
              city: customers[l]?.CITY,
              sCode: customers[l]?.CODE,
              taxnr: customers[l]?.TAXNR,
              taxoffice: customers[l]?.TAXOFFICE,
              fax: customers[l]?.FAXNR,
            });
          } else if (
            customer &&
            customer.customerName !== customers[l]?.DEFINITION_
          ) {
            await Customers.update(
              {
                customerName: customers[l]?.DEFINITION_,
                address: customers[l]?.ADDR1,
                email: customers[l]?.EMAILADDR,
                postcode: customers[l]?.POSTCODE,
                phone: customers[l]?.TELNRS1,
                country: customers[l]?.COUNTRY,
                city: customers[l]?.CITY,
                sCode: customers[l]?.CODE,
                taxnr: customers[l]?.TAXNR,
                taxoffice: customers[l]?.TAXOFFICE,
                fax: customers[l]?.FAXNR,
              },
              { where: { id: customer.id } }
            );
          }
        }
      }
    }
  } catch (err) {
    apiLog("cron", "cron", err, "error", "supplier-customers create", "cron");
    console.log(err);
  }
});

module.exports = router;
