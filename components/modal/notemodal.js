import { useEffect, useState } from "react";
import {
  Grid,
  TextInput,
  Button,
  MultiSelect,
  Textarea,
  Modal,
  ScrollArea,
} from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import { notifications } from "@mantine/notifications";
import Icons from "../../helpers/icon";
import axios from "axios";
import { modalStyle } from "../../helpers/functions";

const NoteModal = ({ setState, data, getData, opened, onClose }) => {
  const { t } = useTranslation("common");
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  const getUsers = async () => {
    const getUsers = await axios.post(`${process.env.SERVER_IP}/api/getUsers`);
    if (getUsers.data.success) {
      setUsers(getUsers.data.selectData);
    }
  };

  const updateNote = async (values) => {
    if (!values.title) {
      notifications.show({
        title: t("error"),
        message: t("requiredtitle"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    if (!values.userIds || values.userIds.length < 1) {
      notifications.show({
        title: t("error"),
        message: t("requiredarea"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    if (!values.userIds.map((x) => Number(x)).includes(data.creator)) {
      notifications.show({
        title: t("error"),
        message: t("toable"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createGeneralNot`,
      {
        ...values,
        edit: data.edit,
        creatorId: data.creator,
        type: data.type,
        card: true,
        opId: data.opId,
        referanceCode: data.referanceCode,
      }
    );
    if (response.data.success) {
      getData({});
      setState((prev) => ({ ...prev, noteModal: false, selectNote: [] }));
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
  };

  useEffect(() => {
    getUsers();
    console.log("notemodal mounted");
    return () => {
      console.log("notemodal unmounted");
    };
  }, []);

  return (
    <Modal
      {...modalStyle}
      scrollAreaComponent={ScrollArea.Autosize}
      closeOnClickOutside={false}
      opened={opened}
      onClose={onClose}
    >
      <Grid>
        <Grid.Col>
          <TextInput
            label={t("title")}
            value={data.selectNote.title || ""}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                selectNote: { ...prev.selectNote, title: e.target.value },
              }))
            }
          />
        </Grid.Col>
        <Grid.Col>
          <Textarea
            label={t("description")}
            autosize
            minRows={10}
            value={data.selectNote.description}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                selectNote: {
                  ...prev.selectNote,
                  description: e.target.value,
                },
              }))
            }
          />
        </Grid.Col>
        <Grid.Col>
          <MultiSelect
            searchable
            searchValue={searchUser.toLocaleUpperCase("tr-TR")}
            onSearchChange={(e) => setSearchUser(e)}
            label={t("users")}
            data={users}
            value={(data.selectNote.userIds ?? []).map(String)}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                selectNote: { ...prev.selectNote, userIds: e },
              }))
            }
          />
        </Grid.Col>
        <Grid.Col>
          <Button
            className="buttons"
            onClick={() => updateNote(data.selectNote)}
          >
            {data.edit ? t("update") : t("save")}
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default NoteModal;
