import { useEffect, useState } from "react";
import CustomersForm from "../components/customersform";
import useTranslation from "next-translate/useTranslation";
import Loading from "../components/global/loading";
import axios from "axios";

export async function getServerSideProps({ query, req }) {
  const userQuery = JSON.stringify(query);
  const ip = req.headers["x-forwarded-for"] || req.body.ip || req.ip;
  return {
    props: { userQuery: userQuery ? JSON.parse(userQuery) : userQuery, ip },
  };
}

const CustomerInfo = (props) => {
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    warning: false,
    ip: null,
    ipblock: false,
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
        `${process.env.SERVER_IP}/api/checkForm`,
        { uuId: props.userQuery.uuId, id: props.userQuery.id }
      );
      if (response.data.success) {
        setState((prev) => ({ ...prev, loading: false }));
      } else {
        await axios.post(`${process.env.SERVER_IP}/api/blockIp`);
        setState((prev) => ({ ...prev, loading: false, warning: true }));
      }
    }
  };

  useEffect(() => {
    getData();
    console.log("customerformpage mounted");
    return () => {
      console.log("customerformpage unmounted");
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
    <div className="customer-form">
      <CustomersForm uuId={props.userQuery.uuId} id={props.userQuery.id} />
    </div>
  );
};

export default CustomerInfo;
