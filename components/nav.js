import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button, Group, Popover } from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";

const cdnLoader = ({ src }) => {
  return `${process.env.SERVER_IP}/${src}`;
};
const Navbar = (props) => {
  const router = useRouter();
  const horiRef = useRef();
  const [popover, setPopover] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (props.userAgent) {
      props.pageChange(props.name, props.userAgent.lang !== "en");
    }
    console.log("nav mounted");
    return () => {
      console.log("nav unmounted");
    };
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-custom navbar-mainbg">
        <Image
          loader={cdnLoader}
          className="navbar-logo"
          width={120}
          height={60}
          src="images/logo.png"
          alt="Çakır Lojistik"
        />

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <div className="hori-selector" id="hori-selector" ref={horiRef}>
              <div className="left"></div>
              <div className="right"></div>
            </div>
            <li
              ref={props.homeRef}
              className={`nav-item ${props.name === "home" ? "active" : ""}`}
              onClick={() => props.pageChange("home")}
            >
              <a className="nav-link">{t("home")}</a>
            </li>
            <li
              ref={props.invoOpRef}
              className={`nav-item ${props.name === "logbook" ? "active" : ""}`}
              onClick={() => props.pageChange("logbook")}
            >
              <a className="nav-link">{t("logbook")}</a>
            </li>
            {props.userAgent && props.userAgent.type === "Admin" ? (
              <li
                ref={props.paytracRef}
                className={`nav-item ${props.name === "paymenttrackings" ? "active" : ""}`}
                onClick={() => props.pageChange("paymenttrackings")}
              >
                <a className="nav-link">{t("billpayment")}</a>
              </li>
            ) : null}
            <li
              ref={props.dashRef}
              className={`nav-item ${props.name === "offers" ? "active" : ""}`}
              onClick={() => props.pageChange("offers")}
            >
              <a className="nav-link">{t("offers")}</a>
            </li>
            <li
              ref={props.invRef}
              className={`nav-item ${props.name === "invoices" ? "active" : ""}`}
              onClick={() => props.pageChange("invoices")}
            >
              <a className="nav-link">{t("invoices")}</a>
            </li>
            <li
              ref={props.notesRef}
              className={`nav-item ${props.name === "generalnotes" ? "active" : ""}`}
              onClick={() => props.pageChange("generalnotes")}
            >
              <a className="nav-link">{t("generalnotes")}</a>
            </li>
            <li
              ref={props.opRef}
              className={`nav-item ${props.name === "operation" ? "active" : ""}`}
              onClick={() => props.pageChange("operation")}
            >
              <a className="nav-link">{t("operations")}</a>
            </li>
            <li
              ref={props.customerRef}
              className={`nav-item ${
                props.name === "customers" ? "active" : ""
              }`}
              onClick={() => props.pageChange("customers")}
            >
              <a className="nav-link">{t("customers")}</a>
            </li>
            <li
              ref={props.supplRef}
              className={`nav-item ${
                props.name === "suppliers" ? "active" : ""
              }`}
              onClick={() => props.pageChange("suppliers")}
            >
              <a className="nav-link">{t("suppliers")}</a>
            </li>
            <li
              ref={props.sheetRef}
              className={`nav-item ${props.name === "sheet" ? "active" : ""}`}
              onClick={() => props.pageChange("sheet")}
            >
              <a className="nav-link">{t("balancesheet")}</a>
            </li>
            <li
              ref={props.setRef}
              className={`nav-item ${
                props.name === "settings" ? "active" : ""
              }`}
              onClick={() => props.pageChange("settings")}
            >
              <a className="nav-link">{t("settings")}</a>
            </li>
            <li className="nav-item">
              <Popover
                opened={popover}
                offset={0}
                width={200}
                position="bottom"
                withArrow
                shadow="md"
                closeOnClickOutside
              >
                <Popover.Target onClick={() => setPopover(true)}>
                  <a className="nav-link">{t("logout")}</a>
                </Popover.Target>
                <Popover.Dropdown style={{ backgroundColor: "#4c5056" }}>
                  <p
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#fad105",
                      fontSize: 14,
                    }}
                  >
                    {t("isexit")}
                  </p>
                  <Group style={{ marginTop: 8, justifyContent: "center" }}>
                    <Button
                      size="xs"
                      style={{ background: "#2c2c2c" }}
                      onClick={() => router.push("/auth")}
                    >
                      {t("exit")}
                    </Button>
                    <Button
                      size="xs"
                      style={{ background: "#2c2c2c" }}
                      onClick={() => setPopover(false)}
                    >
                      {t("cancel")}
                    </Button>
                  </Group>
                </Popover.Dropdown>
              </Popover>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
