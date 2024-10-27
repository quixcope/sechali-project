import useTranslation from "next-translate/useTranslation";
import { useEffect, useState } from "react";
import axios from "axios";
import { TextInput, Modal, Table, Button, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DateTime } from "luxon";
import { useViewportSize } from "@mantine/hooks";
import Icons from "../helpers/icon";
import Loading from "./global/loading";
import { makeid } from "../server/functions";
import GlobalPagination from "./global/globalpagination";

const BalanceSheet = () => {
  const { height } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    page: 1,
    perPage: "20",
    direction: "ASC",
    total: 0,
    search: "",
    data: [],
    detailsData: [],
    openModal: false,
    edata: [],
    loading: true,
    warning: false,
    company: "logistic",
  });
  const [searchTime, setSearchTime] = useState(0);

  const getData = async ({
    page = state.page,
    perPage = state.perPage,
    column = state.column,
    direction = state.direction,
    search = state.search,
    company = state.company,
  }) => {
    const data = { page, perPage, column, direction, search, company };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getBalanceSheet`,
      data
    );
    let temp = data;
    if (response.data.success) {
      temp = { ...temp, ...response.data.data };
    } else {
      temp = { ...temp, warning: true };
    }
    setState((prev) => ({ ...prev, ...temp, loading: false }));
  };

  const searchCName = (value) => {
    clearTimeout(searchTime);
    setState((prev) => ({ ...prev, search: value }));
    setSearchTime(setTimeout(() => getData({ search: value }), 1000));
  };

  useEffect(() => {
    getData({});
    console.log("balancesheet mounted");
    return () => {
      console.log("balancesheet unmounted");
    };
  }, []);

  const exportExcel = async () => {
    const data = {
      data: state.edata,
      name: `${t("balancesheet")}_${DateTime.fromISO(DateTime.local()).toFormat(
        "dd_MM_yyyy"
      )}_${makeid()}.xlsx`,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/sheetExportExcel?name=BALANCESHEET`,
      data,
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
        message: `${t("fileerror")}:\n${response}`,
        color: "red",
        radius: "lg",
      });
    }
  };

  const populateDetailRows = () => {
    let temp = [];
    if (state.detailsData.length !== 0) {
      for (let k = 0; k < state.detailsData?.length; k++) {
        temp.push(
          <tr key={`populateDetailRows-${k}`}>
            <td>
              {<strong style={{ fontSize: 18 }}>::</strong>}
              {state.detailsData[k].CARI_HESAP_KODU}
            </td>
            <td>{state.detailsData[k].ACIKLAMA}</td>
            <td>
              {DateTime.fromISO(state.detailsData[k].TARIH).toFormat(
                "dd/MM/yyyy"
              )}
            </td>
            <td>{state.detailsData[k].FIS_NO}</td>
            <td>{state.detailsData[k].FIS_TURU}</td>
            <td>{state.detailsData[k].BELGE_NO}</td>
            <td>{state.detailsData[k].SATIR_ACIKLAMASI}</td>
            <td>{state.detailsData[k].BORC}</td>
            <td>{state.detailsData[k].BAKIYE}</td>
            <td>{state.detailsData[k].ISLEM_DOVIZI}</td>
            <td>{state.detailsData[k].ISLEM_DOVIZ_TUTARI}</td>
          </tr>
        );
      }
    }
    return temp;
  };

  const getDetailRows = async (code) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getBalanceDetails`,
      { code: code, company: state.company }
    );
    setState((prev) => ({ ...prev, ...response.data.data, openModal: true }));
  };

  const populateRows = () => {
    let temp = [];
    if (state.data.length !== 0) {
      for (let k = 0; k < state.data?.length; k++) {
        temp.push(
          <tr
            onClick={() => getDetailRows(state.data[k].KOD)}
            key={`populateRows-${k}`}
          >
            <td>
              {<strong style={{ fontSize: 18, marginRight: 10 }}>::</strong>}
              {state.data[k].KOD}
            </td>
            <td>{state.data[k].UNVAN}</td>
            <td>{state.data[k].BORC}</td>
            <td>{state.data[k].ALACAK}</td>
            <td>{state.data[k].BAKIYE}</td>
            <td>{state.data[k].RENK}</td>
          </tr>
        );
      }
    }
    return temp;
  };

  return state.loading ? (
    <Loading />
  ) : state.warning ? (
    <div
      style={{
        textAlign: "center",
        justifyContent: "center",
        height: "90vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {t("errortryagain")}
    </div>
  ) : (
    <>
      <div
        style={{
          margin: 10,
          display: "flex",
          justifyContent: "flext-start",
          flexDirection: "row",
          gap: 5,
        }}
      >
        <TextInput
          rightSection={<Icons name="BiSearchAlt" size="1.2em" />}
          value={state.search}
          placeholder={t("searchbyname")}
          onChange={(e) => searchCName(e.target.value)}
        />
        <Button
          size="sm"
          className="buttons"
          style={{ marginBottom: 20 }}
          onClick={() => exportExcel()}
        >
          {t("exportexcel")}
        </Button>
      </div>
      <ScrollArea
        scrollbarSize={0}
        style={{
          height: height - 250,
          margin: 10,
        }}
        mt={10}
      >
        <Table highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>{t("clientcode")}</th>
              <th>{t("clientname")}</th>
              <th>{t("debit")}</th>
              <th>{t("credit")}</th>
              <th>{t("balance")}</th>
              <th>{t("color")}</th>
            </tr>
          </thead>
          <tbody>{populateRows()}</tbody>
        </Table>
      </ScrollArea>
      <GlobalPagination
        getData={getData}
        page={state.page}
        perPage={state.perPage}
        total={state.total}
      />
      <Modal
        fullScreen
        centered
        opened={state.openModal}
        onClose={() => setState((prev) => ({ ...prev, openModal: false }))}
        title={
          <strong className="size-14" style={{ textTransform: "uppercase" }}>
            {t("balancesheetdetails")}
          </strong>
        }
      >
        <Table
          className="sheet-table"
          style={{
            margin: 10,
          }}
          highlightOnHover
          withBorder
          withColumnBorders
        >
          <thead>
            <tr>
              <th>{t("clientaccountcode")}</th>
              <th>{t("description")}</th>
              <th>{t("date")}</th>
              <th>{t("billno")}</th>
              <th>{t("billtype")}</th>
              <th>{t("documentno")}</th>
              <th>{t("rowdesc")}</th>
              <th>{t("debit")}</th>
              <th>{t("balance")}</th>
              <th>{t("processcurrency")}</th>
              <th>{t("currencyamount")}</th>
            </tr>
          </thead>
          <tbody>{populateDetailRows()}</tbody>
        </Table>
      </Modal>
    </>
  );
};

export default BalanceSheet;
