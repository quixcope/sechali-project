import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Grid,
  Modal,
  ScrollArea,
  Table,
  Pagination,
  Select,
  Flex,
  SimpleGrid,
} from "@mantine/core";
import Loading from "./global/loading.js";
import OperationCard from "./operationcards.js";
import useTranslation from "next-translate/useTranslation";
import { DateTime } from "luxon";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon.js";
import { modalStyle } from "../helpers/functions";
import { useViewportSize } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import Info from "./infopopup.js";

const Operation = (props) => {
  const { height } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    data: [],
    users: [],
    passiveOps: [],
    carriers: [],
    page: 1,
    perPage: "10",
    totalRows: 0,
    total: 0,
    oPerPage: "10",
    oPage: 1,
    cdata: [],
    search: "",
    searchOp: "",
    operationNames: [],
    pTotal: 0,
    count: 0,
    suppData: [],
    cusData: [],
    passiveOpNames: [],
    statuses: [],
    intRefKey: props.general.EMAIL.intRefKey || "ÇKR",
    domRefKey: props.general.EMAIL.domRefKey || "LJSY",
    customer: "",
    supplier: "",
    operation: "",
    searchDate: [null, null],
    mLoading: false,
  });

  const getData = async ({
    search = state.search,
    searchOp = state.searchOp,
    oPage = state.oPage,
    oPerPage = state.oPerPage,
  }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = { search, searchOp, oPage, oPerPage, type: props.type };
    let temp = {};
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOperations`,
      data
    );
    const users = await axios.post(`${process.env.SERVER_IP}/api/getUsers`);
    if (users.data.success) {
      temp = { ...temp, users: users.data.selectData };
    }
    if (response.data.success) {
      temp = { ...temp, ...data, ...response.data.data };
    }
    setState((prev) => ({ ...prev, ...temp, loading: false }));
  };

  const getPassiveOp = async ({
    page = state.page,
    perPage = state.perPage,
    customer = state.customer,
    supplier = state.supplier,
    operation = state.operation,
    searchDate = state.searchDate,
  }) => {
    setState((prev) => ({ ...prev, mLoading: true }));
    const data = {
      page,
      perPage,
      customer,
      supplier,
      operation,
      searchDate,
      type: props.type,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getPassiveOp`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        ...response.data.data,
        mLoading: false,
      }));
    }
  };

  const changeDate = (e) => {
    if (e[0] && e[1]) {
      getPassiveOp({ page: 1, searchDate: e });
    } else if (e[0] || e[1]) {
      setState((prev) => ({ ...prev, searchDate: e }));
    } else {
      getPassiveOp({ page: 1, searchDate: [null, null] });
    }
  };

  const changeActive = async (id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/changeActive`,
      { id: id }
    );
    if (response.data.success) {
      getData({});
      setState((prev) => ({ ...prev, modal: false }));
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
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

  const populateOperations = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.data));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <div key={`operations${i}`}>
          <OperationCard
            users={state.users}
            carriers={state.carriers}
            changeProjectType={props.changeProjectType}
            data={data[i]}
            userAgent={props.userAgent}
            editor={props.editor}
            emailEditor={props.emailEditor}
            mailEditor={props.mailEditor}
            type={props.type}
            statuses={state.statuses}
            general={props.general}
            getData={getData}
          />
        </div>
      );
    }
    return temp;
  };

  const populatePassiveOperations = () => {
    let temp = [];
    const data = state.passiveOps;
    for (let i = 0; i < data.length; i++) {
      props.type === "domestic"
        ? temp.push(
            <Table.Tr key={`passives${i}`}>
              <Table.Td>
                {data[i].Freight.referanceCode
                  ? `${state.domRefKey}${data[i].Freight.referanceCode}`
                  : ""}
              </Table.Td>
              <Table.Td>
                {DateTime.fromISO(data[i].date).toFormat("dd-MM-yyyy")}
              </Table.Td>
              <Table.Td>{data[i].Supplier?.supplierName || ""}</Table.Td>
              <Table.Td>
                {data[i].Freight?.CustomerForm.Customer.customerName || ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.loadPoint
                  ? data[i].Freight.loadPoint
                      .filter((x) => x.region)
                      .map((item) => item.region)
                      .join(",")
                  : ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.unloadDates
                  ? `${DateTime.fromISO(
                      data[i].Freight.unloadDates[0]
                    ).toFormat("dd-MM-yyyy")} / ${DateTime.fromISO(
                      data[i].Freight.unloadDates[1]
                    ).toFormat("dd-MM-yyyy")}`
                  : ""}
              </Table.Td>
              <Table.Td>{data[i].Freight.productType || ""}</Table.Td>
              <Table.Td>{data[i].Freight.deliveryAddress || ""}</Table.Td>
              <Table.Td>
                {data[i].Freight.supplierOffer
                  ? `${data[i].Freight.supplierOffer} ${t(`${data[i].Freight.currency}`)}`
                  : ""}
              </Table.Td>
              <Table.Td>{data[i].vat ? `%${data[i].vat}` : ""}</Table.Td>
              <Table.Td>
                {data[i].Freigth?.cash
                  ? `${data[i].Freigth.cash} ${t(`${data[i].Freight.currency}`)}`
                  : ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.CustomerForm.requestingPerson || ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.CustomerForm.relatedDepartment || ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.cMaturityDay
                  ? ` ${data[i].Freight.cMaturityDay} ${t("day")}`
                  : DateTime.fromISO(data[i].Freight.cLastPayDay).toFormat(
                      "dd-MM-yyyy"
                    )}
              </Table.Td>
              <Table.Td>
                {data[i].isCancelled ? t("cancelled") : t("completed")}
              </Table.Td>
              <Table.Td>
                <Button
                  className="buttons"
                  onClick={() => changeActive(data[i].id)}
                >
                  {t("active")}
                </Button>
              </Table.Td>
            </Table.Tr>
          )
        : temp.push(
            <Table.Tr key={`passive${i}`}>
              <Table.Td>
                {data[i].Freight.referanceCode
                  ? `${state.intRefKey}${data[i].Freight.referanceCode}`
                  : ""}
              </Table.Td>
              <Table.Td>{data[i].Supplier?.supplierName || ""}</Table.Td>
              <Table.Td>
                {data[i].Freight.CustomerForm.Customer.customerName || ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.CustomerForm.requestingPerson || ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.loadDate
                  ? DateTime.fromISO(data[i].Freight.loadDate).toFormat(
                      "dd-MM-yyyy"
                    )
                  : ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.loadPoint
                  ? data[i].Freight.loadPoint
                      .filter((x) => x.region)
                      .map((item) => item.region)
                      .join(",")
                  : ""}
              </Table.Td>
              <Table.Td>{data[i].Freight.deliveryAddress || ""}</Table.Td>
              <Table.Td>{data[i].Freight.deliveryCompany || ""}</Table.Td>
              <Table.Td>
                {data[i].Freight.unloadDates
                  ? `${DateTime.fromISO(
                      data[i].Freight.unloadDates[0]
                    ).toFormat("dd-MM-yyyy")} / ${DateTime.fromISO(
                      data[i].Freight.unloadDates[1]
                    ).toFormat("dd-MM-yyyy")}`
                  : ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.supplierOffer
                  ? `${data[i].Freight.supplierOffer} ${t(`${data[i].Freight.currency}`)}`
                  : ""}
              </Table.Td>
              <Table.Td>
                {data[i].Freight.cash
                  ? `${data[i].Freight.cash} ${t(`${data[i].Freight.currency}`)}`
                  : ""}
              </Table.Td>

              <Table.Td>
                {data[i].Freight.cMaturityDay
                  ? ` ${data[i].Freight.cMaturityDay} ${t("day")}`
                  : DateTime.fromISO(data[i].Freight.cLastPayDay).toFormat(
                      "dd-MM-yyyy"
                    )}
              </Table.Td>
              <Table.Td>
                {data[i].isCancelled ? t("cancelled") : t("completed")}
              </Table.Td>
              <Table.Td>
                <Button
                  className="buttons"
                  onClick={() => changeActive(data[i].id)}
                >
                  {t("active")}
                </Button>
              </Table.Td>
            </Table.Tr>
          );
    }
    return temp;
  };

  useEffect(() => {
    getData({ search: "", searchOp: "" });
    console.log("operation mounted");
    return () => {
      console.log("operation unmounted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <Grid style={{ margin: 8, paddingTop: 34 }}>
        <Flex
          mx={10}
          w="100%"
          justify="flex-end"
          align="center"
          gap={20}
          direction={{
            base: "column",
            xs: "column",
            sm: "column",
            md: "column",
            lg: "row",
            xl: "row",
          }}
        >
          {/* <Grid.Col span={{ sm: 2, md: 2, lg: 6 }}>
          {t("total")} : {state.count}
        </Grid.Col>
        <Grid.Col span={{ sm: 10, md: 10, lg: 6 }}>
          <Select
            radius="md"
            style={{ marginRight: 10 }}
            onChange={(e) => getData({ oPerPage: e, oPage: 1 })}
            data={["10", "20", "30"]}
            value={state.oPerPage}
          />
          <Pagination
            color="dark"
            radius="md"
            total={Math.ceil(state.count / Number(state.oPerPage))}
            value={state.oPage}
            onChange={(e) => getData({ oPage: e })}
          />
        </Grid.Col> */}
          <Flex
            direction={{
              base: "column",
              xs: "column",
              sm: "column",
              md: "row",
              lg: "row",
              xl: "row",
            }}
            align="center"
            justify="center"
            gap={20}
          >
            <Select
              className="opSelect"
              miw={170}
              maw={250}
              clearable
              searchable
              label={t("searchbycustomer")}
              data={state.cdata}
              searchValue={state.search.toLocaleUpperCase("tr-TR")}
              onSearchChange={(e) =>
                setState((prev) => ({ ...prev, search: e }))
              }
              value={state.search}
              onChange={(e) => getData({ search: e || "" })}
            />
            <Select
              className="opSelect"
              maw={250}
              miw={170}
              clearable
              searchable
              label={t("searchbyreferancecode")}
              data={state.operationNames}
              searchValue={state.searchOp}
              onSearchChange={(e) =>
                setState((prev) => ({ ...prev, searchOp: e }))
              }
              value={state.searchOp}
              onChange={(e) => getData({ searchOp: e || "", search: "" })}
            />
            <Button
              className="buttons"
              maw={280}
              miw={230}
              mt={22}
              onClick={() => getPassiveOp({ customer: "", supplier: "" })}
            >
              {t("showpassiveoperations")}
            </Button>
          </Flex>
        </Flex>
        <SimpleGrid
          w="100%"
          mx={10}
          cols={{ base: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
          mt={20}
          mb={20}
        >
          {populateOperations()}
        </SimpleGrid>
      </Grid>
      <Modal
        size="70rem"
        fullScreen
        opened={state.modal}
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        onClose={() => setState((prev) => ({ ...prev, modal: false }))}
      >
        {state.mLoading ? (
          <Loading />
        ) : (
          <>
            <Flex
              direction={{
                base: "column",
                xs: "column",
                sm: "column",
                md: "row",
                lg: "row",
                xl: "row",
              }}
              justify="flex-end"
              align="center"
              gap={20}
            >
              <Select
                label={t("searchbyoperation")}
                searchable
                clearable
                data={state.passiveOpNames}
                value={state.operation}
                onChange={(e) =>
                  getPassiveOp({
                    page: 1,
                    operation: e || "",
                    customer: "",
                    supplier: "",
                  })
                }
              />
              <Select
                label={t("searchbyreceiving")}
                searchable
                clearable
                data={state.cusData}
                value={state.customer}
                onChange={(e) => getPassiveOp({ page: 1, customer: e || "" })}
              />
              <Select
                label={t("searchbycarrier")}
                searchable
                clearable
                data={state.suppData}
                value={state.supplier}
                onChange={(e) => getPassiveOp({ page: 1, supplier: e || "" })}
              />
              <DatePickerInput
                w={220}
                type="range"
                allowSingleDateInRange
                clearable
                locale={props.userAgent.lang === "tr" ? "tr" : "en"}
                label={t("searchbydate")}
                valueFormat="DD/MM/YYYY"
                onChange={(e) => changeDate(e)}
                value={state.searchDate}
              />
            </Flex>
            <ScrollArea
              style={{ marginTop: 20 }}
              h={height - 150}
              scrollbarSize={5}
            >
              <Table
                withColumnBorders
                withTableBorder
                withRowBorders
                highlightOnHover
                highlightOnHoverColor="#e4e4e4"
              >
                <Table.Thead>
                  {props.type === "domestic" ? (
                    <Table.Tr>
                      <Table.Th>{t("referancecode")}</Table.Th>
                      <Table.Th>{t("date")}</Table.Th>
                      <Table.Th>{t("carriercompany")}</Table.Th>
                      <Table.Th>{t("receivingcompany")}</Table.Th>
                      <Table.Th>{t("loadingpoint")}</Table.Th>
                      <Table.Th>{t("estimatedunloaddate")}</Table.Th>
                      <Table.Th>{t("material")}</Table.Th>
                      <Table.Th>{t("deliveryaddress")}</Table.Th>
                      <Table.Th>{t("price")}</Table.Th>
                      <Table.Th>{t("profit")}</Table.Th>
                      <Table.Th>{t("totalpincludevat")}</Table.Th>
                      <Table.Th>{t("requestingperson")}</Table.Th>
                      <Table.Th>{t("department")}</Table.Th>
                      <Table.Th>{t("maturity")}</Table.Th>
                      <Table.Th>{t("status")}</Table.Th>
                      <Table.Th>{t("active")}</Table.Th>
                    </Table.Tr>
                  ) : (
                    <Table.Tr>
                      <Table.Th>{t("referancecode")}</Table.Th>
                      <Table.Th>{t("carriercompany")}</Table.Th>
                      <Table.Th>{t("receivingcompany")}</Table.Th>
                      <Table.Th>{t("requestingperson")}</Table.Th>
                      <Table.Th>{t("loadingdate")}</Table.Th>
                      <Table.Th>{t("loadingpoint")}</Table.Th>
                      <Table.Th>{t("deliveryaddress")}</Table.Th>
                      <Table.Th>{t("deliveringcompany")}</Table.Th>
                      <Table.Th>{t("estimatedunloaddate")}</Table.Th>
                      <Table.Th>{t("carrieragreement")}</Table.Th>
                      <Table.Th>{t("recipientagreement")}</Table.Th>
                      <Table.Th>{t("maturity")}</Table.Th>
                      <Table.Th>{t("status")}</Table.Th>
                      <Table.Th>{t("active")}</Table.Th>
                    </Table.Tr>
                  )}
                </Table.Thead>
                <Table.Tbody>{populatePassiveOperations()}</Table.Tbody>
              </Table>
            </ScrollArea>
            <Flex justify="space-between" align="center" direction="row" m={10}>
              {t("total")} : {state.totalRows}
              <Flex direction="row" align="center" justify="center">
                <Select
                  maw={110}
                  radius="md"
                  style={{ marginRight: 10 }}
                  onChange={(e) => getPassiveOp({ perPage: e, page: 1 })}
                  data={["10", "20", "30", "50", "100"]}
                  value={state.perPage}
                />
                <Pagination
                  color="dark"
                  radius="md"
                  total={state.pTotal}
                  value={state.page}
                  onChange={(e) => getPassiveOp({ page: e })}
                />
              </Flex>
            </Flex>
          </>
        )}
      </Modal>
    </>
  );
};

export default Operation;
