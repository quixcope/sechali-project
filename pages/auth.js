import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import {
  Button,
  PasswordInput,
  Grid,
  TextInput,
  NumberInput,
  Modal,
  Card,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { useForm } from "@mantine/form";
import useTranslation from "next-translate/useTranslation";
import Icons from "../helpers/icon";
import NextHead from "next/head";

const cdnLoader = ({ src }) => {
  return `${process.env.SERVER_IP}/${src}`;
};

const Auth = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [state, setState] = useState({
    authToken: null,
    open: false,
    isBlocked: false,
    ip: "",
  });

  const form = useForm({ initialValues: { email: "", password: "" } });

  const logIn = async (values) => {
    if (values.email !== "" && values.password !== "") {
      const data = await axios.post(`${process.env.SERVER_IP}/login`, values);
      if (data.data.success) {
        notifications.show({
          title: t("success"),
          color: "green",
          radius: "lg",
        });
        if (process.env.NODE_ENV === "production") {
          setState((prev) => ({ ...prev, open: true }));
        } else {
          router.push("/");
        }
      } else {
        notifications.show({
          title: t("error"),
          message: t(`${data.data.message}`),
          color: "red",
          radius: "lg",
        });
        if (data.data.message == "ipblock") {
          setState((prev) => ({
            ...prev,
            isBlocked: true,
            ip: data.data.ip,
          }));
        }
      }
    }
  };

  const verifyToken = async () => {
    const data = { ...form.values, authToken: state.authToken };
    const response = await axios.post(
      `${process.env.SERVER_IP}/verifyToken`,
      data
    );
    if (response.data.success) {
      router.push("/");
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 4000,
      });
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
        autoClose: 4000,
      });
      setState((prev) => ({ ...prev, open: false }));
    }
  };

  const ipBlockControl = async () => {
    await axios.get(`${process.env.SERVER_IP}/auth`);
    const result = await axios.post(`${process.env.SERVER_IP}/getBlockedIps`);
    if (!result.data.success) {
      setState((prev) => ({ ...prev, isBlocked: true, ip: result.data.ip }));
    }
  };

  useEffect(() => {
    ipBlockControl();
    console.log("login mounted");
    return () => {
      console.log("login unmounted");
    };
  }, []);

  return state.isBlocked ? (
    <div className="authorization-text">
      <h1>
        ERİŞİM İZNİNİZ YOKTUR! DESTEK İÇİN ALUSOFT YAZILIM EKİBİNE BAŞVURUN
      </h1>
      <h1>IP : {state.ip} </h1>
    </div>
  ) : (
    <>
      <NextHead>
        <link
          rel="manifest"
          href={`/manifest.json?language=${router.locale || "tr"}`}
        />
      </NextHead>
      <div className="container">
        <form onSubmit={form.onSubmit((values) => logIn(values))}>
          <Card
            shadow="xl"
            radius="xl"
            style={{
              backgroundColor: "#f1cf2a",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card.Section>
              <Grid
                style={{
                  padding: "8% 12% 8%",
                }}
              >
                <Grid.Col
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    loader={cdnLoader}
                    width={300}
                    height={200}
                    src="images/logo.png"
                    alt="Çakır Lojistik"
                  />
                </Grid.Col>
                <Grid.Col
                  style={{
                    marginTop: "4%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <TextInput
                    className="login_input"
                    style={{ width: "50%" }}
                    placeholder={t("email")}
                    withAsterisk
                    {...form.getInputProps("email")}
                  />
                </Grid.Col>
                <Grid.Col style={{ display: "flex", justifyContent: "center" }}>
                  <PasswordInput
                    className="login_input"
                    style={{ width: "50%", borderColor: "#393939" }}
                    withAsterisk
                    placeholder={t("password")}
                    {...form.getInputProps("password")}
                  />
                </Grid.Col>
                <Grid.Col style={{ marginTop: "4%" }}>
                  <Grid>
                    <Grid.Col
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        style={{ background: "black", width: "50%" }}
                        type="submit"
                      >
                        <Text style={{ color: "#fafafa", fontWeight: "bold" }}>
                          {t("login")}
                        </Text>
                      </Button>
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              </Grid>
            </Card.Section>
          </Card>
        </form>
        <Modal
          centered
          closeOnClickOutside={false}
          opened={state.open}
          onClose={() => setState(() => ({ open: false, authToken: "" }))}
          title={
            <strong className="size-14" style={{ textTransform: "uppercase" }}>
              {t("loginsmstitle")}
            </strong>
          }
        >
          <Grid>
            <Grid.Col
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: 10,
              }}
            >
              <NumberInput
                value={state.authToken}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, authToken: e }))
                }
              />
            </Grid.Col>
            <Grid.Col
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                style={{ backgroundColor: "black", width: "50%" }}
                onClick={() => verifyToken()}
              >
                <Text style={{ fontWeight: "bold" }}>{t("send")}</Text>
              </Button>
            </Grid.Col>
          </Grid>
        </Modal>
      </div>
    </>
  );
};

export default Auth;
