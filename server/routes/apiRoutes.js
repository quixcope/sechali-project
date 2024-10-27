const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const { ensureAuthenticated } = require("../../config/auth");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { sendSMS, apiLog, makeid, convertCurrency } = require("../functions.js");
const Suppliers = require("../../models").Suppliers;
const CustomerForms = require("../../models").CustomerForms;
const Customers = require("../../models").Customers;
const Users = require("../../models").Users;
const Freights = require("../../models").Freights;
const Logs = require("../../models").Logs;
const Operations = require("../../models").Operations;
const GeneralNotes = require("../../models").GeneralNotes;
const Contacts = require("../../models").Contacts;
const Settings = require("../../models").Settings;
const Mails = require("../../models").Mails;
const IpBlocks = require("../../models").IpBlocks;
const PaymentTrackings = require("../../models").PaymentTrackings;
const Files = require("../../models").Files;
const Addresses = require("../../models").Addresses;
const Vehicles = require("../../models").Vehicles;
const Logins = require("../../models").Logins;
const Confirmations = require("../../models").Confirmations;
const ShipmentForms = require("../../models").ShipmentForms;
const Locations = require("../../models").Locations;
const Fines = require("../../models").Fines;
const Invoices = require("../../models").Invoices;
const path = require("path");
const { DateTime } = require("luxon");
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const PdfPrinter = require("pdfmake");
const MailComposer = require("nodemailer/lib/mail-composer");

router.post("/getSuppliers", ensureAuthenticated, async (req, res) => {
  try {
    let supplier = [];
    const { rows, count } = await Suppliers.findAndCountAll({
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      order: [["updatedAt", "desc"]],
      where: { supplierName: { [Op.iLike]: `%${req.body.search}%` } },
    });
    let total = Math.ceil(count / Number(req.body.perPage));
    const suppdata = await Suppliers.findAll({
      attributes: ["id", "supplierName"],
    });
    for (let i = 0; i < suppdata.length; i++) {
      supplier.push(suppdata[i].supplierName);
    }
    const supp = [...new Set([...supplier])];
    res.json({
      success: true,
      data: { suppliersData: rows, count, suppliers: supp, total },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/createSupplier", ensureAuthenticated, async (req, res) => {
  try {
    if (!req.body.edit) {
      await Suppliers.create(req.body);
    } else {
      let data = JSON.parse(JSON.stringify(req.body));
      const id = data.id;
      delete data.id;
      await Suppliers.update(data, { where: { id: id } });
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/createCustomerForms", async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    const id = data.id;
    delete data.id;
    if (req.body.checkUpdate) {
      let cont;
      let contacts = [];
      const contact = [
        data.importauthority,
        data.exportauthority,
        data.accountingofficer,
        data.financeofficer,
      ];
      for (let l = 0; l < contact.length; l++) {
        if (contact[l].name !== "") contacts.push(contact[l]);
      }
      if (data.contactId) {
        await Contacts.update(
          { contact: contacts },
          { where: { id: data.contactId } }
        );
      } else {
        cont = await Contacts.create({ contact: contacts });
        data = { ...data, contactId: cont.id };
      }
      await CustomerForms.update(data, { where: { id } });
    } else {
      delete data.id;
      let contacts = [];
      const contact = [
        data.importauthority,
        data.exportauthority,
        data.accountingofficer,
        data.financeofficer,
      ];
      for (let l = 0; l < contact.length; l++) {
        if (contact[l].name !== "") contacts.push(contact[l]);
      }
      const cont = await Contacts.create({ contact: contacts });
      if (cont) {
        await CustomerForms.update(
          { ...data, contactId: cont.id },
          { where: { uuId: data.uuId } }
        );
        if (data.filesData.length > 0) {
          const filePath = `./files/uploads/customerfiles/${data.customerId}`;
          if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
          }
          const read = fs.readdirSync(filePath);
          let temp = [];
          for (let l = 0; l < data.filesData.length; l++) {
            temp.push(`${data.filesData[l]}`);
          }
          for (let j = 0; j < read.length; j++) {
            if (!temp.includes(read[j])) {
              const deletePath = path.join(
                __dirname,
                `../../files/uploads/customerfiles/${data.customerId}/${read[j]}`
              );
              fs.unlinkSync(deletePath);
            }
          }
        }
      }
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    res.json({ success: false, msg: err });
  }
});

router.post("/checkUuId", async (req, res) => {
  try {
    if (!req.body.check) {
      const check = await CustomerForms.findOne({
        where: { uuId: req.body.uuId, currentReconliation: "" },
      });
      if (check) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } else {
      res.json({ success: true });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    res.json({ success: false, msg: err });
  }
});

router.post("/checkSafeConnection", async (req, res) => {
  try {
    const data = await Freights.findOne({
      where: { id: req.body.fId },
      include: [
        {
          model: CustomerForms,
          where: { uuId: req.body.uuId },
          include: [
            {
              model: Customers,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            { model: Contacts },
          ],
        },
        { model: Addresses, attributes: ["type", "address"] },
        { model: Confirmations, attributes: ["ip", "name"] },
      ],
    });
    if (data) {
      res.json({ success: true, data: { data } });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    res.json({ success: false, msg: err });
  }
});

router.post("/checkCForm", async (req, res) => {
  try {
    let include = [{ model: Customers }, { model: Contacts }];
    if (req.body.check) {
      include = [
        ...include,
        { model: Files, attributes: ["path", "createdAt", "seen"] },
      ];
    }
    const data = await CustomerForms.findOne({
      where: { id: req.body.id, uuId: req.body.uuId },
      include: include,
    });
    res.json({ success: true, data });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    res.json({ success: false, msg: err });
  }
});

router.post("/insertFiles", async (req, res) => {
  try {
    if (!req.files) {
      res.send({ status: false, message: "No file uploaded" });
    } else {
      const randomId = makeid(12);
      const tempDir = `./files/uploads/customerfiles/${req.body.customerId}`;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      if (
        !fs.existsSync(`./files/uploads/customerfiles/${req.body.customerId}`)
      ) {
        fs.rmdirSync(`./files/uploads/customerfiles/${req.body.customerId}`, {
          recursive: true,
        });
      }
      let image = req.files.file;
      const user = await Users.findOne({
        where: { id: req.body.purchasingRep },
      });
      const filename = `${randomId}-${req.body.filename}`;
      image.mv(`${tempDir}/${filename}`, async (err) => {
        if (err) {
          res.send({
            status: false,
            message: `Dosya yüklenirken bir hata oluştu: ${err}`,
          });
          return;
        } else {
          if (user && user.phone) {
            sendSMS(
              user.phone,
              `${req.body.customerName} isimli müşteri, müşteri bilgilendirme formu dosyalarına ${req.body.filename} isimli dosyayı yüklemiştir. Teklifler sayfasında Müşteri Bilgilendirme Formlarından erişebilirsiniz.`
            );
          }
          await Files.create({ path: filename, relatedId: req.body.cFormId });
          res.send({ status: true, message: "File is uploaded", filename });
        }
      });
    }
  } catch (err) {
    res.status(500).send(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    console.log(err);
  }
});

router.post("/insertOpFiles", async (req, res) => {
  try {
    if (!req.files) {
      res.send({ status: false, message: "No file uploaded" });
    } else {
      const randomId = makeid(3);
      const tempDir = `./files/operationfiles${
        req.body.folder ? `/${req.body.folder}` : ""
      }`;
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      let image = req.files.file;
      image.mv(`${tempDir}/${randomId}-${req.body.filename}`);
      await Logs.create({
        status: "newfile",
        operationId: req.body.opId,
        creatorId: req.user.id,
        fileName: `${randomId}-${req.body.filename}`,
        type: "static",
      });
      res.send({ status: true, message: "File is uploaded" });
    }
  } catch (err) {
    res.status(500).send(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    console.log(err);
  }
});

router.post("/deleteFile", async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      `../../files/uploads/customerfiles/${req.body.customerId}/${req.body.fileName}`
    );
    fs.unlinkSync(filePath);
    if (!req.body.check) {
      const user = await Users.findOne({
        where: { id: req.body.purchasingRep },
      });
      const file = req.body.fileName.split("-")[1];
      if (user && user.phone) {
        sendSMS(
          user.phone,
          `${req.body.customerName} isimli müşteri, ${file} isimli dosyayı silmiştir.`
        );
      }
    }
    await Files.destroy({
      where: { path: req.body.fileName, relatedId: req.body.relatedId },
    });
    res.send({ status: true });
  } catch (err) {
    res.status(500).send(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    console.log(err);
  }
});

router.post("/deleteOpFile", async (req, res) => {
  try {
    const fileName = req.body.fileName;
    const filePath = path.join(
      __dirname,
      `../../files/operationfiles/${req.body.opId}/${fileName}`
    );
    fs.unlinkSync(filePath);
    await Logs.create({
      status: "deletefile",
      operationId: req.body.opId,
      creatorId: req.user.id,
      fileName,
      type: "static",
    });
    res.send({ status: true });
  } catch (err) {
    res.status(500).send(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user);
    console.log(err);
  }
});

router.post("/getCustomersForms", ensureAuthenticated, async (req, res) => {
  try {
    let where = req.body.cSearch
      ? { date: { [Op.not]: null }, customerId: req.body.cSearch }
      : { date: { [Op.not]: null } };
    let data = await CustomerForms.findAll({
      where: where,
      order: [["createdAt", "desc"]],
      include: [
        { model: Contacts, attributes: ["contact"] },
        { model: Customers, attributes: ["customerName", "id"] },
        { model: Freights, attributes: ["id"] },
      ],
      limit: req.body.cusPerPage,
      offset: req.body.cusPage * req.body.cusPerPage - req.body.cusPerPage,
    });
    let count = await CustomerForms.count({ where: where });
    const ptotal = Math.ceil(count / Number(req.body.cusPerPage));
    res.json({
      success: true,
      data: {
        formData: data,
        total: count,
        company: data.map((x) => ({
          label: x.Customer.customerName,
          value: `${x.Customer.id}`,
        })),
        ptotal,
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getCancelledCForms", ensureAuthenticated, async (req, res) => {
  try {
    let cCompany = [];
    let ids = [];
    const findfreight = await Freights.findAll({
      attributes: ["cFormId"],
      group: ["cFormId"],
    });
    for (let j = 0; j < findfreight.length; j++) {
      ids.push(findfreight[j].cFormId);
    }
    let { rows, count } = await CustomerForms.findAndCountAll({
      where: { date: { [Op.not]: null }, id: { [Op.notIn]: ids } },
      order: [["createdAt", "desc"]],
      include: [
        { model: Contacts, attributes: ["contact"] },
        { model: Customers, attributes: ["customerName", "id"] },
      ],
      limit: req.body.cPerPage,
      offset: req.body.cPage * req.body.cPerPage - req.body.cPerPage,
    });
    let total = Math.ceil(count / Number(req.body.cPerPage));
    for (let i = 0; i < rows.length; i++) {
      let comp = Customers.findOne({
        where: { id: rows[i].customerId },
        attributes: ["customerName", "id"],
      });
      cCompany.push({ label: comp.customerName, value: `${comp.id}` });
    }
    res.json({
      success: true,
      data: { cFormData: rows, ctotal: count, cCompany, pctotal: total },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/downloadFormFiles", ensureAuthenticated, async (req, res) => {
  try {
    const filePath = `./files/uploads/customerfiles/${req.body.customerId}/${req.body.fileName}`;
    if (fs.existsSync(filePath)) {
      res.download(filePath);
      await Files.update(
        { seen: true },
        { where: { path: req.body.fileName } }
      );
    } else res.json({ success: false });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/downloadOpFiles", ensureAuthenticated, async (req, res) => {
  try {
    const filePath = `./files/operationfiles/${req.body.path}/${req.body.fileName}`;
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.json({ success: false });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getFormData", ensureAuthenticated, async (req, res) => {
  try {
    let temp = [];
    let users = [];
    const data = await Customers.findAll({
      attributes: ["customerName", "id", "address"],
    });
    let currentRef;
    let refKey = req.body.type === "domestic" ? "domRefCode" : "intRefCode";
    const maxRefCode = await Freights.max("referanceCode", {
      where: { type: req.body.type },
    });
    const findReferanceCode = await Settings.findOne({
      where: { userId: 0 },
      attributes: ["EMAIL"],
    });
    if (maxRefCode) {
      if (findReferanceCode?.EMAIL?.[refKey]) {
        if (maxRefCode >= findReferanceCode.EMAIL[refKey]) {
          currentRef = maxRefCode + 1;
        } else {
          currentRef = findReferanceCode.EMAIL[refKey];
        }
      }
    } else {
      if (findReferanceCode?.EMAIL?.[refKey]) {
        currentRef = findReferanceCode.EMAIL[refKey];
      } else {
        currentRef = "20240000000";
      }
    }
    for (let i = 0; i < data.length; i++) {
      temp.push({
        label: data[i].customerName,
        value: `${data[i].id}`,
        address: data[i].address,
      });
    }
    let where = req.body.allAddresses
      ? {
          type: "loadingpoint",
          address: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        }
      : {
          "$Freight.CustomerForm.Customer.id$": req.body.cFormId,
          type: "loadingpoint",
          address: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        };
    const addresses = await Addresses.findAll({
      where: where,
      attributes: ["address"],
      include: [
        {
          model: Freights,
          attributes: ["id"],
          include: [
            {
              model: CustomerForms,
              attributes: ["id"],
              include: [{ model: Customers, attributes: ["id"] }],
            },
          ],
        },
      ],
    });
    let companiesAddress = {};
    for (let x = 0; x < addresses.length; x++) {
      const customerId = addresses[x].Freight.CustomerForm.Customer.id;
      const address = addresses[x].address;
      if (!companiesAddress[customerId]) {
        companiesAddress[customerId] = { id: customerId, addresses: [] };
      }
      if (!companiesAddress[customerId].addresses.includes(address)) {
        companiesAddress[customerId].addresses.push(address);
      }
    }
    const companiesAddresses = Object.values(companiesAddress);
    const dAddress = await Addresses.findAll({
      where: {
        type: "deliveryaddress",
        address: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: ["address"],
      include: [{ model: Freights, attributes: ["id", "deliveryCompany"] }],
    });
    let deliveringAddress = {};
    for (let y = 0; y < dAddress.length; y++) {
      const company = dAddress[y].Freight.deliveryCompany;
      const address = dAddress[y].address;
      if (company) {
        if (!deliveringAddress[company]) {
          deliveringAddress[company] = { company: company, addresses: [] };
        }
        if (!deliveringAddress[company].addresses.includes(address)) {
          deliveringAddress[company].addresses.push(address);
        }
      }
    }
    const deliveringAddresses = Object.values(deliveringAddress);
    const user = await Users.findAll({
      where: { active: true },
      attributes: ["id", "name"],
    });
    for (let j = 0; j < user.length; j++) {
      users.push({ label: user[j].name, value: `${user[j].id}` });
    }
    const productType = await Freights.findAll({
      where: { productType: { [Op.ne]: null } },
      attributes: ["productType"],
      group: ["productType"],
    });
    const cMaturityDay = await Freights.findAll({
      where: { cMaturityDay: { [Op.ne]: null } },
      attributes: ["cMaturityDay"],
      group: ["cMaturityDay"],
    });
    const sMaturityDay = await Freights.findAll({
      where: { sMaturityDay: { [Op.ne]: null } },
      attributes: ["sMaturityDay"],
      group: ["sMaturityDay"],
    });
    const deliveryCompany = await Freights.findAll({
      where: {
        deliveryCompany: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: ["deliveryCompany"],
      group: ["deliveryCompany"],
    });
    let days = [
      ...cMaturityDay.map((x) => x.cMaturityDay),
      ...sMaturityDay.map((x) => x.sMaturityDay),
      "30",
      "45",
      "60",
    ];
    res.json({
      success: true,
      data: {
        clients: temp,
        user: users,
        pType: productType.map((x) => x.productType),
        maturityData: [...new Set([...days])].sort((a, b) => {
          return a - b;
        }),
        currentRef,
        addresses: companiesAddresses,
        deliveryCompany: deliveryCompany.map((x) => x.deliveryCompany),
        deliveringAddresses,
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/createFreightForm", ensureAuthenticated, async (req, res) => {
  try {
    let cForm, cId;
    const load = DateTime.fromISO(req.body.loadDate).toISODate();
    const firstDate = DateTime.fromISO(req.body.deliveryDate[0]).toISODate();
    const secondDate = DateTime.fromISO(req.body.deliveryDate[1]).toISODate();
    const firstDay = DateTime.fromISO(firstDate)
      .diff(DateTime.fromISO(load), ["days"])
      .toObject().days;
    const secondDay = DateTime.fromISO(secondDate)
      .diff(DateTime.fromISO(load), ["days"])
      .toObject().days;
    const diff = `${firstDay}-${secondDay}`;
    const company = await Customers.findOne({
      where: { id: req.body.companyName },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const isAlready = await CustomerForms.findOne({
      where: { customerId: company.id },
    });
    if (isAlready) {
      cId = isAlready.id;
    } else {
      cForm = await CustomerForms.create({
        uuId: req.body.uuId,
        type: req.body.type,
        customerId: req.body.companyName,
        date: req.body.orderDate,
        realtedPersonelMail: "",
        taxPayer: "eInvoice",
        invoiceSendingEA: "",
        currentReconliation: "",
        kepAddress: "",
        webAddress: "",
        requestingPerson: "",
        relatedDepartment: "",
        serviceProvided: "",
        creditLimit: "",
      });
      cId = cForm.id;
    }
    if (req.body.edit) {
      const op = await Operations.findOne({
        where: { freightId: req.body.id },
        attributes: ["id", "date"],
      });
      if (op) {
        const cpayment = !req.body.cLastPayDay
          ? DateTime.fromJSDate(op.date)
              .plus({ days: req.body.cMaturityDay })
              .toISODate()
          : req.body.cLastPayDay;
        const spayment = !req.body.sLastPayDay
          ? DateTime.fromJSDate(op.date)
              .plus({ days: req.body.sMaturityDay })
              .toISODate()
          : req.body.sLastPayDay;
        let data = { cPaymentDate: cpayment, sPaymentDate: spayment };
        op.update({ ...data });
      }
      await Freights.update(
        {
          ...req.body,
          deliveryDate: diff,
          cFormId: cId,
          companyName: company.customerName,
          referanceCode: req.body.referanceCode,
        },
        { where: { id: req.body.id } }
      );
      if (req.body.deletedIds.length > 0) {
        await Addresses.destroy({
          where: { id: { [Op.in]: req.body.deletedIds } },
        });
      }
      for (let k = 0; k < req.body.Addresses.length; k++) {
        if (req.body.Addresses[k].id) {
          await Addresses.update(
            { address: req.body.Addresses[k].address },
            { where: { id: req.body.Addresses[k].id } }
          );
        } else {
          await Addresses.create({
            ...req.body.Addresses[k],
            freightId: req.body.id,
          });
        }
      }
    } else {
      const freight = await Freights.create({
        ...req.body,
        deliveryDate: diff,
        companyName: company.customerName,
        cFormId: cId,
      });
      const operationManager = await Users.findOne({
        where: { id: req.body.operationManager },
        attributes: ["phone"],
      });
      if (operationManager && operationManager.phone) {
        sendSMS(
          operationManager.phone,
          `${req.user.name}, ${req.body.referanceCode} numaralı operasyona sizi Operasyon Yetkilisi olarak atamıştır. Teklifler sayfasından erişebilir ve operasyonu başlatabilirsiniz.`
        );
      }
      for (let l = 0; l < req.body.Addresses.length; l++) {
        await Addresses.create({
          ...req.body.Addresses[l],
          freightId: freight.id,
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getFreights", ensureAuthenticated, async (req, res) => {
  try {
    let companies = [];
    const customers = await Freights.findAll({
      where: { type: req.body.type, active: true },
      attributes: ["companyName"],
      group: ["companyName"],
    });
    const relatedPersons = await Freights.findAll({
      where: {
        [Op.and]: [
          { relatedPerson: { [Op.ne]: null } },
          { relatedPerson: { [Op.ne]: "" } },
        ],
      },
      attributes: ["relatedPerson"],
      group: ["relatedPerson"],
    });
    const referances = await Freights.findAll({
      where: { type: req.body.type, active: req.body.activeSearch },
      attributes: ["referanceCode"],
      group: ["referanceCode"],
    });
    let referanceCodes = [];
    for (let j = 0; j < referances.length; j++) {
      referanceCodes.push(referances[j].referanceCode);
    }
    for (let k = 0; k < customers.length; k++) {
      companies.push(customers[k].companyName);
    }
    let where = {
      [Op.and]: [
        { companyName: { [Op.ne]: null } },
        { companyName: { [Op.iLike]: `%${req.body.customer}%` } },
      ],
      type: req.body.type,
      active: req.body.activeSearch,
      relatedPerson: { [Op.iLike]: `%${req.body.relatedPerson}%` },
      weightType: { [Op.iLike]: `%${req.body.weightType}%` },
    };
    if (req.body.referance) {
      where = { ...where, referanceCode: req.body.referance };
    }
    let { rows, count } = await Freights.findAndCountAll({
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      where: where,
      include: [
        { model: CustomerForms, attributes: ["customerId"] },
        { model: Users, as: "PurchasingRep", attributes: ["name"] },
        { model: Users, as: "OperationManager", attributes: ["name"] },
        {
          model: Addresses,
          attributes: ["id", "type", "address"],
          separate: true,
          order: [["createdAt", "asc"]],
        },
        { model: Confirmations, attributes: ["name"] },
      ],
      order: [["createdAt", "desc"]],
    });
    const pmtotal = Math.ceil(count / Number(req.body.perPage));
    for (let i = 0; i < rows.length; i++) {
      const freightstatus = await Operations.findOne({
        where: { freightId: rows[i].id },
        attributes: ["active", "id"],
      });
      if (freightstatus) {
        if (freightstatus.active) {
          rows[i].dataValues["status"] = "active";
        } else if (!freightstatus.active) {
          rows[i].dataValues["status"] = "passive";
        }
      } else {
        rows[i].dataValues["status"] = "waitingcform";
      }
    }
    res.json({
      success: true,
      data: {
        freights: rows,
        companies,
        mtotal: count,
        pmtotal,
        relatedPersons: relatedPersons.map((x) => x.relatedPerson),
        referanceCodes,
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getOffersData", async (req, res) => {
  try {
    let setting = {};
    const generalSettings = await Settings.findOne({
      where: { userId: 0 },
      attributes: ["EMAIL"],
    });
    if (generalSettings) {
      setting = { generalSettings };
    } else {
      setting = {
        generalSettings: {
          EMAIL: {
            intRefCode: null,
            domRefCode: null,
            intRefKey: null,
            domRefKey: null,
            vat: null,
          },
        },
      };
    }
    const relatedPersons = await Freights.findAll({
      where: {
        [Op.and]: [
          { relatedPerson: { [Op.ne]: null } },
          { relatedPerson: { [Op.ne]: "" } },
        ],
      },
      attributes: ["relatedPerson"],
      group: ["relatedPerson"],
    });
    const cFormId = await Freights.findOne({
      where: { id: req.body.id },
      attributes: ["cFormId"],
    });
    const user = await Users.findOne({
      where: { id: req.body.userId },
      attributes: ["name"],
    });
    res.json({
      success: true,
      user: user.name,
      cFormId: cFormId.cFormId,
      relatedPersons: relatedPersons.map((x) => x.relatedPerson),
      setting,
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getCustomerData", ensureAuthenticated, async (req, res) => {
  try {
    const { rows, count } = await Customers.findAndCountAll({
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      order: [["createdAt", "desc"]],
      where: { customerName: { [Op.iLike]: `%${req.body.search}%` } },
    });
    let total = Math.ceil(count / Number(req.body.perPage));
    const customerData = await Customers.findAll({
      attributes: ["customerName"],
      group: ["customerName"],
    });
    res.json({
      success: true,
      data: {
        customers: rows,
        totalRows: count,
        customerData: customerData.map((x) => x.customerName),
        total,
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/createCustomer", ensureAuthenticated, async (req, res) => {
  try {
    if (req.body.edit) {
      await Customers.update({ ...req.body }, { where: { id: req.body.id } });
    } else {
      await Customers.create(req.body);
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/createOperation", ensureAuthenticated, async (req, res) => {
  try {
    const find = await Operations.findOne({
      where: { freightId: req.body.freightId, active: true },
    });
    if (find) {
      res.json({ success: false, msg: "alreadyoperation" });
    } else {
      const cpayment = !req.body.cLastPayDay
        ? DateTime.fromISO(req.body.date)
            .plus({ days: req.body.cPaymentDay })
            .toISODate()
        : req.body.cLastPayDay;
      const spayment = !req.body.sLastPayDay
        ? DateTime.fromISO(req.body.date)
            .plus({ days: req.body.sPaymentDay })
            .toISODate()
        : req.body.sLastPayDay;
      let data = { cPaymentDate: cpayment };
      data = { ...data, ...req.body, sPaymentDate: spayment };
      const op = await Operations.create(data);
      if (op) {
        await Logs.create({
          operationId: op.id,
          creatorId: op.creatorId,
          status: op.status,
          type: "static",
        });
        await PaymentTrackings.create({
          operationId: op.id,
          customerName: req.body.customerName,
          date: req.body.date,
          type: req.body.type,
        });
        res.json({ success: true });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getOperations", ensureAuthenticated, async (req, res) => {
  try {
    if (req.body.home) {
      const data = await Operations.findAll({
        attributes: ["id", "type"],
        where: { type: req.body.type, active: true },
        include: [
          {
            model: Freights,
            attributes: ["referanceCode"],
            where: { active: true },
          },
        ],
      });
      res.json({ success: true, data });
    } else {
      let search = req.body.search || "";
      let carriers = [];
      const carrier = await Suppliers.findAll({
        attributes: ["supplierName", "id"],
        group: ["supplierName", "id"],
      });
      for (let k = 0; k < carrier.length; k++) {
        carriers.push({
          label: carrier[k].supplierName,
          value: `${carrier[k].id}`,
        });
      }
      const operationNames = await Operations.findAll({
        where: {
          active: true,
          type: req.body.type,
          "$Freight.referanceCode$": { [Op.ne]: null },
        },
        include: [{ model: Freights, attributes: ["referanceCode"] }],
      });
      const customers = await Freights.findAll({
        where: {
          [Op.and]: [
            { companyName: { [Op.ne]: "" } },
            { companyName: { [Op.ne]: null } },
          ],
        },
        attributes: ["companyName"],
        include: [
          {
            model: Operations,
            attributes: ["id"],
            where: { active: true, type: req.body.type },
          },
        ],
      });
      let where = { type: req.body.type, active: true };
      if (req.body.searchOp) {
        where = { ...where, "$Freight.referanceCode$": req.body.searchOp };
      }
      let { rows, count } = await Operations.findAndCountAll({
        where: where,
        order: [[Freights, "referanceCode", "desc"]],
        // limit: req.body.oPerPage,
        // offset: req.body.oPage * req.body.oPerPage - req.body.oPerPage,
        include: [
          {
            model: Freights,
            attributes: [
              "companyName",
              "type",
              "referanceCode",
              "weightType",
              "cMaturityDay",
              "sMaturityDay",
              "cLastPayDay",
              "sLastPayDay",
              "loadDate",
              "deliveryDate",
              "cash",
              "supplierOffer",
              "currency",
              "deliveryCompany",
              "shippingType",
              "id",
            ],
            where: { companyName: { [Op.iLike]: `%${search}%` } },
            include: [
              { model: Addresses, attributes: ["type", "address"] },
              { model: Users, as: "OperationManager", attributes: ["name"] },
            ],
          },
          { model: GeneralNotes },
          {
            model: Logs,
            include: [{ model: Users, attributes: ["name"] }],
            separate: true,
            order: [["createdAt", "desc"]],
          },
          { model: Mails, attributes: ["path"] },
          {
            model: Vehicles,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          { model: Suppliers, attributes: ["supplierName"] },
          {
            model: ShipmentForms,
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          { model: Fines, attributes: ["finesPrice", "currency", "id"] },
        ],
      });
      for (let i = 0; i < rows.length; i++) {
        const filePath = `./files/operationfiles/${rows[i].id}`;
        if (fs.existsSync(filePath)) {
          let read = fs.readdirSync(filePath);
          rows[i].dataValues["fileCount"] = read.filter(
            (x) => x !== "fines"
          ).length;
        }
        if (rows[i].userIds) {
          rows[i]["userIds"] = rows[i]["userIds"].map(String);
        }
        if (rows[i].Mails.length !== 0) {
          let mailData = [];
          for (let m = 0; m < rows[i].Mails.length; m++) {
            if (fs.existsSync(rows[i].Mails[m].path)) {
              let read = fs.readFileSync(rows[i].Mails[m].path, "utf8");
              mailData.push(JSON.parse(read));
            }
          }
          rows[i].dataValues["Content"] = mailData;
        }
      }
      const logstatuses = await Logs.findAll({
        where: {
          type: { [Op.eq]: null },
          status: {
            [Op.and]: [
              {
                [Op.notIn]: [
                  "newfile",
                  "newuser",
                  "vehicleinfo",
                  "deletefile",
                  "operationfinished",
                  "operationstarted",
                  "active",
                  "status",
                  "newnote",
                  "",
                ],
              },
              { [Op.ne]: null },
            ],
          },
        },
        attributes: ["status"],
        group: ["status"],
      });
      res.json({
        success: true,
        data: {
          data: rows,
          count,
          carriers,
          cdata: [...new Set([...customers.map((x) => x.companyName)])],
          operationNames: operationNames.map((x) => x.Freight.referanceCode),
          statuses: logstatuses.map((x) => x.status),
        },
      });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/editStatus", ensureAuthenticated, async (req, res) => {
  try {
    await Logs.create(req.body);
    await Operations.update(
      { status: req.body.status },
      { where: { id: req.body.operationId } }
    );
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/createGeneralNot", ensureAuthenticated, async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    const id = data.id;
    delete data.id;
    const users = await Users.findAll({
      where: { id: { [Op.in]: req.body.userIds }, active: true },
      attributes: ["name", "phone", "id"],
    });
    let msg = "";
    if (data.edit) {
      const note = await GeneralNotes.findOne({
        where: { id },
        include: [
          {
            model: Operations,
            include: [{ model: Freights, attributes: ["referanceCode"] }],
          },
        ],
      });
      if (note.Operation?.Freight?.referanceCode) {
        msg = `${req.user.name} ${note.Operation.Freight.referanceCode} numaralı operasyona bağlı ${data.title} isimli notu güncellemiştir.`;
      } else {
        msg = `${req.user.name} ${data.title} isimli notu güncellemiştir. Genel Notlar bölümündem erişebilirsiniz.`;
      }
      note.update({ ...data, creatorId: req.user.id });
      for (let i = 0; i < users.length; i++) {
        if (req.user.id !== users[i].id) sendSMS(users[i].phone, msg);
      }
    } else {
      const note = await GeneralNotes.create(data);
      if (note) {
        if (data.opId) {
          msg = `${req.user.name} sizinde dahil olduğunuz ${data.title} isimli notu eklemiştir. ${data.referanceCode} referans kodlu operasyondan erişebilirsiniz.`;
        } else {
          msg = `${req.user.name} sizinde dahil olduğunuz ${data.title} isimli notu eklemiştir. Genel Notlar sayfasından erişebilirsiniz.`;
        }
        for (let i = 0; i < users.length; i++) {
          if (req.user.id !== users[i].id) sendSMS(users[i].phone, msg);
        }
        await Logs.create({
          status: "newnote",
          operationId: data.opId,
          creatorId: req.user.id,
          fileName: data.title,
          type: "static",
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getGeneralNotes", ensureAuthenticated, async (req, res) => {
  try {
    let users = [];
    let titlenames = [];
    let titles = await GeneralNotes.findAll({
      where: {
        type: req.body.type,
        userIds: { [Op.contains]: [req.user.id] },
        opId: { [Op.eq]: null },
      },
      attributes: ["title"],
      group: ["title"],
    });
    for (let k = 0; k < titles.length; k++) {
      titlenames.push(titles[k].title);
    }
    let { rows, count } = await GeneralNotes.findAndCountAll({
      attributes: ["id", "description", "userIds", "createdAt", "title"],
      order: [["createdAt", "asc"]],
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      where: {
        type: req.body.type,
        userIds: { [Op.contains]: [req.user.id] },
        title: { [Op.iLike]: `%${req.body.search}%` },
        opId: null,
      },
    });
    let total = Math.ceil(count / Number(req.body.perPage));
    for (let i = 0; i < rows.length; i++) {
      rows[i]["userIds"] = rows[i]["userIds"].map(String);
      let names = [];
      const users = await Users.findAll({
        where: { active: true, id: { [Op.in]: rows[i]["userIds"] } },
        attributes: ["name", "id"],
      });
      if (users.length !== 0) {
        for (let l = 0; l < users.length; l++) {
          names = [...names, users[l].name];
        }
        rows[i].dataValues["names"] = names.join(`, `);
      }
    }
    res.json({
      success: true,
      data: { data: rows, users, count, total, titlenames },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/addVehicleInfo", ensureAuthenticated, async (req, res) => {
  try {
    let vehicles = JSON.parse(JSON.stringify(req.body.vehicles));
    if (req.body.deletedIds.length > 0) {
      await Vehicles.destroy({
        where: { id: { [Op.in]: req.body.deletedIds } },
      });
    }
    for (let i = 0; i < vehicles.length; i++) {
      if (!vehicles[i].id) {
        await Vehicles.create({ ...vehicles[i], operationId: req.body.id });
      } else {
        const id = vehicles[i].id;
        delete vehicles[i].id;
        await Vehicles.update(
          { ...vehicles[i], operationId: req.body.id },
          { where: { id: id } }
        );
      }
    }
    await Logs.create({
      operationId: req.body.id,
      status: "vehicleinfo",
      creatorId: req.user.id,
      type: "static",
    });
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getLogBookOperations", ensureAuthenticated, async (req, res) => {
  try {
    const currentDate = new Date();
    let freWhere = {
      companyName: {
        [Op.iLike]: `%${req.body.searchReceiving}%`,
      },
      deliveryCompany: { [Op.iLike]: `%${req.body.searchDeliveryComp}%` },
    };
    let where = { type: req.body.type, isCancelled: false };
    if (req.body.searchDate[0] && req.body.searchDate[1]) {
      const dateBeg = DateTime.fromISO(req.body.searchDate[0])
        .toLocal()
        .toString();
      const dateEnd = DateTime.fromISO(req.body.searchDate[1])
        .toLocal()
        .plus({ days: 1 })
        .toString();
      where = {
        ...where,
        date: { [Op.and]: [{ [Op.gte]: dateBeg }, { [Op.lte]: dateEnd }] },
      };
    }
    if (req.body.searchReferance) {
      freWhere.referanceCode = req.body.searchReferance;
    }
    if (req.body.searchCarrier) {
      where = { ...where, "$Supplier.id$": Number(req.body.searchCarrier) };
    }
    const filterData = await Operations.findAll({
      where: { type: req.body.type, isCancelled: false },
      attributes: ["id"],
      include: [
        {
          model: Freights,
          attributes: ["companyName", "referanceCode"],
          where: { companyName: { [Op.ne]: null } },
        },
        {
          model: Suppliers,
          attributes: ["supplierName", "id"],
          where: { supplierName: { [Op.ne]: null } },
        },
      ],
    });
    let carrierData = [];
    for (let h = 0; h < filterData.length; h++) {
      if (
        !carrierData.find((x) => x.value === `${filterData[h].Supplier.id}`)
      ) {
        carrierData.push({
          value: `${filterData[h].Supplier.id}`,
          label: filterData[h].Supplier.supplierName,
        });
      }
    }
    const deliveryCompany = await Freights.findAll({
      where: {
        deliveryCompany: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        type: req.body.type,
      },
      attributes: ["deliveryCompany"],
      group: ["deliveryCompany"],
    });
    let { rows, count } = await Operations.findAndCountAll({
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      where: where,
      order: [[Freights, "referanceCode", "desc"]],
      include: [
        { model: Suppliers, attributes: ["supplierName", "id"] },
        {
          model: Freights,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: freWhere,
          include: [
            {
              model: CustomerForms,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              include: [
                {
                  model: Customers,
                  attributes: ["customerName", "taxnr", "id"],
                },
              ],
            },
            {
              model: Addresses,
              attributes: ["type", "address", "id"],
              separate: true,
              order: [["createdAt", "asc"]],
            },
            { model: Users, as: "OperationManager", attributes: ["name"] },
          ],
        },
        {
          model: Vehicles,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          separate: true,
          order: [["createdAt", "asc"]],
        },
        { model: Fines, separate: true, order: [["createdAt", "asc"]] },
      ],
      subQuery: false,
    });
    const addresses = await Addresses.findAll({
      where: {
        "$Freight.CustomerForm.Customer.id$": {
          [Op.in]: rows.map((x) => x.Freight.CustomerForm.Customer.id),
        },
        type: "loadingpoint",
        address: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: ["address"],
      include: [
        {
          model: Freights,
          attributes: ["id"],
          include: [
            {
              model: CustomerForms,
              attributes: ["id"],
              include: [{ model: Customers, attributes: ["id"] }],
            },
          ],
        },
      ],
    });
    let companiesAddress = {};
    for (let x = 0; x < addresses.length; x++) {
      const customerId = addresses[x].Freight.CustomerForm.Customer.id;
      const address = addresses[x].address;
      if (!companiesAddress[customerId]) {
        companiesAddress[customerId] = { id: customerId, addresses: [] };
      }
      if (!companiesAddress[customerId].addresses.includes(address)) {
        companiesAddress[customerId].addresses.push(address);
      }
    }
    const companiesAddresses = Object.values(companiesAddress);
    const dAddress = await Addresses.findAll({
      where: {
        type: "deliveryaddress",
        address: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: ["address"],
      include: [{ model: Freights, attributes: ["id", "deliveryCompany"] }],
    });
    let deliveringAddress = {};
    for (let y = 0; y < dAddress.length; y++) {
      const company = dAddress[y].Freight.deliveryCompany;
      const address = dAddress[y].address;
      if (company) {
        if (!deliveringAddress[company]) {
          deliveringAddress[company] = { company: company, addresses: [] };
        }
        if (!deliveringAddress[company].addresses.includes(address)) {
          deliveringAddress[company].addresses.push(address);
        }
      }
    }
    const deliveringAddresses = Object.values(deliveringAddress);
    let total = Math.ceil(count / Number(req.body.perPage));
    const pType = await Freights.findAll({
      attributes: ["productType"],
      group: ["productType"],
    });
    let days = [];
    for (let i = 0; i < rows.length; i++) {
      let deliveryDate = [];
      let splitParts = rows[i].Freight.deliveryDate.split("-");
      days.push(splitParts);
      for (let l = 0; l < splitParts.length; l++) {
        deliveryDate.push(
          DateTime.fromISO(rows[i].Freight.loadDate)
            .plus({ days: Number(splitParts[l]) })
            .toISODate()
        );
        rows[i].Freight.dataValues["unloadDates"] = deliveryDate;
      }
      let customerPaymentDay = Math.ceil(
        DateTime.fromJSDate(rows[i].cPaymentDate)
          .diff(DateTime.fromJSDate(currentDate), ["days"])
          .toObject().days
      );
      let supplierPaymentDay = Math.ceil(
        DateTime.fromJSDate(rows[i].sPaymentDate)
          .diff(DateTime.fromJSDate(currentDate), ["days"])
          .toObject().days
      );
      rows[i].dataValues["cPaymentDay"] = customerPaymentDay;
      rows[i].dataValues["sPaymentDay"] = supplierPaymentDay;
    }
    res.json({
      success: true,
      data: {
        data: rows,
        count,
        productTypes: pType.map((x) => x.productType),
        total,
        customers: [
          ...new Set([...filterData.map((x) => x.Freight?.companyName)]),
        ],
        carrierData,
        addresses: companiesAddresses,
        deliveringAddresses,
        deliveryCompany: deliveryCompany.map((x) => x.deliveryCompany),
        referanceCodes: filterData.map((x) => x.Freight.referanceCode),
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/changeLanguage", ensureAuthenticated, async (req, res) => {
  try {
    const language = req.user.lang === "tr" ? "en" : "tr";
    const change = await Users.update(
      { lang: language },
      { where: { id: req.user.id } }
    );
    if (change) {
      const lang = await Users.findOne({
        where: { id: req.user.id },
        attributes: ["lang"],
      });
      res.json({ success: true, lang: lang.lang });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/changeProjectType", ensureAuthenticated, async (req, res) => {
  try {
    const change = await Users.update(
      {
        projectType:
          req.body.type === "domestic" ? "international" : "domestic",
      },
      { where: { id: req.user.id } }
    );
    if (change) {
      const pType = await Users.findOne({
        where: { id: req.user.id },
        attributes: ["projectType"],
      });
      res.json({ success: true, msg: pType.projectType });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getSettings", ensureAuthenticated, async (req, res) => {
  try {
    let temp = {};
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["id", "EMAIL", "colorSettings"],
    });
    const generalSettings = await Settings.findOne({ where: { userId: 0 } });
    temp = generalSettings
      ? { generalSettings }
      : {
          generalSettings: {
            EMAIL: {
              intRefCode: null,
              domRefCode: null,
              intRefKey: null,
              domRefKey: null,
              vat: null,
            },
          },
        };
    temp = setting?.EMAIL ? { ...temp, email: setting.EMAIL } : { ...temp };
    temp = setting?.colorSettings
      ? { ...temp, colorSettings: setting.colorSettings }
      : { ...temp };
    res.json({ success: true, ...temp });
  } catch (err) {
    console.log(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/saveEmailSettings", ensureAuthenticated, async (req, res) => {
  try {
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
    });
    if (setting) {
      await Settings.update({ EMAIL: req.body }, { where: { id: setting.id } });
    } else {
      await Settings.create({ EMAIL: req.body, userId: req.user.id });
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/saveColorSettings", ensureAuthenticated, async (req, res) => {
  try {
    let colorSettings = {};
    let setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["id", "colorSettings"],
    });
    if (setting) {
      colorSettings = {
        ...setting.colorSettings,
        [req.body.value]: req.body.color,
      };
      setting.update({ colorSettings });
    } else {
      colorSettings = { [req.body.value]: req.body.color };
      await Settings.create({ colorSettings, userId: req.user.id });
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getMails", ensureAuthenticated, async (req, res) => {
  try {
    let mails = [];
    let count = 0;
    const perPage = Number(req.body.perPage);
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["EMAIL"],
    });
    if (
      setting &&
      setting.EMAIL?.IMAP_SERVERNAME &&
      setting.EMAIL?.IMAP_SERVERPORT &&
      setting.EMAIL?.IMAP_SERVERSECURE &&
      setting.EMAIL?.IMAP_USERNAME &&
      setting.EMAIL?.IMAP_PASSWORD
    ) {
      const client = new ImapFlow({
        host: setting.EMAIL.IMAP_SERVERNAME,
        port: setting.EMAIL.IMAP_SERVERPORT,
        secure: setting.EMAIL.IMAP_SERVERSECURE,
        auth: {
          user: setting.EMAIL.IMAP_USERNAME,
          pass: setting.EMAIL.IMAP_PASSWORD,
        },
        logger: false,
        tls: { rejectUnauthorized: setting.EMAIL.IMAP_SERVERTLS },
        emitLogs: true,
      });
      await client.connect();
      await client.mailboxOpen(req.body.mailBox || "INBOX");
      const lastSeqId = await client.fetchOne("*", { uid: true });
      count = lastSeqId.seq;
      const offset = count - (req.body.page * perPage - 1);
      for await (let msg of client.fetch(
        `${offset < 1 ? 1 : offset}:${offset + perPage - 1}`,
        { uid: true, source: true, envelope: true, flags: true }
      )) {
        const mail = await simpleParser(msg.source);
        let attachments = [];
        for (let i = 0; i < mail.attachments.length; i++) {
          if (mail.attachments[i].contentDisposition === "attachment")
            attachments.push(mail.attachments[i]);
        }
        const { cc, bcc } = msg.envelope;
        mails.push({
          uid: msg.uid,
          attachments: attachments,
          subject: mail.subject,
          cc: cc ? cc.map((x) => x.address).join(", ") : "",
          bcc: bcc ? bcc.map((x) => x.address).join(", ") : "",
          from: mail.from.value[0].address,
          date: mail.date,
          html: mail.html ? mail.html : mail.textAsHtml,
          seen: Array.from(msg.flags).indexOf("\\Seen") >= 0,
        });
      }
      mails = mails.reverse();
      client.mailboxClose();
      await client.logout();
      res.json({ success: true, data: { mails, totalRows: count } });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "warning", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/setSeenMail", ensureAuthenticated, async (req, res) => {
  try {
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["EMAIL"],
    });
    let response;
    const client = new ImapFlow({
      host: setting.EMAIL.IMAP_SERVERNAME,
      port: setting.EMAIL.IMAP_SERVERPORT,
      secure: setting.EMAIL.IMAP_SERVERSECURE,
      auth: {
        user: setting.EMAIL.IMAP_USERNAME,
        pass: setting.EMAIL.IMAP_PASSWORD,
      },
      tls: { rejectUnauthorized: setting.EMAIL.IMAP_SERVERTLS },
      emitLogs: true,
    });
    await client.connect();
    await client.mailboxOpen("INBOX");
    try {
      response = await client.messageFlagsAdd({ uid: req.body.uid }, [
        "\\Seen",
      ]);
    } finally {
      client.mailboxClose();
    }
    await client.logout();
    if (response) res.json({ success: true });
    else res.json({ success: false });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/replyMail", ensureAuthenticated, async (req, res) => {
  try {
    let mails = [];
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["EMAIL"],
    });
    const keys = [
      "IMAP_SERVERNAME",
      "IMAP_USERNAME",
      "IMAP_PASSWORD",
      "IMAP_SMTPPORT",
    ];
    let temp = [];
    for (let j = 0; j < keys.length; j++) {
      if (typeof setting.EMAIL[keys[j]] === "undefined") temp.push(keys[j]);
    }
    if (temp.length !== 0) res.json({ success: false, data: temp });
    else {
      const smtpTransport = nodemailer.createTransport({
        host: setting.EMAIL.IMAP_SERVERNAME,
        port: setting.EMAIL.IMAP_SMTPPORT,
        secure: setting.EMAIL.IMAP_SERVERSECURE,
        auth: {
          user: setting.EMAIL.IMAP_USERNAME,
          pass: setting.EMAIL.IMAP_PASSWORD,
        },
        logger: false,
        transactionLog: true,
      });
      const addresses = req.body.to.split(",");
      for (let k = 0; k < addresses.length; k++) {
        const mailOptions = {
          from: setting.EMAIL.IMAP_USERNAME,
          to: addresses[k].replace(/\s/g, ""),
          subject: req.body.subject,
          html: req.body.message,
          cc: req.body.cc,
          bcc: req.body.bcc,
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          if (err) {
            console.log(err);
            return false;
          } else {
            const mail = new MailComposer(mailOptions);
            mail.compile().build(async (err, msg) => {
              if (err) {
                console.log(err);
              } else {
                const client = new ImapFlow({
                  host: setting.EMAIL.IMAP_SERVERNAME,
                  port: setting.EMAIL.IMAP_SERVERPORT,
                  secure: setting.EMAIL.IMAP_SERVERSECURE,
                  auth: {
                    user: setting.EMAIL.IMAP_USERNAME,
                    pass: setting.EMAIL.IMAP_PASSWORD,
                  },
                  logger: false,
                  tls: { rejectUnauthorized: setting.EMAIL.IMAP_SERVERTLS },
                  emitLogs: true,
                });
                await client.connect();
                await client.append("Sent", msg, ["\\Seen"]);
                await client.logout();
              }
            });
            console.log(`Message sent `);
            return true;
          }
        });
      }
    }
    res.json({ success: true, data: mails.reverse() });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/downloadAttachments", ensureAuthenticated, async (req, res) => {
  try {
    if (fs.existsSync("./files/mails")) {
      fs.rmdirSync("./files/mails", { recursive: true });
    }
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["EMAIL"],
    });
    const client = new ImapFlow({
      host: setting.EMAIL.IMAP_SERVERNAME,
      port: setting.EMAIL.IMAP_SERVERPORT,
      secure: setting.EMAIL.IMAP_SERVERSECURE,
      auth: {
        user: setting.EMAIL.IMAP_USERNAME,
        pass: setting.EMAIL.IMAP_PASSWORD,
      },
      tls: { rejectUnauthorized: setting.EMAIL.IMAP_SERVERTLS },
      emitLogs: true,
    });
    await client.connect();
    await client.mailboxOpen("INBOX");
    let { content } = await client.download(
      `${req.body.uid}`,
      req.body.partId,
      { uid: true }
    );
    const mailsDir = "./files/mails";
    if (!fs.existsSync(mailsDir)) {
      fs.mkdirSync(mailsDir, { recursive: true });
    }
    let writeStream = fs.createWriteStream(
      "./files/mails/" + req.body.filename
    );
    const dataDownload = content.pipe(writeStream);
    dataDownload.on("finish", async () => {
      client.mailboxClose();
      await client.logout();
      res.download(`files/mails/${req.body.filename}`);
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    console.log(err);
    res.json({ success: false, msg: err });
  }
});

router.post("/deleteMail", ensureAuthenticated, async (req, res) => {
  try {
    const setting = await Settings.findOne({
      where: { userId: req.user.id },
      attributes: ["EMAIL"],
    });
    const client = new ImapFlow({
      host: setting.EMAIL.IMAP_SERVERNAME,
      port: setting.EMAIL.IMAP_SERVERPORT,
      secure: setting.EMAIL.IMAP_SERVERSECURE,
      auth: {
        user: setting.EMAIL.IMAP_USERNAME,
        pass: setting.EMAIL.IMAP_PASSWORD,
      },
      tls: { rejectUnauthorized: setting.EMAIL.IMAP_SERVERTLS },
      logger: false,
      emitLogs: true,
    });
    await client.connect();
    await client.mailboxOpen("INBOX");
    try {
      if (req.body.mailBox === "INBOX") {
        await client.messageMove({ uid: req.body.uid }, "Trash", {
          uid: true,
        });
      } else {
        await client.messageDelete({ uid: req.body.uid }, { uid: true });
      }
    } finally {
      client.mailboxClose();
    }
    await client.logout();
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/matchOperation", ensureAuthenticated, async (req, res) => {
  try {
    const filePath = `./files/operationmails/${req.body.id}/${req.body.uid}`;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }
    let content = {
      date: req.body.date,
      to: req.body.to,
      content: req.body.content,
      message: req.body.message,
    };
    const file = `${filePath}/${req.body.uid}.json`;
    fs.writeFileSync(file, JSON.stringify(content, null, 2), "utf-8");
    let data = {
      creatorId: req.user.id,
      uid: req.body.uid,
      opId: req.body.id,
      path: file,
    };
    await Mails.create(data);
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getUsers", ensureAuthenticated, async (req, res) => {
  try {
    let user = [];
    const users = await Users.findAll({
      where: { active: true },
      attributes: ["name", "email", "password", "id", "phone", "type"],
    });
    for (let i = 0; i < users.length; i++) {
      user.push({ label: users[i].name, value: `${users[i].id}` });
    }
    res.json({ success: true, selectData: user, users });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/iOperationDetails", ensureAuthenticated, async (req, res) => {
  try {
    const {
      productType,
      deliveryAddress,
      loadDate,
      deletedIds,
      taxNumber,
      requestingPerson,
      relatedDepartment,
      deliveryCompany,
      cPaymentStatus,
      cPaidDate,
      sPaymentStatus,
      sPaidDate,
      deliveryDate,
      id,
    } = req.body;
    const data = await Operations.findOne({
      include: [
        {
          model: Freights,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: CustomerForms,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
          ],
        },
      ],
      where: { id: id },
      order: [["createdAt", "desc"]],
    });
    if (data.userIds.includes(req.user.id)) {
      if (data.Freight.id) {
        await Freights.update(
          {
            productType,
            relatedDepartment,
            deliveryAddress,
            loadDate,
            deliveryCompany,
          },
          { where: { id: data.Freight.id } }
        );
        if (deletedIds.length > 0) {
          await Addresses.destroy({
            where: { id: { [Op.in]: deletedIds } },
          });
        }
        for (let k = 0; k < req.body.Addresses.length; k++) {
          if (req.body.Addresses[k].id) {
            await Addresses.update(
              { address: req.body.Addresses[k].address },
              { where: { id: req.body.Addresses[k].id } }
            );
          } else {
            await Addresses.create({
              ...req.body.Addresses[k],
              freightId: data.Freight.id,
            });
          }
        }
      }
      if (data.Freight.CustomerForm.id) {
        await CustomerForms.update(
          { taxNumber, requestingPerson, relatedDepartment },
          { where: { id: data.Freight.CustomerForm.id } }
        );
      }
      await Operations.update(
        {
          deliveryCompany,
          cPaidDate: cPaymentStatus === "paid" ? cPaidDate : null,
          sPaidDate: sPaymentStatus === "paid" ? sPaidDate : null,
          deliveryDate,
        },
        { where: { id: data.id } }
      );
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "noauthority" });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getInvoices", ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.post(`${process.env.API_URL}/getInvoices`, {
      apiKey: process.env.API_KEY,
      company: process.env.COMPANY_INVOICES_NAME,
      username: req.user.name,
      GRPCODE: req.body.GRPCODE,
      FOREIGN: req.body.FOREIGN,
      GUID: req.body.GUID,
      search: req.body.search,
    });
    let companies = [];
    const data = response.data.data;
    const total = response.data.total;
    for (let i = 0; i < data.length; i++) {
      companies.push(data[i].DEFINITION_);
    }
    res.json({
      success: true,
      companies: [...new Set([...companies])],
      data,
      total: total,
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getOperationFiles", ensureAuthenticated, async (req, res) => {
  try {
    let read;
    const filePath = `./files/operationfiles/${req.body.fines ? `${req.body.id}/fines` : req.body.id}`;
    if (fs.existsSync(filePath)) {
      read = fs.readdirSync(filePath);
    } else {
      read = "";
    }
    res.json({ success: true, data: read });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/addUserOperation", ensureAuthenticated, async (req, res) => {
  try {
    let user;
    let userIds = req.body.users.map((x) => Number(x));
    const operation = await Operations.findOne({
      where: { id: req.body.id, userIds, active: true },
    });
    if (!operation) {
      const adduser = await Operations.update(
        { userIds },
        { where: { id: req.body.id } }
      );
      if (adduser) {
        let users = "";
        for (let i = 0; i < userIds.length; i++) {
          user = await Users.findOne({
            where: { id: userIds[i] },
            attributes: ["phone", "name"],
          });
          users += `${user.name} ,`;
        }
        await Logs.create({
          operationId: req.body.id,
          creatorId: req.user.id,
          status: "newuser",
          users,
          type: "static",
        });
      }
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/matchNoteOperation", ensureAuthenticated, async (req, res) => {
  try {
    await GeneralNotes.update(
      { opId: req.body.opId },
      { where: { id: req.body.id } }
    );
    await Logs.create({
      status: "newnote",
      operationId: req.body.opId,
      creatorId: req.user.id,
      fileName: req.body.title,
      type: "static",
    });
    res.json({ success: true, msg: "success" });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getLink", ensureAuthenticated, async (req, res) => {
  try {
    const data = await Freights.findOne({
      where: { id: req.body.id },
      attributes: ["id"],
      include: [{ model: CustomerForms, attributes: ["id", "uuId"] }],
    });
    res.json({ success: true, data });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/deleteNote", ensureAuthenticated, async (req, res) => {
  try {
    const note = await GeneralNotes.findOne({
      where: { id: req.body.id },
      attributes: ["userIds"],
    });
    await GeneralNotes.destroy({ where: { id: req.body.id } });
    for (let i = 0; i < note.userIds.length; i++) {
      const users = await Users.findOne({
        where: { id: note.userIds[i], active: true },
        attributes: ["phone", "id"],
      });
      if (users.id != req.user.id && users.phone) {
        sendSMS(
          users.phone,
          `${req.user.name}, sizinde dahil olduğunuz ${req.body.title} isimli notu silmiştir.`
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/terminateOperation", ensureAuthenticated, async (req, res) => {
  try {
    const operation = await Operations.findOne({
      where: { id: req.body.id },
      include: [{ model: Freights, attributes: ["id"] }],
    });
    if (operation && operation.userIds.includes(req.user.id)) {
      await operation.update({ active: false, isCancelled: req.body.cancel });
      await operation.Freight.update({ active: false });
      await Logs.create({
        status: "operationfinished",
        operationId: req.body.id,
        creatorId: req.user.id,
        type: "static",
      });
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "noauthority" });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getPassiveOp", ensureAuthenticated, async (req, res) => {
  try {
    let where = {
      active: false,
      type: req.body.type,
      "$Freight.companyName$": { [Op.iLike]: `%${req.body.customer}%` },
    };
    if (req.body.operation) {
      where = { ...where, "$Freight.referanceCode$": req.body.operation };
    }
    if (req.body.supplier) {
      where = {
        ...where,
        "$Supplier.supplierName$": { [Op.iLike]: `%${req.body.supplier}%` },
      };
    }
    if (req.body.searchDate[0] && req.body.searchDate[1]) {
      const dateBeg = DateTime.fromISO(req.body.searchDate[0])
        .toLocal()
        .toString();
      const dateEnd = DateTime.fromISO(req.body.searchDate[1])
        .toLocal()
        .toString();
      where = {
        ...where,
        "$Freight.loadDate$": {
          [Op.and]: [{ [Op.gte]: dateBeg }, { [Op.lte]: dateEnd }],
        },
      };
    }
    const { rows, count } = await Operations.findAndCountAll({
      where: where,
      limit: req.body.perPage,
      offset: req.body.page * req.body.perPage - req.body.perPage,
      order: [["date", "desc"]],
      include: [
        { model: Suppliers, attributes: ["supplierName", "id"] },
        {
          model: Freights,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: CustomerForms,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              include: [
                { model: Customers, attributes: ["customerName", "taxnr"] },
              ],
            },
          ],
        },
      ],
    });
    const passiveOpNames = await Freights.findAll({
      where: { active: false, type: req.body.type },
      attributes: ["referanceCode"],
      group: ["referanceCode"],
    });
    const customers = await Freights.findAll({
      where: {
        [Op.and]: [
          { companyName: { [Op.ne]: "" } },
          { companyName: { [Op.ne]: null } },
        ],
      },
      attributes: ["companyName"],
      include: [
        {
          model: Operations,
          attributes: ["id"],
          where: { active: false, type: req.body.type },
        },
      ],
    });
    const suppliers = await Suppliers.findAll({
      attributes: ["supplierName", "id"],
      include: [
        {
          model: Operations,
          attributes: ["id"],
          where: { active: false, type: req.body.type },
        },
      ],
    });
    for (let i = 0; i < rows.length; i++) {
      let deliveryDate = [];
      let splitParts = rows[i].Freight.deliveryDate.split("-");
      for (let l = 0; l < splitParts.length; l++) {
        deliveryDate.push(
          DateTime.fromISO(rows[i].Freight.loadDate)
            .plus({ days: Number(splitParts[l]) })
            .toISODate()
        );
        rows[i].Freight.dataValues["unloadDates"] = deliveryDate;
      }
    }
    const pTotal = Math.ceil(count / Number(req.body.perPage));
    res.json({
      success: true,
      data: {
        passiveOps: rows,
        totalRows: count,
        modal: true,
        pTotal,
        cusData: [...new Set([...customers.map((x) => x.companyName)])],
        suppData: suppliers.map((x) => x.supplierName),
        passiveOpNames: passiveOpNames.map((x) => x.referanceCode),
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/changeActive", ensureAuthenticated, async (req, res) => {
  try {
    const operation = await Operations.findOne({
      where: { id: req.body.id },
      attributes: ["id", "userIds", "freightId"],
      include: [{ model: Freights, attributes: ["id"] }],
    });
    if (operation.userIds.includes(req.user.id)) {
      await operation.update({ active: true, isCancelled: false });
      await operation.Freight.update({ active: true });
      await Logs.create({
        status: "active",
        operationId: req.body.id,
        creatorId: req.user.id,
        type: "static",
      });
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "noauthority" });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/createUser", ensureAuthenticated, async (req, res) => {
  try {
    if (["Super", "Admin"].includes(req.user.type)) {
      let data = JSON.parse(JSON.stringify(req.body));
      const id = data.id;
      let where = { [Op.or]: [{ email: data.email }, { phone: data.phone }] };
      if (req.body.edit) {
        where = { ...where, id: { [Op.ne]: id } };
      }
      const dup = await Users.findOne({ attributes: ["id"], where: where });
      if (dup) {
        res.json({ success: false, msg: "duplicate" });
      } else if (req.body.edit) {
        const user = await Users.findOne({
          attributes: ["type", "password"],
          where: { id },
        });
        if (user.type === "Admin" && req.user.type !== "Admin") {
          res.json({ success: false, msg: "noauthority" });
        } else if (req.user.type === "Super" && data.type === "Admin") {
          res.json({ success: false, msg: "noauthority" });
        } else {
          delete data.id;
          if (user.password !== data.password) {
            data.password = bcrypt.hashSync(
              data.password,
              bcrypt.genSaltSync(10),
              null
            );
          }
          await Users.update(data, { where: { id } });
          res.json({ success: true });
        }
      } else {
        data = {
          ...data,
          active: true,
          lang: "tr",
          projectType: "domestic",
          authToken: null,
        };
        const newUser = await Users.create(data);
        if (newUser) {
          await Settings.create({
            colorSettings: {
              completedoperation: "rgba(192, 197, 206, 1)",
              duringoperation: "rgba(250, 209, 5, 1)",
              notstartedyet: "rgba(104, 148, 108, 1)",
            },
            userId: newUser.id,
          });
        }
        res.json({ success: true });
      }
    } else {
      res.json({ success: false, msg: "noauthority" });
    }
  } catch (err) {
    console.log(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/blockedIps", ensureAuthenticated, async (req, res) => {
  try {
    const ips = await IpBlocks.findAll({ attributes: ["id", "ip"] });
    const blockedUsers = await Logins.findAll({ attributes: ["id", "email"] });
    res.json({ success: true, data: { ips, blockedUsers } });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/deleteIp", ensureAuthenticated, async (req, res) => {
  try {
    if (req.body.type === "ip") {
      await IpBlocks.destroy({ where: { id: req.body.id } });
      const logins = await Logins.findOne({ where: { email: req.body.ip } });
      if (logins) {
        logins.update({ count: 0 });
      }
    } else {
      await Logins.destroy({ where: { id: req.body.id } });
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/deleteFreight", ensureAuthenticated, async (req, res) => {
  try {
    const op = await Operations.findOne({
      where: { freightId: req.body.id, active: true },
      include: [{ model: Freights, attributes: ["referanceCode"] }],
      attributes: ["id"],
    });
    if (!op) {
      await Freights.update({ active: false }, { where: { id: req.body.id } });
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: op.Freight.referanceCode });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/activedFreight", ensureAuthenticated, async (req, res) => {
  try {
    await Operations.update(
      { active: true },
      { where: { freightId: req.body.id } }
    );
    await Freights.update({ active: true }, { where: { id: req.body.id } });
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/downloadInvoice", ensureAuthenticated, async (req, res) => {
  try {
    const { guid, type, company } = req.body;
    const pdfDir = "./files/invoices";
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    if (fs.existsSync(`${pdfDir}/${req.body.guid}.pdf`)) {
      res.download(`${pdfDir}/${req.body.guid}.pdf`);
    } else {
      const response = await axios.post(
        `${process.env.API_URL}/getInvoicePdf`,
        { apiKey: process.env.API_KEY, company, type, guid },
        { responseType: "arraybuffer" }
      );
      if (
        response.status === 200 &&
        response.headers["content-length"] !== "0"
      ) {
        const fileName = `${guid}.pdf`;
        const fileData = Buffer.from(response.data, "binary");
        fs.writeFileSync(`${pdfDir}/${fileName}`, fileData);
        apiLog(
          req.ip,
          req.body,
          `${pdfDir}/${fileName}`,
          "success",
          req.path,
          req.user.name
        );
        res.download(`${pdfDir}/${fileName}`);
      } else {
        apiLog(
          req.ip,
          req.body,
          "filenotfound",
          "warning",
          req.path,
          req.user.name
        );
        res.json({ success: false, msg: "filenotfound" });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getPaymentTrackings", ensureAuthenticated, async (req, res) => {
  try {
    let where = { type: req.body.type, isCancelled: false };
    if (
      req.body.searchDate &&
      req.body.searchDate[0] &&
      req.body.searchDate[1]
    ) {
      const dateBeg = DateTime.fromISO(req.body.searchDate[0])
        .toLocal()
        .toString();
      const dateEnd = DateTime.fromISO(req.body.searchDate[1])
        .toLocal()
        .plus({ days: 1 })
        .toString();
      where = {
        ...where,
        date: { [Op.and]: [{ [Op.gte]: dateBeg }, { [Op.lte]: dateEnd }] },
      };
    }
    const filterData = await PaymentTrackings.findAll({
      include: [
        {
          model: Operations,
          attributes: ["id"],
          where: {
            carrierCompany: { [Op.ne]: null },
            type: req.body.type,
            isCancelled: false,
          },
          include: [
            {
              model: Freights,
              attributes: ["companyName", "referanceCode"],
              where: {
                companyName: { [Op.ne]: null },
                referanceCode: { [Op.ne]: null },
              },
            },
            {
              model: Suppliers,
              attributes: ["supplierName"],
              where: { supplierName: { [Op.ne]: null } },
            },
          ],
        },
      ],
    });
    let pWhere = {};
    if (req.body.customer) {
      pWhere = {
        "$Operation.Freight.companyName$": {
          [Op.iLike]: `%${req.body.customer}%`,
        },
      };
    }
    if (req.body.supplier) {
      pWhere = {
        ...pWhere,
        "$Operation.Supplier.supplierName$": {
          [Op.iLike]: `%${req.body.supplier}%`,
        },
      };
    }
    let options = {
      where: pWhere,
      order: [["createdAt", "desc"]],
      include: [
        {
          model: Operations,
          attributes: [
            "cPaidDate",
            "sPaidDate",
            "sPaymentDate",
            "cPaymentDate",
            "active",
            "type",
          ],
          where: where,
          include: [
            {
              model: Freights,
              attributes: [
                "cMaturityDay",
                "sMaturityDay",
                "companyName",
                "currency",
                "cash",
                "price",
                "supplierOffer",
                "referanceCode",
              ],
              where: req.body.operation
                ? { referanceCode: req.body.operation }
                : {},
            },
            { model: Suppliers, attributes: ["supplierName"] },
          ],
        },
      ],
    };
    if (!req.body.allData) {
      options = {
        ...options,
        limit: req.body.perPage,
        offset: req.body.page * req.body.perPage - req.body.perPage,
      };
    }
    let { rows, count } = await PaymentTrackings.findAndCountAll(options);
    let total = Math.ceil(count / Number(req.body.perPage));
    let currencies = {};
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].Operation.Freight) {
        rows[i]["totalProfit"] =
          rows[i].Operation.Freight.cash -
          rows[i].Operation.Freight.supplierOffer;
        if (currencies[rows[i].Operation.Freight.currency]) {
          currencies[rows[i].Operation.Freight.currency].profit +=
            rows[i].Operation.Freight.cash -
            rows[i].Operation.Freight.supplierOffer;
          currencies[rows[i].Operation.Freight.currency].totallogisticsales +=
            rows[i].Operation.Freight.supplierOffer;
          currencies[
            rows[i].Operation?.Freight.currency
          ].totaltransportationfee += rows[i].Operation.Freight.cash;
        } else {
          currencies = {
            ...currencies,
            [rows[i].Operation.Freight.currency]: {
              totallogisticsales: rows[i].Operation.Freight.supplierOffer,
              totaltransportationfee: rows[i].Operation.Freight.cash,
              profit:
                rows[i].Operation.Freight.cash -
                rows[i].Operation.Freight.supplierOffer,
            },
          };
        }
        rows[i].dataValues["profit"] = Math.round(
          rows[i].Operation.Freight.cash -
            rows[i].Operation.Freight.supplierOffer
        ).toLocaleString("tr-TR");
        if (rows[i].Operation.Freight) {
          rows[i].Operation.Freight.dataValues["supplierOffer"] =
            rows[i].Operation.Freight.supplierOffer.toLocaleString();
          rows[i].Operation.Freight.dataValues["cash"] =
            rows[i].Operation.Freight.cash.toLocaleString();
        }
      }
    }
    res.json({
      success: true,
      data: {
        data: rows,
        total: currencies,
        count,
        totalPage: total,
        customers: [
          ...new Set([
            ...filterData.map((x) => x.Operation.Freight.companyName),
          ]),
        ],
        suppliers: [
          ...new Set([
            ...filterData.map((x) => x.Operation.Supplier.supplierName),
          ]),
        ],
        operationNames: [
          ...new Set([
            ...filterData.map((x) => x.Operation.Freight.referanceCode),
          ]),
        ],
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/updatePaymentTracking", ensureAuthenticated, async (req, res) => {
  try {
    await PaymentTrackings.update(
      {
        exportCountry: req.body.exportCountry,
        exportCustomer: req.body.exportCustomer,
      },
      { where: { id: req.body.id } }
    );
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/exportExcel", ensureAuthenticated, async (req, res) => {
  try {
    const data = JSON.parse(JSON.stringify(req.body.excelData));
    const total = JSON.parse(JSON.stringify(req.body.total));
    let tempData = [];
    let temp = {};
    let rtempData = [];
    const workbook = new ExcelJS.Workbook();
    const operations = workbook.addWorksheet(`Operasyonlar`, {
      properties: { defaultRowHeight: 28 },
      pageSetup: {
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        verticalCentered: true,
        paperSize: 9,
        orientation: "portrait",
        margins: {
          left: 0.3149606,
          right: 0.3149606,
          top: 0.3543307,
          bottom: 0.3543307,
          header: 0.3149606,
          footer: 0.3149606,
        },
      },
    });
    let report = workbook.addWorksheet(`Rapor`, {
      properties: { defaultRowHeight: 28 },
      pageSetup: {
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        verticalCentered: true,
        paperSize: 9,
        orientation: "portrait",
        margins: {
          left: 0.3149606,
          right: 0.3149606,
          top: 0.3543307,
          bottom: 0.3543307,
          header: 0.3149606,
          footer: 0.3149606,
        },
      },
    });
    for (let i = 0; i < data.length; i++) {
      let currency = convertCurrency(data[i].Operation.Freight.currency);
      temp = {
        referanceCode: data[i].Operation.Freight.referanceCode
          ? `${req.body.referanceKey}${data[i].Operation.Freight.referanceCode}`
          : "",
        date: DateTime.fromISO(data[i].date).toFormat("dd-MM-yyyy"),
        customerName: data[i].Operation.Freight.companyName,
        exportCountry: data[i].exportCountry,
        exportCustomer: data[i].exportCustomer,
        supplierName: data[i].Operation.Supplier?.supplierName,
        supplierPrice: `${data[
          i
        ].Operation.Freight.supplierOffer.toLocaleString()} ${currency}`,
        sMaturity: data[i].Operation.Freight.sMaturityDay
          ? `${data[i].Operation.Freight.sMaturityDay} Gün`
          : "Peşin",
        transportationPrice: `${data[
          i
        ].Operation.Freight.cash.toLocaleString()} ${currency}`,
        cMaturity: data[i].Operation.Freight.cMaturityDay
          ? `${data[i].Operation.Freight.cMaturityDay} Gün`
          : "Peşin",
        profit: data[i].profit ? `${data[i].profit} ${currency}` : "",
        collectionDate: DateTime.fromISO(
          data[i].Operation.cPaymentDate
        ).toFormat("dd-MM-yyyy"),
        paymentDate: DateTime.fromISO(data[i].Operation.sPaymentDate).toFormat(
          "dd-MM-yyyy"
        ),
      };
      tempData.push(temp);
    }
    report.columns = [];
    const columns = [];
    const rows = {};
    for (const key in total) {
      const currency = total[key];
      columns.push(
        {
          header: `Toplam Lojistikçi Ücreti (${convertCurrency(key, "text")})`,
          key: `totallogisticsales_${key}`,
          width: 30,
        },
        {
          header: `Toplam Taşıma Ücreti (${convertCurrency(key, "text")})`,
          key: `totaltransportationfee_${key}`,
          width: 30,
        },
        {
          header: `Kâr (${convertCurrency(key, "text")})`,
          key: `profit_${key}`,
          width: 12,
        }
      );
      rows[`totallogisticsales_${key}`] = `${
        currency.totallogisticsales
      } ${convertCurrency(key, "text")}`;
      rows[`totaltransportationfee_${key}`] = `${
        currency.totaltransportationfee
      } ${convertCurrency(key, "text")}`;
      rows[`profit_${key}`] = `${currency.profit} ${convertCurrency(
        key,
        "text"
      )}`;
    }
    report.columns = columns;
    rtempData.push(rows);
    report.addRows(rtempData);
    operations.columns = [
      { header: "Referans Kodu", key: "referanceCode", width: 20 },
      { header: "Tarih", key: "date", width: 20 },
      { header: "Müşteri Firma Adı", key: "customerName", width: 40 },
      { header: "İhracat Y. Ülke", key: "exportCountry", width: 20 },
      { header: "İhracat Y. Müşteri", key: "exportCustomer", width: 30 },
      { header: "Lojistik Firma Adı", key: "supplierName", width: 40 },
      { header: "Lojistik Ücreti", key: "supplierPrice", width: 20 },
      { header: "Tedarikçi Vade", key: "sMaturity", width: 15 },
      { header: "Taşıma Ücreti", key: "transportationPrice", width: 20 },
      { header: "Müşteri Vade", key: "cMaturity", width: 15 },
      { header: "Kâr", key: "profit", width: 12 },
      { header: "Tahsilat Günü", key: "collectionDate", width: 15 },
      { header: "Ödeme Günü", key: "paymentDate", width: 15 },
    ];
    operations.addRows(tempData);
    const row = operations.getRow(1);
    for (let i = 1; i < row._cells.length + 1; i++) {
      const cell = row.getCell(i);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FAD105" },
      };
    }
    const rRow = report.getRow(1);
    for (let i = 1; i < rRow._cells.length + 1; i++) {
      const cell = rRow.getCell(i);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FAD105" },
      };
    }
    operations.columns.forEach((column) => {
      column.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });
    report.columns.forEach((column) => {
      column.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });
    const direct = "./files/excelReport";
    if (fs.existsSync(direct)) {
      fs.rmdirSync(direct, { recursive: true });
      fs.mkdirSync(direct, { recursive: true });
    } else {
      fs.mkdirSync(direct, { recursive: true });
    }
    await workbook.xlsx.writeFile(`${direct}/${req.body.name}`);
    res.download(`${direct}/${req.body.name}`);
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/setRefKey", ensureAuthenticated, async (req, res) => {
  try {
    const { intRefCode, domRefCode, intRefKey, domRefKey, vat } = req.body;
    if (req.user.type === "Super" || req.user.type === "Admin") {
      let data = {
        intRefKey: intRefKey.trim(),
        domRefKey: domRefKey.trim(),
        intRefCode,
        domRefCode,
        vat,
      };
      const settings = await Settings.findOne({ where: { userId: 0 } });
      if (!settings) {
        await Settings.create({ userId: 0, EMAIL: [], colorSettings: [] });
      }
      await Settings.update({ EMAIL: data }, { where: { userId: 0 } });
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "noauthority" });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/seenFile", ensureAuthenticated, async (req, res) => {
  try {
    await Files.update({ seen: true }, { where: { path: req.body.fileName } });
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/editVehicleStatus", ensureAuthenticated, async (req, res) => {
  try {
    await Logs.create(req.body);
    await Operations.update(
      { vehicleStatus: req.body.status },
      { where: { id: req.body.operationId } }
    );
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/getVehicleStatuses", ensureAuthenticated, async (req, res) => {
  try {
    const vehicleStatuses = await Logs.findAll({
      where: {
        [Op.and]: [
          { type: "vehicle" },
          { status: { [Op.ne]: null } },
          { status: { [Op.ne]: "" } },
          { fileName: null },
        ],
      },
      attributes: ["status"],
      group: ["status"],
    });
    const vehicleLogs = await Operations.findOne({
      where: { id: req.body.id },
      include: [
        {
          model: Logs,
          attributes: ["status", "createdAt", "id", "fileName"],
          where: {
            [Op.and]: [
              { type: "vehicle" },
              { status: { [Op.ne]: null } },
              { status: { [Op.ne]: "" } },
            ],
          },
        },
      ],
      order: [[Logs, "createdAt", "desc"]],
    });
    const vehiclePlates = await Vehicles.findAll({
      where: { operationId: req.body.id, frontPlate: { [Op.ne]: null } },
      attributes: ["frontPlate"],
      group: ["frontPlate"],
    });
    let plates = ["Plaka Belli Değil"];
    for (let i = 0; i < vehiclePlates.length; i++) {
      plates.push(vehiclePlates[i].frontPlate);
    }
    res.json({
      success: true,
      data: {
        vehicleLogs: vehicleLogs?.Logs || [],
        vehicleStatuses: vehicleStatuses.map((x) => x.status),
        plates: [...new Set([...plates])],
      },
    });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/deleteVehicleStatus", ensureAuthenticated, async (req, res) => {
  try {
    await Logs.destroy({ where: { id: req.body.id } });
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
    console.log(err);
  }
});

router.post("/blockIp", async (req, res) => {
  try {
    const ipData = process.env.SAFE_IP.split(",");
    if (!ipData.includes(req.ip)) {
      await IpBlocks.create({ ip: req.ip });
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "safeip" });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/checkForm", async (req, res) => {
  try {
    const blockControl = await IpBlocks.findOne({ where: { ip: req.ip } });
    if (blockControl) {
      res.json({ success: false });
    } else {
      const form = await CustomerForms.findOne({
        where: { id: req.body.id, uuId: req.body.uuId },
      });
      if (form) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/confirmFreightForm", async (req, res) => {
  try {
    const blockControl = await IpBlocks.findOne({ where: { ip: req.ip } });
    if (blockControl) {
      res.json({ success: false });
    } else {
      const name = `${req.body.name} ${req.body.lastName}`;
      const confirm = await Confirmations.create({
        ip: req.ip,
        name,
        freightId: req.body.id,
      });
      if (confirm) {
        const user = await Users.findOne({
          where: { id: req.body.purchasingRep },
          attributes: ["phone"],
        });
        if (user && user.phone) {
          sendSMS(
            user.phone,
            `${req.body.companyName} isimli müşteri ${name} adı ile ${req.body.referanceCode} referans kodlu navlun formuna onay vermiştir.`
          );
        }
        res.json({ success: true });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/setCardColour", ensureAuthenticated, async (req, res) => {
  try {
    const setColour = await Operations.update(
      { colour: req.body.colour },
      { where: { id: req.body.id } }
    );
    if (setColour) {
      await Logs.create({
        status: "cardcolour",
        operationId: req.body.id,
        creatorId: req.user.id,
        type: "static",
      });
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/editShipmentForm", ensureAuthenticated, async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    const shipmentForm = await ShipmentForms.findOne({
      where: { operationId: data.operationId },
    });
    if (shipmentForm) {
      await shipmentForm.update(data);
    } else {
      await ShipmentForms.create(data);
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/exportPdf", ensureAuthenticated, async (req, res) => {
  try {
    const pdfMaker = async (docDefinition) => {
      return new Promise((resolve, reject) => {
        try {
          const buffer = [];
          const fonts = {
            Roboto: {
              normal: "./public/fonts/Roboto-Regular.ttf",
              bold: "./public/fonts/Roboto-Medium.ttf",
              italics: "./public/fonts/Roboto-Italic.ttf",
              bolditalics: "./public/fonts/Roboto-MediumItalic.ttf",
            },
            Symbol: { normal: "Symbol" },
            ZapfDingbats: { normal: "ZapfDingbats" },
          };
          const printer = new PdfPrinter(fonts);
          const pdfDoc = printer.createPdfKitDocument(
            docDefinition,
            null,
            fonts
          );
          pdfDoc.on("data", (chunk) => buffer.push(chunk));
          pdfDoc.on("end", () => resolve(Buffer.concat(buffer)));
          pdfDoc.on("error", (err) => reject(err));
          pdfDoc.end();
        } catch (err) {
          reject();
        }
      });
    };
    const populateTemp = () => {
      const style = {
        bold: true,
        fillColor: "#fad105",
        alignment: "left",
        margin: [0, 7],
      };
      const rowStyle = { width: "auto", alignment: "left" };
      const headers = [
        {
          image: "./public/images/Cakir-lojistik-crop.png",
          width: 100,
          height: 100,
          alignment: "center",
        },
        { text: req.body.refCode, ...style },
        { text: req.body.carrierComp, ...style },
        { text: req.body.agreeAmountCarrier, ...style },
        { text: req.body.maturityCarrier, ...style },
        { text: req.body.agreeAmountReceiving, ...style },
        { text: req.body.maturitReceiving, ...style },
        { text: req.body.loadingDate, ...style },
        { text: req.body.loadingLocation, ...style },
        { text: req.body.customsLocation, ...style },
        { text: req.body.loadingAddress, ...style },
        { text: req.body.domesticTransportation, ...style },
        { text: req.body.weightT, ...style },
        { text: req.body.shippingT, ...style },
        { text: req.body.deliveryAddress, ...style },
        { text: req.body.deliveryDuration, ...style },
        { text: req.body.vehiclePlateFront, ...style },
        { text: req.body.vehiclePlateTrailer, ...style },
        { text: req.body.vehicleQuantity, ...style },
        { text: req.body.customInformation, ...style },
        { text: req.body.documentDelivery, ...style },
        { text: req.body.borderCrossing, ...style },
      ];
      const values = [
        {},
        { text: req.body.Freight.referanceCode, ...rowStyle },
        { text: req.body.Supplier?.supplierName, ...rowStyle },
        {
          text: `${req.body.Freight.supplierOffer.toLocaleString(
            "tr-TR"
          )} ${convertCurrency(req.body.Freight.currency, "text")} ${req.body.ShipmentForm?.ydg === "true" ? `+ ${req.body.ShipmentForm?.ydgAmount} ${convertCurrency(req.body.ShipmentForm?.ydgCurrency, "text")} YDG` : ""}`,
          ...rowStyle,
        },
        {
          text: req.body.Freight.sMaturityDay
            ? `${req.body.Freight.sMaturityDay} Gün`
            : DateTime.fromISO(req.body.Freight.sLastPayDay).toFormat(
                "dd-MM-yyyy"
              ),
          ...rowStyle,
        },
        {
          text: `${req.body.Freight.cash.toLocaleString(
            "tr-TR"
          )} ${convertCurrency(req.body.Freight.currency, "text")} ${req.body.ShipmentForm?.ydg === "true" ? `+ ${req.body.ShipmentForm?.ydgAmount} ${convertCurrency(req.body.ShipmentForm?.ydgCurrency, "text")} YDG` : ""}`,
          ...rowStyle,
        },
        {
          text: req.body.Freight.cMaturityDay
            ? `${req.body.Freight.cMaturityDay} Gün`
            : DateTime.fromISO(req.body.Freight.cLastPayDay).toFormat(
                "dd-MM-yyyy"
              ),
          ...rowStyle,
        },
        {
          text: req.body.Freight.loadDate
            ? DateTime.fromISO(req.body.Freight.loadDate).toFormat("dd-MM-yyyy")
            : "",
          ...rowStyle,
        },
        { text: req.body.ShipmentForm?.deliveryCompany, ...rowStyle },
        { text: req.body.ShipmentForm?.customsLocation, ...rowStyle },
        {
          text: req.body.Freight.Addresses?.filter(
            (x) => x.type === "loadingpoint"
          )
            .map((x) => x.address)
            .join("  -  "),
          ...rowStyle,
        },
        {
          text:
            req.body.ShipmentForm?.domesticTransp === "true"
              ? `${req.body.ShipmentForm.totalDomTPrice.toLocaleString("tr-TR")} TL`
              : "YOK",
          ...rowStyle,
        },
        { text: req.body.weightType, ...rowStyle },
        { text: req.body.shippingType, ...rowStyle },
        {
          text: req.body.Freight.deliveryCompany
            ? `${
                req.body.Freight.deliveryCompany
              } - ${req.body.Freight.Addresses?.filter(
                (x) => x.type === "deliveryaddress"
              )
                .map((x) => x.address)
                .join("  -  ")} `
            : "",
          ...rowStyle,
        },
        { text: `${req.body.Freight.deliveryDate} Gün`, ...rowStyle },
        {
          text: req.body.Vehicles?.map((x) => x.frontPlate).join("  -  "),
          ...rowStyle,
        },
        {
          text: req.body.Vehicles?.map((x) => x.trailerPlate).join("  -  "),
          ...rowStyle,
        },
        { text: req.body.Vehicles.length, width: "auto", alignment: "left" },
        { text: req.body.ShipmentForm?.customInformation, ...rowStyle },
        { text: req.body.ShipmentForm?.documentDelivery, ...rowStyle },
        { text: req.body.ShipmentForm?.borderCrossing, ...rowStyle },
      ];
      let data = [];
      for (let i = 0; i < headers.length; i++) {
        data.push([headers[i], values[i]]);
      }
      return data;
    };
    const docDefinition = {
      content: [
        {
          table: {
            headerRows: 1,
            widths: Array(18).fill(270),
            body: populateTemp(),
          },
        },
      ],
      pageSize: "A4",
      pageMargins: [20, 20, 20, 20],
      defaultStyle: { font: "Roboto", fontSize: 7, alignment: "center" },
    };
    const path = "./files/shipmentpdf/";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    const pathDirect = `${path}${req.body.name}`;
    const pdf = await pdfMaker(docDefinition);
    fs.writeFileSync(pathDirect, Buffer.from(pdf.toString("base64"), "base64"));
    apiLog(req.ip, req.body, pathDirect, "success", req.path, req.user.name);
    res.download(pathDirect);
  } catch (err) {
    console.log(err);
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post(
  "/getLogoCustomersSuppliers",
  ensureAuthenticated,
  async (req, res) => {
    try {
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
      res.json({ success: true });
    } catch (err) {
      console.log(err);
      apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
      res.json({ success: false, msg: err });
    }
  }
);

router.post("/setLoc", ensureAuthenticated, async (req, res) => {
  try {
    if (!req.body.data.map || !req.body.data.map.place_name) {
      res.json({ success: false, msg: "locationrequired" });
      return;
    }
    const response = await Locations.findOne({
      where: {
        operationId: req.body.data.operationId,
        plate: req.body.data.plate,
      },
      attributes: ["map", "loc"],
    });
    if (response) {
      await Locations.update(req.body.data, {
        where: {
          operationId: req.body.data.operationId,
          plate: req.body.data.plate,
        },
      });
    } else {
      await Locations.create(req.body.data);
    }
    await Logs.create({
      operationId: req.body.data.operationId,
      status: req.body.data.map.place_name,
      creatorId: req.user.id,
      type: "vehicle",
      fileName: req.body.data.plate,
    });
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getLoc", async (req, res) => {
  try {
    const blockControl = await IpBlocks.findOne({ where: { ip: req.ip } });
    if (blockControl) {
      res.json({ success: false });
    } else {
      const response = await Locations.findOne({
        where: { operationId: req.body.operationId, plate: req.body.plate },
        attributes: ["map", "loc"],
      });
      if (response) {
        res.json({ success: true, data: response });
      } else {
        res.json({ success: false });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getLocations", async (req, res) => {
  try {
    const blockControl = await IpBlocks.findOne({ where: { ip: req.ip } });
    if (blockControl) {
      res.json({ success: false });
    } else {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(
          req.body.key
        )}.json?access_token=${process.env.access_token}
      `
      );
      if (response.status) {
        const locData = response.data.features;
        let locations = [];
        for (let i = 0; i < locData.length; i++) {
          locations.push(locData[i].place_name);
        }
        res.json({ success: true, locations, locData });
      } else {
        res.json({ success: false });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getVehiclesInfo", ensureAuthenticated, async (req, res) => {
  try {
    const data = await Operations.findOne({
      where: { id: req.body.id },
      attributes: ["carrierCompany"],
      include: [
        {
          model: Vehicles,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    res.json({ success: true, data });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getVehicle", async (req, res) => {
  try {
    const blockControl = await IpBlocks.findOne({ where: { ip: req.ip } });
    if (blockControl) {
      res.json({ success: false });
    } else {
      const check = await Freights.findOne({
        where: { id: req.body.id, "$CustomerForm.uuId$": req.body.uuId },
        attributes: ["id"],
        include: [{ model: CustomerForms, attributes: ["uuId"] }],
      });
      if (check) {
        const plates = await Locations.findAll({
          where: { operationId: req.body.opId },
          attributes: ["plate"],
          group: ["plate"],
        });
        const vehicleLogs = await Logs.findAll({
          where: {
            fileName: { [Op.ne]: null },
            type: "vehicle",
            operationId: req.body.opId,
            status: {
              [Op.and]: [
                { [Op.ne]: null },
                { [Op.notIn]: ["", "vehicleinfo"] },
              ],
            },
          },
          attributes: ["status", "createdAt", "id"],
          order: [["createdAt", "desc"]],
        });
        res.json({
          success: true,
          data: {
            vehicleLogs,
            plates: plates.map((x) => x.plate),
            data: { id: req.body.opId },
          },
        });
      } else {
        res.json({ success: false });
      }
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/updateFines", ensureAuthenticated, async (req, res) => {
  try {
    let data = JSON.parse(JSON.stringify(req.body.fines));
    if (req.body.deletedFinesIds.length > 0) {
      await Fines.destroy({
        where: { id: { [Op.in]: req.body.deletedFinesIds } },
      });
    }
    for (let i = 0; i < data.length; i++) {
      if (!data[i].id) {
        await Fines.create({ ...data[i], operationId: req.body.id });
      } else {
        const id = data[i].id;
        delete data[i].id;
        await Fines.update(
          { ...data[i], operationId: req.body.id },
          { where: { id: id } }
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getOperationNotes", ensureAuthenticated, async (req, res) => {
  try {
    const result = await Operations.findOne({
      where: { id: req.body.id },
      include: [{ model: GeneralNotes }],
    });
    if (result) {
      res.json({ success: true, data: result.GeneralNotes });
    } else {
      res.json({ success: false, data: [] });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/setCarrier", ensureAuthenticated, async (req, res) => {
  try {
    const result = await Operations.update(
      { carrierCompany: req.body.carrierCompany },
      { where: { id: req.body.id } }
    );
    if (result) {
      await Logs.create({
        status: "carrierinfo",
        operationId: req.body.id,
        creatorId: req.user.id,
        type: "static",
      });
      res.json({ success: true });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getOperationInvoices", ensureAuthenticated, async (req, res) => {
  try {
    const data = await Invoices.findAll({
      where: { operationId: req.body.id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    res.json({ success: true, data: data });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post(
  "/updateOperationInvoices",
  ensureAuthenticated,
  async (req, res) => {
    try {
      let data = JSON.parse(JSON.stringify(req.body.invoices));
      if (req.body.deletedInvoiceIds.length > 0) {
        await Invoices.destroy({
          where: { id: { [Op.in]: req.body.deletedInvoiceIds } },
        });
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i].ficheNo) {
          if (!data[i].id) {
            await Invoices.create({
              ...data[i],
              operationId: req.body.operationId,
            });
          } else {
            const id = data[i].id;
            delete data[i].id;
            await Invoices.update(
              { ...data[i], operationId: req.body.operationId },
              { where: { id: id } }
            );
          }
        }
      }
      res.json({ success: true });
    } catch (err) {
      apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
      res.json({ success: false, msg: err });
    }
  }
);

router.post("/getBalanceSheet", ensureAuthenticated, async (req, res) => {
  try {
    const result = await axios.post(
      `${process.env.T_API_URL}/getBalanceSheet`,
      {
        ...req.body,
        lSQL_DB_NUMBER: process.env.lSQL_DB_NUMBER,
        lSQL_DB_NAME: process.env.lSQL_DB_NAME,
        lSQL_DB: process.env.lSQL_DB,
        apiKey: process.env.T_API_KEY,
        limit: req.body.perPage,
        offset: req.body.page * req.body.perPage - req.body.perPage,
      }
    );
    if (result.data.status) {
      res.json({ success: true, data: result.data.data });
    } else {
      apiLog(req.ip, req.body, result.data, "error", req.path, req.user.name);
      res.json({ success: false });
    }
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/getBalanceDetails", ensureAuthenticated, async (req, res) => {
  try {
    const result = await axios.post(
      `${process.env.T_API_URL}/getBalanceDetails`,
      {
        apiKey: process.env.T_API_KEY,
        lSQL_DB_NUMBER: process.env.lSQL_DB_NUMBER,
        lSQL_DB_NAME: process.env.lSQL_DB_NAME,
        lSQL_DB: process.env.lSQL_DB,
        code: req.body.code,
      }
    );
    res.json({ success: true, data: { detailsData: result.data.data } });
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

router.post("/sheetExportExcel", ensureAuthenticated, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("BALANCESHEET LİSTESİ", {
      properties: { defaultRowHeight: 30 },
    });
    let data = req.body.data || [];
    worksheet.columns = [
      { header: "KOD", key: "KOD", width: 20 },
      { header: "ÜNVAN", key: "UNVAN", width: 60 },
      { header: "BORÇ", key: "BORC", width: 20 },
      { header: "ALACAK", key: "ALACAK", width: 20 },
      { header: "BAKİYE", key: "BAKIYE", width: 20 },
      { header: "RENK", key: "RENK", width: 20 },
    ];
    worksheet.getRow(1).font = { family: 4, size: 16, bold: true };
    worksheet.addRows(data);
    const folder = `./files/${req.query.name}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    await workbook.xlsx.writeFile(`${folder}/${req.body.name}`);
    res.download(`${folder}/${req.body.name}`);
  } catch (err) {
    apiLog(req.ip, req.body, err, "error", req.path, req.user.name);
    res.json({ success: false, msg: err });
  }
});

module.exports = router;
