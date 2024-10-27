import { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  Button,
  Grid,
  TextInput,
  Checkbox,
  NumberInput,
  Radio,
  Group,
  ActionIcon,
  Flex,
  Paper,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import useTranslation from "next-translate/useTranslation";
import Loading from "./global/loading";
import Icons from "../helpers/icon";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import { convertCurrency } from "../helpers/functions";

const FreightForm = (props) => {
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    weightType: [
      { label: "FTL", value: "FTL" },
      { label: t("PARTIAL"), value: "PARTIAL" },
    ],
    currency: [
      { label: `${t("eur")} €`, value: "eur" },
      { label: `${t("usd")} $`, value: "usd" },
      { label: `${t("gbp")} £`, value: "gbp" },
      { label: `${t("try")} ₺`, value: "try" },
    ],
    shippingType: [
      { label: t("roadtransport"), value: "roadtransport" },
      { label: t("martimetransport"), value: "martimetransport" },
      { label: t("airtransport"), value: "airtransport" },
      { label: t("railtransport"), value: "railtransport" },
    ],
    clients: [],
    search: "",
    user: [],
    searchProductType: "",
    pType: [],
    maturityData: [],
    searchCMaturity: "",
    searchSMaturity: "",
    relatedPerson: props.relatedPersons || [],
    searchRPerson: "",
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
    deletedIds: [],
    addresses: [],
    searchAddress: {},
    searchDAddress: {},
    compAddr: [],
    loading: true,
    deliveryCompany: [],
    searchDCompany: "",
    deliveringAddresses: [],
    delAddr: [],
    vat: props.general.EMAIL.vat || process.env.CURRENT_VAT,
  });

  const form = useForm({
    initialValues: {
      relatedPerson: "",
      companyName: null,
      companyAddress: "",
      purchasingRep: "",
      YDG: false,
      productType: null,
      weightType: "",
      currency: "",
      price: "",
      loadDate: null,
      shippingType: "",
      orderDate: null,
      deliveryDate: [null, null],
      Addresses: [
        { type: "loadingpoint", address: "" },
        { type: "deliveryaddress", address: "" },
      ],
      shipping: "",
      type: props.userAgent.projectType,
      cash: "",
      cMaturityDay: "",
      sMaturityDay: null,
      cLastPayDay: null,
      sLastPayDay: null,
      cMaturity: "maturity",
      sMaturity: "maturity",
      cPaymentMethod: "wiretransfer",
      sPaymentMethod: "wiretransfer",
      supplierOffer: "",
      referanceCode: "",
      deliveryCompany: "",
      operationManager: "",
    },
    validate: {
      type: (value) => (value === "" ? t("required") : null),
      companyName: (value) => (!value ? t("required") : null),
      purchasingRep: (value) => (value === "" ? t("required") : null),
      operationManager: (value) =>
        !value || value === "" ? t("required") : null,
      deliveryCompany: (value) => (!value ? t("required") : null),
      price: (value) => (value === "" || !value ? t("required") : null),
      supplierOffer: (value) => (value === "" || !value ? t("required") : null),
      loadDate: (value) => (!value ? t("required") : null),
      orderDate: (value) => (!value ? t("required") : null),
      relatedPerson: (value) => (value === "" ? t("required") : null),
      productType: (value) =>
        value === "" || value === null ? t("required") : null,
      deliveryAddress: (value) => (value === "" ? t("required") : null),
      weightType: (value) => (value === "" ? t("required") : null),
      currency: (value) => (value === "" ? t("required") : null),
      shippingType: (value) => (!value ? t("required") : null),
      deliveryDate: (value) =>
        value[0] === null && !value[1] ? t("required") : null,
      cash: (value) => (value == "" ? t("required") : null),
      cLastPayDay: (value) =>
        form.values.cMaturity == "cash" && !value ? t("required") : null,
      sLastPayDay: (value) =>
        form.values.sMaturity == "cash" && !value ? t("required") : null,
      cMaturityDay: (value) =>
        form.values.cMaturity == "maturity" && !value ? t("required") : null,
      sMaturityDay: (value) =>
        form.values.sMaturity == "maturity" && !value ? t("required") : null,
    },
  });

  const getData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getFormData`,
      {
        type: props.type,
        allAddresses: props.edit ? false : true,
        cFormId: props.edit && props.data.CustomerForm.customerId,
      }
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, ...response.data.data, loading: false }));
      if (!props.edit) {
        form.setFieldValue("referanceCode", response.data.data.currentRef);
      } else {
        const findAddresses = response.data.data.addresses.find(
          (x) => x.id == props.data.CustomerForm.customerId
        );
        let compAddr;
        let delAddr;
        if (findAddresses) {
          compAddr = findAddresses.addresses || [];
        } else {
          compAddr = [];
        }
        const findDAddresses = response.data.data.deliveringAddresses.find(
          (x) => x.company == props.data.deliveryCompany
        );
        if (findDAddresses) {
          delAddr = findDAddresses.addresses || [];
        } else {
          delAddr = [...compAddr];
        }
        setState((prev) => ({
          ...prev,
          compAddr,
          delAddr: [...new Set([...delAddr, ...compAddr])],
        }));
        let dates = props.data.deliveryDate.split("-");
        const firstdate = DateTime.fromISO(props.data.loadDate)
          .plus({ days: Number(dates[0]) })
          .toJSDate();
        const seconddate = DateTime.fromISO(props.data.loadDate)
          .plus({ days: Number(dates[1]) })
          .toJSDate();
        form.setValues((prev) => ({
          ...prev,
          ...props.data,
          orderDate: props.data.orderDate
            ? DateTime.fromISO(props.data.orderDate).toJSDate()
            : null,
          loadDate: props.data.loadDate
            ? DateTime.fromISO(props.data.loadDate).toJSDate()
            : null,
          cLastPayDay: props.data.cLastPayDay
            ? DateTime.fromISO(props.data.cLastPayDay).toJSDate()
            : null,
          sLastPayDay: props.data.sLastPayDay
            ? DateTime.fromISO(props.data.sLastPayDay).toJSDate()
            : null,
          deliveryDate: [firstdate, seconddate],
          purchasingRep: props.data.purchasingRep
            ? `${props.data.purchasingRep}`
            : null,
          operationManager: props.data.operationManager
            ? `${props.data.operationManager}`
            : null,
          companyName: props.data.CustomerForm.customerId
            ? `${props.data.CustomerForm.customerId}`
            : null,
        }));
      }
    }
  };

  const selectClient = (e) => {
    const client = state.clients.find((x) => x.value === e);
    if (client) {
      form.setFieldValue("companyAddress", client.address);
    }
    form.setValues((prev) => ({
      ...prev,
      Addresses: [
        { type: "loadingpoint", address: "" },
        { type: "deliveryaddress", address: "" },
      ],
      companyName: e,
    }));
    let compAddr = [];
    let delAddr = state.delAddr;
    const findAddresses = state.addresses.find((x) => x.id == e);
    if (findAddresses) {
      compAddr = findAddresses.addresses;
      delAddr = [...delAddr, ...findAddresses.addresses];
    }
    setState((prev) => ({
      ...prev,
      compAddr,
      searchAddress: {},
      searchDAddress: {},
      delAddr: [...new Set([...delAddr])],
    }));
  };

  const selectDeliveryCompany = (e) => {
    form.setValues((prev) => ({
      ...prev,
      Addresses: [
        ...prev.Addresses.filter((x) => x.type !== "deliveryaddress"),
        { type: "deliveryaddress", address: "" },
      ],
      deliveryCompany: e,
    }));
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

  const findCustomerPrice = (price) => {
    if (price) {
      if (props.type === "domestic") {
        const cash = Number(price * (state.vat / 100) + price).toFixed(0);
        form.setValues((prev) => ({ ...prev, price, cash: Number(cash) }));
      } else {
        form.setValues((prev) => ({ ...prev, price, cash: price }));
      }
    } else {
      form.setValues((prev) => ({ ...prev, price: "", cash: "" }));
    }
  };

  const handleSubmit = async (values) => {
    const uuId = uuidv4();
    let data = {
      ...values,
      uuId: uuId,
      cLastPayDay:
        form.values.cMaturity === "maturity" ? null : form.values.cLastPayDay,
      cMaturityDay:
        form.values.cMaturity === "maturity" ? form.values.cMaturityDay : null,
      sLastPayDay:
        form.values.sMaturity === "maturity" ? null : form.values.sLastPayDay,
      sMaturityDay:
        form.values.sMaturity === "maturity" ? form.values.sMaturityDay : null,
      edit: props.edit ? true : false,
      type: props.type,
      deletedIds: state.deletedIds,
    };
    if (!data.companyName || data.companyName === "") {
      notifications.show({
        title: t("error"),
        message: t("invalidcompanyname"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
        autoClose: 5000,
      });
      return;
    }
    if (data.deliveryDate[0] < data.loadDate) {
      notifications.show({
        title: t("error"),
        message: t("invaliddate"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
        autoClose: 5000,
      });
      return;
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createFreightForm`,
      data
    );
    if (!props.edit) {
      if (response.data.success) {
        form.reset();
        props.getData({});
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
          message: t(`${response.data.msg}`),
          color: "red",
          radius: "lg",
          icon: <Icons name="FaExclamationTriangle" />,
        });
      }
    } else {
      if (response.data.success) {
        form.reset();
        props.getData({});
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
          message: t(`${response.data.msg}`),
          color: "red",
          radius: "lg",
          icon: <Icons name="FaExclamationTriangle" />,
        });
      }
    }
  };

  useEffect(() => {
    console.log("freightform mounted");
    getData();
    return () => {
      console.log("freightform unmounted");
    };
  }, []);

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
                  w="100%"
                  data={state[values.data] || []}
                  allowDeselect={false}
                  searchable
                  clearable
                  searchValue={state[values.search][i] || ""}
                  onSearchChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      [values.search]: { ...prev[values.search], [i]: e },
                    }))
                  }
                  label={<strong>{t(`${type}`)}</strong>}
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

  return (
    <>
      {state.loading ? (
        <Loading />
      ) : (
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Grid style={{ margin: 0, marginTop: 20 }}>
            <Grid.Col>
              <Grid>
                <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                  <Select
                    label={t("purchasingrepresentative")}
                    data={state.user}
                    allowDeselect={false}
                    {...form.getInputProps("purchasingRep")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                  <Select
                    label={t("operationmanager")}
                    data={state.user}
                    allowDeselect={false}
                    {...form.getInputProps("operationManager")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <TextInput
                    type="number"
                    disabled
                    leftSection={state[props.type]}
                    label={t("referancecode")}
                    {...form.getInputProps("referanceCode")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <DatePickerInput
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    label={t("orderdate")}
                    valueFormat="DD/MM/YYYY"
                    {...form.getInputProps("orderDate")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <Select
                    label={t("clientcompanyname")}
                    data={state.clients}
                    allowDeselect={false}
                    disabled={props.edit}
                    onSearchChange={(e) =>
                      setState((prev) => ({ ...prev, search: e }))
                    }
                    searchValue={state.search.toLocaleUpperCase()}
                    clearable
                    searchable
                    value={form.values.companyName}
                    onChange={(e) => selectClient(e)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <TextInput
                    disabled
                    label={t("clientcompanyaddress")}
                    {...form.getInputProps("companyAddress")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <Select
                    label={t("relatedperson")}
                    searchable
                    data={state.relatedPerson}
                    searchValue={state.searchRPerson}
                    allowDeselect={false}
                    onSearchChange={(e) =>
                      setState((prev) => ({ ...prev, searchRPerson: e }))
                    }
                    nothingFoundMessage={
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          form.setFieldValue(
                            "relatedPerson",
                            state.searchRPerson
                          );
                          setState((prev) => ({
                            ...prev,
                            relatedPerson: [
                              ...prev.relatedPerson,
                              state.searchRPerson,
                            ],
                          }));
                        }}
                      >{`+ ${t("addnewrelatedperson")} ${state.searchRPerson}`}</a>
                    }
                    {...form.getInputProps(`relatedPerson`)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <Select
                    label={t("producttype")}
                    searchable
                    clearable
                    allowDeselect={false}
                    data={state.pType}
                    searchValue={state.searchProductType}
                    onSearchChange={(e) =>
                      setState((prev) => ({ ...prev, searchProductType: e }))
                    }
                    nothingFoundMessage={
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          form.setFieldValue(
                            "productType",
                            state.searchProductType
                          );
                          setState((prev) => ({
                            ...prev,
                            pType: [...prev.pType, state.searchProductType],
                          }));
                        }}
                      >{`+ ${t("addnewproducttype")} ${state.searchProductType}`}</a>
                    }
                    {...form.getInputProps("productType")}
                  />
                </Grid.Col>
                <Grid.Col>
                  <Select
                    label={t("deliveringcompany")}
                    searchable
                    clearable
                    allowDeselect={false}
                    disabled={!form.values.companyName}
                    data={state.deliveryCompany}
                    searchValue={state.searchDCompany}
                    onSearchChange={(e) =>
                      setState((prev) => ({ ...prev, searchDCompany: e }))
                    }
                    nothingFoundMessage={
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          form.setValues((prev) => ({
                            ...prev,
                            Addresses: [
                              ...prev.Addresses.filter(
                                (x) => x.type !== "deliveryaddress"
                              ),
                              { type: "deliveryaddress", address: "" },
                            ],
                            deliveryCompany: state.searchDCompany,
                          }));
                          setState((prev) => ({
                            ...prev,
                            deliveryCompany: [
                              ...prev.deliveryCompany,
                              state.searchDCompany,
                            ],
                            searchDAddress: {},
                          }));
                        }}
                      >{`+ ${t("addnewdeliverycompany")} ${state.searchDCompany}`}</a>
                    }
                    onChange={(e) => selectDeliveryCompany(e)}
                    value={form.values.deliveryCompany}
                    error={form.errors.deliveryCompany}
                  />
                </Grid.Col>
                {populateAddress("loadingpoint")}
                <Grid.Col>
                  <Group justify="center" mt="md">
                    <Button
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
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                  <Select
                    label={t("weighttype")}
                    data={state.weightType}
                    allowDeselect={false}
                    {...form.getInputProps("weightType")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <DatePickerInput
                    label={t("loaddate")}
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    className="select"
                    valueFormat="DD/MM/YYYY"
                    {...form.getInputProps("loadDate")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <DatePickerInput
                    type="range"
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    label={
                      props.type === "domestic"
                        ? t("deliverydate")
                        : t("estimateddeliverydate")
                    }
                    valueFormat="DD/MM/YYYY"
                    {...form.getInputProps("deliveryDate")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <Select
                    label={t("shippingtype")}
                    allowDeselect={false}
                    style={{ marginRight: 10 }}
                    data={state.shippingType}
                    {...form.getInputProps("shippingType")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <NumberInput
                    label={t("freightquote")}
                    thousandSeparator=","
                    suffix={props.type === "domestic" ? " + KDV" : ""}
                    onChange={(e) => findCustomerPrice(e)}
                    value={form.values.price}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <Select
                    label={t("currency")}
                    data={state.currency}
                    allowDeselect={false}
                    {...form.getInputProps("currency")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <NumberInput
                    label={t("customerpay")}
                    thousandSeparator=","
                    disabled
                    suffix={` ${convertCurrency(form.values.currency)}`}
                    {...form.getInputProps("cash")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6, md: 6 }}>
                  <NumberInput
                    label={t("supplieroffer")}
                    thousandSeparator=","
                    suffix={` ${convertCurrency(form.values.currency)}`}
                    {...form.getInputProps("supplierOffer")}
                  />
                </Grid.Col>
                <Grid.Col
                  span={{ base: 12, lg: 6, md: 6 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {props.type === "domestic" ? null : (
                    <Checkbox
                      mt={19}
                      color="dark"
                      label="YDG"
                      {...form.getInputProps("YDG", { type: "checkbox" })}
                    />
                  )}
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 12, md: 12 }}>
                  <Paper>
                    <Grid.Col span={{ base: 12, lg: 12, md: 12 }}>
                      {form.values.cMaturity === "maturity" ? (
                        <Select
                          type="number"
                          searchable
                          allowDeselect={false}
                          label={`${t("maturity")} ${t("day")} (${t("customer")})`}
                          data={state.maturityData}
                          searchValue={state.searchCMaturity}
                          onSearchChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              searchCMaturity: e,
                            }))
                          }
                          nothingFoundMessage={
                            <a
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() => {
                                form.setFieldValue(
                                  "cMaturityDay",
                                  state.searchCMaturity
                                );
                                setState((prev) => ({
                                  ...prev,
                                  maturityData: [
                                    ...prev.maturityData,
                                    state.searchCMaturity,
                                  ],
                                }));
                              }}
                            >{`+ ${t("addnewmaturityday")} ${state.searchCMaturity}`}</a>
                          }
                          {...form.getInputProps("cMaturityDay")}
                        />
                      ) : (
                        <DatePickerInput
                          label={t("lastpaymentday")}
                          locale={props.userAgent.lang}
                          {...form.getInputProps("cLastPayDay")}
                        />
                      )}
                    </Grid.Col>
                    <Grid.Col>
                      <Flex
                        align="center"
                        justify="space-evenly"
                        direction="row"
                        w="100%"
                      >
                        <Flex
                          align="center"
                          justify="center"
                          gap={20}
                          direction="row"
                        >
                          <Radio.Group {...form.getInputProps("cMaturity")}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                              }}
                            >
                              <div className="radioDivs">
                                {t("cash")}
                                <Radio color="#4c5056" value="cash" />
                              </div>
                              <div className="radioDivs">
                                {t("maturity")}
                                <Radio color="#4c5056" value="maturity" />
                              </div>
                            </div>
                          </Radio.Group>
                        </Flex>
                        <Flex
                          align="center"
                          justify="center"
                          gap={20}
                          direction="row"
                        >
                          <Radio.Group
                            {...form.getInputProps("cPaymentMethod")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                              }}
                            >
                              <div className="radioDivs">
                                {t("wiretransfer")}
                                <Radio color="#4c5056" value="wiretransfer" />
                              </div>
                              <div className="radioDivs">
                                {t("cheque")}
                                <Radio color="#4c5056" value="cheque" />
                              </div>
                            </div>
                          </Radio.Group>
                        </Flex>
                      </Flex>
                    </Grid.Col>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 12, md: 12 }}>
                  <Paper>
                    <Grid.Col span={{ base: 12, lg: 12, md: 12 }}>
                      {form.values.sMaturity === "maturity" ? (
                        <Select
                          type="number"
                          searchable
                          allowDeselect={false}
                          label={`${t("maturity")} ${t("day")} (${t("supplier")})`}
                          data={state.maturityData}
                          searchValue={state.searchSMaturity}
                          onSearchChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              searchSMaturity: e,
                            }))
                          }
                          nothingFoundMessage={
                            <a
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() => {
                                form.setFieldValue(
                                  "sMaturityDay",
                                  state.searchSMaturity
                                );
                                setState((prev) => ({
                                  ...prev,
                                  maturityData: [
                                    ...prev.maturityData,
                                    state.searchSMaturity,
                                  ],
                                }));
                              }}
                            >{`+ ${t("addnewmaturityday")} ${state.searchSMaturity}`}</a>
                          }
                          {...form.getInputProps("sMaturityDay")}
                        />
                      ) : (
                        <DatePickerInput
                          label={`${t("lastpaymentday")} (${t("supplier")})`}
                          locale={props.userAgent.lang}
                          {...form.getInputProps("sLastPayDay")}
                        />
                      )}
                    </Grid.Col>
                    <Grid.Col>
                      <Flex
                        align="center"
                        justify="space-evenly"
                        direction="row"
                        w="100%"
                      >
                        <Flex
                          align="center"
                          justify="center"
                          gap={20}
                          direction="row"
                        >
                          <Radio.Group {...form.getInputProps("sMaturity")}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                              }}
                            >
                              <div className="radioDivs">
                                {`${t("cash")}`}
                                <Radio color="#4c5056" value="cash" />
                              </div>
                              <div className="radioDivs">
                                {`${t("maturity")}`}
                                <Radio color="#4c5056" value="maturity" />
                              </div>
                            </div>
                          </Radio.Group>
                        </Flex>
                        <Flex
                          align="center"
                          justify="center"
                          gap={20}
                          direction="row"
                        >
                          <Radio.Group
                            {...form.getInputProps("sPaymentMethod")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 20,
                              }}
                            >
                              <div className="radioDivs">
                                {`${t("wiretransfer")}`}
                                <Radio color="#4c5056" value="wiretransfer" />
                              </div>
                              <div className="radioDivs">
                                {`${t("cheque")}`}
                                <Radio color="#4c5056" value="cheque" />
                              </div>
                            </div>
                          </Radio.Group>
                        </Flex>
                      </Flex>
                    </Grid.Col>
                  </Paper>
                </Grid.Col>
                <Flex my={20} justify="center" align="center" w="100%">
                  <Button className="buttons" color="dark" type="submit">
                    {t(props.edit ? "update" : "save")}
                  </Button>
                </Flex>
              </Grid>
            </Grid.Col>
          </Grid>
        </form>
      )}
    </>
  );
};

export default FreightForm;
