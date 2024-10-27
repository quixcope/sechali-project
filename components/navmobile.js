import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Button,
  AppShell,
  Burger,
  Flex,
  ActionIcon,
  Tooltip,
  Modal,
  Text,
  Grid,
} from "@mantine/core";
import Icons from "../helpers/icon";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useDisclosure } from "@mantine/hooks";
import { modalStyle } from "../helpers/functions";

const cdnLoader = ({ src }) => {
  return `${process.env.SERVER_IP}/${src}`;
};

const NavbarMobile = (props) => {
  const [exit, setExit] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    props.pageChange(props.name, props.userAgent.lang !== "en");
    console.log("nav mobile mounted");
    return () => {
      console.log("nav mobile unmounted");
    };
  }, []);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: "100%",
          breakpoint: "1600px",
          collapsed: { desktop: true, mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header
          bg="#FAD105"
          className={`${opened ? "" : "navMobileHeader "}`}
        >
          <Flex align="center" justify="space-between" mx={10}>
            <Image
              loader={cdnLoader}
              className="navbar-logo"
              width={120}
              height={60}
              src="images/logo.png"
              alt="Çakır Lojistik"
            />
            <Flex align="center" justify="center" direction="row" gap={8}>
              <Tooltip label={t("logout")} position="bottom" offset={6}>
                <ActionIcon
                  onClick={() => setExit(true)}
                  variant="transparent"
                  aria-label="logout"
                  className="navMobileButtonClose"
                >
                  <Icons color="#4c5056" size="25px" name="IoMdPower" />
                </ActionIcon>
              </Tooltip>
              <Burger
                color="#4c5056"
                opened={opened}
                onClick={toggle}
                size="sm"
              />
            </Flex>
          </Flex>
        </AppShell.Header>
        <AppShell.Navbar
          className="navMobileContainer"
          bg="#4c5056"
          py="md"
          px={4}
        >
          <Button
            maw={550}
            leftSection={<Icons name="FaHome" size={20} />}
            onClick={() => {
              props.pageChange("home");
              toggle();
            }}
            className={`navMobileButton ${props.name === "home" ? "active" : ""}`}
          >
            <p> {t("home")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="FaBookBookmark" size={20} />}
            onClick={() => {
              props.pageChange("logbook");
              toggle();
            }}
            className={`navMobileButton ${props.name === "logbook" ? "active" : ""}`}
          >
            <p> {t("logbook")}</p>
          </Button>
          {props.userAgent.type === "Admin" ? (
            <Button
              maw={550}
              leftSection={<Icons name="FaBookBookmark" size={20} />}
              onClick={() => {
                props.pageChange("paymenttrackings");
                toggle();
              }}
              className={`navMobileButton ${props.name === "paymenttrackings" ? "active" : ""}`}
            >
              <p> {t("billpayment")}</p>
            </Button>
          ) : null}
          <Button
            maw={550}
            leftSection={<Icons name="BiSolidOffer" size={20} />}
            onClick={() => {
              props.pageChange("offers");
              toggle();
            }}
            className={`navMobileButton ${props.name === "offers" ? "active" : ""}`}
          >
            <p> {t("offers")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="LiaFileInvoiceSolid" size={20} />}
            onClick={() => {
              props.pageChange("invoices");
              toggle();
            }}
            className={`navMobileButton ${props.name === "invoices" ? "active" : ""}`}
          >
            <p> {t("invoices")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="FaRegNoteSticky" size={20} />}
            onClick={() => {
              props.pageChange("generalnotes");
              toggle();
            }}
            className={`navMobileButton ${props.name === "generalnotes" ? "active" : ""}`}
          >
            <p> {t("generalnotes")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="FaTruckMoving" size={20} />}
            onClick={() => {
              props.pageChange("operation");
              toggle();
            }}
            className={`navMobileButton ${props.name === "operation" ? "active" : ""}`}
          >
            <p> {t("operations")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="FaPeopleGroup" size={20} />}
            onClick={() => {
              props.pageChange("customers");
              toggle();
            }}
            className={`navMobileButton ${props.name === "customers" ? "active" : ""}`}
          >
            <p> {t("customers")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="IoPersonSharp" size={20} />}
            onClick={() => {
              props.pageChange("suppliers");
              toggle();
            }}
            className={`navMobileButton ${props.name === "suppliers" ? "active" : ""}`}
          >
            <p> {t("suppliers")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="FaMoneyBillAlt" size={20} />}
            onClick={() => {
              props.pageChange("sheet");
              toggle();
            }}
            className={`navMobileButton ${props.name === "sheet" ? "active" : ""}`}
          >
            <p> {t("balancesheet")}</p>
          </Button>
          <Button
            maw={550}
            leftSection={<Icons name="MdOutlineSettings" size={20} />}
            onClick={() => {
              props.pageChange("settings");
              toggle();
            }}
            className={`navMobileButton ${props.name === "settings" ? "active" : ""}`}
          >
            <p> {t("settings")}</p>
          </Button>
        </AppShell.Navbar>
      </AppShell>
      <Modal
        {...modalStyle}
        closeOnClickOutside={false}
        opened={exit}
        onClose={() => setExit(false)}
      >
        <Grid>
          <Grid.Col>
            <Text>{t("isexit")}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button className="buttons" onClick={() => router.push("/auth")}>
              {t("yes")}
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button className="buttons" onClick={() => setExit(false)}>
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
};
export default NavbarMobile;
