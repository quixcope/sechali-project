import { ActionIcon, Text } from "@mantine/core";
import Icons from "../helpers/icon";
import useTranslation from "next-translate/useTranslation";
import { useEffect } from "react";

const Info = (props) => {
  const { t } = useTranslation("common");

  useEffect(() => {
    return () => {
      console.log("Info unmounted");
    };
  }, []);
  return (
    <div className="popup">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Text>{t(`${props.type}`)}</Text>
        <ActionIcon
          variant="subtle"
          color="rgba(255, 255, 255, 1)"
          onClick={() => props.changeProjectType(props.type)}
        >
          <Icons name="GrPowerCycle" />
        </ActionIcon>
      </div>
    </div>
  );
};
export default Info;
