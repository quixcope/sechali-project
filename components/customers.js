import axios from "axios";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Table,
  Select,
  Pagination,
  Modal,
  ScrollArea,
  Grid,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Loading from "./global/loading";
import { useViewportSize } from "@mantine/hooks";
import { countryData, cityData } from "../helpers/countryandcity";
import { modalStyle } from "../helpers/functions";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon";
import Info from "./infopopup";

const Customers = (props) => {
  const { height, width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: false,
    customers: [],
    perPage: "20",
    page: 1,
    totalRows: 0,
    edit: false,
    search: "",
    customerData: [],
    total: 0,
  });

  const form = useForm({
    initialValues: {
      customerName: "",
      email: "",
      phone: "",
      fax: "",
      taxnr: "",
      taxoffice: "",
      country: null,
      city: null,
    },
  });

  const getData = async ({
    page = state.page,
    perPage = state.perPage,
    search = state.search,
  }) => {
    const data = { page, perPage, search };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getCustomerData`,
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

  const selectCity = (e) => {
    if (e) form.setValues((prev) => ({ ...prev, country: e, region: null }));
  };

  const handleSubmit = async (values) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createCustomer`,
      { ...values, edit: state.edit }
    );
    if (response.data.success) {
      getData({});
      form.reset();
      setState((prev) => ({ ...prev, edit: false, cModal: false }));
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
  };

  const setRows = (values) => {
    form.setValues(values);
    setState((prev) => ({ ...prev, cModal: true, edit: true }));
  };

  const populateCustomers = () => {
    const data = JSON.parse(JSON.stringify(state.customers));
    let temp = [];
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`customers${i}`} onClick={() => setRows(data[i])}>
          <Table.Td>{data[i].customerName || "-"}</Table.Td>
          <Table.Td>{data[i].address || "-"}</Table.Td>
          <Table.Td>{data[i].email || "-"}</Table.Td>
          <Table.Td>{data[i].phone || "-"}</Table.Td>
          <Table.Td>{data[i].fax || "-"}</Table.Td>
          <Table.Td>{data[i].taxnr || "-"}</Table.Td>
          <Table.Td>{data[i].taxoffice || "-"}</Table.Td>
          <Table.Td>{data[i].country || "-"}</Table.Td>
          <Table.Td>{data[i].city || "-"}</Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  const getCustomers = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getLogoCustomersSuppliers`,
      { type: "customer" }
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
        message: t("servererror"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  useEffect(() => {
    getData({});
    console.log("customerspage mounted");
    return () => {
      console.log("customerspage unmouted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <div style={{ margin: 8, paddingTop: 34 }}>
        <Flex
          gap={{ base: 4, xs: 4, sm: 20, md: 20, lg: 20, xl: 20 }}
          my={20}
          direction={{
            base: "column",
            xs: "column",
            sm: "row",
            md: "row",
            lg: "row",
            xl: "row",
          }}
          align="center"
          justify="flex-end"
        >
          <Button mt={22} className="buttons" onClick={() => getCustomers()}>
            {t("getlogocustomers")}
          </Button>
          <Select
            w={{
              base: 350,
              xs: 350,
              sm: 450,
              md: 450,
              lg: 450,
              xl: 450,
            }}
            label={t("searchbycompany")}
            clearable
            searchable
            data={state.customerData}
            searchValue={state.search.toLocaleUpperCase("tr-TR")}
            onSearchChange={(e) => setState((prev) => ({ ...prev, search: e }))}
            onChange={(e) => getData({ page: 1, search: e || "" })}
          />
          <Button
            mt={22}
            className="buttons"
            onClick={() => setState((prev) => ({ ...prev, cModal: true }))}
          >
            {t("newcustomer")}
          </Button>
        </Flex>
        <ScrollArea h={height - 150} scrollbarSize={5}>
          <Table
            withColumnBorders
            withTableBorder
            withRowBorders
            highlightOnHover
            highlightOnHoverColor="#e4e4e4"
            striped
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("customername")}</Table.Th>
                <Table.Th>{t("address")}</Table.Th>
                <Table.Th>{t("email")}</Table.Th>
                <Table.Th>{t("phone")}</Table.Th>
                <Table.Th>{t("fax")}</Table.Th>
                <Table.Th>{t("taxnr")}</Table.Th>
                <Table.Th>{t("taxoffice")}</Table.Th>
                <Table.Th>{t("country")}</Table.Th>
                <Table.Th>{t("city")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{populateCustomers()}</Table.Tbody>
          </Table>
        </ScrollArea>
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
          gap={20}
        >
          <Flex direction="row" justify="center" align="center" gap={20}>
            {t("total")} : {state.totalRows}
            {width > 768 ? (
              ""
            ) : (
              <Select
                maw={80}
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
                maw={80}
                style={{ marginRight: 10 }}
                onChange={(e) => getData({ perPage: e, page: 1 })}
                data={["10", "20", "30", "50", "100"]}
                value={state.perPage}
              />
            )}
            <Pagination
              color="dark"
              radius="md"
              total={state.total}
              value={state.page}
              onChange={(e) => getData({ page: e })}
            />
          </Flex>
        </Flex>
        <Modal
          className="customerModal"
          {...modalStyle}
          size="lg"
          scrollAreaComponent={ScrollArea.Autosize}
          title={<strong>{t("newcustomer")}</strong>}
          opened={state.cModal}
          onClose={() =>
            setState((prev) => ({ ...prev, cModal: false, edit: false }))
          }
        >
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Grid>
              <Grid.Col>
                <TextInput
                  label={t("customername")}
                  {...form.getInputProps("customerName")}
                />
              </Grid.Col>
              <Grid.Col>
                <TextInput
                  label={t("address")}
                  {...form.getInputProps("address")}
                />
              </Grid.Col>
              <Grid.Col>
                <TextInput
                  label={t("email")}
                  {...form.getInputProps("email")}
                />
              </Grid.Col>
              <Grid.Col>
                <TextInput
                  label={t("phone")}
                  {...form.getInputProps("phone")}
                />
              </Grid.Col>
              <Grid.Col>
                <TextInput label={t("fax")} {...form.getInputProps("fax")} />
                <TextInput
                  label={t("taxnr")}
                  {...form.getInputProps("taxnr")}
                />
              </Grid.Col>
              <Grid.Col>
                <TextInput
                  label={t("taxoffice")}
                  {...form.getInputProps("taxoffice")}
                />
              </Grid.Col>
              <Grid.Col>
                <Select
                  searchable
                  label={<strong>{t("country")}</strong>}
                  data={countryData[props.lang === "tr" ? "tr" : "en"]}
                  value={form.values.country}
                  onChange={(e) => selectCity(e)}
                />
              </Grid.Col>
              <Grid.Col>
                <Select
                  searchable
                  label={<strong>{t("city")}</strong>}
                  data={
                    form.values.country ? cityData[form.values.country] : []
                  }
                  {...form.getInputProps("city")}
                />
              </Grid.Col>
              <Flex align="center" justify="center" w="100%">
                <Button className="buttons" type="submit">
                  {state.edit ? t("edit") : t("save")}
                </Button>
              </Flex>
            </Grid>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Customers;
