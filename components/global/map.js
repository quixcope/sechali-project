import useTranslation from "next-translate/useTranslation";
import { notifications } from "@mantine/notifications";
import { Grid, Button, Text, Select, Flex } from "@mantine/core";
import { useEffect, useState, useRef, useCallback } from "react";
import Loading from "../global/loading";
import Icons from "../../helpers/icon";
import Pin from "./pin";
import axios from "axios";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import AutoSizer from "react-virtualized-auto-sizer";
import { useDebouncedValue } from "@mantine/hooks";
import setLanguage from "next-translate/setLanguage";
import { useRouter } from "next/router.js";

const Maps = (props) => {
  const router = useRouter();
  const mapRef = useRef();
  const { t } = useTranslation("common");
  const [mapboxAPI] = useState(process.env.access_token);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);
  const [state, setState] = useState({
    map: null,
    loc: null,
    newMap: null,
    newLoc: null,
    locData: [],
    locations: [],
    selectedLoc: null,
    loading: false,
    plate: "",
    plates: props.plates || [],
  });

  const onResize = useCallback(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.resize(), 0);
    }
    return null;
  }, []);

  const getLocations = async (value, temp) => {
    const tempValue = temp || {};
    if (value) {
      const response = await axios.post(
        `${process.env.SERVER_IP}/api/getLocations`,
        { key: value }
      );
      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          ...tempValue,
          locations: response.data.locations,
          locData: response.data.locData,
          loading: false,
        }));
      }
    }
  };

  const getData = async ({ plate = state.plate }) => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = { operationId: props.id, plate };
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getLoc`,
      data
    );
    let temp = {};
    if (response.data.success) {
      temp = {
        ...data,
        ...response.data.data,
        selectedLoc: response.data.data.map?.place_name,
      };
      getLocations(response.data.data.map?.place_name, temp);
    } else {
      temp = {
        loc: null,
        map: null,
        newMap: null,
        newLoc: null,
        selectedLoc: null,
        locations: [],
      };
      notifications.show({
        message: t("recordnotfound"),
        color: "gray",
        radius: "lg",
      });
      setState((prev) => ({ ...prev, ...data, ...temp, loading: false }));
    }
  };

  const copyUrl = async () => {
    const formlink = await axios.post(`${process.env.SERVER_IP}/api/getLink`, {
      id: props.freightId,
    });
    if (formlink.data.success) {
      const linkValue = `${process.env.SERVER_IP}/vehiclestatus?&uuId=${formlink.data.data.CustomerForm.uuId}&id=${formlink.data.data.id}&opId=${props.id}`;
      await navigator.clipboard.writeText(linkValue);
      notifications.show({
        title: t("copysuccessful"),
        color: "green",
        radius: "lg",
        icon: <Icons name="FaRegCheckCircle" />,
        autoClose: 5000,
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
    if (debouncedSearchTerm) {
      getLocations(debouncedSearchTerm);
    }
    if (props.customer) {
      setLanguage(router.locale);
    }
    console.log("maps mounted");
    return () => {
      console.log("maps unmounted");
    };
  }, [props.id, debouncedSearchTerm]);

  const onChange = (value) => {
    const find = state.locData.find((item) => item.place_name === value);
    if (find) {
      setState((prev) => ({
        ...prev,
        newMap: find,
        newLoc: { type: "Point", coordinates: find.geometry.coordinates },
        selectedLoc: value,
      }));
    }
  };

  const setLoc = async () => {
    const response = await axios.post(`${process.env.SERVER_IP}/api/setLoc`, {
      data: {
        map: state.newMap,
        loc: state.newLoc,
        operationId: props.id,
        plate: state.plate,
      },
    });
    if (response.data.success) {
      props.getVehicleStatuses(props.id);
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
      getData({});
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

  const populateRows = () => {
    let temp = [];
    if (state.map) {
      temp.push(
        <Grid.Col span={6} key="address">
          <Text>{`${t("address")} : ${
            state.map ? state.map.place_name : ""
          } `}</Text>
        </Grid.Col>
      );
    }
    if (state.newMap) {
      temp.push(
        <Grid.Col span={6} key="newaddress">
          <Text>{`${t("newaddress")} : ${
            state.newMap ? state.newMap.place_name : ""
          } `}</Text>
        </Grid.Col>
      );
    }
    return temp;
  };

  return state.loading ? (
    <Loading />
  ) : (
    <>
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
        justify="flex-start"
      >
        <Select
          label={t("vehicleplate")}
          allowDeselect={false}
          data={state.plates}
          value={state.plate}
          searchable
          onChange={(e) => getData({ plate: e || "" })}
        />
        {!props.customer && (
          <Select
            disabled={!state.plate}
            label={t("location")}
            allowDeselect={false}
            data={state.locations}
            value={state.selectedLoc}
            searchable
            clearable
            onSearchChange={(e) => setSearchTerm(e)}
            onChange={(e) => onChange(e)}
          />
        )}
        {!props.customer && (
          <Button
            mt={25}
            disabled={!state.plate && !state.selectedLoc}
            className="buttons"
            style={{ marginTop: 10, backgroundColor: props.cColor }}
            onClick={() => setLoc()}
          >
            {t("save")}
          </Button>
        )}
        {!props.customer ? (
          <Button
            mt={25}
            className="buttons"
            style={{ marginTop: 10, backgroundColor: props.cColor }}
            onClick={() => copyUrl()}
          >
            {t("sharelink")}
          </Button>
        ) : (
          <Button
            mt={25}
            className="buttons"
            leftSection={<Icons name="MdLanguage" size={20} />}
            onClick={() => setLanguage(router.locale === "en" ? "tr" : "en")}
          >
            {t("changelanguage")}
          </Button>
        )}
      </Flex>
      {populateRows()}
      <div style={{ height: "50vh", overflow: "scroll" }}>
        <AutoSizer>{onResize}</AutoSizer>
        <Map
          initialViewState={
            state.loc
              ? {
                  longitude: state.loc.coordinates[0],
                  latitude: state.loc.coordinates[1],
                  zoom: 10,
                }
              : { longitude: 31.451, latitude: 41.2051, zoom: 4 }
          }
          mapStyle={"mapbox://styles/mapbox/outdoors-v12"}
          mapboxAccessToken={mapboxAPI}
          scrollZoom={true}
          ref={mapRef}
        >
          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <ScaleControl />
          {state.loc && (
            <Marker
              longitude={state.loc.coordinates[0]}
              latitude={state.loc.coordinates[1]}
              anchor="center"
            >
              <Pin color="#01a577" size="2em" />
            </Marker>
          )}
        </Map>
      </div>
    </>
  );
};

export default Maps;
