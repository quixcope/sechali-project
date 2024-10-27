import { useEffect } from "react";
import useTranslation from "next-translate/useTranslation";

const Loading = (props) => {
  const { t } = useTranslation("common");

  useEffect(() => {
    console.log("loading mounted");
    return () => {
      console.log("loading unmounted");
    };
  }, []);

  return (
    <>
      <div className="loader">
        <div className="loader-circle"></div>
        <span style={{ color: props.color ? props.color : "black" }}>
          {t("loading")}
        </span>
      </div>
    </>
  );
};

export default Loading;
