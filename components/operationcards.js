import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Button,
  Select,
  Accordion,
  Timeline,
  Text,
  Divider,
  Modal,
  TextInput,
  ScrollArea,
  Group,
  ActionIcon,
  MultiSelect,
  Flex,
  Paper,
  ColorInput,
  Radio,
  NumberInput,
} from "@mantine/core";
import Icons from "../helpers/icon.js";
import { notifications } from "@mantine/notifications";
import useTranslation from "next-translate/useTranslation";
import { DateTime } from "luxon";
import { Dropzone } from "@mantine/dropzone";
import { logs, formatDifference } from "./../helpers/functions.js";
import { modalStyle, convertCurrency, howManyItem } from "../helpers/functions";
import { useForm } from "@mantine/form";
import Vehicle from "./global/vehicle.js";
import DocumentViewer from "./global/documentviewer.js";
import NoteModal from "./modal/notemodal.js";
import Loading from "./global/loading.js";
import ImageModal from "./modal/imgmodal.js";

const OperationCard = (props) => {
  const { t } = useTranslation("common");
  const currentTime = DateTime.now();
  const [state, setState] = useState({
    logs: [],
    loading: false,
    status: props.data.status || "",
    search: "",
    operationStatus: props.statuses || [],
    driverModal: false,
    mailsModal: false,
    selectMail: [],
    filesData: [],
    warnModal: false,
    selectedFile: "",
    userIds: props.data.userIds || [],
    selectNote: [],
    noteModal: false,
    confirmModal: false,
    edit: false,
    vehicleModal: false,
    vehicleStatuses: [],
    searchVStatus: "",
    vehicleStatus: props.data.vehicleStatus || "",
    vehicleLogs: [],
    statusId: null,
    international: props.general.EMAIL.intRefKey || "ÇKR",
    domestic: props.general.EMAIL.domRefKey || "LJSY",
    deletedIds: [],
    colour: props.data.colour || "#fad105",
    customInformation: props.data.ShipmentForm?.customInformation || "",
    documentDelivery: props.data.ShipmentForm?.documentDelivery || "",
    borderCrossing: props.data.ShipmentForm?.borderCrossing || "",
    domesticTransp: props.data.ShipmentForm?.domesticTransp || "false",
    domesticTPrice: props.data.ShipmentForm?.domesticTPrice || "",
    totalDomTPrice: props.data.ShipmentForm?.totalDomTPrice || "",
    deliveryCompany: props.data.ShipmentForm?.deliveryCompany || "",
    customsLocation: props.data.ShipmentForm?.customsLocation || "",
    ydg: props.data.ShipmentForm?.ydg || "false",
    ydgAmount: props.data.ShipmentForm?.ydgAmount || "",
    ydgCurrency: props.data.ShipmentForm?.ydgCurrency || "",
    files: [],
    vat: props.general.EMAIL.vat || process.env.CURRENT_VAT,
    plates: [],
    docModal: false,
    imgModal: false,
    deletedFinesIds: [],
    finesAttachment: false,
    carrierCompany: props.data.carrierCompany
      ? `${props.data.carrierCompany}`
      : null,
    cancel: false,
    filesIcon: "",
    emailsIcon: "",
    finesIcon: "",
    notesIcon: "",
    mailPlusIcon: false,
    finesPlusIcon: false,
    notePlusIcon: false,
    filePlusIcon: false,
  });

  const form = useForm({
    initialValues: {
      vehicles: [
        {
          driverName: "",
          driverNo: "",
          driverIdNo: "",
          frontPlate: "",
          trailerPlate: "",
          id: null,
        },
      ],
      fines: props.data.Fines || [{ finesPrice: "", currency: "" }],
    },
  });

  const addUserOperation = async (users) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/addUserOperation`,
      { users: users, id: props.data.id, opName: props.data.operationName }
    );
    if (response.data.success) {
      props.getData({});
      setState((prev) => ({ ...prev, userModal: false }));
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
    } else {
      notifications.show({
        title: t("usersalready"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const setCarrier = async (carrier) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/setCarrier`,
      { carrierCompany: carrier, id: props.data.id }
    );
    if (response.data.success) {
      props.getData({});
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
    } else {
      notifications.show({
        title: t("usersalready"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const getVehiclesInfo = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getVehiclesInfo`,
      { id: props.data.id }
    );
    if (response.data.success) {
      form.setValues((prev) => ({
        ...prev,
        vehicles: response.data.data.Vehicles,
        carrierCompany: response.data.data.carrierCompany
          ? `${response.data.data.carrierCompany}`
          : null,
      }));
    }
    setState((prev) => ({ ...prev, driverModal: true }));
  };

  const findPrice = (price) => {
    if (price) {
      const withVat = Number(price * (state.vat / 100) + price).toFixed(0);
      setState((prev) => ({
        ...prev,
        ...prev,
        domesticTPrice: price,
        totalDomTPrice: Number(withVat),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        ...prev,
        domesticTPrice: "",
        totalDomTPrice: "",
      }));
    }
  };

  const exportPdf = async () => {
    const data = {
      ...props.data,
      name: `${DateTime.fromJSDate(new Date()).toFormat("dd-MM-yyyy")}-${props.data.Freight.referanceCode}-SevkiyatFormu.pdf`,
      weightType: t(`operation:${props.data.Freight.weightType}`),
      shippingType: t(`operation:${props.data.Freight.shippingType}`),
      refCode: t("operation:referancecode"),
      carrierComp: t("operation:carriercompany"),
      agreeAmountCarrier: t("operation:agreeamountcarrier"),
      maturityCarrier: t("operation:maturitycarrier"),
      agreeAmountReceiving: t("operation:agreeamountreceiving"),
      maturitReceiving: t("operation:maturityreceiving"),
      loadingDate: t("operation:loadingdate"),
      loadingLocation: t("operation:loadinglocation"),
      loadingAddress: t("operation:loadingaddress"),
      domesticTransportation: t("operation:domestictransportation"),
      weightT: t("operation:weighttype"),
      shippingT: t("operation:shippingtype"),
      deliveryAddress: t("operation:deliveryaddress"),
      deliveryDuration: t("operation:deliveryduration"),
      vehiclePlateFront: t("operation:vehicleplatefront"),
      vehiclePlateTrailer: t("operation:vehicleplatetrailer"),
      vehicleQuantity: t("operation:vehiclequantity"),
      customInformation: t("operation:custominformation"),
      documentDelivery: t("operation:documentdelivery"),
      borderCrossing: t("operation:bordercrossing"),
      customsLocation: t("operation:customslocation"),
    };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/exportPdf`,
      data,
      { responseType: "blob" }
    );
    if (response.status == 200) {
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", data.name);
      document.body.appendChild(link);
      link.click();
    } else {
      notifications.show({
        title: "Hata",
        message: `Dosya Hatası:\n${response}`,
        color: "red",
        radius: "lg",
      });
    }
  };

  const updateFines = async (values) => {
    for (let i = 0; i < values.length; i++) {
      if (!values[i].finesPrice || !values[i].currency) {
        notifications.show({
          title: t("error"),
          message: t("requiredarea"),
          color: "red",
          radius: "lg",
          icon: <Icons name="FaExclamationTriangle" />,
        });
        return;
      }
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/updateFines`,
      {
        fines: values,
        id: props.data.id,
        deletedFinesIds: state.deletedFinesIds,
      }
    );
    if (response.data.success) {
      props.getData({});
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

  const editShipmentForm = async () => {
    if (state.domesticTransp === "true" && !state.domesticTPrice) {
      notifications.show({
        title: t("error"),
        message: t("requiredprice"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    if (state.ydg === "true" && (!state.ydgAmount || !state.ydgCurrency)) {
      notifications.show({
        title: t("error"),
        message: t("requiredydg"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
      return;
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/editShipmentForm`,
      {
        customInformation: state.customInformation,
        documentDelivery: state.documentDelivery,
        borderCrossing: state.borderCrossing,
        domesticTransp: state.domesticTransp,
        deliveryCompany: state.deliveryCompany,
        ydg: state.ydg,
        operationId: props.data.id,
        domesticTPrice:
          state.domesticTransp === "true" ? state.domesticTPrice : null,
        totalDomTPrice:
          state.domesticTransp === "true" ? state.totalDomTPrice : null,
        ydgAmount: state.ydg === "true" ? state.ydgAmount : null,
        ydgCurrency: state.ydg === "true" ? state.ydgCurrency : null,
        customsLocation: state.customsLocation,
      }
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, shipmentForm: false }));
      props.getData({});
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

  const setCardColour = async (colour, id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/setCardColour`,
      { colour, id }
    );
    if (response.data.success) {
      props.getData({});
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

  const addVehicleInfo = async (values) => {
    const data = { ...values, id: props.data.id, deletedIds: state.deletedIds };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/addVehicleInfo`,
      data
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, driverModal: false }));
      props.getData({});
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

  const getFiles = async (id, fines) => {
    setState((prev) => ({ ...prev, loading: true }));
    const files = await axios.post(
      `${process.env.SERVER_IP}/api/getOperationFiles`,
      { id: id, fines }
    );
    if (files.data.success) {
      form.reset();
      setState((prev) => ({
        ...prev,
        files: files.data.data,
        finesAttachment: fines,
        loading: false,
      }));
    }
  };

  const getVehicleStatuses = async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getVehicleStatuses`,
      { id: id }
    );
    let temp = {};
    if (response.data.success) {
      temp = { vehicleModal: true, ...response.data.data };
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
    setState((prev) => ({ ...prev, ...temp, loading: false }));
  };

  const deleteStatus = async (id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/deleteVehicleStatus`,
      { id: id }
    );
    if (response.data.success) {
      getVehicleStatuses(props.data.id);
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
      setState((prev) => ({
        ...prev,
        statusDelete: false,
        statusId: null,
      }));
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const deleteFile = async (opId, name) => {
    const delFile = await axios.post(
      `${process.env.SERVER_IP}/api/deleteOpFile`,
      { opId, fileName: name }
    );
    if (delFile.data.status) {
      notifications.show({
        title: t("success"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
      });
      let newData = [...state.filesData];
      newData = newData.filter((x) => x !== name);
      setState((prev) => ({
        ...prev,
        filesData: newData,
        warnModal: false,
        selectedFile: "",
      }));
      getFiles(props.data.id);
      props.getData({});
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const fileUpload = async (value, name, realName) => {
    if (value.length !== 0) {
      for (let k = 0; k < value.length; k++) {
        const fdata = new FormData();
        const fileName = `${value[k].name.replace(/[^\x00-\x7F]/g, "")}`;
        fdata.append("file", value[k]);
        fdata.append("filename", `${fileName}`);
        fdata.append("folder", name);
        fdata.append("opId", props.data.id);
        const response = await axios.post(
          `${process.env.SERVER_IP}/api/insertOpFiles`,
          fdata,
          { headers: { "content-type": "multipart/form-data" } }
        );
        if (response.data.status) {
          notifications.show({
            title: t("success"),
            message: t("uploadsuccess"),
            color: "green",
            icon: <Icons name="FaRegCheckCircle" />,
            radius: "lg",
          });
          setState((prev) => {
            const newData = [...prev.filesData];
            newData.push(`${realName}`);
            return { ...prev, filesData: newData };
          });
          props.getData({});
        } else {
          notifications.show({
            title: t("error"),
            message: `${t("errorupload")}:\n${response.data}`,
            color: "red",
            icon: <Icons name="FaExclamationTriangle" />,
            radius: "lg",
          });
        }
      }
    }
  };

  const downloadFile = async (name) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/downloadOpFiles`,
      {
        path: state.finesAttachment ? `${props.data.id}/fines` : props.data.id,
        fileName: name,
      },
      { responseType: "blob" }
    );
    if (response.status == 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
    }
  };

  const terminateOperation = async (id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/terminateOperation`,
      { id: id, cancel: state.cancel }
    );
    if (response.data.success) {
      props.getData({});
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
    setState((prev) => ({ ...prev, confirmModal: false, cancel: false }));
  };

  const populateFiles = () => {
    let temp = [];
    const data = state.files;
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== "fines") {
        temp.push(
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #ccc",
              padding: 4,
              marginTop: 4,
            }}
            key={`files${i}`}
          >
            {data[i]}
            <div style={{ display: "flex", gap: 4, textWrap: "nowrap" }}>
              {data[i].endsWith("png") ||
              data[i].endsWith("jpg") ||
              data[i].endsWith("jpeg") ||
              data[i].endsWith("pdf") ? (
                <ActionIcon
                  color="rgba(250, 209, 5, 1)"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const modal = data[i].endsWith("pdf")
                      ? "docModal"
                      : "imgModal";
                    setState((prev) => ({
                      ...prev,
                      selectedFile: data[i],
                      [modal]: true,
                    }));
                  }}
                >
                  <Icons name="FaEye" color="black" />
                </ActionIcon>
              ) : null}
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() => downloadFile(data[i])}
              >
                <Icons name="FaDownload" color="black" />
              </ActionIcon>
              <ActionIcon
                color="rgba(250, 209, 5, 1)"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    warnModal: true,
                    selectedFile: state.finesAttachment
                      ? `fines/${data[i]}`
                      : data[i],
                  }));
                }}
              >
                <Icons name="AiFillDelete" color="black" />
              </ActionIcon>
            </div>
          </div>
        );
      }
    }
    return temp;
  };

  const editStatus = async (values) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/editStatus`,
      values
    );
    if (response.data.success) {
      props.getData({});
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

  const populateMails = () => {
    if (props.data.Content) {
      let temp = [];
      const data = JSON.parse(JSON.stringify(props.data.Content)) || [];
      for (let i = 0; i < data.length; i++) {
        temp.push(
          <Grid.Col
            className="grid-col"
            style={{ cursor: "pointer" }}
            key={`mails${i}`}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                selectMail: data[i],
                mailsModal: true,
              }))
            }
          >
            <Text>{`${data[i].to} / ${data[i].date}`}</Text>
          </Grid.Col>
        );
      }
      return temp;
    }
  };

  const populateNotes = () => {
    if (props.data.GeneralNotes) {
      let temp = [];
      const data = JSON.parse(JSON.stringify(props.data.GeneralNotes));
      for (let i = 0; i < data.length; i++) {
        temp.push(
          <Grid.Col
            className="grid-col"
            style={{ cursor: "pointer" }}
            key={`notes${i}`}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                noteModal: true,
                selectNote: data[i],
                edit: true,
              }))
            }
          >
            <Text>{data[i].title}</Text>
          </Grid.Col>
        );
      }
      temp.push(
        <Grid.Col key={`button`}>
          <Button
            variant="transparent"
            onClick={() =>
              setState((prev) => ({ ...prev, noteModal: true, edit: false }))
            }
          >
            {t("addnot")}
          </Button>
        </Grid.Col>
      );
      return temp;
    }
  };

  const populateLogs = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(props.data.Logs)) || [];
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Timeline
          color={
            data[i].status === "finishedop" ? "green" : "rgba(250, 209, 5, 1)"
          }
          active={1}
          bulletSize={24}
          lineWidth={2}
          key={`logs${i}`}
        >
          <Timeline.Item
            style={{ marginTop: 10, marginBottom: 10 }}
            bullet={
              <Icons size={12} color="black" name={"LiaShippingFastSolid"} />
            }
            title={DateTime.fromISO(data[i].createdAt).toFormat(
              "dd-MM-yyyy HH:mm"
            )}
          >
            <Text size="sm" fw={600}>
              {logs(
                data[i].status,
                data[i].User.name,
                data[i].createdAt,
                props.userAgent.lang,
                data[i].fileName,
                data[i].users,
                data[i].type
              )}
            </Text>
            <Text size="xs" mt={4}>
              {formatDifference(
                DateTime.fromISO(data[i].createdAt)
                  .diff(currentTime, ["days", "hours", "minutes"])
                  .toObject(),
                t
              )}
            </Text>
            <Divider size="md" />
          </Timeline.Item>
        </Timeline>
      );
    }
    return temp;
  };

  const populateVehicles = () => {
    let temp = [];
    const { vehicles } = form.values;
    for (let i = 0; i < vehicles.length; i++) {
      temp.push(
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={`key${i}`}>
          <Paper shadow="xs" p="lg">
            <Flex
              align="center"
              justify="space-between"
              direction={{
                base: "column",
                xs: "column",
                sm: "column",
                md: "column",
                lg: "column",
                xl: "column",
              }}
              gap={17}
            >
              <TextInput
                label={`${t("vehicleplate")} (${t("front")})`}
                {...form.getInputProps(`vehicles.${i}.frontPlate`)}
              />
              <TextInput
                label={`${t("vehicleplate")} (${t("trailer")})`}
                {...form.getInputProps(`vehicles.${i}.trailerPlate`)}
              />
              <TextInput
                label={t("drivername")}
                {...form.getInputProps(`vehicles.${i}.driverName`)}
              />
              <TextInput
                label={t("driverno")}
                {...form.getInputProps(`vehicles.${i}.driverNo`)}
              />
              <TextInput
                label={t("driveridno")}
                {...form.getInputProps(`vehicles.${i}.driverIdNo`)}
              />
              <ActionIcon
                className="deleteIcon"
                mt={24}
                variant="transparent"
                onClick={() => {
                  form.removeListItem("vehicles", i);
                  if (vehicles[i].id) {
                    setState((prev) => ({
                      ...prev,
                      deletedIds: [...prev.deletedIds, vehicles[i].id],
                    }));
                  }
                }}
              >
                <Icons name="RxCross1" size="1rem" color="black" />
              </ActionIcon>
            </Flex>
          </Paper>
        </Grid.Col>
      );
    }
    return temp;
  };

  const populateFines = () => {
    let temp = [];
    const { fines } = form.values;
    for (let i = 0; i < fines.length; i++) {
      temp.push(
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={`key${i}`}>
          <Flex
            align="center"
            justify="space-between"
            direction={{
              base: "row",
              xs: "row",
              sm: "row",
              md: "row",
              lg: "row",
              xl: "row",
            }}
            gap={17}
          >
            <NumberInput
              label={t("price")}
              thousandSeparator
              defaultValue={0.0}
              decimalScale={2}
              {...form.getInputProps(`fines.${i}.finesPrice`)}
            />
            <Select
              label={t("currency")}
              data={[
                { label: t("eur"), value: "eur" },
                { label: t("usd"), value: "usd" },
                { label: t("gbp"), value: "gbp" },
                { label: t("try"), value: "try" },
              ]}
              {...form.getInputProps(`fines.${i}.currency`)}
            />
            <ActionIcon
              mt={24}
              variant="transparent"
              onClick={() => {
                form.removeListItem("fines", i);
                if (fines[i].id) {
                  setState((prev) => ({
                    ...prev,
                    deletedFinesIds: [...prev.deletedFinesIds, fines[i].id],
                  }));
                }
              }}
            >
              <Icons name="RxCross1" size="1rem" color="black" />
            </ActionIcon>
          </Flex>
        </Grid.Col>
      );
    }
    return temp;
  };

  const setHowManyItem = () => {
    if (props.data) {
      let result = howManyItem({
        items: [
          {
            icon: "emailsIcon",
            plusIcon: "mailPlusIcon",
            data: props.data.Mails || [],
            count: null,
          },
          {
            icon: "finesIcon",
            plusIcon: "finesPlusIcon",
            data: props.data.Fines || [],
            count: null,
          },
          {
            icon: "notesIcon",
            plusIcon: "notePlusIcon",
            data: props.data.GeneralNotes || [],
            count: null,
          },
          {
            icon: "filesIcon",
            plusIcon: "filePlusIcon",
            data: [],
            count: props.data.fileCount,
          },
        ],
      });
      setState((prev) => ({ ...prev, ...result }));
    }
  };

  useEffect(() => {
    setHowManyItem();
    console.log("cards mounted");
    return () => {
      console.log("cards unmounted");
    };
  }, [state.filesData]);

  return (
    <>
      <Accordion
        chevronPosition="left"
        w="100%"
        variant="contained"
        defaultValue="operation"
        styles={{
          item: { backgroundColor: props.data.colour || "#fad105" },
          content: { backgroundColor: props.data.colour || "#fad105" },
          control: { backgroundColor: props.data.colour || "#fad105" },
          paddingTop: 30,
        }}
      >
        <Accordion.Item value="operation">
          <Accordion.Control>
            <Text fw={700}>{t("operationname")}</Text>
            {props.data.Freight.referanceCode
              ? `${state[props.data.type]}${props.data.Freight.referanceCode}`
              : ""}
          </Accordion.Control>
          <Accordion.Panel>
            <Grid>
              <Grid.Col span={6}>
                <Text fw={700}>{t("customername")}</Text>
                {props.data.Freight.companyName}
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700}>{t("deliveringcompany")}</Text>
                {props.data.Freight.deliveryCompany}
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700}>{t("operationmanager")}</Text>
                {props.data.Freight.OperationManager?.name}
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={700}>{t("opstartdate")}</Text>
                {DateTime.fromISO(props.data.date).toFormat("dd-MM-yyyy")}
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Button
                  w="100%"
                  className="buttons"
                  onClick={() => getVehiclesInfo()}
                >
                  {t("addvehicleinfo")}
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Button
                  w="100%"
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({ ...prev, userModal: true }))
                  }
                >
                  {t("adduser")}
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Button
                  w="100%"
                  className="buttons"
                  onClick={() => getVehicleStatuses(props.data.id)}
                >
                  {t("currentvehiclelocation")}
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                <Button
                  w="100%"
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({ ...prev, confirmModal: true }))
                  }
                >
                  {t("terminateoperation")}
                </Button>
              </Grid.Col>
              <Grid.Col>
                <Button
                  w="100%"
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      cancel: true,
                      confirmModal: true,
                    }))
                  }
                >
                  {t("canceloperation")}
                </Button>
              </Grid.Col>
              <Grid.Col span={8}>
                <Select
                  label={t("carriercompany")}
                  data={props.carriers}
                  clearable
                  searchable
                  value={state.carrierCompany}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, carrierCompany: e }))
                  }
                />
              </Grid.Col>
              <Grid.Col
                span={4}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                <Group justify="center" mt="md">
                  <Button
                    className="buttons"
                    onClick={() => setCarrier(state.carrierCompany)}
                  >
                    {t("save")}
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col>
                <Dropzone
                  style={{ marginTop: 10 }}
                  multiple={true}
                  accept={"/*"}
                  onReject={() =>
                    notifications.show({
                      title: "Hata",
                      message: t("wrongtype"),
                      color: "red",
                      icon: <Icons name="FaExclamationTriangle" />,
                      radius: "lg",
                    })
                  }
                  onDrop={(files) => {
                    files.forEach((file) => {
                      fileUpload([file], `${props.data.id}`, [file.name]);
                    });
                  }}
                >
                  <Group justify="center" style={{ pointerEvents: "none" }}>
                    <Dropzone.Idle>
                      <Icons name="FaFileUpload" size={30} />
                    </Dropzone.Idle>
                    <Text size="xl" inline>
                      {t(`uploadfile`)}
                    </Text>
                  </Group>
                </Dropzone>
              </Grid.Col>
              <Grid.Col span={{ base: 8, md: 8, lg: 8 }}>
                <Select
                  label={t("status")}
                  searchable
                  allowDeselect={false}
                  clearable
                  data={state.operationStatus}
                  searchValue={state.search}
                  onSearchChange={(e) =>
                    setState((prev) => ({ ...prev, search: e }))
                  }
                  nothingFoundMessage={
                    state.search.trim() ? (
                      <a
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            operationStatus: [
                              ...prev.operationStatus,
                              state.search,
                            ],
                            status: state.search,
                          }));
                        }}
                      >{`+ ${t("addnewstatus")} ${state.search}`}</a>
                    ) : null
                  }
                  value={state.status}
                  onChange={(e) => setState((prev) => ({ ...prev, status: e }))}
                />
              </Grid.Col>
              <Grid.Col
                span={{ base: 4, md: 4, lg: 4 }}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  disabled={!state.status}
                  className="buttons"
                  onClick={() =>
                    editStatus({
                      creatorId: props.userAgent.id,
                      date: new Date(),
                      status: state.status,
                      operationId: props.data.id,
                    })
                  }
                >
                  {t("update")}
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 8, md: 8, lg: 8 }}>
                <ColorInput
                  withEyeDropper={false}
                  swatchesPerRow={11}
                  format="hex"
                  swatches={[
                    "#868e96",
                    "#fa5252",
                    "#e64980",
                    "#be4bdb",
                    "#7950f2",
                    "#4c6ef5",
                    "#228be6",
                    "#15aabf",
                    "#12b886",
                    "#40c057",
                    "#82c91e",
                    "#fab005",
                    "#fd7e14",
                    "#ffffff",
                  ]}
                  label={t("cardcolour")}
                  value={state.colour}
                  onChange={(e) => setState((prev) => ({ ...prev, colour: e }))}
                />
              </Grid.Col>
              <Grid.Col
                span={{ base: 4, md: 4, lg: 4 }}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  disabled={state.colour === props.data.colour}
                  className="buttons"
                  onClick={() => setCardColour(state.colour, props.data.id)}
                >
                  {t("updatecolour")}
                </Button>
              </Grid.Col>
            </Grid>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="logs">
          <Accordion.Control>
            <Text style={{ fontWeight: "bold" }}>{t("logs")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Grid>
              <ScrollArea h={350} type="always" scrollbarSize={5}>
                {populateLogs()}
              </ScrollArea>
            </Grid>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="files">
          <Accordion.Control
            onClick={() => getFiles(props.data.id, false)}
            icon={
              <>
                {state.filePlusIcon && (
                  <Icons name={"HiMiniPlusSmall"} size={19} />
                )}
                <Icons name={state.filesIcon} size={19} />
              </>
            }
          >
            <Text style={{ fontWeight: "bold" }}>{t("files")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={350} type="always" scrollbarSize={5}>
              {state.loading ? <Loading /> : populateFiles(false)}
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="notes">
          <Accordion.Control
            icon={
              <>
                {state.notePlusIcon && (
                  <Icons name={"HiMiniPlusSmall"} size={19} />
                )}
                <Icons name={state.notesIcon} size={19} />
              </>
            }
          >
            <Text style={{ fontWeight: "bold" }}>{t("notes")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={350} type="always" scrollbarSize={5}>
              <Grid>{populateNotes()}</Grid>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="email">
          <Accordion.Control
            icon={
              <>
                {state.mailPlusIcon && (
                  <Icons name={"HiMiniPlusSmall"} size={19} />
                )}
                <Icons name={state.emailsIcon} size={19} />
              </>
            }
          >
            <Text style={{ fontWeight: "bold" }}>{t("emails")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={350} type="always" scrollbarSize={5}>
              <Grid>{populateMails()}</Grid>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="fines">
          <Accordion.Control
            onClick={() => getFiles(props.data.id, true)}
            icon={
              <>
                {state.finesPlusIcon && (
                  <Icons name={"HiMiniPlusSmall"} size={19} />
                )}
                <Icons name={state.finesIcon} size={19} />
              </>
            }
          >
            <Text style={{ fontWeight: "bold" }}>{t("additionalcosts")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={350} type="always" scrollbarSize={5}>
              <Grid>
                {state.loading ? (
                  <Grid.Col
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <Loading />
                  </Grid.Col>
                ) : (
                  <>
                    <Grid.Col>
                      <Dropzone
                        style={{ marginTop: 10 }}
                        multiple={true}
                        accept={"/*"}
                        onReject={() =>
                          notifications.show({
                            title: "Hata",
                            message: t("wrongtype"),
                            color: "red",
                            icon: <Icons name="FaExclamationTriangle" />,
                            radius: "lg",
                          })
                        }
                        onDrop={(files) => {
                          files.forEach((file) => {
                            fileUpload([file], `${props.data.id}/fines`, [
                              file.name,
                            ]);
                          });
                        }}
                      >
                        <Group
                          justify="center"
                          style={{ pointerEvents: "none" }}
                        >
                          <Dropzone.Idle>
                            <Icons name="FaFileUpload" size={30} />
                          </Dropzone.Idle>
                          <Text size="xl" inline>
                            {t(`uploadfile`)}
                          </Text>
                        </Group>
                      </Dropzone>
                    </Grid.Col>
                    <Grid.Col>{populateFiles(true)}</Grid.Col>
                    {populateFines()}
                    <Flex
                      align="center"
                      justify="space-around"
                      direction={{
                        base: "row",
                        xs: "row",
                        sm: "row",
                        md: "row",
                        lg: "row",
                        xl: "row",
                      }}
                      gap={100}
                    >
                      <Button
                        mt={5}
                        className="buttons"
                        onClick={() =>
                          form.insertListItem("fines", {
                            finesPrice: "",
                            currency: "",
                          })
                        }
                      >
                        {t("add")}
                      </Button>
                      <Button
                        mt={5}
                        className="buttons"
                        onClick={() => updateFines(form.values.fines)}
                      >
                        {t("save")}
                      </Button>
                    </Flex>
                  </>
                )}
              </Grid>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
        {props.type === "international" && (
          <Accordion.Item value="shipmentform">
            <Accordion.Control>
              <Text style={{ fontWeight: "bold" }}>{t("shipmentform")}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <ScrollArea h={350} type="always" scrollbarSize={5}>
                <Button
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({ ...prev, shipmentForm: true }))
                  }
                >
                  {t("shipmentform")}
                </Button>
              </ScrollArea>
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>
      <Modal
        size="md"
        opened={state.driverModal}
        closeOnClickOutside={false}
        onClose={() => setState((prev) => ({ ...prev, driverModal: false }))}
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {populateVehicles()}
        <Group justify="center" mt="md">
          <Button
            className="buttons"
            onClick={() =>
              form.insertListItem("vehicles", {
                driverName: "",
                driverNo: "",
                driverIdNo: "",
                frontPlate: "",
                trailerPlate: "",
                id: null,
              })
            }
          >
            {t("addnewvehicleinfo")}
          </Button>
        </Group>
        <Group justify="center" mt="md">
          <Button
            className="buttons"
            onClick={() => addVehicleInfo(form.values)}
          >
            {t("save")}
          </Button>
        </Group>
      </Modal>
      <Modal
        size="70rem"
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        fullScreen
        opened={state.mailsModal}
        onClose={() =>
          setState((prev) => ({ ...prev, mailsModal: false, selectMail: [] }))
        }
      >
        <ScrollArea scrollbarSize={5} style={{ marginBottom: 20, margin: 20 }}>
          <Grid className="grid-div">
            <Grid.Col>{state.selectMail?.content}</Grid.Col>
            <Grid.Col>{state.selectMail?.date}</Grid.Col>
            <Text
              dangerouslySetInnerHTML={{ __html: state.selectMail?.message }}
            ></Text>
          </Grid>
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
        <Grid>
          <Grid.Col>
            <Text>{`${state.selectedFile} ${t("areusuredeletefile")}`}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() => deleteFile(props.data.id, state.selectedFile)}
            >
              {t("yes")}
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  warnModal: false,
                  selectedFile: "",
                }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        {...modalStyle}
        size="auto"
        zIndex={300}
        scrollAreaComponent={ScrollArea.Autosize}
        opened={state.statusDelete}
        closeOnClickOutside={false}
        onClose={() =>
          setState((prev) => ({ ...prev, statusDelete: false, statusId: null }))
        }
      >
        <Grid>
          <Grid.Col>
            <Text>{`${state.selectedFile} ${t("aresuredelete")}`}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() => deleteStatus(state.statusId)}
            >
              {t("yes")}
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  statusDelete: false,
                  statusId: null,
                }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        {...modalStyle}
        scrollAreaComponent={ScrollArea.Autosize}
        closeOnClickOutside={false}
        opened={state.userModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            userModal: false,
            userIds: props.data.userIds || [],
          }))
        }
      >
        <Grid>
          <Grid.Col>
            <MultiSelect
              style={{ marginTop: 10 }}
              searchable
              label={t("users")}
              data={props.users}
              value={state.userIds}
              onChange={(e) => setState((prev) => ({ ...prev, userIds: e }))}
            />
          </Grid.Col>
          <Grid.Col
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              className="buttons"
              onClick={() => addUserOperation(state.userIds)}
            >
              {t("adduser")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <NoteModal
        opened={state.noteModal}
        onClose={() =>
          setState((prev) => ({ ...prev, noteModal: false, selectNote: [] }))
        }
        setState={setState}
        getData={props.getData}
        data={{
          creator: props.userAgent.id,
          type: props.type,
          opId: props.data.id,
          referanceCode: props.data.Freight.referanceCode,
          selectNote: state.selectNote,
          edit: state.edit,
        }}
      />
      <Modal
        {...modalStyle}
        opened={state.confirmModal}
        closeOnClickOutside={false}
        onClose={() =>
          setState((prev) => ({ ...prev, confirmModal: false, cancel: false }))
        }
      >
        <Grid>
          <Grid.Col>
            <Text>
              {state.cancel
                ? t("areusurewantcancel")
                : t("uwantterminateoperation")}
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() => terminateOperation(props.data.id)}
            >
              {t("yes")}
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  confirmModal: false,
                  cancel: false,
                }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        zIndex={200}
        fullScreen
        {...modalStyle}
        closeOnClickOutside={false}
        opened={state.vehicleModal}
        onClose={() => {
          setState((prev) => ({ ...prev, vehicleModal: false }));
          props.getData({});
        }}
      >
        <Vehicle
          data={props.data}
          state={state}
          setState={setState}
          userAgent={props.userAgent}
        />
      </Modal>
      <Modal
        title={t("shipmentform")}
        closeOnClickOutside={false}
        size="60rem"
        opened={state.shipmentForm}
        onClose={() => setState((prev) => ({ ...prev, shipmentForm: false }))}
      >
        <Grid>
          <Grid.Col>
            <TextInput
              disabled
              label={t("referancecode")}
              value={props.data.Freight.referanceCode}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("carriercompany")}
              value={props.data.Supplier?.supplierName || ""}
            />
          </Grid.Col>
          <Grid.Col>
            <NumberInput
              disabled
              label={`${t("price")} (${t("carrier")})`}
              value={props.data.Freight.supplierOffer}
              suffix={` ${convertCurrency(props.data.Freight.currency, "text")}${
                state.ydgAmount
                  ? ` + ${state.ydgAmount}${state.ydgCurrency ? ` ${t(`${state.ydgCurrency}`)} YDG` : ""}`
                  : ""
              }`}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={`${t("maturity")} (${t("carrier")})`}
              value={
                props.data.Freight.sMaturityDay
                  ? props.data.Freight.sMaturityDay
                  : DateTime.fromISO(props.data.Freight.sLastPayDay).toFormat(
                      "dd-MM-yyyy"
                    )
              }
            />
          </Grid.Col>
          <Grid.Col>
            <NumberInput
              disabled
              label={`${t("price")} (${t("customer")})`}
              value={props.data.Freight.cash}
              suffix={` ${convertCurrency(props.data.Freight.currency, "text")}${
                state.ydgAmount
                  ? ` + ${state.ydgAmount}${state.ydgCurrency ? ` ${t(`${state.ydgCurrency}`)} YDG` : ""}`
                  : ""
              }`}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={`${t("maturity")} (${t("customer")})`}
              value={
                props.data.Freight.cMaturityDay
                  ? props.data.Freight.cMaturityDay
                  : DateTime.fromISO(props.data.Freight.cLastPayDay).toFormat(
                      "dd-MM-yyyy"
                    )
              }
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("loadingdate")}
              value={
                props.data.Freight.loadDate
                  ? DateTime.fromISO(props.data.Freight.loadDate).toFormat(
                      "dd-MM-yyyy"
                    )
                  : ""
              }
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={`${t("loadinglocation")} ${t("countrycompany")}`}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  deliveryCompany: e.target.value,
                }))
              }
              value={state.deliveryCompany}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("loadingpoint")}
              value={props.data.Freight.Addresses?.filter(
                (x) => x.type === "loadingpoint"
              )
                .map((x) => x.address)
                .join("  -  ")}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={t("customslocation")}
              value={state.customsLocation}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  customsLocation: e.target.value,
                }))
              }
            />
          </Grid.Col>
          <Grid.Col>
            <Text>{t("domestictransportation")}</Text>
            <Radio.Group
              onChange={(e) =>
                setState((prev) => ({ ...prev, domesticTransp: e }))
              }
              defaultValue={state.domesticTransp}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div className="radioDivs">
                  {t("yes")}
                  <Radio color="#4c5056" value="true" />
                </div>
                <div className="radioDivs">
                  {t("no")}
                  <Radio color="#4c5056" value="false" />
                </div>
                {state.domesticTransp === "true" && (
                  <>
                    <div>
                      <NumberInput
                        label={t("amount")}
                        thousandSeparator=","
                        value={state.domesticTPrice}
                        onChange={(e) => findPrice(e)}
                        error={
                          state.domesticTransp === "true" &&
                          !state.domesticTPrice
                        }
                      />
                    </div>
                    <div>
                      <NumberInput
                        disabled
                        label={`${t("amount")} + ${t("vat")} `}
                        thousandSeparator=","
                        value={state.totalDomTPrice}
                      />
                    </div>
                  </>
                )}
              </div>
            </Radio.Group>
          </Grid.Col>
          <Grid.Col>
            <Text>YDG</Text>
            <Radio.Group
              onChange={(e) => setState((prev) => ({ ...prev, ydg: e }))}
              defaultValue={state.ydg}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div className="radioDivs">
                  {t("yes")}
                  <Radio color="#4c5056" value="true" />
                </div>
                <div className="radioDivs">
                  {t("no")}
                  <Radio color="#4c5056" value="false" />
                </div>
                {state.ydg === "true" && (
                  <>
                    <NumberInput
                      label={t("amount")}
                      thousandSeparator=","
                      value={state.ydgAmount}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, ydgAmount: e }))
                      }
                      error={state.ydg === "true" && !state.ydgAmount}
                    />
                    <Select
                      label={t("currency")}
                      data={[
                        { label: t("eur"), value: "eur" },
                        { label: t("usd"), value: "usd" },
                        { label: t("gbp"), value: "gbp" },
                        { label: t("try"), value: "try" },
                      ]}
                      value={state.ydgCurrency}
                      error={state.ydg === "true" && !state.ydgCurrency}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, ydgCurrency: e }))
                      }
                    />
                  </>
                )}
              </div>
            </Radio.Group>
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("weighttype")}
              value={t(`${props.data.Freight.weightType}`)}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("shippingtype")}
              value={t(`${props.data.Freight.shippingType}`)}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("deliveryaddress")}
              value={`${props.data.Freight.deliveryCompany ? props.data.Freight.deliveryCompany.toLocaleUpperCase("tr-TR") : ""} - ${props.data.Freight.Addresses?.filter(
                (x) => x.type === "deliveryaddress"
              )
                .map((x) => x.address)
                .join("  -  ")}`}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("deliveryduration")}
              value={`${props.data.Freight.deliveryDate} ${t("day")}`}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={`${t("vehicleplate")} (${t("front")})`}
              value={props.data.Vehicles?.map((x) => x.frontPlate).join(
                "  -  "
              )}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={`${t("vehicleplate")} (${t("trailer")})`}
              value={props.data.Vehicles?.map((x) => x.trailerPlate).join(
                "  -  "
              )}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              disabled
              label={t("numberofvehicles")}
              value={props.data.Vehicles.length}
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={t("customsinformation")}
              value={state.customInformation}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  customInformation: e.target.value,
                }))
              }
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={t("documentdelivery")}
              value={state.documentDelivery}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  documentDelivery: e.target.value,
                }))
              }
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={t("bordercrossing")}
              value={state.borderCrossing}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  borderCrossing: e.target.value,
                }))
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Button className="buttons" onClick={() => editShipmentForm()}>
              {t("save")}
            </Button>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button className="buttons" onClick={() => exportPdf()}>
              {t("exportpdf")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        opened={state.docModal}
        onClose={() => setState((prev) => ({ ...prev, docModal: false }))}
        fullScreen
        className="attachment-pdf-modal"
      >
        <DocumentViewer
          file={`${process.env.SERVER_IP}/files/operationfiles/${state.finesAttachment ? `${props.data.id}/fines` : props.data.id}/${state.selectedFile}`}
        />
      </Modal>
      <ImageModal
        opened={state.imgModal}
        src={`files/operationfiles/${state.finesAttachment ? `${props.data.id}/fines` : props.data.id}/${state.selectedFile}`}
        onClose={() => setState((prev) => ({ ...prev, imgModal: false }))}
      />
    </>
  );
};

export default OperationCard;
