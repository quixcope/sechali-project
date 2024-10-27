import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  Grid,
  Select,
  TextInput,
  Radio,
  Flex,
  ScrollArea,
} from "@mantine/core";
import Loading from "./global/loading";
import useTranslation from "next-translate/useTranslation";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon";
import { useViewportSize } from "@mantine/hooks";
import { useOs } from "@mantine/hooks";

const Invoices = (props) => {
  const { t } = useTranslation("common");
  const { height } = useViewportSize();
  const os = useOs();
  const [state, setState] = useState({
    loading: true,
    data: [],
    total: 0,
    modal: false,
    GRPCODE: props.GRPCODE ? props.GRPCODE : "1",
    FOREIGN: props.FOREIGN
      ? props.FOREIGN
      : props.type === "domestic"
        ? "0"
        : "1",
    GUID: "",
    search: "",
    companies: [],
  });

  const form = useForm({ initialValues: { invoicesno: "", date: null } });

  const getData = async ({
    search = state.search,
    GRPCODE = state.GRPCODE,
    FOREIGN = state.FOREIGN,
  }) => {
    let data = { GRPCODE, FOREIGN, GUID: state.GUID, search };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getInvoices`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        ...data,
        data: response.data.data,
        total: response.data.total,
        companies: response.data.companies,
        loading: false,
      }));
    }
  };

  const logbook = (value) => {
    if (value) {
      props.setFieldValue(`invoices.${props.index}`, value);
      props.set((prev) => ({ ...prev, invoiceModal: false }));
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

  const populateInvoices = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.data));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`invoices${i}`}>
          <Table.Td>{data[i].DEFINITION_ || ""}</Table.Td>
          <Table.Td>{data[i].COUNTRY || ""}</Table.Td>
          <Table.Td>{data[i].CITY || ""}</Table.Td>
          <Table.Td>{data[i].TAXOFFICE || ""}</Table.Td>
          <Table.Td>{data[i].DATE_ || ""}</Table.Td>
          <Table.Td>{data[i].TRNET || ""}</Table.Td>
          <Table.Td>{data[i].DOVIZ || ""}</Table.Td>
          <Table.Td>
            {data[i].NETTOTAL ? `${data[i].NETTOTAL} ${t("try")}` : ""}
          </Table.Td>
          <Table.Td>
            {data[i].TUR === "EINVOICE"
              ? t("einvoice")
              : data[i].TUR === "EARCHIVE"
                ? t("earchive")
                : data[i].TUR === "KAGIT"
                  ? t("paper")
                  : data[i].TUR || ""}
          </Table.Td>
          {props.GRPCODE ? (
            <Table.Td>
              <Button
                style={{ backgroundColor: "#4c5056", margin: 10 }}
                onClick={() =>
                  logbook({
                    ficheNo: data[i].FICHENO,
                    guid: data[i].GUID,
                    type: data[i].TUR,
                    id: props.invoiceId,
                    invoiceCategory:
                      state.GRPCODE === "1"
                        ? "incomingInvoice"
                        : "outgoingInvoice",
                  })
                }
              >
                {t("match")}
              </Button>
            </Table.Td>
          ) : null}
          {data[i].TUR === "EINVOICE" || data[i].TUR === "EARCHIVE" ? (
            <Table.Td>
              <>
                <Button
                  className="buttons"
                  onClick={() => {
                    downloadInvoice(data[i].GUID, data[i].TUR);
                  }}
                >
                  {t("invoice")}
                </Button>
              </>
            </Table.Td>
          ) : (
            <Table.Td></Table.Td>
          )}
        </Table.Tr>
      );
    }
    return temp;
  };

  const onClose = () => {
    form.reset();
    setState((prev) => ({ ...prev, modal: false }));
  };

  useEffect(() => {
    getData({});
    console.log("invoices mounted");
    return () => {
      console.log("invoices unmounted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Grid style={{ margin: 8, paddingTop: 34 }} className="invoices-grid">
        <Flex
          m={10}
          justify="flex-start"
          align="center"
          direction={{
            base: "column",
            xs: "column",
            sm: "row",
            md: "row",
            lg: "row",
            xl: "row",
          }}
          w="100%"
          gap={90}
        >
          <Select
            miw={340}
            label={t("searchbycompany")}
            clearable
            searchable
            data={state.companies}
            onChange={(e) => getData({ search: e || "" })}
          />
          <Radio.Group
            label={<strong>{`${t("invoicetype")} :`}</strong>}
            defaultValue={state.FOREIGN}
            onChange={(e) => getData({ FOREIGN: e || "" })}
            align="center"
          >
            <Flex gap={10}>
              <Radio color="#4c5056" label={t("domestic")} value="0" />
              <Radio color="#4c5056" label={t("international")} value="1" />
            </Flex>
          </Radio.Group>
          <Radio.Group
            label={<strong>{`${t("selectinvoicetype")} :`}</strong>}
            defaultValue="1"
            onChange={(e) => getData({ GRPCODE: e || "" })}
            align="center"
          >
            <Flex gap={10}>
              <Radio color="#4c5056" label={t("incomingInvoice")} value="1" />
              <Radio color="#4c5056" label={t("outgoingInvoice")} value="2" />
            </Flex>
          </Radio.Group>
        </Flex>
      </Grid>
      <ScrollArea h={height - 150} scrollbarSize={5}>
        <Table
          withColumnBorders
          withTableBorder
          withRowBorders
          highlightOnHover
          highlightOnHoverColor="#e4e4e4"
          mx={10}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("companyname")}</Table.Th>
              <Table.Th>{t("country")}</Table.Th>
              <Table.Th>{t("city")}</Table.Th>
              <Table.Th>{t("taxoffice")}</Table.Th>
              <Table.Th>{t("date")}</Table.Th>
              <Table.Th>{t("totalamount")}</Table.Th>
              <Table.Th>{t("currency")}</Table.Th>
              <Table.Th>{`${t("total")} ${t("try")}`}</Table.Th>
              <Table.Th>{t("taxpayer")}</Table.Th>
              {props.GRPCODE ? (
                <Table.Th>{t("matchoperation")}</Table.Th>
              ) : null}
              <Table.Th>PDF</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{populateInvoices()}</Table.Tbody>
        </Table>
      </ScrollArea>
      <Modal opened={state.modal} onClose={() => onClose()}>
        <Grid>
          <Grid.Col>
            <TextInput
              label={t("invoiceno")}
              {...form.getInputProps("invoicesno")}
            />
          </Grid.Col>
          <Grid.Col>
            <DatePickerInput
              label={t("date")}
              {...form.getInputProps("date")}
            />
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
};

export default Invoices;
