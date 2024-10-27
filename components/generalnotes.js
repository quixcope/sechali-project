import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Select,
  Button,
  Textarea,
  Modal,
  Table,
  Pagination,
  MultiSelect,
  ScrollArea,
  TextInput,
  Text,
  Flex,
} from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import Loading from "./global/loading";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Icons from "../helpers/icon.js";
import { DateTime } from "luxon";
import { useViewportSize } from "@mantine/hooks";
import { modalStyle } from "../helpers/functions";
import Info from "./infopopup";

const GeneralNotes = (props) => {
  const { width, height } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: false,
    modal: false,
    isEdit: false,
    page: 1,
    perPage: "20",
    totalRows: 0,
    users: [],
    data: [],
    count: 0,
    usersData: [],
    noteId: null,
    noteTitle: "",
    opModal: false,
    operations: [],
    total: 0,
    titlenames: [],
    search: "",
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
    searchUser: "",
  });

  const form = useForm({
    initialValues: { title: "", description: "", userIds: [] },
    validate: {
      userIds: (value) =>
        !value.includes(`${props.userAgent.id}`) ? t("toable") : null,
      title: (value) => (!value ? t("requiredtitle") : null),
    },
  });

  const getData = async ({
    page = state.page,
    search = state.search,
    perPage = state.perPage,
    totalRows = state.totalRows,
  }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = { page, perPage, totalRows, search, type: props.type };
    let temp = {};
    const user = await axios.post(`${process.env.SERVER_IP}/api/getUsers`);
    if (user.data.success) {
      temp = { ...data, usersData: user.data.selectData };
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getGeneralNotes`,
      data
    );
    if (response.data.success) {
      temp = { ...temp, ...response.data.data };
    }
    setState((prev) => ({ ...prev, ...temp, loading: false }));
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      edit: state.isEdit,
      creatorId: props.userAgent.id,
      type: props.type,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createGeneralNot`,
      data
    );
    if (response.data.success) {
      form.reset();
      setState((prev) => ({ ...prev, modal: false, isEdit: false }));
      getData({});
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

  const getOperations = async (id, title) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOperations`,
      { home: true, type: props.type }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        noteId: id,
        noteTitle: title,
        opModal: true,
        operations: response.data.data,
      }));
    }
  };

  const matchOperation = async (id, opId, title) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/matchNoteOperation`,
      { id, opId, title }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        noteId: null,
        opModal: false,
        noteTitle: "",
      }));
      getData({});
      notifications.show({
        title: t(`${response.data.msg}`),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
    } else {
      notifications.show({
        title: t(`${response.data.msg}`),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const populateOperations = () => {
    let temp = [];
    const data = state.operations;
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Grid.Col
          key={`operations${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {`${state[data[i].type]}${data[i].Freight.referanceCode}`}
          <Button
            className="buttons"
            onClick={() =>
              matchOperation(state.noteId, data[i].id, state.noteTitle)
            }
          >
            {t("matchoperation")}
          </Button>
        </Grid.Col>
      );
    }
    return temp;
  };

  const setRows = (rows) => {
    form.setValues(rows);
    setState((prev) => ({ ...prev, modal: true, isEdit: true }));
  };

  const populateNotes = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.data));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Table.Tr key={`notes${i}`}>
          <Table.Td onClick={() => setRows(data[i])}>
            {data[i].title || ""}
          </Table.Td>
          <Table.Td onClick={() => setRows(data[i])}>
            {data[i].names || ""}
          </Table.Td>
          <Table.Td onClick={() => setRows(data[i])}>
            {DateTime.fromISO(data[i].createdAt).toFormat("dd-MM-yyyy") || ""}
          </Table.Td>
          <Table.Td align="center">
            <Button
              className="buttons"
              onClick={() => getOperations(data[i].id, data[i].title)}
            >
              {t("match")}
            </Button>
          </Table.Td>
        </Table.Tr>
      );
    }
    return temp;
  };

  const deleteNote = async (id, title) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/deleteNote`,
      { id, title }
    );
    if (response.data.success) {
      getData({});
      form.reset();
      setState((prev) => ({
        ...prev,
        modal: false,
        edit: false,
        warnModal: false,
      }));
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
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
    }
  };

  const onClose = () => {
    form.reset();
    setState((prev) => ({ ...prev, modal: false, isEdit: false }));
  };

  useEffect(() => {
    getData({ search: "" });
    console.log("generalnotes mounted");
    return () => {
      console.log("generalnotes unmounted");
    };
  }, [props.type]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <Grid style={{ margin: 8, paddingTop: 34 }}>
        <Flex
          w="100%"
          mx={12}
          gap={{ base: 4, xs: 4, sm: 20, md: 20, lg: 20, xl: 20 }}
          my={20}
          direction={{
            base: "column",
            xs: "column",
            sm: "row",
            md: "row",
            lg: "row",
            xl: "row",
          }}
          align="center"
          justify="flex-end"
        >
          <Select
            w={{
              base: 350,
              xs: 350,
              sm: 450,
              md: 450,
              lg: 450,
              xl: 450,
            }}
            label={t("searchbytitle")}
            searchable
            clearable
            data={state.titlenames}
            searchValue={state.search}
            onSearchChange={(e) => setState((prev) => ({ ...prev, search: e }))}
            onChange={(e) => getData({ page: 1, search: e || "" })}
            value={state.search}
          />
          <Button
            mt={22}
            className="buttons"
            onClick={() => setState((prev) => ({ ...prev, modal: true }))}
          >
            {t("addnot")}
          </Button>
        </Flex>
        <Grid.Col>
          <ScrollArea h={height - 250} scrollbarSize={5}>
            <Table
              withColumnBorders
              withTableBorder
              withRowBorders
              highlightOnHover
              highlightOnHoverColor="#e4e4e4"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("title")}</Table.Th>
                  <Table.Th>{t("users")}</Table.Th>
                  <Table.Th>{t("date")}</Table.Th>
                  <Table.Th ta="center">{t("matchoperation")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{populateNotes()}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Grid.Col>
        <Flex
          w="100%"
          align="center"
          justify="space-between"
          direction={{
            base: "column",
            xs: "column",
            sm: "row",
            md: "row",
            lg: "row",
            xl: "row",
          }}
          m={15}
          gap={20}
        >
          <Flex direction="row" justify="center" align="center" gap={20}>
            {t("total")} : {state.count}
            {width > 768 ? (
              ""
            ) : (
              <Select
                maw={80}
                onChange={(e) => getData({ perPage: e, page: 1 })}
                data={["10", "20", "30", "50", "100"]}
                value={state.perPage}
              />
            )}
          </Flex>
          <Flex direction="row" justify="center" align="center" gap={20}>
            {width < 768 ? (
              ""
            ) : (
              <Select
                maw={80}
                onChange={(e) => getData({ perPage: e, page: 1 })}
                data={["10", "20", "30", "50", "100"]}
                value={state.perPage}
              />
            )}
            <Pagination
              color="dark"
              total={state.total}
              value={state.page}
              onChange={(e) => getData({ page: e })}
            />
          </Flex>
        </Flex>
      </Grid>
      <Modal
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        closeOnClickOutside={false}
        opened={state.modal}
        onClose={() => onClose()}
        size="sm"
      >
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Grid>
            <Grid.Col>
              <TextInput label={t("title")} {...form.getInputProps("title")} />
            </Grid.Col>
            <Grid.Col>
              <Textarea
                label={t("description")}
                autosize
                minRows={10}
                {...form.getInputProps("description")}
              />
            </Grid.Col>
            <Grid.Col>
              <MultiSelect
                searchable
                searchValue={state.searchUser.toLocaleUpperCase("tr-TR")}
                onSearchChange={(e) =>
                  setState((prev) => ({ ...prev, searchUser: e }))
                }
                label={t("users")}
                data={state.usersData}
                {...form.getInputProps("userIds")}
              />
            </Grid.Col>
            <Grid.Col
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Button className="buttons" type="submit">
                {state.isEdit ? t("update") : t("save")}
              </Button>
              {state.isEdit ? (
                <Button
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({ ...prev, warnModal: true }))
                  }
                >
                  {t("delete")}
                </Button>
              ) : null}
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
      <Modal
        className="opModal"
        {...modalStyle}
        closeOnClickOutside={false}
        opened={state.opModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            opModal: false,
            noteId: null,
            noteTitle: "",
          }))
        }
      >
        <ScrollArea style={{ marginTop: 20 }} h={450} scrollbarSize={5}>
          <Grid>{populateOperations()}</Grid>
        </ScrollArea>
      </Modal>
      <Modal
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={state.warnModal}
        closeOnClickOutside={false}
        onClose={() =>
          setState((prev) => ({ ...prev, warnModal: false, selectedFile: "" }))
        }
      >
        <ScrollArea style={{ marginTop: 20 }} h={300} scrollbarSize={5}>
          <Grid>
            <Grid.Col>
              <Text>{t("aresuredelete")}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button
                className="buttons"
                onClick={() => deleteNote(form.values.id, form.values.title)}
              >
                {t("yes")}
              </Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button
                className="buttons"
                onClick={() =>
                  setState((prev) => ({ ...prev, warnModal: false }))
                }
              >
                {t("no")}
              </Button>
            </Grid.Col>
          </Grid>
        </ScrollArea>
      </Modal>
    </>
  );
};

export default GeneralNotes;
