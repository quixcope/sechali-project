import { useEffect } from "react";
import LogTable from "./datatables/logtable";
import Info from "./infopopup";

const Logbook = (props) => {
  useEffect(() => {
    console.log("Logbook mounted");
    return () => {
      console.log("Logbook unmounted");
    };
  }, [props.type]);

  return (
    <>
      <Info type={props.type} changeProjectType={props.changeProjectType} />
      <div style={{ margin: 8, paddingTop: 34 }}>
        <LogTable
          projectType={props.type}
          general={props.general}
          userAgent={props.userAgent}
          colorSettings={props.colorSettings}
        />
      </div>
    </>
  );
};

export default Logbook;
