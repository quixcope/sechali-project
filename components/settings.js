import { useEffect, useState } from "react";
import axios from "axios";
import {
  Text,
  Grid,
  Button,
  TextInput,
  PasswordInput,
  Checkbox,
  NumberInput,
  Group,
  Radio,
  ColorSwatch,
  Modal,
  ScrollArea,
  ColorPicker,
  Select,
  Table,
  Flex,
  SimpleGrid,
  Tabs,
  Paper,
  Textarea,
} from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import Icons from "../helpers/icon.js";
import { notifications } from "@mantine/notifications";
import Loading from "./global/loading.js";
import { modalStyle } from "../helpers/functions";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";

const Settings = (props) => {
  const { width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    users: [],
    allUsers: [],
    selectedUser: null,
    email: {
      IMAP_USERNAME: "",
      IMAP_PASSWORD: "",
      IMAP_SERVERNAME: "",
      IMAP_SERVERPORT: "",
      IMAP_SMTPPORT: "",
      IMAP_SERVERSECURE: false,
      IMAP_SERVERTLS: false,
      SIGNATURE: "",
    },
    colorModal: false,
    colors: { duringoperation: "", completedoperation: "", notstartedyet: "" },
    statusName: "",
    color: "",
    ips: [],
    intRefKey: props.general.EMAIL.intRefKey || "ÇKR",
    domRefKey: props.general.EMAIL.domRefKey || "LJSY",
    intRefCode: props.general.EMAIL.intRefCode || "20240000000",
    domRefCode: props.general.EMAIL.domRefCode || "20240000000",
    vat: props.general.EMAIL.vat || process.env.CURRENT_VAT,
  });

  const form = useForm({
    initialValues: {
      id: null,
      name: "",
      email: "",
      phone: "",
      password: "",
      type: null,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("invalidemail")),
      name: (value) => (value === "" ? t("required") : null),
      phone: (value) =>
        value === "" || value.length < 10 || value.length > 13
          ? t("invalidphone")
          : null,
      password: (value) => (value.length < 8 ? t("invalidpassword") : null),
      type: (value) => (value === "" ? t("required") : null),
    },
  });

  const saveEmailSettings = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/saveEmailSettings`,
      state.email
    );
    if (response.data.success) {
      props.getData();
      notifications.show({
        title: t("success"),
        message: t("successmailsave"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      notifications.show({
        title: t("error"),
        message: t("errormailsave"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const getUsers = async () => {
    let temp = {};
    if (props.userAgent.type === "Super" || props.userAgent.type === "Admin") {
      const blockeds = await axios.post(
        `${process.env.SERVER_IP}/api/blockedIps`
      );
      if (blockeds.data.success) {
        temp = blockeds.data.data;
      }
    }
    const response = await axios.post(`${process.env.SERVER_IP}/api/getUsers`);
    if (response.data.success) {
      temp = {
        ...temp,
        users: response.data.selectData,
        allUsers: response.data.users,
      };
    }
    setState((prev) => ({
      ...prev,
      ...temp,
      loading: false,
      email: props.email,
      colors: props.colorSettings,
    }));
  };

  const setKeys = async () => {
    if (state.intRefKey.length > 5) {
      notifications.show({
        title: t("error"),
        message: t("referancekeyerror"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    if (state.domRefKey.length > 5) {
      notifications.show({
        title: t("error"),
        message: t("referancekeyerror"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    if (`${state.intRefCode}`.length !== 11) {
      notifications.show({
        title: t("error"),
        message: t("referancecodeerror"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    if (`${state.domRefCode}`.length !== 11) {
      notifications.show({
        title: t("error"),
        message: t("referancecodeerror"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    if (state.vat && state.vat > 100) {
      notifications.show({
        title: t("error"),
        message: t("wrongvatvalue"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/setRefKey`,
      {
        intRefKey: state.intRefKey,
        domRefKey: state.domRefKey,
        intRefCode: state.intRefCode,
        domRefCode: state.domRefCode,
        vat: state.vat,
      }
    );
    if (response.data.success) {
      props.getData();
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
        message: t(`${response.data.msg}`),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const deleteIp = async (id, ip, type) => {
    const response = await axios.post(`${process.env.SERVER_IP}/api/deleteIp`, {
      id,
      ip,
      type,
    });
    if (response.data.success) {
      getUsers();
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
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const getOneUserInfo = async (e) => {
    if (e) {
      const find = state.allUsers.find((x) => x.id == e);
      if (find) {
        let temp = {
          id: find.id,
          name: find.name,
          email: find.email,
          phone: find.phone,
          password: find.password,
          type: find.type,
        };
        form.setValues(temp);
      }
    } else {
      form.reset();
    }
    setState((prev) => ({ ...prev, selectedUser: e }));
  };

  const createUser = async (values) => {
    if (props.userAgent.type !== "Admin" && values.type === "Admin") {
      notifications.show({
        title: t("error"),
        message: t("noauthorized"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    values = { ...values, edit: state.selectedUser ? true : false };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createUser`,
      values
    );
    if (response.data.success) {
      getUsers();
      getOneUserInfo(null);
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      notifications.show({
        title: t("error"),
        message: t(`${response.data.msg}`),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const pType = (value) => {
    props.changeProjectType(
      value === "domestic" ? "international" : "domestic"
    );
  };

  const setColor = async (color, value) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/saveColorSettings`,
      { value, color }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        colorModal: false,
        colors: { ...prev.colors, [value]: color },
      }));
      props.getData();
      notifications.show({
        title: t("success"),
        message: t("successcolorsettings"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      notifications.show({
        title: t("error"),
        message: t("errorcolorsave"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  const populateIps = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.ips));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`ips${i}`}>
          <Table.Td>{data[i].ip || "-"}</Table.Td>
          <Table.Td align="center">
            <Button
              className="buttons"
              onClick={() => deleteIp(data[i].id, data[i].ip, "ip")}
            >
              {t("remove")}
            </Button>
          </Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  const populateBlockedUsers = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.blockedUsers));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`user${i}`}>
          <Table.Td>{data[i].email || "-"}</Table.Td>
          <Table.Td align="center">
            <Button
              className="buttons"
              onClick={() => deleteIp(data[i].id, data[i].email, "user")}
            >
              {t("remove")}
            </Button>
          </Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  useEffect(() => {
    getUsers();
    console.log("settings mounted");
    return () => {
      console.log("settings unmounted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Paper
        shadow="xs"
        p="xl"
        h={width > 575 ? 850 : "100%"}
        maw={750}
        mx="auto"
        my={100}
        className="settings-container"
      >
        <Tabs color="yellow" defaultValue="emailSettings">
          <Tabs.List>
            <Tabs.Tab
              style={{ fontWeight: "bolder" }}
              value="emailSettings"
              leftSection={<Icons name="MdMarkEmailRead" />}
            >
              {t("emailsettings")}
            </Tabs.Tab>
            <Tabs.Tab
              style={{ fontWeight: "bolder" }}
              value="projectSettings"
              leftSection={<Icons name="CiSettings" />}
            >
              {t("projectsettings")}
            </Tabs.Tab>
            <Tabs.Tab
              style={{ fontWeight: "bolder" }}
              value="userRegistration"
              leftSection={<Icons name="FaUserPlus" />}
            >
              {t("userregistration")}
            </Tabs.Tab>
            <Tabs.Tab
              style={{ fontWeight: "bolder" }}
              value="blockedIps"
              leftSection={<Icons name="ImBlocked" />}
            >
              {t("blockedips")}
            </Tabs.Tab>
            <Tabs.Tab
              style={{ fontWeight: "bolder" }}
              value="blockedUsers"
              leftSection={<Icons name="ImBlocked" />}
            >
              {t("blockedusers")}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="emailSettings">
            <SimpleGrid w="100%" m="auto" cols={1} mt={35} gap={15}>
              <TextInput
                w="100%"
                label={t("emailusername")}
                value={state.email?.IMAP_USERNAME || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, IMAP_USERNAME: e.target.value },
                  }))
                }
              />
              <PasswordInput
                w="100%"
                label={t("emailpassword")}
                value={state.email?.IMAP_PASSWORD || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, IMAP_PASSWORD: e.target.value },
                  }))
                }
              />
              <TextInput
                w="100%"
                label={t("emailservername")}
                value={state.email?.IMAP_SERVERNAME || ""}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, IMAP_SERVERNAME: e.target.value },
                  }))
                }
              />
              <NumberInput
                w="100%"
                label={t("emailserverport")}
                value={state.email?.IMAP_SERVERPORT}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, IMAP_SERVERPORT: e },
                  }))
                }
              />
              <NumberInput
                w="100%"
                label={t("emailsmtpport")}
                value={state.email?.IMAP_SMTPPORT}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, IMAP_SMTPPORT: e },
                  }))
                }
              />
              <Textarea
                w="100%"
                label={t("emailsignature")}
                value={state.email?.SIGNATURE || ""}
                minRows={5}
                maxRows={6}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    email: { ...prev.email, SIGNATURE: e.target.value },
                  }))
                }
              />
              <Flex
                align="center"
                justify="center"
                direction="row"
                gap={10}
                w="100%"
                mt={10}
              >
                <Checkbox
                  color="dark"
                  style={{ marginTop: 8 }}
                  label={t("servertls")}
                  checked={state.email?.IMAP_SERVERTLS || false}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        IMAP_SERVERTLS: e.target.checked,
                      },
                    }))
                  }
                />
                <Checkbox
                  color="dark"
                  style={{ marginTop: 8 }}
                  label={t("serversecure")}
                  checked={state.email?.IMAP_SERVERSECURE || false}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      email: {
                        ...prev.email,
                        IMAP_SERVERSECURE: e.target.checked,
                      },
                    }))
                  }
                />
              </Flex>
              <Flex align="center" justify="center" direction="row" w="100%">
                <Button
                  mt={24}
                  className="buttons"
                  onClick={() => saveEmailSettings()}
                >
                  {t("saveemailsettings")}
                </Button>
              </Flex>
            </SimpleGrid>
          </Tabs.Panel>
          <Tabs.Panel value="projectSettings">
            <Flex
              mt={35}
              w="100%"
              justify="center"
              align="center"
              direction="column"
              gap={50}
            >
              <Radio.Group
                w="100%"
                className="settingsRadioContainer"
                label={
                  <h4
                    style={{
                      textAlign: "left",
                      width: "100%",
                      color: "#FAB004",
                    }}
                  >
                    {t("chooseprojecttype")}
                  </h4>
                }
                defaultValue={props.type}
                onChange={(e) => pType(e)}
              >
                <Group>
                  <Radio
                    color="#4c5056"
                    label={t("domestic")}
                    value="domestic"
                  />
                  <Radio
                    color="#4c5056"
                    label={t("international")}
                    value="international"
                  />
                </Group>
              </Radio.Group>
              <Flex gap={5} align="flex-start" direction="column" w="100%">
                <h4
                  style={{
                    textAlign: "left",
                    width: "100%",
                    color: "#FAB004",
                    borderBottom: "1px solid #FAD105",
                  }}
                >
                  {t("tablebackgroundsettings")}
                </h4>
                <Flex
                  align="flex-start"
                  direction={{
                    base: "column",
                    xs: "row",
                    sm: "row",
                    md: "row",
                    lg: "row",
                    xl: "row",
                  }}
                  justify="space-between"
                  w="100%"
                  gap={10}
                >
                  <Flex direction="row" align="flex-start" gap={3}>
                    <ColorSwatch
                      style={{ cursor: "pointer" }}
                      color={state.colors?.duringoperation || "#fad105"}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          statusName: "duringoperation",
                          colorModal: true,
                          color: state.colors?.duringoperation || "#fad105",
                        }))
                      }
                    />
                    <Text>{t("duringoperation")}</Text>
                  </Flex>
                  <Flex align="center" direction="flex-start" gap={3}>
                    <ColorSwatch
                      style={{ cursor: "pointer" }}
                      color={state.colors?.completedoperation || "#c0c5ce"}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          statusName: "completedoperation",
                          colorModal: true,
                          color: state.colors?.completedoperation || "#c0c5ce",
                        }))
                      }
                    />
                    <Text>{t("completedoperation")}</Text>
                  </Flex>
                  <Flex align="center" direction="flex-start" gap={3}>
                    <ColorSwatch
                      style={{ cursor: "pointer" }}
                      color={state.colors?.notstartedyet || "#68946c"}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          statusName: "notstartedyet",
                          colorModal: true,
                          color: state.colors?.notstartedyet || "#68946c",
                        }))
                      }
                    />
                    <Text>{t("notstartedyet")}</Text>
                  </Flex>
                </Flex>
              </Flex>
              <Flex gap={5} align="flex-start" direction="column" w="100%">
                <h4
                  style={{
                    textAlign: "left",
                    width: "100%",
                    color: "#FAB004",
                    borderBottom: "1px solid #FAD105",
                  }}
                >
                  {t("keys")}
                </h4>
                <Flex
                  align="flex-start"
                  direction={{
                    base: "column",
                    xs: "row",
                    sm: "row",
                    md: "row",
                    lg: "row",
                    xl: "row",
                  }}
                  w="100%"
                  gap={20}
                >
                  <TextInput
                    label={`${t("referancekey")} (${t("international")})`}
                    value={state.intRefKey}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        intRefKey: e.target.value.replace(/\s/g, ""),
                      }))
                    }
                  />
                  <NumberInput
                    label={`${t("referancecode")} (${t("international")})`}
                    value={state.intRefCode}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, intRefCode: e }))
                    }
                  />
                  <TextInput
                    label={`${t("referancekey")} (${t("domestic")})`}
                    value={state.domRefKey}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        domRefKey: e.target.value.replace(/\s/g, ""),
                      }))
                    }
                  />
                  <NumberInput
                    label={`${t("referancecode")} (${t("domestic")})`}
                    value={state.domRefCode}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, domRefCode: e }))
                    }
                  />
                </Flex>
              </Flex>
              <Flex gap={5} align="flex-start" direction="column" w="100%">
                <h4
                  style={{
                    textAlign: "left",
                    width: "100%",
                    color: "#FAB004",
                    borderBottom: "1px solid #FAD105",
                  }}
                >
                  {t("currentvatrate")}
                </h4>
                <Flex
                  align="flex-start"
                  direction={{
                    base: "column",
                    xs: "row",
                    sm: "row",
                    md: "row",
                    lg: "row",
                    xl: "row",
                  }}
                  w="100%"
                  gap={20}
                >
                  <NumberInput
                    label={t("vat")}
                    value={state.vat}
                    rightSection="%"
                    onChange={(e) => setState((prev) => ({ ...prev, vat: e }))}
                  />
                </Flex>
              </Flex>
              <Flex gap={5} align="flex-start" direction="column" w="100%">
                <h4
                  style={{
                    textAlign: "left",
                    width: "100%",
                    color: "#FAB004",
                    borderBottom: "1px solid #FAD105",
                  }}
                >
                  {t("other")}
                </h4>
                <SimpleGrid
                  cols={{ base: 2, xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}
                >
                  <Button
                    className="buttons"
                    leftSection={<Icons name="IoLanguageOutline" />}
                    onClick={() => props.changeLanguage("settings")}
                  >
                    {t("changelanguage")}
                  </Button>
                  <Button
                    disabled
                    maw={165}
                    className="buttons"
                    leftSection={<Icons name="CgDanger" />}
                    onClick={() => props.changeLanguage("settings")}
                  >
                    {t("notready")}
                  </Button>
                  <Button
                    disabled
                    maw={165}
                    className="buttons"
                    leftSection={<Icons name="CgDanger" />}
                    onClick={() => props.changeLanguage("settings")}
                  >
                    {t("notready")}
                  </Button>
                </SimpleGrid>
                <Flex align="center" justify="center" w="100%" m={20}>
                  <Button className="buttons" onClick={() => setKeys()}>
                    {t("save")}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel value="userRegistration">
            {props.userAgent.type === "Super" ||
            props.userAgent.type === "Admin" ? (
              <form onSubmit={form.onSubmit((values) => createUser(values))}>
                <SimpleGrid mt={35} gap={15} w="100%" cols={1}>
                  <Select
                    w="100%"
                    label={t("users")}
                    data={state.users}
                    onChange={(e) => getOneUserInfo(e)}
                    clearable
                    value={state.selectedUser}
                  />
                  <TextInput
                    w="100%"
                    label={t("name")}
                    {...form.getInputProps("name")}
                  />
                  <TextInput
                    w="100%"
                    label={t("email")}
                    {...form.getInputProps("email")}
                  />
                  <TextInput
                    w="100%"
                    type="number"
                    label={t("phone")}
                    {...form.getInputProps("phone")}
                  />
                  <PasswordInput
                    w="100%"
                    label={t("password")}
                    {...form.getInputProps("password")}
                  />
                  <Select
                    w="100%"
                    label={t("usertype")}
                    data={["User", "Super", "Admin"]}
                    {...form.getInputProps("type")}
                  />
                </SimpleGrid>
                <Flex align="center" justify="center" w="100%" m={20}>
                  <Button className="buttons" type="submit">
                    {t(state.selectedUser ? "update" : "save")}
                  </Button>
                </Flex>
              </form>
            ) : null}
          </Tabs.Panel>
          <Tabs.Panel value="blockedIps">
            <ScrollArea h={650} scrollbarSize={5}>
              <Table
                withTableBorder
                withRowBorders
                highlightOnHover
                highlightOnHoverColor="#e4e4e4"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>IP</Table.Th>
                    <Table.Th align="center" ta="center">
                      {t("remove")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{populateIps()}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>
          <Tabs.Panel value="blockedUsers">
            <ScrollArea h={650} scrollbarSize={5}>
              <Table
                withTableBorder
                withRowBorders
                highlightOnHover
                highlightOnHoverColor="#e4e4e4"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>E-mail</Table.Th>
                    <Table.Th align="center" ta="center">
                      {t("remove")}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{populateBlockedUsers()}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      <Modal
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        title={t(`${state.statusName}`)}
        opened={state.colorModal}
        onClose={() =>
          setState((prev) => ({ ...prev, statusName: "", colorModal: false }))
        }
      >
        <Grid>
          <Grid.Col
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ColorPicker
              pt={10}
              format="rgba"
              value={state.color}
              onChange={(e) => setState((prev) => ({ ...prev, color: e }))}
            />
          </Grid.Col>
          <Grid.Col>
            <Button
              className="buttons"
              onClick={() => setColor(state.color, state.statusName)}
            >
              {t("change")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
};

export default Settings;
