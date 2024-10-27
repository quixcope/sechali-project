import { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Group,
  Radio,
  Text,
  ActionIcon,
  SimpleGrid,
  Paper,
  Flex,
  Accordion,
  Modal,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import useTranslation from "next-translate/useTranslation";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import Loading from "./global/loading";
import { DateTime } from "luxon";
import Image from "next/image";
import { useViewportSize } from "@mantine/hooks";
import setLanguage from "next-translate/setLanguage";
import Icons from "../helpers/icon";
import { useRouter } from "next/router";
import { modalStyle } from "../helpers/functions";

const cdnLoader = ({ src }) => {
  return `${process.env.SERVER_IP}/${src}`;
};

const CustomersForm = (props) => {
  const router = useRouter();
  const { width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    filesData: [],
    deleteData: [],
    deleteModal: false,
    uploadedFiles: [],
    currency: [
      { label: t("eur"), value: "eur" },
      { label: t("usd"), value: "usd" },
      { label: t("gbp"), value: "gbp" },
      { label: t("try"), value: "try" },
    ],
    freightForm: false,
    customerId: "",
  });

  const notif = () => {
    notifications.clean();
    notifications.show({
      title: t("error"),
      message: t("requiredarea"),
      color: "red",
      icon: <Icons name="FaExclamationTriangle" />,
      radius: "lg",
    });
    return t("required");
  };

  const validate = !props.check
    ? {
        relatedPersonMail: (value) => (value === "" ? t("required") : null),
        taxPayer: (value) =>
          value.eInvoice && value.eArchive ? t("required") : null,
        invoiceSendingEA: (value) => (value === "" ? t("required") : null),
        currentReconliation: (value) => (value === "" ? notif() : null),
        accountingofficer: {
          name: (value) => (value === "" ? notif() : null),
          phone: (value) => (value === "" ? notif() : null),
          email: (value) => (value === "" ? notif() : null),
        },
        financeofficer: {
          name: (value) => (value === "" ? notif() : null),
          phone: (value) => (value === "" ? notif() : null),
          email: (value) => (value === "" ? notif() : null),
        },
      }
    : null;

  const form = useForm({
    initialValues: {
      companyName: "",
      companyAddress: "",
      addressCityTown: "",
      phone: "",
      fax: "",
      taxOffice: "",
      taxNumber: "",
      relatedPersonMail: "",
      relatedPersonMail2: "",
      mobilePhone: "",
      taxPayer: {
        eInvoice: "",
        eArchive: "",
      },
      invoiceSendingEA: "",
      currentReconliation: "",
      kepAddress: "",
      webAddress: "",
      requestingPerson: "",
      relatedDepartment: "",
      serviceProvided: "",
      paymentTerm: "",
      creditLimit: "",
      uuId: "",
      importauthority: {
        type: "importauthority",
        name: "",
        phone: "",
        email: "",
      },
      exportauthority: {
        type: "exportauthority",
        name: "",
        phone: "",
        email: "",
      },
      accountingofficer: {
        type: "accountingofficer",
        name: "",
        phone: "",
        email: "",
      },
      financeofficer: {
        type: "financeofficer",
        name: "",
        phone: "",
        email: "",
      },
    },
    validate: validate,
  });

  const getData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = await axios.post(`${process.env.SERVER_IP}/api/checkCForm`, {
      uuId: props.check ? props.data.uuId : props.uuId,
      id: props.check ? props.data.id : props.id,
      check: props.check,
    });
    if (data.data.success) {
      setState((prev) => ({
        ...prev,
        loading: false,
        customerId: data.data.data.Customer.id,
        uploadedFiles: data.data.data.Files,
        filesData: [],
      }));
      form.setValues((prev) => ({
        ...prev,
        ...data.data.data,
        ...data.data.data,
        companyName: data.data.data.Customer.customerName,
        companyAddress: data.data.data.Customer.address,
        addressCityTown: `${data.data.data.Customer.country}-${data.data.data.Customer.city}`,
        phone: data.data.data.Customer.phone,
        fax: data.data.data.Customer.fax,
        taxOffice: data.data.data.Customer.taxoffice,
        taxNumber: data.data.data.Customer.taxnr,
        invoiceSendingEA: data.data.data.Customer.email,
        cMaturityDay:
          data.data.data.cMaturity === "maturity"
            ? data.data.data.cMaturityDay
            : null,
        cash: data.data.data.cMaturity === "cash" ? data.data.data.cash : "",
        maturityCash:
          data.data.data.cMaturity === "maturity" ? data.data.data.cash : "",
      }));
      for (let i = 0; i < data.data.data.Contact?.contact.length; i++) {
        if (data.data.data.Contact.contact[i].name !== "") {
          form.setFieldValue(
            `${data.data.data.Contact.contact[i].type}`,
            data.data.data.Contact.contact[i]
          );
        }
      }
    }
  };

  const deleteElement = async (name) => {
    const delFile = await axios.post(
      `${process.env.SERVER_IP}/api/deleteFile`,
      {
        fileName: name,
        customerId: props.data.Customer.id,
        customerName: props.data.companyName,
        purchasingRep: props.data.purchasingRep,
        relatedId: props.data.id,
        check: true,
      }
    );
    if (delFile.data.status) {
      getData();
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
      let newData = [...state.uploadedFiles];
      newData = newData.filter((x) => x !== name);
      setState((prev) => ({
        ...prev,
        uploadedFiles: newData,
        deleteModal: false,
        deleteData: [],
      }));
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const seenFile = async (fileName) => {
    const response = await axios.post(`${process.env.SERVER_IP}/api/seenFile`, {
      fileName,
    });
    if (response.data.success) getData();
  };

  const downloadFile = async (name) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/downloadFormFiles`,
      { fileName: name, customerId: props.data.Customer.id },
      { responseType: "blob" }
    );
    if (response.status == 200) {
      getData();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
    }
  };

  const uploadedFiles = () => {
    const data = state.uploadedFiles;
    let temp = [];
    if (state.uploadedFiles.length > 0) {
      for (let i = 0; i < data.length; i++) {
        temp.push(
          <Accordion.Panel
            className="customer-form-accordion"
            key={`files${i}`}
          >
            <p>{data[i].path}</p>
            <p>
              {data[i].createdAt
                ? DateTime.fromISO(data[i].createdAt).toFormat("dd-MM-yyyy")
                : ""}
            </p>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 5 }}
            >
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() => downloadFile(data[i].path)}
              >
                <Icons variant="transparent" name="FaDownload" color="black" />
              </ActionIcon>
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  {
                    window.open(
                      `${process.env.SERVER_IP}/files/uploads/customerfiles/${props.data.Customer.id}/${data[i].path}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                    seenFile(data[i].path);
                  }
                }}
              >
                <Icons name="FaEye" color="black" />
              </ActionIcon>
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    deleteModal: true,
                    deleteData: data[i].path,
                  }))
                }
              >
                <Icons variant="transparent" name="FaTrashAlt" color="black" />
              </ActionIcon>
              <ActionIcon
                color={
                  data[i].seen ? "rgb(75, 129, 43)" : "rgba(250, 209, 5, 1)"
                }
                style={{ cursor: "pointer", marginRight: 20 }}
              >
                <Icons
                  name={data[i].seen ? "AiOutlineCheck" : "AiOutlineClose"}
                  color="black"
                />
              </ActionIcon>
            </div>
          </Accordion.Panel>
        );
      }
    }
    return temp;
  };

  const handleSubmit = async (values) => {
    setState((prev) => ({ ...prev, loading: true }));
    const checkUuId = await axios.post(
      `${process.env.SERVER_IP}/api/checkUuId`,
      {
        uuId: props.check ? props.data.uuId : props.uuId,
        check: props.check ? true : false,
      }
    );
    if (checkUuId.data.success) {
      const data = {
        ...values,
        taxPayer:
          values.taxPayer.eInvoice === "" && values.taxPayer.eArchive === ""
            ? ""
            : values.taxPayer,
        uuId: props.check ? props.data.uuId : props.uuId,
        filesData: state.filesData,
        checkUpdate: props.check ? true : false,
        customerId: state.customerId,
      };
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/createCustomerForms`,
        data
      );
      if (response.data.success) {
        !props.check ? form.reset() : props.getData({});
        notifications.show({
          title: t("success"),
          color: "green",
          radius: "lg",
          icon: <Icons name="FaRegCheckCircle" />,
          autoClose: 5000,
        });
        getData();
      } else {
        notifications.show({
          title: t("error"),
          color: "red",
          radius: "lg",
          icon: <Icons name="FaExclamationTriangle" />,
        });
      }
    } else {
      notifications.show({
        title: t("error"),
        message: t("alreadylink"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
        autoClose: 5000,
      });
    }
    setState((prev) => ({ ...prev, loading: false }));
  };

  const populateContacts = () => {
    let temp = [];
    const contacts = [
      "accountingofficer",
      "financeofficer",
      "importauthority",
      "exportauthority",
    ];
    for (let i = 0; i < contacts.length; i++) {
      temp.push(
        <Paper
          px={{ base: 30, xs: 30, sm: 20, md: 5, lg: 30, xl: 80 }}
          py="xl"
          shadow="sm"
          radius="xs"
          key={`contacts${i}`}
        >
          {contacts[i] === "financeofficer" ||
          contacts[i] === "accountingofficer" ? (
            <Flex mb={10} justify="center" align="center">
              <strong>
                {t(`${contacts[i]}`)} {t("required")}
              </strong>
            </Flex>
          ) : (
            <Flex justify="center" align="center">
              <strong>{t(`${contacts[i]}`)}</strong>
            </Flex>
          )}
          <Flex
            my={5}
            gap={8}
            align="center"
            justify="space-between"
            direction="row"
          >
            <p>{t("name")}: </p>
            <TextInput
              variant="unstyled"
              {...form.getInputProps(`${contacts[i]}.name`)}
            />
          </Flex>
          <Flex
            my={5}
            gap={8}
            align="center"
            justify="space-between"
            direction="row"
          >
            <p>{t("phone")}: </p>
            <TextInput
              variant="unstyled"
              {...form.getInputProps(`${contacts[i]}.phone`)}
            />
          </Flex>
          <Flex
            my={5}
            gap={8}
            align="center"
            justify="space-between"
            direction="row"
          >
            <p>{t("email")}: </p>
            <TextInput
              variant="unstyled"
              {...form.getInputProps(`${contacts[i]}.email`)}
            />
          </Flex>
        </Paper>
      );
    }
    return temp;
  };

  useEffect(() => {
    getData();
    if (props.check) {
      form.setValues((prev) => ({
        ...prev,
        ...props.data,
      }));
      for (let i = 0; i < props.data.Contact?.contact.length; i++) {
        if (props.data.Contact.contact[i].name !== "") {
          form.setFieldValue(
            `${props.data.Contact.contact[i].type}`,
            props.data.Contact.contact[i]
          );
        }
      }
    }
    console.log("customerform mounted");
    return () => {
      console.log("customerform unmounted");
    };
  }, []);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <div className="customer-form">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Paper
            className="navlunForm"
            m={{ base: 5, xs: 5, sm: 20, md: 150, lg: 150, xl: 150 }}
            shadow="sm"
            radius="xs"
            p="xl"
          >
            <Flex align="center" justify="center" w="100%">
              {width > 1100 ? (
                <Image
                  loader={cdnLoader}
                  width={626}
                  height={356}
                  src="images/Cakir-lojistik-crop.png"
                  alt="cakiraylogo"
                />
              ) : (
                <Image
                  loader={cdnLoader}
                  width={313}
                  height={178}
                  src="images/Cakir-lojistik-crop.png"
                  alt="cakiraylogo"
                />
              )}
            </Flex>
            <Flex
              w="100%"
              direction="row"
              aling="center"
              justify="center"
              gap={10}
            >
              <Text>
                <strong style={{ color: "red", fontSize: 25 }}>
                  {t("customerinformationform")}
                </strong>
              </Text>
            </Flex>
            {!props.check ? (
              <Flex
                w="100%"
                direction="row"
                aling="center"
                justify="center"
                gap={10}
              >
                <Button
                  leftSection={<Icons name="MdLanguage" size={20} />}
                  w={170}
                  className="buttons"
                  onClick={() =>
                    setLanguage(router.locale === "en" ? "tr" : "en")
                  }
                >
                  {t("changelanguage")}
                </Button>
              </Flex>
            ) : null}
            <SimpleGrid cols={{ base: 1, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}>
              <Paper shadow="sm" radius="xs" p="xl" m={10}>
                <SimpleGrid cols={1}>
                  <TextInput
                    w="100%"
                    label={t("companyname")}
                    variant="unstyled"
                    disabled
                    {...form.getInputProps("companyName")}
                  />
                  <TextInput
                    w="100%"
                    label={t("companyaddress")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("companyAddress")}
                  />
                  <TextInput
                    w="100%"
                    label={t("addresscitytown")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("addressCityTown")}
                  />
                  <TextInput
                    w="100%"
                    label={t("phone")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("phone")}
                  />
                  <TextInput
                    w="100%"
                    label={t("fax")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("fax")}
                  />
                  <TextInput
                    w="100%"
                    label={t("taxoffice")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("taxOffice")}
                  />
                  <TextInput
                    w="100%"
                    label={t("taxnrtcknno")}
                    disabled
                    variant="unstyled"
                    {...form.getInputProps("taxNumber")}
                  />
                </SimpleGrid>
              </Paper>
              <Paper shadow="sm" radius="xs" p="xl" m={10}>
                <SimpleGrid cols={1}>
                  <TextInput
                    label={t("relatedpersonmail1")}
                    variant="unstyled"
                    {...form.getInputProps("relatedPersonMail")}
                  />
                  <TextInput
                    label={t("relatedpersonmail2")}
                    variant="unstyled"
                    {...form.getInputProps("relatedPersonMail2")}
                  />
                  <TextInput
                    label={t("mobilephone")}
                    variant="unstyled"
                    {...form.getInputProps("mobilePhone")}
                  />
                  <Radio.Group
                    label={t("taxpayer")}
                    {...form.getInputProps("taxPayer")}
                  >
                    <Group>
                      <Radio
                        color="#4c5056"
                        label={t("einvoice")}
                        value="eInvoice"
                      />
                      <Radio
                        color="#4c5056"
                        label={t("earchive")}
                        value="eArchive"
                      />
                    </Group>
                  </Radio.Group>
                  <TextInput
                    label={t("invoicesendingea")}
                    variant="unstyled"
                    {...form.getInputProps("invoiceSendingEA")}
                  />
                  <TextInput
                    label={t("currentreconliation")}
                    variant="unstyled"
                    {...form.getInputProps("currentReconliation")}
                  />
                  <TextInput
                    label={t("kepaddress")}
                    variant="unstyled"
                    {...form.getInputProps("kepAddress")}
                  />
                  <TextInput
                    label={t("webaddress")}
                    variant="unstyled"
                    {...form.getInputProps("webAddress")}
                  />
                </SimpleGrid>
              </Paper>
            </SimpleGrid>
            {props.check ? (
              <>
                <Paper shadow="sm" radius="xs" p="xl" m={10}>
                  <SimpleGrid
                    cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 3, xl: 5 }}
                  >
                    <TextInput
                      label={t("requestingperson")}
                      variant="unstyled"
                      {...form.getInputProps("requestingPerson")}
                    />

                    <TextInput
                      label={t("relateddepartment")}
                      variant="unstyled"
                      {...form.getInputProps("relatedDepartment")}
                    />

                    <TextInput
                      label={t("serviceprovided")}
                      variant="unstyled"
                      {...form.getInputProps("serviceProvided")}
                    />

                    <TextInput
                      label={t("paymentterm")}
                      variant="unstyled"
                      {...form.getInputProps("paymentTerm")}
                    />

                    <TextInput
                      label={t("creditLimit")}
                      variant="unstyled"
                      {...form.getInputProps("creditLimit")}
                    />
                  </SimpleGrid>
                </Paper>
              </>
            ) : null}
            <SimpleGrid cols={{ base: 1, xs: 1, sm: 1, md: 3, lg: 4, xl: 4 }}>
              {populateContacts()}
            </SimpleGrid>
            {props.check ? (
              <>
                <Flex my={20} align="center" justify="center">
                  <h2>{t("files")}</h2>
                </Flex>
                <Flex
                  align="center"
                  justify="center"
                  w="100%"
                  direction="column"
                >
                  <Accordion
                    radius="xs"
                    w="100%"
                    maw="690px"
                    defaultValue="files"
                  >
                    <Accordion.Item value="files">
                      <Accordion.Control>
                        <strong>{t(`uploadedfiles`)}</strong>
                      </Accordion.Control>
                      {uploadedFiles()}
                    </Accordion.Item>
                  </Accordion>
                </Flex>
              </>
            ) : null}
            <Flex my={30} align="center" justify="center" w="100%">
              <Button className="buttons" type="submit">
                {props.check ? t("update") : t("send")}
              </Button>
            </Flex>
          </Paper>
        </form>
      </div>
      <Modal
        {...modalStyle}
        opened={state.deleteModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            deleteModal: false,
            deleteData: [],
          }))
        }
      >
        <Grid>
          <Grid.Col>
            {router.locale === "tr"
              ? `${state.deleteData} ${t("areusuredeletefile")}`
              : `${t("areusuredeletefile")} ${state.deleteData} ?`}
          </Grid.Col>
          <Grid.Col
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              className="buttons"
              onClick={() => deleteElement(state.deleteData)}
            >
              {t("yes")}
            </Button>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  deleteModal: false,
                  deleteData: [],
                }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
};

export default CustomersForm;
