import { useEffect, useState } from "react";
import axios from "axios";
import useTranslation from "next-translate/useTranslation";
import Loading from "./global/loading";
import Offers from "./offers";
import {
  Button,
  Table,
  Modal,
  Grid,
  ScrollArea,
  Tabs,
  Pagination,
  Select,
  Flex,
} from "@mantine/core";
import FreightForm from "./freightform";
import { DateTime } from "luxon";
import { modalStyle } from "../helpers/functions";
import { useViewportSize } from "@mantine/hooks";
import CustomersForm from "./customersform";
import Info from "./infopopup";

const ListOffers = (props) => {
  const { t } = useTranslation("common");
  const { width, height } = useViewportSize();
  const [state, setState] = useState({
    loading: false,
    freights: [],
    formData: [],
    cFormData: [],
    selectData: [],
    showFreight: false,
    selectCData: [],
    freightForm: false,
    freightType: [
      { label: t("domestic"), value: "domestic" },
      { label: t("international"), value: "international" },
    ],
    cModal: false,
    cInfo: false,
    page: 1,
    perPage: "10",
    cPage: 1,
    cPerPage: "10",
    cusPage: 1,
    cusPerPage: "10",
    total: 0,
    ptotal: 0,
    ctotal: 0,
    pctotal: 0,
    mloading: false,
    tab: "form",
    cancelled: false,
    companies: [],
    customer: "",
    mtotal: 0,
    pmtotal: 0,
    cSearch: "",
    cCompany: [],
    company: [],
    activeSearch: true,
    active: false,
    relatedPersons: [],
    relatedPerson: "",
    weightType: "",
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
    referanceCodes: [],
    referance: "",
  });

  const getData = async ({
    customer = state.customer,
    activeSearch = state.activeSearch,

    page = state.page,
    perPage = state.perPage,
    relatedPerson = state.relatedPerson,
    weightType = state.weightType,
    referance = state.referance,
  }) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      freightForm: false,
      showFreight: false,
    }));
    const data = {
      customer,
      page,
      perPage,
      type: props.type,
      activeSearch,
      relatedPerson,
      weightType,
      referance,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getFreights`,
      data
    );
    let temp = {};
    if (response.data.success) {
      temp = {
        ...data,
        ...response.data.data,
        loading: false,
        showFreight: false,
      };
    }
    setState((prev) => ({ ...prev, ...temp, loading: false }));
  };

  const getDeletedFreights = () => {
    setState((prev) => ({ ...prev, active: !prev.active }));
    getData({ activeSearch: !state.activeSearch });
  };

  const setTab = (value) => {
    let temp = {};
    if (value === "form") temp = { cancelled: false };
    else temp = { cancelled: true };
    setState((prev) => ({ ...prev, ...temp, tab: value }));
  };

  const getCForms = async ({
    cusPage = state.cusPage,
    cusPerPage = state.cusPerPage,
    cSearch = state.cSearch,
  }) => {
    const data = { cusPage, cusPerPage, cSearch: cSearch || "" };
    setState((prev) => ({ ...prev, mloading: true }));
    const cForms = await axios.post(
      `${process.env.SERVER_IP}/api/getCustomersForms`,
      data
    );
    if (cForms.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        ...cForms.data.data,
        cInfo: true,
        mloading: false,
      }));
    }
  };

  const getCancelledCForms = async ({
    cPage = state.cPage,
    cPerPage = state.cPerPage,
  }) => {
    const data = { cPage, cPerPage };
    setState((prev) => ({ ...prev, mloading: true }));
    const cForms = await axios.post(
      `${process.env.SERVER_IP}/api/getCancelledCForms`,
      data
    );
    if (cForms.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        ...cForms.data.data,
        cancelled: true,
        mloading: false,
      }));
    }
  };

  const populateCForms = () => {
    let temp = [];
    const data = state.formData;
    for (let i = 0; i < data.length; i++) {
      if (data[i].freightName !== "invalidform") {
        temp.push(
          <Table.Tr
            key={`cforms${i}`}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                cModal: true,
                selectCData: data[i],
              }))
            }
          >
            <Table.Td>{data[i].Customer.customerName || ""}</Table.Td>
            <Table.Td>
              {data[i].date
                ? DateTime.fromISO(data[i].date).toFormat("dd-MM-yyyy")
                : ""}
            </Table.Td>
          </Table.Tr>
        );
      }
    }
    return temp;
  };

  const populateCancelledCForms = () => {
    let temp = [];
    const data = state.cFormData;
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr
          key={`cforms${i}`}
          onClick={() =>
            setState((prev) => ({
              ...prev,
              cModal: true,
              selectCData: data[i],
            }))
          }
        >
          <Table.Td>{data[i].Customer.customerName}</Table.Td>
          <Table.Td>
            {DateTime.fromISO(data[i].date).toFormat("dd-MM-yyyy")}
          </Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  const populateForms = () => {
    let temp = [];
    const data = state.freights;
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr
          key={`forms${i}`}
          style={{
            backgroundColor:
              data[i].status === "active"
                ? props.color?.duringoperation || "#fad105"
                : data[i].status === "passive"
                  ? props.color?.completedoperation || "#c0c5ce"
                  : data[i].status === "waitingcform"
                    ? props.color?.notstartedyet || "#68946c"
                    : "",
          }}
          onClick={() =>
            setState((prev) => ({
              ...prev,
              showFreight: true,
              selectData: data[i],
            }))
          }
        >
          <Table.Td>
            {data[i].referanceCode
              ? `${state[data[i].type]}${data[i].referanceCode}`
              : ""}
          </Table.Td>
          {props.type === "international" && (
            <Table.Td>
              {data[i].Confirmation ? `${t("yes")}` : `${t("no")}`}
            </Table.Td>
          )}
          {props.type === "international" && (
            <Table.Td>{data[i].Confirmation?.name || ""}</Table.Td>
          )}
          <Table.Td>{data[i].PurchasingRep.name || ""}</Table.Td>
          <Table.Td>{data[i].companyName || ""}</Table.Td>
          <Table.Td>{data[i].companyAddress || ""}</Table.Td>
          <Table.Td>{data[i].productType || ""}</Table.Td>
          <Table.Td>
            {data[i].weightType ? t(`${data[i].weightType}`) : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Addresses
              ? data[i].Addresses.filter((x) => x.type === "loadingpoint")
                  .map((x) => x.address)
                  .join(", ")
              : ""}
          </Table.Td>
          <Table.Td>
            {data[i].Addresses
              ? data[i].Addresses.filter((x) => x.type === "deliveryaddress")
                  .map((x) => x.address)
                  .join(", ")
              : ""}
          </Table.Td>
          <Table.Td>
            {DateTime.fromISO(data[i].orderDate).toFormat("dd-MM-yyyy") || ""}
          </Table.Td>
          <Table.Td>
            {DateTime.fromISO(data[i].loadDate).toFormat("dd-MM-yyyy") || ""}
          </Table.Td>
          <Table.Td>{t(`${data[i].shippingType}`) || ""}</Table.Td>
          <Table.Td>{data[i].cash || ""}</Table.Td>
          <Table.Td>{t(`${data[i].currency}`) || ""}</Table.Td>
          {props.type === "international" ? (
            <Table.Td>{data[i].YDG ? t("yes") : t("no")}</Table.Td>
          ) : null}
          <Table.Td>{data[i].relatedPerson || ""}</Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  useEffect(() => {
    console.log("listoffers mounted");
    getData({
      customer: "",
      relatedPerson: "",
      weightType: "",
      referance: "",
    });
    return () => {
      console.log("listoffers unmounted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <Grid style={{ margin: 8, paddingTop: 34 }}>
        <Flex
          mx={21}
          gap={{ base: 3, xs: 3, sm: 3, md: 21, lg: 21, xl: 21 }}
          my={20}
          w="100%"
          justify="flex-end"
          align="center"
          direction={{
            base: "column",
            xs: "column",
            sm: "column",
            md: "row",
            lg: "row",
            xl: "row",
          }}
        >
          <Select
            label={t("searchbycompany")}
            clearable
            searchable
            onChange={(e) => getData({ page: 1, customer: e || "" })}
            data={state.companies}
            value={state.customer}
          />
          <Select
            label={t("searchbyrelatedperson")}
            clearable
            searchable
            onChange={(e) => getData({ page: 1, relatedPerson: e || "" })}
            data={state.relatedPersons}
            value={state.relatedPerson}
          />
          <Select
            label={t("searchbyreferancecode")}
            clearable
            searchable
            onChange={(e) =>
              getData({
                page: 1,
                referance: e || "",
                relatedPerson: "",
                customer: "",
                weightType: "",
              })
            }
            data={state.referanceCodes}
            value={state.referance}
          />
          <Select
            label={t("searchbyweighttype")}
            clearable
            searchable
            onChange={(e) => getData({ page: 1, weightType: e || "" })}
            data={[
              { label: "FTL", value: "FTL" },
              { label: t("PARTIAL"), value: "PARTIAL" },
            ]}
            value={state.weightType}
          />
          <Button
            miw={{ base: 350, xs: 350, sm: 450, md: 200, lg: 200, xl: 200 }}
            mt={24}
            className="buttons"
            onClick={() => setState((prev) => ({ ...prev, freightForm: true }))}
          >
            {t("freightform")}
          </Button>
          <Button
            miw={{ base: 350, xs: 350, sm: 450, md: 200, lg: 200, xl: 200 }}
            mt={24}
            className="buttons right"
            onClick={() => getCForms({})}
          >
            {t("customerinfoforms")}
          </Button>
          <Button
            miw={{ base: 350, xs: 350, sm: 450, md: 200, lg: 200, xl: 200 }}
            mt={24}
            className="buttons right"
            onClick={() => getDeletedFreights({})}
          >
            {state.active ? t("showactiveforms") : t("showpassiveforms")}
          </Button>
        </Flex>
        <Grid.Col>
          <ScrollArea h={height - 250} scrollbarSize={5}>
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
                  {props.type === "international" && (
                    <Table.Th>{t("confirm")}</Table.Th>
                  )}
                  {props.type === "international" && (
                    <Table.Th>{t("approver")}</Table.Th>
                  )}
                  <Table.Th>{t("purchasingrepresentative")}</Table.Th>
                  <Table.Th>{t("companyname")}</Table.Th>
                  <Table.Th>{t("clientcompanyaddress")}</Table.Th>
                  <Table.Th>{t("producttype")}</Table.Th>
                  <Table.Th>{t("weighttype")}</Table.Th>
                  <Table.Th>{t("loadingpoint")}</Table.Th>
                  <Table.Th>{t("deliveryaddress")}</Table.Th>
                  <Table.Th>{t("orderdate")}</Table.Th>
                  <Table.Th>{t("loaddate")}</Table.Th>
                  <Table.Th>{t("shippingtype")}</Table.Th>
                  <Table.Th>{t("price")}</Table.Th>
                  <Table.Th>{t("currency")}</Table.Th>
                  {props.type === "international" ? (
                    <Table.Th>{t("Ydg")}</Table.Th>
                  ) : null}
                  <Table.Th>{t("relatedperson")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{populateForms()}</Table.Tbody>
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
            {t("total")} : {state.mtotal}
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
              total={state.pmtotal}
              value={state.page}
              onChange={(e) => getData({ page: e })}
            />
          </Flex>
        </Flex>
        <Modal
          {...modalStyle}
          scrollAreaComponent={ScrollArea.Autosize}
          fullScreen
          opened={state.showFreight}
          onClose={() => setState((prev) => ({ ...prev, showFreight: false }))}
        >
          <Offers
            data={state.selectData}
            userAgent={props.userAgent}
            set={setState}
            getData={getData}
            type={props.type}
            general={props.general}
          />
        </Modal>
        <Modal
          size="70rem"
          scrollAreaComponent={ScrollArea.Autosize}
          opened={state.freightForm}
          closeOnClickOutside={false}
          onClose={() => setState((prev) => ({ ...prev, freightForm: false }))}
          {...modalStyle}
        >
          <FreightForm
            closeFreightForm={setState}
            userAgent={props.userAgent}
            general={props.general}
            type={props.type}
            relatedPersons={state.relatedPersons}
            getData={getData}
          />
        </Modal>
      </Grid>
      <Modal
        size="70rem"
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={state.cInfo}
        onClose={() =>
          setState((prev) => ({ ...prev, cInfo: false, cancelled: false }))
        }
      >
        <ScrollArea style={{ marginTop: 20 }} h={1000} scrollbarSize={5}>
          <Tabs color="blue" defaultValue="form" onChange={(e) => setTab(e)}>
            <Tabs.List>
              <Tabs.Tab value="form">{<strong>{t("forms")}</strong>}</Tabs.Tab>
              <Tabs.Tab
                value="cform"
                color="red"
                onClick={() => getCancelledCForms({})}
              >
                {<strong>{t("cancelledforms")}</strong>}
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="form" pt="xs">
              {state.mloading ? (
                <Loading />
              ) : (
                <Grid>
                  <Grid.Col span={4}>
                    <Select
                      clearable
                      searchable
                      label={t("searchbycompany")}
                      data={state.company}
                      searchValue={state.cSearch}
                      onSearchChange={(e) =>
                        setState((prev) => ({ ...prev, cSearch: e }))
                      }
                      value={state.cSearch}
                      onChange={(e) => getCForms({ cSearch: e })}
                    />
                  </Grid.Col>
                  <Grid.Col>
                    <Table highlightOnHover highlightOnHoverColor="gray">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{t("companyname")}</Table.Th>
                          <Table.Th>{t("date")}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{populateCForms()}</Table.Tbody>
                    </Table>
                  </Grid.Col>
                </Grid>
              )}
            </Tabs.Panel>
            <Tabs.Panel value="cform" pt="xs">
              {state.mloading ? (
                <Loading />
              ) : (
                <Grid>
                  <Grid.Col>
                    <Table highlightOnHover highlightOnHoverColor="gray">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>{t("companyname")}</Table.Th>
                          <Table.Th>{t("date")}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{populateCancelledCForms()}</Table.Tbody>
                    </Table>
                  </Grid.Col>
                </Grid>
              )}
            </Tabs.Panel>
          </Tabs>
        </ScrollArea>
        <Grid>
          {!state.cancelled ? (
            <>
              <Flex
                mx={20}
                w="100%"
                direction="row"
                justify="space-between"
                align="center"
                gap={20}
              >
                <div>
                  {t("total")} : {state.total}
                </div>
                <Flex justify="center" align="center" direction="row" gap={10}>
                  <Select
                    maw={100}
                    radius="md"
                    style={{ marginRight: 10 }}
                    onChange={(e) => getCForms({ cusPerPage: e, cusPage: 1 })}
                    data={["10", "20", "30", "50", "100"]}
                    value={state.cusPerPage}
                  />
                  <Pagination
                    color="dark"
                    radius="md"
                    total={state.ptotal}
                    value={state.cusPage}
                    onChange={(e) => getCForms({ cusPage: e })}
                  />
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex
                mx={20}
                w="100%"
                direction="row"
                justify="space-between"
                align="center"
              >
                <div>
                  {t("total")} : {state.ctotal}
                </div>
                <Flex justify="center" align="center" direction="row" gap={10}>
                  <Select
                    maw={100}
                    radius="md"
                    style={{ marginRight: 10 }}
                    onChange={(e) =>
                      getCancelledCForms({ cPerPage: e, cPage: 1 })
                    }
                    data={["10", "20", "30", "50", "100"]}
                    value={state.cPerPage}
                  />
                  <Pagination
                    color="dark"
                    radius="md"
                    total={state.pctotal}
                    value={state.cPage}
                    onChange={(e) => getCancelledCForms({ cPage: e })}
                  />
                </Flex>
              </Flex>
            </>
          )}
        </Grid>
      </Modal>
      <Modal
        {...modalStyle}
        fullScreen
        opened={state.cModal}
        onClose={() =>
          setState((prev) => ({ ...prev, cModal: false, selectData: [] }))
        }
      >
        <CustomersForm
          data={state.selectCData}
          check={true}
          set={setState}
          userAgent={props.userAgent}
          getData={getData}
        />
      </Modal>
    </>
  );
};

export default ListOffers;
