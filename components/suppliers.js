import axios from "axios";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Select,
  Modal,
  Table,
  Grid,
  ActionIcon,
  Text,
  Divider,
  Accordion,
  Pagination,
  ScrollArea,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { countryData, cityData } from "../helpers/countryandcity";
import Icons from "../helpers/icon";
import { notifications } from "@mantine/notifications";
import Loading from "./global/loading";
import { useViewportSize } from "@mantine/hooks";
import { modalStyle } from "../helpers/functions";
import Info from "./infopopup";

const Suppliers = (props) => {
  const { width, height } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    contactTypes: [
      { label: t("importauthority"), value: "importauthority" },
      { label: t("exportauthority"), value: "exportauthority" },
      { label: t("accountingofficer"), value: "accountingofficer" },
      { label: t("financeofficer"), value: "financeofficer" },
    ],
    suppliersData: [],
    isEdit: false,
    perPage: "30",
    page: 1,
    count: 0,
    suppModal: false,
    suppliers: [],
    search: "",
    total: 0,
  });

  const form = useForm({
    initialValues: {
      supplierName: "",
      country: null,
      city: null,
      address: "",
      phone: "",
      email: "",
      fax: "",
      postcode: "",
      id: null,
      taxnr: "",
      taxoffice: "",
      contacts: [],
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("invalidemail")),
      address: (value) => (value === "" ? t("requiredaddress") : null),
      cCode: (value) => (value === "" ? t("requiredccode") : null),
    },
  });

  const getData = async ({
    page = state.page,
    perPage = state.perPage,
    search = state.search,
  }) => {
    const data = { page, perPage, search };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getSuppliers`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, ...data, ...response.data.data }));
      form.reset();
    }
    setState((prev) => ({ ...prev, ...data, loading: false }));
  };

  const selectCity = (e) => {
    if (e) form.setValues((prev) => ({ ...prev, country: e, region: null }));
  };

  const handleSubmit = async (values) => {
    const data = { ...values, edit: state.isEdit };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createSupplier`,
      data
    );
    if (response.data.success) {
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
      setState((prev) => ({ ...prev, suppModal: false }));
      getData({});
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const setRows = (rows) => {
    form.setValues(rows);
    setState((prev) => ({ ...prev, suppModal: true, isEdit: true }));
  };

  const populateSuppliers = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.suppliersData));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`suppliers${i}`} onClick={() => setRows(data[i])}>
          <Table.Td>{data[i].supplierName || "-"}</Table.Td>
          <Table.Td>{data[i].email || "-"}</Table.Td>
          <Table.Td>{data[i].address || "-"}</Table.Td>
          <Table.Td>{data[i].phone || "-"}</Table.Td>
          <Table.Td>{data[i].fax || "-"}</Table.Td>
          <Table.Td>{data[i].taxnr || "-"}</Table.Td>
          <Table.Td>{data[i].taxoffice || "-"}</Table.Td>
          <Table.Td>{data[i].country || "-"}</Table.Td>
          <Table.Td>{data[i].city || "-"}</Table.Td>
          <Table.Td>{data[i].postcode || "-"}</Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  const populateForm = () => {
    const texts = [
      { label: t("suppliername"), value: "supplierName" },
      { label: t("email"), value: "email" },
      { label: t("address"), value: "address" },
      { label: t("phone"), value: "phone" },
      { label: t("fax"), value: "fax" },
      { label: t("taxnr"), value: "taxnr" },
      { label: t("taxoffice"), value: "taxoffice" },
      { label: t("postcode"), value: "postcode" },
    ];
    let temp = [];
    for (let i = 0; i < texts.length; i++) {
      temp.push(
        <div key={`texts${i}`}>
          <TextInput
            label={texts[i].label}
            {...form.getInputProps(texts[i].value)}
          />
        </div>
      );
    }
    return temp;
  };

  const onClose = () => {
    form.reset();
    setState((prev) => ({ ...prev, suppModal: false, isEdit: false }));
  };

  const getSuppliers = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getLogoCustomersSuppliers`,
      { type: "supplier" }
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
    console.log("suppliers mounted");
    return () => {
      console.log("suppliers unmounted");
    };
  }, [props.type]);

  const fields = form.values.contacts?.map((item, index) => {
    const selectedContacts = form.values.contacts
      .filter((contact, i) => i !== index)
      .map((contact) => contact.type);
    return (
      <Accordion.Item key={`accordion-${index}`} value={`accordion-${index}`}>
        <Accordion.Control>
          {form.values.contacts[index].type
            ? state.contactTypes.find(
                (x) => x.value === form.values.contacts[index].type
              ).label
            : t("contacttype")}
        </Accordion.Control>
        <Accordion.Panel>
          <Grid>
            <Grid.Col>
              <Select
                label={t("contacttype")}
                searchable
                clearable
                data={state.contactTypes.filter(
                  (contact) => !selectedContacts.includes(contact.value)
                )}
                onChange={(e) =>
                  form.setFieldValue(`contacts.${index}.type`, e)
                }
                {...form.getInputProps(`contacts.${index}.type`)}
              />
            </Grid.Col>
            <Grid.Col>
              <TextInput
                label={t("name")}
                {...form.getInputProps(`contacts.${index}.name`)}
              />
            </Grid.Col>
            <Grid.Col>
              <TextInput
                label={t("phone")}
                {...form.getInputProps(`contacts.${index}.phone`)}
              />
            </Grid.Col>
            <Grid.Col>
              <TextInput
                label={t("email")}
                {...form.getInputProps(`contacts.${index}.email`)}
              />
            </Grid.Col>
            <Grid.Col
              span={12}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActionIcon
                color="red"
                onClick={() => form.removeListItem("contacts", index)}
              >
                <Icons name="FaTrashAlt" />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

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
          <Button mt={22} className="buttons" onClick={() => getSuppliers()}>
            {t("getlogosuppliers")}
          </Button>
          <Select
            w={{ base: 350, xs: 350, sm: 450, md: 450, lg: 450, xl: 450 }}
            label={t("searchbycompany")}
            clearable
            searchable
            data={state.suppliers}
            searchValue={state.search.toLocaleUpperCase("tr-TR")}
            onSearchChange={(e) => setState((prev) => ({ ...prev, search: e }))}
            onChange={(e) => getData({ page: 1, search: e || "" })}
          />
          <Button
            mt={22}
            className="buttons"
            onClick={() => setState((prev) => ({ ...prev, suppModal: true }))}
          >
            {t("newsupplier")}
          </Button>
        </Flex>
        <ScrollArea
          style={{ marginTop: 10 }}
          h={height - 200}
          scrollbarSize={5}
        >
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
                <Table.Th>{t("suppliername")}</Table.Th>
                <Table.Th>{t("email")}</Table.Th>
                <Table.Th>{t("address")}</Table.Th>
                <Table.Th>{t("phone")}</Table.Th>
                <Table.Th>{t("fax")}</Table.Th>
                <Table.Th>{t("taxnr")}</Table.Th>
                <Table.Th>{t("taxoffice")}</Table.Th>
                <Table.Th>{t("country")}</Table.Th>
                <Table.Th>{t("city")}</Table.Th>
                <Table.Th>{t("postcode")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{populateSuppliers()}</Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
      <Modal
        className="supplierModal"
        size="lg"
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        closeOnClickOutside={false}
        title={<strong>{t("newsupplier")}</strong>}
        opened={state.suppModal}
        onClose={() => onClose()}
      >
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          {populateForm()}
          <Divider my="xs" label={t("contacttypes")} />
          {fields.length > 0 ? null : (
            <Text c="dimmed" align="center">
              {t("nothingfound")}
            </Text>
          )}
          <Accordion mb="md">{fields}</Accordion>
          {fields.length === state.contactTypes.length ? null : (
            <Flex align="center" justify="center" my={10}>
              <Button
                className="buttons"
                onClick={() =>
                  form.insertListItem("contacts", {
                    type: null,
                    name: "",
                    phone: "",
                    email: "",
                  })
                }
              >
                {t("addcontact")}
              </Button>
            </Flex>
          )}
          <Select
            searchable
            label={<strong>{t("country")}</strong>}
            data={countryData[props.lang === "tr" ? "tr" : "en"]}
            value={form.values.country}
            onChange={(e) => selectCity(e)}
          />
          <Select
            searchable
            label={<strong>{t("city")}</strong>}
            data={form.values.country ? cityData[form.values.country] : []}
            {...form.getInputProps("city")}
          />
          <Flex align="center" justify="center" my={10}>
            <Button className="buttons" type="submit">
              {state.isEdit ? t("edit") : t("create")}
            </Button>
          </Flex>
        </form>
      </Modal>
      <Flex
        m={15}
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
          {t("total")} : {state.count}
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
    </>
  );
};

export default Suppliers;
