import { useState, useEffect } from "react";
import Loading from "./global/loading";
import axios from "axios";
import {
  Table,
  ScrollArea,
  Button,
  Modal,
  TextInput,
  Grid,
  Flex,
  Paper,
  Select,
  Pagination,
} from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import { DateTime } from "luxon";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { useViewportSize } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon";
import { modalStyle, convertCurrency } from "../helpers/functions";
import { useRouter } from "next/router";
import { makeid } from "../server/functions";
import Info from "./infopopup";

const PaymentTrackings = (props) => {
  const { width } = useViewportSize();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { height } = useViewportSize();
  const [state, setState] = useState({
    loading: true,
    data: [],
    modal: false,
    total: [],
    btnloading: false,
    page: 1,
    perPage: "30",
    count: 0,
    totalPage: 0,
    searchDate: [null, null],
    customers: [],
    suppliers: [],
    operationNames: [],
    customer: "",
    supplier: "",
    operation: "",
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
  });
  const form = useForm({
    initialValues: {
      id: null,
      date: null,
      customerName: "",
      referanceCode: "",
      exportCountry: "",
      exportCustomer: "",
      logisticName: "",
      sMaturity: "",
      cMaturity: "",
      collectionDate: null,
      paymentDate: null,
    },
  });

  const getData = async ({
    page = state.page,
    perPage = state.perPage,
    searchDate = state.searchDate,
    customer = state.customer,
    supplier = state.supplier,
    operation = state.operation,
  }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = {
      page,
      perPage,
      type: props.type,
      searchDate,
      customer,
      supplier,
      operation,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getPaymentTrackings`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        ...response.data.data,
        loading: false,
        modal: false,
      }));
    }
  };

  const exportExcel = async (referanceKey) => {
    setState((prev) => ({ ...prev, btnloading: true }));
    const excelData = await axios.post(
      `${process.env.SERVER_IP}/api/getPaymentTrackings`,
      { type: props.type, allData: true }
    );
    if (excelData.data.success) {
      const date =
        state.searchDate[0] && state.searchDate[1]
          ? `${DateTime.fromJSDate(state.searchDate[0]).toFormat(
              "dd-MM-yyyy"
            )}-${DateTime.fromJSDate(state.searchDate[1]).toFormat("dd-MM-yyyy")}`
          : DateTime.fromJSDate(new Date()).toFormat("dd-MM-yyyy");
      const data = {
        name: `${date}-CakirLojistikRapor-${makeid(6)}.xlsx`,
        type: props.type,
        referanceKey,
      };
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/exportExcel`,
        {
          ...data,
          type: props.type,
          excelData: excelData.data.data.data,
          total: state.total,
        },
        { responseType: "blob" }
      );
      if (response.status == 200) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.name);
        document.body.appendChild(link);
        link.click();
      } else {
        notifications.show({
          title: t("error"),
          message: `Dosya Hatası:\n${response}`,
          color: "red",
          radius: "lg",
        });
      }
    } else {
      notifications.show({
        title: t("error"),
        message: t("error"),
        color: "red",
        radius: "lg",
      });
    }
    setState((prev) => ({ ...prev, btnloading: false }));
  };

  const handleSubmit = async (values) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/updatePaymentTracking`,
      values
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
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
        autoClose: 5000,
      });
    }
  };

  const setRow = (rows) => {
    form.setValues((prev) => ({
      ...prev,
      id: rows.id,
      date: rows.date ? DateTime.fromISO(rows.date).toJSDate() : null,
      collectionDate: rows.Operation.sPaymentDate
        ? DateTime.fromISO(rows.Operation.sPaymentDate).toJSDate()
        : null,
      paymentDate: rows.Operation.cPaymentDate
        ? DateTime.fromISO(rows.Operation.cPaymentDate).toJSDate()
        : null,
      customerName: rows.Operation.Freight.companyName || "",
      exportCountry: rows.exportCountry || "",
      exportCustomer: rows.exportCustomer || "",
      logisticSalesFee: rows.Operation.Freight.supplierOffer
        ? `${rows.Operation.Freight.supplierOffer} ${convertCurrency(
            rows.Operation.Freight.currency
          )}`
        : 0,
      logisticCName: rows.Operation.Supplier?.supplierName || "",
      sMaturity: rows.Operation.Freight?.sMaturityDay || `${t("cash")}`,
      agreedTransportationFee: rows.Operation.Freight.cash
        ? `${rows.Operation.Freight.cash} ${convertCurrency(
            rows.Operation.Freight.currency
          )}`
        : 0,
      cMaturity: rows.Operation.Freight.cMaturityDay || `${t("cash")}`,
      profit: rows.profit
        ? `${rows.profit} ${convertCurrency(rows.Operation.Freight.currency)}`
        : 0,
      referanceCode: rows.Operation.Freight.referanceCode
        ? `${state[rows.Operation.type]}${rows.Operation.Freight.referanceCode}`
        : "",
    }));
    setState((prev) => ({ ...prev, modal: true }));
  };

  const populateTrackings = () => {
    let temp = [];
    const data = state.data;
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr
          onClick={() => setRow(data[i])}
          key={`data${i}`}
          style={{
            backgroundColor: !data[i].Operation.active
              ? props.colorSettings?.completedoperation || "#c0c5ce"
              : data[i].Operation.active
                ? props.colorSettings?.duringoperation
                : "#fad105",
          }}
        >
          <Table.Td>
            {data[i].Operation.Freight?.referanceCode
              ? `${
                  state[data[i].Operation.type]
                }${data[i].Operation.Freight?.referanceCode}`
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].date
              ? DateTime.fromISO(data[i].date).toFormat("dd-MM-yyyy")
              : ""}
          </Table.Td>
          <Table.Td>{data[i].Operation?.Freight?.companyName || ""}</Table.Td>
          <Table.Td>{data[i].exportCountry || ""}</Table.Td>
          <Table.Td>{data[i].exportCustomer || ""}</Table.Td>
          <Table.Td>{data[i].Operation?.Supplier?.supplierName || ""}</Table.Td>
          <Table.Td
            style={{
              backgroundColor: data[i].Operation?.sPaidDate
                ? "#f1cf2a"
                : "#7c833c",
            }}
          >
            {data[i].Operation?.Freight?.supplierOffer
              ? `${data[i].Operation.Freight.supplierOffer} ${convertCurrency(
                  data[i].Operation.Freight.currency
                )}`
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Operation?.Freight?.sMaturityDay
              ? data[i].Operation?.Freight?.sMaturityDay
              : t("cash")}
          </Table.Td>
          <Table.Td
            style={{
              backgroundColor: data[i].Operation?.cPaidDate
                ? "#f1cf2a"
                : "#7c833c",
            }}
          >
            {data[i].Operation?.Freight?.cash
              ? `${data[i].Operation?.Freight?.cash} ${convertCurrency(
                  data[i].Operation.Freight.currency
                )}`
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Operation?.Freight?.cMaturityDay
              ? data[i].Operation?.Freight?.cMaturityDay
              : t("cash")}
          </Table.Td>
          <Table.Td>
            {data[i].profit
              ? `${data[i].profit} ${convertCurrency(
                  data[i].Operation.Freight.currency
                )}`
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Operation?.cPaymentDate
              ? DateTime.fromISO(data[i].Operation?.cPaymentDate).toFormat(
                  "dd-MM-yyyy"
                )
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Operation?.sPaymentDate
              ? DateTime.fromISO(data[i].Operation?.sPaymentDate).toFormat(
                  "dd-MM-yyyy"
                )
              : ""}
          </Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  useEffect(() => {
    if (props.userAgent.type === "Admin") {
      getData({
        customer: "",
        searchDate: [null, null],
        supplier: "",
        operation: "",
      });
    } else {
      router.push("/");
    }
    console.log("paymenttrackings mounted");
    return () => {
      console.log("paymenttrackings unmounted");
    };
  }, [props.type]);

  const changeDate = (e) => {
    if (e[0] && e[1]) {
      getData({ page: 1, searchDate: e });
    } else if (e[0] || e[1]) {
      setState((prev) => ({ ...prev, searchDate: e }));
    } else {
      getData({ page: 1, searchDate: [null, null] });
    }
  };

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <Grid style={{ margin: 8, paddingTop: 34 }}>
        <Grid.Col span={12}>
          <Flex
            direction={{
              base: "column",
              xs: "row",
              sm: "row",
              md: "row",
              lg: "row",
              xl: "row",
            }}
            align="center"
            justify="flex-end"
            gap={20}
          >
            <DatePickerInput
              w={220}
              type="range"
              clearable
              allowSingleDateInRange
              locale={props.userAgent.lang === "tr" ? "tr" : "en"}
              label={t("searchbydate")}
              valueFormat="DD/MM/YYYY"
              onChange={(e) => changeDate(e)}
              value={state.searchDate}
            />
            <Select
              searchable
              clearable
              label={t("searchbyreceiving")}
              data={state.customers}
              value={state.customer}
              onChange={(e) => getData({ page: 1, customer: e || "" })}
            />
            <Select
              searchable
              clearable
              label={t("searchbycarrier")}
              data={state.suppliers}
              value={state.supplier}
              onChange={(e) => getData({ page: 1, supplier: e || "" })}
            />
            <Select
              searchable
              clearable
              label={t("searchbyoperation")}
              data={state.operationNames}
              value={state.operation}
              onChange={(e) =>
                getData({
                  page: 1,
                  operation: e || "",
                  customer: "",
                  supplier: "",
                })
              }
            />
            <Button
              mt={20}
              className="buttons"
              disabled={state.data.length < 1}
              onClick={() => exportExcel(state[state.data[0].Operation.type])}
              loading={state.btnloading}
            >
              {t("exportexcel")}
            </Button>
          </Flex>
        </Grid.Col>
        {state.data.length > 0 ? (
          <>
            <Grid.Col>
              <h3 className="tracking-total">{t("total")}</h3>
            </Grid.Col>
            {Object.keys(state.total).map((currency) => (
              <Grid.Col
                mah={450}
                key={currency}
                span={{ base: 12, xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}
                m="auto"
                className="payment-top-container"
              >
                <Paper
                  withBorder
                  maw={{
                    base: "100%",
                    xs: "100%",
                    sm: 500,
                    md: 500,
                    lg: 500,
                    xl: 500,
                  }}
                  m="auto"
                  w="auto"
                  shadow="xs"
                  p="sm"
                  gap={20}
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    direction="column"
                    gap={10}
                  >
                    <h4>{`${t(`${currency}`)} ${convertCurrency(
                      currency
                    )}`}</h4>
                    <p>
                      {<strong>{t("totallogisticsales")} : </strong>}
                      {state.total[currency].totallogisticsales}
                      {convertCurrency(currency)}
                    </p>
                    <p>
                      {<strong>{t("totaltransportationfee")} : </strong>}
                      {state.total[currency].totaltransportationfee}
                      {convertCurrency(currency)}
                    </p>
                    <p>
                      {<strong>{t("totalprofit")} : </strong>}
                      {state.total[currency].profit} {convertCurrency(currency)}
                    </p>
                  </Flex>
                </Paper>
              </Grid.Col>
            ))}
          </>
        ) : null}
        <Grid.Col>
          <ScrollArea h={height} scrollbarSize={5}>
            <Table
              withColumnBorders
              withTableBorder
              withRowBorders
              borderColor="black"
              highlightOnHover
              highlightOnHoverColor="#e4e4e4"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("referancecode")}</Table.Th>
                  <Table.Th>{t("date")}</Table.Th>
                  <Table.Th>{t("customername")}</Table.Th>
                  <Table.Th>
                    {props.type === "domestic"
                      ? t("exportcity")
                      : t("exportcountry")}
                  </Table.Th>
                  <Table.Th>{t("exportcustomer")}</Table.Th>
                  <Table.Th>{t("logisticcustomername")}</Table.Th>
                  <Table.Th>{t("logisticfee")}</Table.Th>
                  <Table.Th>{t("maturity")}</Table.Th>
                  <Table.Th>{t("transportationfee")}</Table.Th>
                  <Table.Th>{t("maturity")}</Table.Th>
                  <Table.Th>{t("profit")}</Table.Th>
                  <Table.Th>{t("collectiondate")}</Table.Th>
                  <Table.Th>{t("paymentdate")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{populateTrackings()}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Grid.Col>
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
          w="100%"
          m={15}
          gap={20}
        >
          <Flex direction="row" justify="center" align="center" gap={20}>
            {t("total")} : {state.count}
            {width > 768 ? (
              ""
            ) : (
              <Select
                mt={10}
                maw={80}
                radius="md"
                style={{ marginRight: 10 }}
                onChange={(e) => getData({ perPage: e, page: 1 })}
                data={["10", "20", "30", "50", "100"]}
                value={state.perPage}
              />
            )}
          </Flex>
          <Flex direction="row" justify="center" align="center" gap={20}>
            {width < 768 ? (
              ""
            ) : (
              <Select
                mt={10}
                maw={80}
                radius="md"
                style={{ marginRight: 10 }}
                onChange={(e) => getData({ perPage: e, page: 1 })}
                data={["10", "20", "30", "50", "100"]}
                value={state.perPage}
              />
            )}
            <Pagination
              color="dark"
              radius="md"
              total={state.totalPage}
              value={state.page}
              onChange={(e) => getData({ page: e })}
            />
          </Flex>
        </Flex>
      </Grid>
      <Modal
        className="logModal"
        size="70rem"
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={state.modal}
        onClose={() => setState((prev) => ({ ...prev, modal: false }))}
      >
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Grid>
            <Grid.Col span={12}>
              <Grid>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("referancecode")}
                    {...form.getInputProps("referanceCode")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <DatePickerInput
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    disabled
                    label={t("date")}
                    {...form.getInputProps("date")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    label={
                      props.type === "domestic"
                        ? t("exportcity")
                        : t("exportcountry")
                    }
                    {...form.getInputProps("exportCountry")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    label={t("exportcustomer")}
                    {...form.getInputProps("exportCustomer")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("customername")}
                    {...form.getInputProps("customerName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("logisticcustomername")}
                    {...form.getInputProps("logisticCName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("logisticfee")}
                    {...form.getInputProps("logisticSalesFee")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={`${t("maturity")} (${t("customer")})`}
                    {...form.getInputProps("cMaturity")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("approvedfee")}
                    {...form.getInputProps("agreedTransportationFee")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={`${t("maturity")} (${t("supplier")})`}
                    {...form.getInputProps("sMaturity")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <TextInput
                    disabled
                    label={t("profit")}
                    {...form.getInputProps("profit")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <DatePickerInput
                    disabled
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    label={t("collectiondate")}
                    {...form.getInputProps("collectionDate")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 12, sm: 6 }}>
                  <DatePickerInput
                    disabled
                    locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                    label={t("paymentdate")}
                    {...form.getInputProps("paymentDate")}
                  />
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
      </Modal>
    </>
  );
};

export default PaymentTrackings;
