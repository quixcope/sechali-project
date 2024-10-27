import { useEffect, useState } from "react";
import { DataTable, useDataTableColumns } from "mantine-datatable";
import axios from "axios";
import Loading from "../global/loading";
import useTranslation from "next-translate/useTranslation";
import { convertCurrency, modalStyle } from "../../helpers/functions";
import { DateTime } from "luxon";
import Icons from "../../helpers/icon";
import { useForm } from "@mantine/form";
import {
  Grid,
  TextInput,
  Modal,
  ScrollArea,
  NumberInput,
  Button,
  Select,
  ActionIcon,
  Group,
  Flex,
  SimpleGrid,
  Paper,
  Accordion,
  Text,
  Menu,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import NoteModal from "../modal/notemodal";
import DocumentViewer from "../global/documentviewer";
import Invoices from "../invoices";
import { notifications } from "@mantine/notifications";
import { useViewportSize } from "@mantine/hooks";
import { useOs } from "@mantine/hooks";
import ImageModal from "../modal/imgmodal";

let resetFunctions = { rcoLogs: null, rctLogs: null, rcwLogs: false };

const LogTable = ({ userAgent, general, colorSettings, projectType }) => {
  const os = useOs();
  const { width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    selectData: [],
    data: [],
    logBookModal: false,
    opId: null,
    invoiceModal: false,
    GRPCODE: "",
    invoice: { ficheNo: "", guid: "", type: "", operationId: null },
    productTypes: [],
    customers: [],
    title: "",
    carriers: [],
    carrierData: [],
    page: 1,
    perPage: "10",
    count: 0,
    searchReceiving: "",
    searchCarrier: "",
    disabled: false,
    colors: { duringoperation: "", completedoperation: "", notstartedyet: "" },
    searchDate: [null, null],
    total: 0,
    international: general.EMAIL.intRefKey || "ÇKR",
    domestic: general.EMAIL.domRefKey || "LJSY",
    deletedIds: [],
    searchAddress: {},
    addresses: [],
    compAddr: [],
    delAddr: [],
    deliveringAddresses: [],
    searchDAddress: {},
    deliveryCompany: [],
    referanceCodes: [],
    searchReferance: "",
    files: [],
    modalLoading: false,
    docModal: false,
    selectedFile: "",
    fines: [],
    selectNote: [],
    notes: [],
    noteModal: false,
    finesAttachment: false,
    accordLoading: false,
    searchDeliveryComp: "",
    deletedInvoiceIds: [],
    invoiceIndex: null,
    invoiceId: null,
  });

  const form = useForm({
    initialValues: {
      referanceCode: "",
      carrierCompany: null,
      receivingCompany: "",
      requestingPerson: "",
      deliveryAddress: "",
      deliveryCompany: "",
      unloadingDate: "",
      carrierAgreement: "",
      recipientAgreement: "",
      paymentCarrier: "",
      paymentReceipent: "",
      cMaturityDay: "",
      paymentDayRecipient: "",
      paymentDayCarrier: "",
      loadDate: null,
      productType: "",
      cPaymentDay: "",
      sPaymentDay: "",
      currency: "",
      cPaymentStatus: "",
      sPaymentStatus: "",
      Addresses: [],
      deliveryDate: null,
      operationManager: "",
      vehicles: [
        {
          driverName: "",
          driverNo: "",
          driverIdNo: "",
          frontPlate: "",
          trailerPlate: "",
          id: null,
        },
      ],
      sPaidDate: null,
      cPaidDate: null,
      fines: [{ finesPrice: "", currency: "" }],
      invoices: [{ ficheNo: "", guid: "", type: "", id: null }],
    },
  });

  const properties = { draggable: true, resizable: true, toggleable: true };

  const getData = async ({
    searchCarrier = state.searchCarrier,
    searchDate = state.searchDate,
    searchReceiving = state.searchReceiving,
    page = state.page,
    perPage = state.perPage,
    searchReferance = state.searchReferance,
    type = projectType,
    searchDeliveryComp = state.searchDeliveryComp,
  }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = {
      searchCarrier,
      searchReceiving,
      page,
      perPage,
      searchDate,
      type,
      searchReferance,
      searchDeliveryComp,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getLogBookOperations`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        ...response.data.data,
        loading: false,
      }));
    }
  };

  const handleSubmit = async (values) => {
    let data = { ...values, id: state.opId, deletedIds: state.deletedIds };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/iOperationDetails`,
      data
    );
    if (response.data.success) {
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
      getData({});
    } else {
      notifications.show({
        title: t("error"),
        message: t(`${response.data.msg}`),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const getFiles = async (id, fines) => {
    setState((prev) => ({ ...prev, accordLoading: true }));
    const files = await axios.post(
      `${process.env.SERVER_IP}/api/getOperationFiles`,
      { id: id, fines }
    );
    if (files.data.success) {
      setState((prev) => ({
        ...prev,
        files: files.data.data,
        finesAttachment: fines,
        accordLoading: false,
      }));
    }
  };

  const getNotes = async (id) => {
    setState((prev) => ({ ...prev, accordLoading: true }));
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOperationNotes`,
      { id: id }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        notes: response.data.data,
        accordLoading: false,
      }));
    }
  };

  const setRow = async (rows) => {
    setState((prev) => ({ ...prev, modalLoading: true }));
    let temp = {};
    const findAddresses = state.addresses.find(
      (x) => x.id == rows.Freight.CustomerForm.Customer.id
    );
    let compAddr;
    if (findAddresses) {
      compAddr = findAddresses.addresses;
    } else {
      compAddr = [];
    }
    const findDAddresses = state.deliveringAddresses.find(
      (x) => x.company == rows.Freight.deliveryCompany
    );
    let delAddr = [];
    if (findDAddresses) {
      delAddr = [...findDAddresses.addresses, ...state.compAddr] || [];
    } else {
      delAddr = [...compAddr];
    }
    form.setValues((prev) => ({
      ...prev,
      referanceCode: rows.Freight.referanceCode || "",
      receivingCompany: rows.Freight.CustomerForm.Customer.customerName || "",
      productType: rows.Freight.productType || "",
      carrierCompany: rows.carrierCompany ? `${rows.carrierCompany}` : null,
      requestingPerson: rows.Freight.CustomerForm.requestingPerson || "",
      unloadingDate:
        `${DateTime.fromISO(rows.Freight.unloadDates[0]).toFormat(
          "dd-MM-yyyy"
        )} / ${DateTime.fromISO(rows.Freight.unloadDates[1]).toFormat(
          "dd-MM-yyyy"
        )}` || "",
      carrierAgreement: rows.Freight.supplierOffer || "",
      recipientAgreement: rows.Freight.cash || "",
      cMaturityDay: rows.Freight.cMaturityDay
        ? rows.Freight.cMaturityDay
        : rows.Freight.cLastPayDay
          ? t("cash")
          : "",
      sMaturityDay: rows.Freight.sMaturityDay
        ? rows.Freight.sMaturityDay
        : rows.Freight.sLastPayDay
          ? t("cash")
          : "",
      paymentDayRecipient: rows.paymentReceipent || "",
      paymentDayCarrier: rows.paymentDayCarrier || "",
      loadDate: DateTime.fromISO(rows.Freight.loadDate).toJSDate() || "",
      cPaymentDay: `${rows.cPaymentDay}` || "",
      sPaymentDay: `${rows.sPaymentDay}` || "",
      Addresses: rows.Freight.Addresses || [],
      currency: rows.Freight.currency ? t(`${rows.Freight.currency}`) : "",
      cPaymentStatus: rows.cPaidDate ? "paid" : "unpaid",
      sPaymentStatus: rows.sPaidDate ? "paid" : "unpaid",
      deliveryCompany: rows.Freight.deliveryCompany || "",
      vehicles: rows.Vehicles,
      sPaidDate: rows.sPaidDate
        ? DateTime.fromISO(rows.sPaidDate).toJSDate()
        : null,
      cPaidDate: rows.cPaidDate
        ? DateTime.fromISO(rows.cPaidDate).toJSDate()
        : null,
      deliveryDate: rows.deliveryDate
        ? DateTime.fromISO(rows.deliveryDate).toJSDate()
        : null,
      operationManager: rows.Freight.OperationManager?.name,
      fines: rows.Fines || [{ finesPrice: "", currency: "" }],
    }));
    setState((prev) => ({
      ...prev,
      ...temp,
      logBookModal: true,
      opId: rows.id,
      title: rows.operationName,
      disabled: !rows.active ? true : false,
      delAddr: [...new Set([...delAddr])],
      compAddr,
      modalLoading: false,
    }));
  };

  const getInvoices = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOperationInvoices`,
      { id: state.opId }
    );
    if (response.data.success) {
      form.setValues((prev) => ({ ...prev, invoices: response.data.data }));
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const downloadInvoice = async (guid, type) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/downloadInvoice`,
      { guid, type, company: "CAKIR" },
      { responseType: "blob" }
    );
    if (response.status == 200) {
      const url = window.URL.createObjectURL(response.data);
      if (os === "macos" || os === "ios") {
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${guid}.pdf`);
        document.body.appendChild(link);
        link.click();
      } else {
        window.open(url);
      }
    } else {
      notifications.show({
        title: t("error"),
        message: t("invoicedownloaderror"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const updateInvoices = async (values) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/updateOperationInvoices`,
      {
        invoices: values,
        operationId: state.opId,
        deletedInvoiceIds: state.deletedInvoiceIds,
      }
    );
    if (response.data.success) {
      getData({});
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const populateInvoices = () => {
    let temp = [];
    const { invoices } = form.values;
    for (let i = 0; i < invoices.length; i++) {
      temp.push(
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={`key${i}`}>
          <Flex
            align="center"
            justify="space-between"
            direction={{
              base: "column",
              xs: "column",
              sm: "row",
              md: "row",
              lg: "row",
              xl: "row",
            }}
            gap={5}
          >
            <TextInput
              disabled
              {...form.getInputProps(`invoices.${i}.ficheNo`)}
            />
            <TextInput disabled value={t(invoices[i].invoiceCategory)} />
            {form.values.invoices[i].ficheNo ? (
              <ActionIcon
                variant="transparent"
                onClick={() =>
                  downloadInvoice(
                    form.values.invoices[i].guid,
                    form.values.invoices[i].type
                  )
                }
              >
                <Icons name="FaEye" color="black" />
              </ActionIcon>
            ) : (
              <div></div>
            )}
            <Button
              miw={120}
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  invoiceModal: true,
                  GRPCODE: "1",
                  invoiceIndex: i,
                  invoiceId: form.values.invoices[i].id,
                }))
              }
            >
              {t("selectinvoice")}
            </Button>
            <ActionIcon
              variant="transparent"
              onClick={() => {
                form.removeListItem("invoices", i);
                if (invoices[i].id) {
                  setState((prev) => ({
                    ...prev,
                    deletedInvoiceIds: [
                      ...prev.deletedInvoiceIds,
                      invoices[i].id,
                    ],
                  }));
                }
              }}
            >
              <Icons name="RxCross1" size="1rem" color="black" />
            </ActionIcon>
          </Flex>
        </Grid.Col>
      );
    }
    return temp;
  };

  const populateFines = () => {
    let temp = [];
    const { fines } = form.values;
    for (let i = 0; i < fines.length; i++) {
      temp.push(
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={`key${i}`}>
          <Flex
            align="center"
            justify="flex-start"
            direction={{
              base: "row",
              xs: "row",
              sm: "row",
              md: "row",
              lg: "row",
              xl: "row",
            }}
            gap={70}
          >
            <NumberInput
              disabled
              label={t("price")}
              thousandSeparator
              defaultValue={0.0}
              decimalScale={2}
              {...form.getInputProps(`fines.${i}.finesPrice`)}
            />
            <Select
              disabled
              label={t("currency")}
              data={[
                { label: t("eur"), value: "eur" },
                { label: t("usd"), value: "usd" },
                { label: t("gbp"), value: "gbp" },
                { label: t("try"), value: "try" },
              ]}
              {...form.getInputProps(`fines.${i}.currency`)}
            />
          </Flex>
        </Grid.Col>
      );
    }
    return temp;
  };

  const populateAddress = (type) => {
    let temp = [];
    const values =
      type == "loadingpoint"
        ? { search: "searchAddress", data: "compAddr" }
        : { search: "searchDAddress", data: "delAddr" };
    const { Addresses } = form.values;
    for (let i = 0; i < Addresses.length; i++) {
      if (Addresses[i].type === type) {
        temp.push(
          <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={`key${i}`}>
            <Paper shadow="xs" p="lg">
              <Flex
                align="center"
                justify="space-between"
                direction={{
                  base: "column",
                  xs: "column",
                  sm: "row",
                  md: "row",
                  lg: "row",
                  xl: "row",
                }}
                gap={17}
              >
                <Select
                  disabled={state.disabled}
                  w="100%"
                  searchable
                  clearable
                  allowDeselect={false}
                  data={state[values.data] || []}
                  label={<strong>{t(`${type}`)}</strong>}
                  searchValue={state[values.search][i] || ""}
                  onSearchChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [values.search]: { ...prev[values.search], [i]: e },
                    }))
                  }
                  nothingFoundMessage={
                    state[values.search][i] ? (
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          form.setFieldValue(
                            `Addresses.${i}.address`,
                            state[values.search][i]
                          );
                          setState((prev) => ({
                            ...prev,
                            [values.data]: [
                              ...prev[values.data],
                              state[values.search][i],
                            ],
                            [values.search]: {
                              ...prev[values.search],
                              [i]: "",
                            },
                          }));
                        }}
                      >{`+ ${t("addnewaddress")} ${state[values.search][i]}`}</a>
                    ) : null
                  }
                  {...form.getInputProps(`Addresses.${i}.address`)}
                />
                <ActionIcon
                  disabled={state.disabled}
                  className="deleteIcon"
                  mt={24}
                  variant="transparent"
                  onClick={() => {
                    form.removeListItem("Addresses", i);
                    if (Addresses[i].id) {
                      setState((prev) => ({
                        ...prev,
                        deletedIds: [...prev.deletedIds, Addresses[i].id],
                      }));
                    }
                  }}
                >
                  <Icons name="RxCross1" size="1rem" color="black" />
                </ActionIcon>
              </Flex>
            </Paper>
          </Grid.Col>
        );
      }
    }
    return temp;
  };

  const downloadFile = async (name) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/downloadOpFiles`,
      {
        path: state.finesAttachment ? `${state.opId}/fines` : state.opId,
        fileName: name,
      },
      { responseType: "blob" }
    );
    if (response.status == 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
    }
  };

  const populateFiles = () => {
    let temp = [];
    const data = state.files;
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== "fines") {
        temp.push(
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #ccc",
              padding: 4,
              marginTop: 4,
            }}
            key={`files${i}`}
          >
            {data[i]}
            <div style={{ display: "flex", gap: 2, textWrap: "nowrap" }}>
              {data[i].endsWith("png") ||
              data[i].endsWith("jpg") ||
              data[i].endsWith("jpeg") ||
              data[i].endsWith("pdf") ? (
                <ActionIcon
                  color="rgba(250, 209, 5, 1)"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const modal = data[i].endsWith("pdf")
                      ? "docModal"
                      : "imgModal";
                    setState((prev) => ({
                      ...prev,
                      selectedFile: data[i],
                      [modal]: true,
                    }));
                  }}
                >
                  <Icons name="FaEye" color="black" />
                </ActionIcon>
              ) : null}
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() => downloadFile(data[i])}
              >
                <Icons name="FaDownload" color="black" />
              </ActionIcon>
            </div>
          </div>
        );
      }
    }
    return temp;
  };

  const populateNotes = () => {
    let temp = [];
    const data = state.notes;
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Grid.Col
          className="grid-col"
          style={{ cursor: "pointer" }}
          key={`notes${i}`}
          onClick={() =>
            setState((prev) => ({
              ...prev,
              noteModal: true,
              selectNote: data[i],
              edit: true,
            }))
          }
        >
          <Text>{data[i].title}</Text>
        </Grid.Col>
      );
    }
    temp.push(
      <Grid.Col key={`button`}>
        <Button
          variant="transparent"
          onClick={() =>
            setState((prev) => ({ ...prev, noteModal: true, edit: false }))
          }
        >
          {t("addnot")}
        </Button>
      </Grid.Col>
    );
    return temp;
  };

  const selectDeliveryCompany = (e, ftype) => {
    if (ftype === "form") {
      form.setValues((prev) => ({
        ...prev,
        Addresses: [
          ...prev.Addresses.filter((x) => x.type !== "deliveryaddress"),
        ],
        deliveryCompany: e,
      }));
    } else {
      form.setValues((prev) => ({
        ...prev,
        Addresses: [
          ...prev.Addresses.filter((x) => x.type !== "deliveryaddress"),
        ],
        deliveryCompany: e,
      }));
    }
    const findAddresses = state.deliveringAddresses.find((x) => x.company == e);
    let delAddr = [];
    if (findAddresses) {
      delAddr = [...findAddresses.addresses, ...state.compAddr] || [];
    }
    setState((prev) => ({
      ...prev,
      delAddr: [...new Set([...delAddr])],
      searchDAddress: {},
    }));
  };

  const populatePlates = () => {
    let temp = [];
    const data = form.values.vehicles;
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        temp.push(
          <Accordion.Panel
            className="customer-form-accordion"
            key={`files${i}`}
          >
            <Flex
              align="center"
              justify="center"
              direction={{
                base: "column",
                xs: "column",
                sm: "row",
                md: "row",
                lg: "row",
                xl: "row",
              }}
              gap={30}
            >
              <TextInput
                disabled
                label={`${t("vehicleplate")} (${t("front")})`}
                value={data[i].frontPlate}
              />
              <TextInput
                disabled
                label={`${t("vehicleplate")} (${t("trailer")})`}
                value={data[i].trailerPlate}
              />
              <TextInput
                disabled
                label={t("drivername")}
                value={data[i].driverName}
              />
              <TextInput
                disabled
                label={t("driveridno")}
                value={data[i].driverIdNo}
              />
              <TextInput
                disabled
                label={t("driverno")}
                value={data[i].driverNo}
              />
            </Flex>
          </Accordion.Panel>
        );
      }
    }
    return temp;
  };

  const key = "logs";

  const {
    effectiveColumns,
    resetColumnsOrder: rcoLogs,
    resetColumnsToggle: rctLogs,
    resetColumnsWidth: rcwLogs,
  } = useDataTableColumns({
    key,
    columns: [
      {
        accessor: "Freight.referanceCode",
        title: t("referancecode"),
        render: (data) => `${state[projectType]}${data.Freight.referanceCode}`,
        filter: (
          <Select
            label={t("referancecode")}
            description={t("searchbyreferancecode")}
            data={state.referanceCodes}
            value={state.searchReferance}
            placeholder={t("searchbyreferancecode")}
            onChange={(e) => getData({ searchReferance: e || "" })}
            leftSection={<Icons name="FcSearch" size={14} />}
            clearable
            searchable
          />
        ),
        filtering: state.searchReferance !== "",
        ...properties,
      },
      {
        accessor: "Supplier.supplierName",
        title: t("carriercompany"),
        render: (data) => data.Supplier?.supplierName || t("notyetselected"),
        filter: (
          <Select
            label={t("carriercompany")}
            description={t("searchbycarrier")}
            data={state.carrierData}
            value={state.searchCarrier}
            placeholder={t("searchbycarrier")}
            onChange={(e) => getData({ searchCarrier: e || "" })}
            leftSection={<Icons name="FcSearch" size={14} />}
            clearable
            searchable
          />
        ),
        filtering: state.searchCarrier !== "",
        ...properties,
      },
      {
        accessor: "Freight.CustomerForm.Customer.customerName",
        title: t("receivingcompany"),
        filter: (
          <Select
            label={t("receivingcompany")}
            description={t("searchbyreceiving")}
            data={state.customers}
            value={state.searchReceiving}
            placeholder={t("searchbyreceiving")}
            onChange={(e) => getData({ searchReceiving: e || "" })}
            leftSection={<Icons name="FcSearch" size={14} />}
            clearable
            searchable
          />
        ),
        filtering: state.searchReceiving !== "",
        ...properties,
      },
      {
        accessor: "Freight.CustomerForm.requestingPerson",
        title: t("requestingperson"),
        ...properties,
      },
      {
        accessor: "Freight.loadDate",
        title: t("loadingdate"),
        render: (data) =>
          DateTime.fromISO(data.Freight.loadDate).toFormat("dd-MM-yyyy"),
        ...properties,
      },
      {
        accessor: "loadingPoint",
        title: t("loadingpoint"),
        render: (data) =>
          data.Freight.Addresses
            ? data.Freight.Addresses.filter((x) => x.type === "loadingpoint")
                .map((x) => x.address)
                .join(", ")
            : "",
        ...properties,
      },
      {
        accessor: "deliveryAddress",
        title: t("deliveryaddress"),
        render: (data) =>
          data.Freight.Addresses
            ? data.Freight.Addresses.filter((x) => x.type === "deliveryaddress")
                .map((x) => x.address)
                .join(", ")
            : "",
        ...properties,
      },
      {
        accessor: "Freight.deliveryCompany",
        title: t("deliveringcompany"),
        filter: (
          <Select
            label={t("deliveringcompany")}
            description={t("searchbydeliveringcompany")}
            data={state.deliveryCompany}
            value={state.searchDeliveryComp}
            placeholder={t("searchbydeliveringcompany")}
            onChange={(e) => getData({ searchDeliveryComp: e || "" })}
            leftSection={<Icons name="FcSearch" size={14} />}
            clearable
            searchable
          />
        ),
        filtering: state.searchDeliveryComp !== "",
        ...properties,
      },
      {
        accessor: "estimatedUnloadDate",
        title: t("estimatedunloaddate"),
        render: (data) =>
          `${DateTime.fromISO(data.Freight.unloadDates[0]).toFormat("dd-MM-yyyy")} / ${DateTime.fromISO(data.Freight.unloadDates[1]).toFormat("dd-MM-yyyy")}`,
        ...properties,
      },
      {
        accessor: "Freight.supplierOffer",
        title: t("carrieragreement"),
        render: (data) =>
          `${data.Freight.supplierOffer} ${convertCurrency(
            data.Freight.currency
          )}`,
        ...properties,
      },
      {
        accessor: "Freight.cash",
        title: t("recipientagreement"),
        render: (data) =>
          `${data.Freight.cash} ${convertCurrency(data.Freight.currency)}`,
        ...properties,
      },
      {
        accessor: "deliveryDate",
        title: t("deliverydate"),
        render: ({ deliveryDate }) =>
          deliveryDate
            ? DateTime.fromISO(deliveryDate).toFormat("dd-MM-yyyy")
            : "",
        ...properties,
      },
      {
        accessor: "cMaturityDay",
        title: `${t("maturity")} (${t("customer")})`,
        render: (data) =>
          data.Freight?.cMaturityDay
            ? `${data.Freight?.cMaturityDay} ${t("day")}`
            : data.Freight.cLastPayDay
              ? t("cash")
              : "",
        ...properties,
      },
      {
        accessor: "remadaysForCollection",
        title: t("remadaysforcollection"),
        render: ({ cPaidDate, cPaymentDay }) =>
          cPaidDate ? t("paid") : `${cPaymentDay}` || "",
        cellsStyle: ({ cPaidDate, cPaymentDay }) =>
          !cPaidDate &&
          cPaymentDay < 0 && {
            fontWeight: "bold",
            color: "black",
            background: "#c60000",
          },
        ...properties,
      },
      {
        accessor: "cPaidDate",
        title: `${t("paiddate")} (${t("customer")})`,
        render: ({ cPaidDate }) =>
          cPaidDate ? DateTime.fromISO(cPaidDate).toFormat("dd-MM-yyyy") : "",
        ...properties,
      },
      {
        accessor: "sLastPayDay",
        title: `${t("maturity")} (${t("supplier")})`,
        render: (data) =>
          data.Freight?.sMaturityDay
            ? `${data.Freight?.sMaturityDay} ${t("day")}`
            : data.Freight.sLastPayDay
              ? t("cash")
              : "",
        ...properties,
      },
      {
        accessor: "sPaymentDay",
        title: `${t("dayforpayment")}`,
        render: ({ sPaidDate, sPaymentDay }) =>
          sPaidDate ? t("paid") : `${sPaymentDay}` || "",
        cellsStyle: ({ sPaidDate, sPaymentDay }) =>
          !sPaidDate &&
          sPaymentDay < 0 && {
            fontWeight: "bold",
            color: "black",
            background: "#c60000",
          },
        ...properties,
      },
      {
        accessor: "sPaidDate",
        title: `${t("paiddate")} (${t("supplier")})`,
        render: ({ sPaidDate }) =>
          sPaidDate ? DateTime.fromISO(sPaidDate).toFormat("dd-MM-yyyy") : "",
        ...properties,
      },
    ],
  });

  useEffect(() => {
    getData({});
    console.log("logtable mounted");
    return () => {
      console.log("logtable unmounted");
    };
  }, [projectType]);

  useEffect(() => {
    resetFunctions.rcoRequests = rcoLogs;
    resetFunctions.rctLogs = rctLogs;
    resetFunctions.rcwLogs = rcwLogs;
  }, [rcoLogs, rctLogs, rcwLogs]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon color="#4c5056">
            <Icons name="MdOutlineSettings" color="#fff" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            <Text fw={700}>{t("filtersettings")}</Text>
          </Menu.Label>
          <Menu.Item
            leftSection={<Icons name="TbReload" />}
            onClick={() =>
              getData({
                searchCarrier: "",
                searchReceiving: "",
                searchDeliveryComp: "",
                searchReferance: "",
              })
            }
          >
            {t("resetfilters")}
          </Menu.Item>
          <Menu.Label>
            <Text fw={700}>{t("tablesettings")}</Text>
          </Menu.Label>
          <Menu.Item leftSection={<Icons name="TbReload" />} onClick={rctLogs}>
            {t("showhiddencolumns")}
          </Menu.Item>
          <Menu.Item leftSection={<Icons name="TbReload" />} onClick={rcoLogs}>
            {t("resetcolumnorder")}
          </Menu.Item>
          <Menu.Divider />
        </Menu.Dropdown>
      </Menu>
      <Grid>
        <Grid.Col h={width > 800 ? "87vh" : "80vh"}>
          <DataTable
            onRowClick={(e) => setRow(e.record)}
            withTableBorder
            withColumnBorders
            columns={effectiveColumns}
            totalRecords={state.count}
            recordsPerPage={state.perPage}
            onPageChange={(e) => getData({ page: e })}
            page={state.page}
            recordsPerPageOptions={["10", "20", "30", "40", "50", "100"]}
            onRecordsPerPageChange={(e) => getData({ page: 1, perPage: e })}
            rowBackgroundColor={({ active }) => {
              if (!active) {
                return colorSettings?.completedoperation || "#c0c5ce";
              } else if (active) {
                return colorSettings?.duringoperation || "#fad105";
              }
            }}
            storeColumnsKey={key}
            noRecordsText={t("norecord")}
            borderColor="black"
            rowBorderColor="black"
            recordsPerPageLabel={t("perpagerecord")}
            paginationActiveBackgroundColor="dark"
            records={state.data}
          />
        </Grid.Col>
      </Grid>
      <Modal
        className="logModal"
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        size="70rem"
        title={<strong>{state.title}</strong>}
        opened={state.logBookModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            logBookModal: false,
            GRPCODE: "",
            invoice: "",
            disabled: false,
            deletedIds: [],
            files: [],
            opId: null,
          }))
        }
      >
        {state.modalLoading ? (
          <Loading />
        ) : (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Grid>
              <Grid.Col span={12}>
                <SimpleGrid
                  cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
                >
                  <TextInput
                    w="100%"
                    disabled
                    label={t("referancecode")}
                    {...form.getInputProps("referanceCode")}
                  />
                </SimpleGrid>
              </Grid.Col>
              <Grid.Col>
                <Grid>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      w="100%"
                      disabled
                      label={t("receivingcompany")}
                      {...form.getInputProps("receivingCompany")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <Select
                      disabled
                      label={t("carriercompany")}
                      searchable
                      clearable
                      data={state.carrierData}
                      {...form.getInputProps("carrierCompany")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <Select
                      label={t("deliveringcompany")}
                      searchable
                      clearable
                      disabled={state.disabled}
                      allowDeselect={false}
                      data={state.deliveryCompany}
                      onChange={(e) => selectDeliveryCompany(e, "form")}
                      value={form.values.deliveryCompany}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <Select
                      disabled={state.disabled}
                      label={t("material")}
                      data={state.productTypes}
                      {...form.getInputProps("productType")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled={state.disabled}
                      label={t("requestingperson")}
                      {...form.getInputProps("requestingPerson")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={t("operationmanager")}
                      {...form.getInputProps("operationManager")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 12 }}>
                    <Accordion radius="xs" w="100%">
                      <Accordion.Item value="plates">
                        <Accordion.Control>
                          <strong>{t(`vehicleinformation`)}</strong>
                        </Accordion.Control>
                        {populatePlates()}
                      </Accordion.Item>
                      <Accordion.Item value="files">
                        <Accordion.Control
                          onClick={() => getFiles(state.opId, false)}
                        >
                          <strong>{t(`uploadedfiles`)}</strong>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Grid.Col>
                            {state.accordLoading ? (
                              <Loading />
                            ) : (
                              populateFiles()
                            )}
                          </Grid.Col>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item value="notes">
                        <Accordion.Control onClick={() => getNotes(state.opId)}>
                          <strong>{t(`notes`)}</strong>
                        </Accordion.Control>
                        <Accordion.Panel>
                          {state.accordLoading ? <Loading /> : populateNotes()}
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item value="fines">
                        <Accordion.Control
                          onClick={() => getFiles(state.opId, true)}
                        >
                          <strong>{t(`additionalcosts`)}</strong>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Grid>
                            <Grid.Col>
                              {state.accordLoading ? (
                                <Loading />
                              ) : (
                                populateFiles()
                              )}
                            </Grid.Col>
                            {populateFines()}
                          </Grid>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item value="invoices">
                        <Accordion.Control
                          onClick={() => getInvoices(state.opId)}
                        >
                          <strong>{t(`invoices`)}</strong>
                        </Accordion.Control>
                        <Accordion.Panel>
                          {populateInvoices()}
                          <Flex
                            mt={50}
                            align="center"
                            justify="space-around"
                            direction={{
                              base: "row",
                              xs: "row",
                              sm: "row",
                              md: "row",
                              lg: "row",
                              xl: "row",
                            }}
                            gap={100}
                          >
                            <Button
                              mt={5}
                              className="buttons"
                              onClick={() =>
                                form.insertListItem("invoices", {
                                  ficheNo: "",
                                  guid: "",
                                  type: "",
                                  id: null,
                                })
                              }
                            >
                              {t("add")}
                            </Button>
                            <Button
                              mt={5}
                              className="buttons"
                              onClick={() =>
                                updateInvoices(form.values.invoices)
                              }
                            >
                              {t("save")}
                            </Button>
                          </Flex>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <DatePickerInput
                      disabled={state.disabled}
                      label={t("loadingdate")}
                      locale={userAgent.lang === "tr" ? "tr" : "en"}
                      {...form.getInputProps("loadDate")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={t("estimateddeliverydate")}
                      {...form.getInputProps("unloadingDate")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={t("carrieragreement")}
                      {...form.getInputProps("carrierAgreement")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={t("recipientagreement")}
                      {...form.getInputProps("recipientAgreement")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      label={`${t("maturity")} (${t("customer")})`}
                      disabled
                      {...form.getInputProps("cMaturityDay")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      label={`${t("maturity")} (${t("supplier")})`}
                      disabled
                      {...form.getInputProps("sMaturityDay")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={`${t("remadaysforcollection")}`}
                      {...form.getInputProps("cPaymentDay")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={`${t("dayforpayment")}`}
                      {...form.getInputProps("sPaymentDay")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <Select
                      data={[
                        { label: t("paid"), value: "paid" },
                        { label: t("unpaid"), value: "unpaid" },
                      ]}
                      label={`${t("paymentstatus")} (${t("customer")})`}
                      {...form.getInputProps("cPaymentStatus")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <Select
                      data={[
                        { label: t("paid"), value: "paid" },
                        { label: t("unpaid"), value: "unpaid" },
                      ]}
                      label={`${t("paymentstatus")} (${t("supplier")})`}
                      {...form.getInputProps("sPaymentStatus")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    {form.values.cPaymentStatus === "paid" && (
                      <DatePickerInput
                        locale={userAgent.lang === "tr" ? "tr" : "en"}
                        label={`${t("paiddate")} (${t("customer")})`}
                        {...form.getInputProps("cPaidDate")}
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    {form.values.sPaymentStatus === "paid" && (
                      <DatePickerInput
                        locale={userAgent.lang === "tr" ? "tr" : "en"}
                        label={`${t("paiddate")} (${t("supplier")})`}
                        {...form.getInputProps("sPaidDate")}
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <TextInput
                      disabled
                      label={t("currency")}
                      {...form.getInputProps("currency")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                    <DatePickerInput
                      locale={userAgent.lang === "tr" ? "tr" : "en"}
                      label={`${t("deliverydate")}`}
                      {...form.getInputProps("deliveryDate")}
                    />
                  </Grid.Col>
                  {populateAddress("loadingpoint")}
                  <Grid.Col>
                    <Group justify="center" mt="md">
                      <Button
                        disabled={state.disabled}
                        className="buttons"
                        onClick={() =>
                          form.insertListItem("Addresses", {
                            type: "loadingpoint",
                            address: "",
                          })
                        }
                      >
                        {t("newloadpoint")}
                      </Button>
                    </Group>
                  </Grid.Col>
                  {populateAddress("deliveryaddress")}
                  <Grid.Col>
                    <Group justify="center" mt="md">
                      <Button
                        disabled={state.disabled}
                        className="buttons"
                        onClick={() =>
                          form.insertListItem("Addresses", {
                            type: "deliveryaddress",
                            address: "",
                          })
                        }
                      >
                        {t("newdeliveryaddress")}
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
            </Grid>
            <Flex w="100%" align="center" justify="center" my={10} mt={70}>
              <Button className="buttons" type="submit">
                {t("save")}
              </Button>
            </Flex>
          </form>
        )}
      </Modal>
      <Modal
        closeOnClickOutside={false}
        fullScreen
        opened={state.invoiceModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            invoiceModal: false,
            GRPCODE: "",
            invoice: null,
            invoiceIndex: null,
          }))
        }
      >
        <Invoices
          userAgent={userAgent}
          GRPCODE={state.GRPCODE}
          FOREIGN={"0"}
          type={projectType}
          setValues={form.setValues}
          setFieldValue={form.setFieldValue}
          invoices={form.invoices}
          index={state.invoiceIndex}
          set={setState}
          invoiceId={state.invoiceId}
        />
      </Modal>
      <Modal
        opened={state.docModal}
        onClose={() => setState((prev) => ({ ...prev, docModal: false }))}
        fullScreen
        className="attachment-pdf-modal"
      >
        <DocumentViewer
          file={`${process.env.SERVER_IP}/files/operationfiles/${state.finesAttachment ? `${state.opId}/fines` : state.opId}/${state.selectedFile}`}
        />
      </Modal>
      <ImageModal
        opened={state.imgModal}
        src={`files/operationfiles/${state.finesAttachment ? `${state.opId}/fines` : state.opId}/${state.selectedFile}`}
        onClose={() => setState((prev) => ({ ...prev, imgModal: false }))}
      />
      <NoteModal
        opened={state.noteModal}
        onClose={() =>
          setState((prev) => ({ ...prev, noteModal: false, selectNote: [] }))
        }
        setState={setState}
        getData={getData}
        data={{
          creator: userAgent.id,
          type: "international",
          opId: state.opId,
          referanceCode: form.values.referanceCode,
          selectNote: state.selectNote,
          edit: state.edit,
        }}
      />
    </>
  );
};

/**
 * Resets Columns Order, Columns Toggle and Columns Width for Logs Datatable
 */
const rtLogs = () => {
  const { rcoLogs, rctLogs, rcwLogs } = resetFunctions;

  if (rcoLogs) rcoLogs();
  if (rctLogs) rctLogs();
  if (rcwLogs) rcwLogs();
};

export default LogTable;
export { rtLogs };
