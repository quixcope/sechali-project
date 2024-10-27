import "../public/css/navbar.css";
import "../public/css/loginpage.css";
import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "dayjs/locale/tr";
import "@mantine/tiptap/styles.css";
import "../public/css/main.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "mantine-datatable/styles.css";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon";
import useTranslation from "next-translate/useTranslation";

const MyApp = ({ Component, pageProps }) => {
  const { t } = useTranslation("common");
  const [connection, setConnection] = useState(true);

  const offline = () => {
    setConnection(navigator.onLine);
    !navigator.onLine &&
      notifications.show({
        title: t("checkconnection"),
        color: "blue",
        icon: <Icons name="MdSignalWifiStatusbarConnectedNoInternet2" />,
        autoClose: false,
        withCloseButton: false,
      });
  };

  useEffect(() => {
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("offline", offline);
    };
  }, []);

  return (
    <MantineProvider>
      <Notifications
        position={connection ? "bottom-right" : "top-center"}
        className="none-print"
      />
      <Component {...pageProps} />
    </MantineProvider>
  );
};

export default MyApp;
