import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../components/global/loading";
import useTranslation from "next-translate/useTranslation";
import Vehicle from "../components/global/vehicle";
import { Image, Grid } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

export async function getServerSideProps({ query, req }) {
  const userQuery = JSON.stringify(query);
  const ip = req.headers["x-forwarded-for"] || req.body.ip || req.ip;
  return {
    props: { userQuery: userQuery ? JSON.parse(userQuery) : userQuery, ip },
  };
}

const VehicleStatus = (props) => {
  const { width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    data: [],
    searchVStatus: "",
    vehicleStatuses: [],
    vehicleLogs: [],
    plates: [],
    warning: false,
    ip: null,
    ipblock: false,
    loading: true,
    id: null,
  });

  const getData = async () => {
    const blockeds = await axios.post(`${process.env.SERVER_IP}/getBlockedIps`);
    if (!blockeds.data.success) {
      setState((prev) => ({
        ...prev,
        ipblock: true,
        ip: blockeds.data.ip,
        loading: false,
        warning: false,
      }));
    } else {
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/getVehicle`,
        {
          id: props.userQuery.id,
          uuId: props.userQuery.uuId,
          opId: props.userQuery.opId,
        }
      );
      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          ...response.data.data,
          loading: false,
        }));
      } else {
        await axios.post(`${process.env.SERVER_IP}/api/blockIp`);
        setState((prev) => ({ ...prev, loading: false, warning: true }));
      }
    }
  };

  useEffect(() => {
    getData();
    console.log("vehiclestatus mounted");
    return () => {
      console.log("vehiclestatus unmounted");
    };
  }, []);

  return state.loading ? (
    <Loading />
  ) : state.warning ? (
    <div
      style={{ textAlign: "center", alignItems: "center", marginTop: "50px" }}
    >
      <h1>{t("warning")}</h1>
    </div>
  ) : state.ipblock ? (
    <div style={{ textAlign: "center", alignItems: "center" }}>
      <h1>{t("accessdenied")} </h1>
      <h1>IP : {state.ip} </h1>
      <h4>{t("contactforblock")}</h4>
    </div>
  ) : (
    <Grid p={50}>
      <Grid.Col align="center">
        <Image
          alt="logo"
          src="/images/Cakir-lojistik-crop.png"
          h={width < 775 ? 250 : 140}
          w="auto"
        />
      </Grid.Col>
      <Grid.Col>
        <Vehicle
          customer={true}
          data={state.data}
          state={state}
          setState={setState}
          userAgent={props.userAgent}
        />
      </Grid.Col>
    </Grid>
  );
};

export default VehicleStatus;
