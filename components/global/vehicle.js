import { useEffect } from "react";
import {
  Grid,
  Button,
  Select,
  ScrollArea,
  Timeline,
  Flex,
  Text,
  ActionIcon,
  Divider,
} from "@mantine/core";
import Maps from "./map";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import Icons from "../../helpers/icon";
import useTranslation from "next-translate/useTranslation";
import { DateTime } from "luxon";
import { formatDifference } from "../../helpers/functions";

const Vehicle = ({ state, setState, data, userAgent, customer }) => {
  const { t } = useTranslation("common");
  const currentTime = DateTime.now();

  const getVehicleStatuses = async (id) => {
    if (!customer) {
      setState((prev) => ({ ...prev, loading: true }));
      let temp = {};
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/getVehicleStatuses`,
        { id: id }
      );
      if (response.data.success) {
        temp = { ...response.data.data, vehicleModal: true };
      } else {
        notifications.show({
          title: t("error"),
          color: "red",
          radius: "lg",
          icon: <Icons name="FaExclamationTriangle" />,
        });
      }
      setState((prev) => ({ ...prev, ...temp, loading: false }));
    }
  };

  const editVehicleStatus = async (values) => {
    if (!customer) {
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/editVehicleStatus`,
        values
      );
      if (response.data.success) {
        getVehicleStatuses(data.id);
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
    }
  };

  const populateVehicleStatus = () => {
    let temp = [];
    const data = JSON.parse(JSON.stringify(state.vehicleLogs));
    for (let i = 0; i < data.length; i++) {
      temp.push(
        <Timeline
          color={"rgba(250, 209, 5, 1)"}
          active={1}
          bulletSize={24}
          lineWidth={2}
          key={`vehicleStatus${i}`}
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
            <Flex
              align="center"
              justify="space-between"
              w="100%"
              direction="row"
            >
              <Text size="sm" fw={600}>
                {data[i].status}
              </Text>
              {!customer && (
                <ActionIcon
                  color="rgba(250, 209, 5, 1)"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      statusDelete: true,
                      statusId: data[i].id,
                    }))
                  }
                >
                  <Icons name="AiFillDelete" color="black" />
                </ActionIcon>
              )}
            </Flex>
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

  useEffect(() => {
    console.log("vehicle mounted");
    return () => {
      console.log("vehicle unmounted");
    };
  }, []);

  return (
    <>
      <Grid>
        <Grid.Col>
          <Maps
            id={data.id}
            freightId={data.Freight?.id}
            plates={state.plates}
            getVehicleStatuses={getVehicleStatuses}
            customer={customer}
          />
        </Grid.Col>
        {!customer && (
          <Grid.Col>
            <Select
              label={t("addnewstatus")}
              searchable
              allowDeselect={false}
              clearable
              data={state.vehicleStatuses}
              searchValue={state.searchVStatus}
              onSearchChange={(e) =>
                setState((prev) => ({ ...prev, searchVStatus: e }))
              }
              nothingFoundMessage={
                state.searchVStatus.trim() ? (
                  <a
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        vehicleStatuses: [
                          ...prev.vehicleStatuses,
                          state.searchVStatus,
                        ],
                        vehicleStatus: state.searchVStatus,
                      }));
                    }}
                  >{`+ ${t("addnewstatus")} ${state.searchVStatus}`}</a>
                ) : null
              }
              value={state.vehicleStatus}
              onChange={(e) =>
                setState((prev) => ({ ...prev, vehicleStatus: e }))
              }
            />
          </Grid.Col>
        )}
        {!customer && (
          <Grid.Col>
            <Button
              disabled={
                !state.vehicleStatus ||
                state.vehicleStatus === data.vehicleStatus
              }
              className="buttons"
              onClick={() =>
                editVehicleStatus({
                  creatorId: userAgent.id,
                  date: new Date(),
                  status: state.vehicleStatus,
                  operationId: data.id,
                  type: "vehicle",
                })
              }
            >
              {t("add")}
            </Button>
          </Grid.Col>
        )}
      </Grid>
      <ScrollArea h={600} type="always" scrollbarSize={5}>
        {populateVehicleStatus()}
      </ScrollArea>
    </>
  );
};

export default Vehicle;
