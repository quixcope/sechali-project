import { useEffect, useState } from "react";
import Offers from "../components/offers";
import Loading from "../components/global/loading";
import axios from "axios";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

export async function getServerSideProps({ query, req }) {
  const userQuery = JSON.stringify(query);
  const ip = req.headers["x-forwarded-for"] || req.body.ip || req.ip;
  return {
    props: { userQuery: userQuery ? JSON.parse(userQuery) : userQuery, ip },
  };
}

const OfferPage = (props) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [state, setState] = useState({
    loading: true,
    data: [],
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
        `${process.env.SERVER_IP}/api/checkSafeConnection`,
        { uuId: props.userQuery.uuId, fId: props.userQuery.id }
      );
      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          ...response.data.data,
        }));
      } else {
        await axios.post(`${process.env.SERVER_IP}/api/blockIp`);
        setState((prev) => ({ ...prev, loading: false, warning: true }));
      }
    }
  };

  useEffect(() => {
    getData();
    console.log("offer mounted");
    return () => {
      console.log("offer unmounted");
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
    <>
      <Offers
        data={state.data}
        customer={true}
        getData={getData}
        lang={router.locale === "tr" ? "tr" : "en"}
        type={state.data.type}
      />
    </>
  );
};

export default OfferPage;
