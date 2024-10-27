import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useTranslation from "next-translate/useTranslation";
import {
  Modal,
  Table,
  Grid,
  ScrollArea,
  Button,
  TextInput,
  Text,
  Select,
  Pagination,
  ActionIcon,
  Flex,
} from "@mantine/core";
import Icons from "../helpers/icon";
import { DateTime } from "luxon";
import useContextMenu from "./contextmenu.js";
import { notifications } from "@mantine/notifications";
import CustomRichText from "./global/customrichtext";
import Loading from "./global/loading";
import { useViewportSize } from "@mantine/hooks";
import { modalStyle } from "../helpers/functions";
import Info from "./infopopup";

const Home = (props) => {
  const { width, height } = useViewportSize();
  const clickRef = useRef({ left: 0, top: 0 });
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: false,
    selectLang: false,
    mails: [],
    page: 1,
    perPage: "10",
    totalRows: 0,
    selected: null,
    show: false,
    uid: null,
    open: false,
    showModal: false,
    forward: false,
    reply: false,
    from: "",
    html: "",
    subject: "",
    to: "",
    cc: "",
    bcc: "",
    operations: false,
    opData: [],
    attachments: [],
    getmails: false,
    warnModal: false,
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
    mailBox: "INBOX",
  });

  const getData = async ({
    page = state.page,
    perPage = state.perPage,
    mailBox = state.mailBox,
  }) => {
    const data = { page: page, perPage: perPage, mailBox };
    setState((prev) => ({ ...prev, ...data, loading: true }));
    const mails = await axios.post(
      `${process.env.SERVER_IP}/api/getMails`,
      data
    );
    let temp = {};
    if (mails.data.success) {
      temp = { ...mails.data.data };
    } else {
      temp = { getmails: true };
    }
    setState((prev) => ({
      ...prev,
      ...temp,
      loading: false,
      showModal: false,
      from: "",
      subject: "",
      to: "",
      cc: "",
      bcc: "",
    }));
  };

  const newMail = () => {
    setState((prev) => ({ ...prev, showModal: true }));
    if (props.email.SIGNATURE && props.email.SIGNATURE !== "") {
      props.emailEditor.commands.setContent(
        `<br/><div class="moz-signature">-- <br>${props.email.SIGNATURE}</div>`
      );
    }
  };

  const sendMail = async () => {
    const data = {
      from: state.from,
      message: props.emailEditor.getHTML(),
      subject: state.subject,
      to: state.to,
      cc: state.cc,
      bcc: state.bcc,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/replyMail`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, showModal: false }));
      getData({});
      notifications.show({
        title: t("success"),
        message: t("sendsuccess"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      if (response.data.data.length !== 0) {
        for (let k = 0; k < response.data.data.length; k++) {
          notifications.show({
            title: t("error"),
            message: `${response.data.data[k]} ${t("error")}`,
            color: "red",
            icon: <Icons name="FaExclamationTriangle" />,
            radius: "lg",
          });
        }
      } else {
        notifications.show({
          title: t("error"),
          message: t("senderror"),
          color: "red",
          icon: <Icons name="FaExclamationTriangle" />,
          radius: "lg",
        });
      }
    }
  };

  const deleteMail = async (uid) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/deleteMail`,
      { uid: uid, mailBox: state.mailBox }
    );
    if (response.data.success) {
      getData({});
      notifications.show({
        title: t("success"),
        message: t("deletesuccess"),
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
    setState((prev) => ({ ...prev, warnModal: false }));
  };

  const matchOperation = async ({ id }) => {
    const data = {
      id: id,
      uid: state.uid,
      content: state.subject,
      message: state.message,
      to: state.to,
      date: state.date,
      attachments: state.attachments,
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/matchOperation`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, operations: false }));
      notifications.show({
        title: t("success"),
        message: t("matchsuccesful"),
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

  const getOperations = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOperations`,
      { home: true, type: props.type }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        operations: true,
        opData: response.data.data,
      }));
    }
  };

  const populateOperations = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.opData));
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
              matchOperation({ id: data[i].id, files: state.attachments })
            }
          >
            {t("matchoperation")}
          </Button>
        </Grid.Col>
      );
    }
    return temp;
  };

  const Menu = ({ clickRef }) => {
    const { anchorPoint, show } = useContextMenu(clickRef);
    return show && state.show ? (
      <ul
        className={"menu white"}
        style={{ top: anchorPoint.y, left: anchorPoint.x }}
      >
        <li className="size-12" onClick={() => getOperations()}>
          <Icons name="AiOutlinePlusSquare" size="1.6em" />
          {t("matchoperation")}
        </li>
        <li
          className="size-12"
          onClick={() => {
            props.emailEditor.commands.setContent(`
            ${"<br/><br/><br/>"}
              ---------------------------------------------------------
              ${"<br/>"}
            On ${state.date}, ${state.to} wrote : 
            ${state.message}`);
            setState((prev) => ({
              ...prev,
              showModal: true,
              reply: true,
              subject: `Re: ${state.subject}`,
            }));
          }}
        >
          <Icons name="FaReply" size="1.6em" /> {t("reply")}
        </li>
        <li
          className="size-12"
          onClick={() => {
            props.emailEditor.commands.setContent(`
            ${"<br/><br/><br/>"}
            ---------------------------------------------------------
            ${"<br/>"}
            On ${state.date}, ${state.to} wrote : 
            ${state.message}`);
            setState((prev) => ({
              ...prev,
              showModal: true,
              to: "",
              forward: true,
              subject: `Fwd: ${state.subject}`,
            }));
          }}
        >
          <Icons name="RiShareForward2Fill" size="1.6em" /> {t("forward")}
        </li>
        <li
          className="size-12"
          onClick={() => setState((prev) => ({ ...prev, warnModal: true }))}
        >
          <Icons name="AiFillDelete" size="1.6em" />
          {t("deletemail")}
        </li>
      </ul>
    ) : null;
  };

  const check = async (value, index) => {
    let temp = {};
    if (!value.seen) {
      let tempState = JSON.parse(JSON.stringify(state.mails));
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/setSeenMail`,
        { uid: value.uid }
      );
      if (response.data.success) {
        tempState[index] = { ...tempState[index], seen: true };
        temp = { mails: tempState };
      }
    }
    temp = {
      ...temp,
      selected: { ...value, html: `${value.html?.split("</html>")[0]}</html>` },
    };
    setState((prev) => ({ ...prev, ...temp, show: false }));
  };

  const populateMails = () => {
    let temp = [];
    for (let i = 0; i < state.mails.length; i++) {
      temp.push(
        <tr
          className={`mail-tr ${
            state.selected && state.selected.uid === state.mails[i].uid
              ? "select-blue"
              : "unSelect-light"
          } ${state.show && state.uid === state.mails[i].uid ? "show-menu" : ""}`}
          style={{
            backgroundColor: `${
              state.selected && state.selected.uid === state.mails[i].uid
                ? "white"
                : !state.mails[i].seen
                  ? "#f4f4f4"
                  : "white"
            }`,
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            setState((prev) => ({
              ...prev,
              uid: state.mails[i].uid,
              to: state.mails[i].from,
              date: state.mails[i].date
                ? DateTime.fromISO(state.mails[i].date).toFormat("ff")
                : null,
              show: true,
              subject: state.mails[i].subject,
              message: state.mails[i].html,
              attachments: state.mails[i].attachments,
              cc: state.mails[i].cc,
              bcc: state.mails[i].bcc,
            }));
          }}
          onClick={() => check(state.mails[i], i)}
          key={i}
        >
          <td style={{ color: props.color }}>
            {state.mails[i].attachments.length !== 0 && (
              <Icons name="ImAttachment" />
            )}
          </td>
          <td style={{ color: props.color }}>
            {
              <strong
                style={{ marginRight: 10, fontSize: 18, color: props.color }}
              >
                ::
              </strong>
            }
            {state.mails[i].subject}
          </td>
          <td style={{ color: props.color }}>{state.mails[i].from}</td>
          <td style={{ color: props.color }}>
            {DateTime.fromISO(state.mails[i].date).toFormat("dd/MM/yyyy")}
          </td>
        </tr>
      );
    }
    return temp;
  };

  const downloadAttachments = async () => {
    for (let i = 0; i < state.selected.attachments.length; i++) {
      const selected = state.selected.attachments[i];
      const data = {
        uid: state.selected.uid,
        partId: selected.partId,
        filename: selected.filename,
      };
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/downloadAttachments`,
        data,
        { responseType: "blob" }
      );
      if (response.status == 200) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${selected.filename}`);
        document.body.appendChild(link);
        link.click();
      } else {
        notifications.show({
          title: t("error"),
          message: `${t("error")}:\n${selected.filename}`,
          color: "red",
          icon: <Icons name="FaExclamationTriangle" />,
          radius: "lg",
        });
      }
    }
  };

  useEffect(() => {
    console.log("home mounted");
    getData({});
    return () => {
      console.log("home unmounted");
    };
  }, [props.type]);

  return (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <Flex
        m={8}
        pt={34}
        align="center"
        justify="flex-start"
        gap={8}
        direction="row"
      >
        <Button size="xs" className="buttons" onClick={() => getData({})}>
          {t("getmails")}
        </Button>
        <Select
          size="xs"
          data={[
            { label: t("inbox"), value: "INBOX" },
            { label: t("sent"), value: "Sent" },
            { label: t("draft"), value: "Drafts" },
            { label: "Spam", value: "spam" },
            { label: t("trash"), value: "Trash" },
          ]}
          value={state.mailBox}
          onChange={(e) => getData({ page: 1, mailBox: e })}
        />
        <Button size="xs" className="buttons" onClick={() => newMail({})}>
          {t("newmail")}
        </Button>
      </Flex>
      <div style={{ width: "100%" }} ref={clickRef}>
        {state.show && <Menu clickRef={clickRef} />}
        <Modal
          height="auto"
          size="100%"
          closeOnClickOutside={false}
          opened={state.showModal}
          onClose={() =>
            setState((prev) => ({
              ...prev,
              showModal: false,
              reply: false,
              subject: "",
              forward: false,
              from: "",
              to: "",
              cc: "",
              bcc: "",
            }))
          }
        >
          <Grid align="center">
            <Grid.Col lg={2} md={3} sm={12}>
              <Button className="buttons" onClick={() => sendMail()}>
                {t("send")}
              </Button>
            </Grid.Col>
            <Grid.Col>
              <TextInput
                value={state.subject}
                icon={<Icons name="MdSubject" />}
                placeholder={t("subject")}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </Grid.Col>
            <Grid.Col>
              <TextInput
                value={state.to}
                icon={<Icons name="BiMailSend" />}
                placeholder={`to: ${t("emailaddresses")}`}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </Grid.Col>
            <Grid.Col lg={6} md={6} sm={12}>
              <TextInput
                value={state.cc}
                icon={<Icons name="BiMailSend" />}
                placeholder="cc: example@example.com"
                onChange={(e) =>
                  setState((prev) => ({ ...prev, cc: e.target.value }))
                }
              />
            </Grid.Col>
            <Grid.Col value={state.bcc} lg={6} md={6} sm={12}>
              <TextInput
                icon={<Icons name="BiMailSend" />}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, bcc: e.target.value }))
                }
                placeholder="bcc: example@example.com"
              />
            </Grid.Col>
            <Grid.Col>
              <CustomRichText editor={props.emailEditor} />
            </Grid.Col>
          </Grid>
        </Modal>
        {state.loading ? (
          <Loading />
        ) : props.email?.IMAP_USERNAME === "" ||
          props.email?.IMAP_PASSWORD === "" ||
          props.email?.IMAP_SERVERNAME === "" ||
          typeof props.email?.IMAP_SERVERPORT === "undefined" ? (
          <div className="mail-div">
            <Text className="mail-text">{t("viewemails")}</Text>
          </div>
        ) : state.getmails ? (
          <div className="mail-div">
            <Text className="mail-text">{t("getmailserror")}</Text>
          </div>
        ) : (
          <>
            <div style={{ margin: 8, paddingTop: 34 }}>
              <ScrollArea
                scrollbarSize={5}
                style={{
                  height: height / 2 - 140,
                  marginBottom: 20,
                }}
              >
                <Table
                  className="email-table"
                  style={{ height: "fit-content", marginTop: 10 }}
                >
                  <thead style={{ backgroundColor: "white" }}>
                    <tr>
                      <th>
                        <Icons name="ImAttachment" />
                      </th>
                      <th style={{ fontSize: 14 }}>{t("subject")}</th>
                      <th style={{ fontSize: 14 }}>{t("sentby")}</th>
                      <th style={{ fontSize: 14 }}>{t("date")}</th>
                    </tr>
                  </thead>
                  <tbody>{populateMails()}</tbody>
                </Table>
              </ScrollArea>
              <Flex
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
                gap={20}
              >
                <Flex direction="row" justify="center" align="center" gap={20}>
                  {t("total")} : {state.totalRows}
                  {width > 768 ? (
                    ""
                  ) : (
                    <Select
                      mt={10}
                      maw={80}
                      onChange={(e) => getData({ page: 1, perPage: e })}
                      data={["10", "20", "30", "50", "100"]}
                      value={state.perPage}
                      style={{ marginBottom: 10, marginRight: 10 }}
                    />
                  )}
                </Flex>
                <Flex direction="row" justify="center" align="center" gap={20}>
                  {width < 768 ? (
                    ""
                  ) : (
                    <Select
                      mt={10}
                      maw={80}
                      onChange={(e) => getData({ page: 1, perPage: e })}
                      data={["10", "20", "30", "50", "100"]}
                      value={state.perPage}
                      style={{ marginBottom: 10, marginRight: 10 }}
                    />
                  )}
                  <Pagination
                    size="sm"
                    color="dark"
                    total={
                      state.totalRows % Number(state.perPage) === 0
                        ? state.totalRows / Number(state.perPage)
                        : Math.floor(state.totalRows / Number(state.perPage)) +
                          1
                    }
                    value={state.page}
                    onChange={(e) => getData({ page: e })}
                  />
                </Flex>
              </Flex>
            </div>
            {state.selected && (
              <div>
                {state.selected.attachments.length !== 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ActionIcon
                      size="lg"
                      color="teal"
                      variant="filled"
                      onClick={() => downloadAttachments()}
                    >
                      <Icons
                        size="2em"
                        color={props.color}
                        name="ImAttachment"
                      />
                    </ActionIcon>
                  </div>
                )}

                <div
                  className="mailText"
                  dangerouslySetInnerHTML={{ __html: state.selected.html }}
                ></div>
              </div>
            )}
          </>
        )}
      </div>
      <Modal
        opened={state.operations}
        onClose={() => setState((prev) => ({ ...prev, operations: false }))}
      >
        <Grid className="grid-div">{populateOperations()}</Grid>
      </Modal>
      <Modal
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={state.warnModal}
        closeOnClickOutside={false}
        onClose={() => setState((prev) => ({ ...prev, warnModal: false }))}
      >
        <Grid>
          <Grid.Col>
            <Text>{t("areusuredeleteemail")}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button className="buttons" onClick={() => deleteMail(state.uid)}>
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
      </Modal>
    </>
  );
};

export default Home;
