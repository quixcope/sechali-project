import Navbar from "../components/nav";
import { useEffect, useState, useRef } from "react";
import Suppliers from "../components/suppliers";
import Home from "../components/home";
import ListOffers from "../components/listoffers";
import Customers from "../components/customers";
import Settings from "../components/settings";
import Operation from "../components/listoperations";
import GeneralNotes from "../components/generalnotes";
import Logbook from "../components/logbook";
import setLanguage from "next-translate/setLanguage";
import axios from "axios";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Link } from "@mantine/tiptap";
import Invoices from "../components/invoices";
import NavbarMobile from "../components/navmobile";
import { useViewportSize } from "@mantine/hooks";
import PaymentTrackings from "../components/paymenttrackings";
import NextHead from "next/head";
import Loading from "../components/global/loading";
import BalanceSheet from "../components/balancesheet";

export async function getServerSideProps({ req, query }) {
  const userAgent = JSON.stringify(req.user);
  const userQuery = JSON.stringify(query);
  const flashMessage = !req
    ? "no message"
    : req.locals
      ? JSON.stringify(req.locals)
      : "no message";
  return {
    props: {
      userAgent: userAgent ? JSON.parse(userAgent) : userAgent,
      userQuery: userQuery ? JSON.parse(userQuery) : userQuery,
      flashMessage: flashMessage,
    },
  };
}

const Index = (props) => {
  const { width } = useViewportSize();
  const homeRef = useRef();
  const dashRef = useRef();
  const opRef = useRef();
  const setRef = useRef();
  const notesRef = useRef();
  const invoOpRef = useRef();
  const invRef = useRef();
  const customerRef = useRef();
  const supplRef = useRef();
  const paytracRef = useRef();
  const sheetRef = useRef();
  const [email, setEmail] = useState();
  const [color, setColor] = useState();
  const [general, setGeneral] = useState();
  const [state, setState] = useState({
    name: "home",
    pType: props.userAgent.projectType || "domestic",
    loading: true,
  });
  const content = "<p></p><p></p><p></p><p></p><p></p>";
  const extension = [
    Color,
    TextStyle,
    StarterKit,
    Underline,
    Link,
    Superscript,
    SubScript,
    Highlight,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ];
  const editor = useEditor({ extensions: extension, content: content });
  const emailEditor = useEditor({ extensions: extension, content: content });
  const mailEditor = useEditor({ extensions: extension, content: "" });

  const getData = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getSettings`
    );
    if (response.data.success) {
      setEmail(() => response.data.email);
      setColor(() => response.data.colorSettings);
      setGeneral(() => response.data.generalSettings);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const pageChange = (name, firstOpen, enFirstOpen) => {
    let loc =
      name === "home"
        ? homeRef
        : name === "offers"
          ? dashRef
          : name === "logbook"
            ? invoOpRef
            : name === "generalnotes"
              ? notesRef
              : name === "operation"
                ? opRef
                : name === "settings"
                  ? setRef
                  : name === "invoices"
                    ? invRef
                    : name === "paymenttrackings"
                      ? paytracRef
                      : name === "customers"
                        ? customerRef
                        : name === "sheet"
                          ? sheetRef
                          : supplRef;
    const position = loc.current.getBoundingClientRect();
    const positiondash = homeRef.current.getBoundingClientRect();
    let cName = document.getElementById("hori-selector");
    cName.style.top = position.top + "px";
    cName.style.left = position.left - positiondash.left + "px";
    cName.style.height = position.height + "px";
    let widthValue = 30;
    if (firstOpen) {
      widthValue = 0;
    } else if (enFirstOpen) {
      widthValue = 60;
    }
    cName.style.width = position.width - widthValue + "px";
    setState((prev) => ({ ...prev, name }));
  };

  const pageChangeMobile = (name) => {
    setState((prev) => ({ ...prev, name }));
  };

  const changeLang = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/changeLanguage`
    );
    if (response.data.success) {
      setLanguage(response.data.lang);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const changeProjectType = async (type) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/changeProjectType`,
      { type }
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, pType: response.data.msg }));
    }
  };

  useEffect(() => {
    getData();
    changeLanguage(props.userAgent.lang);
  }, [state.pType]);

  return state.loading ? (
    <Loading />
  ) : (
    <>
      <NextHead>
        <link
          rel="manifest"
          href={`/manifest.json?language=${props.userAgent.lang || "tr"}`}
        />
      </NextHead>
      {width > 1440 ? (
        <Navbar
          pageChange={pageChange}
          name={state.name}
          changeProjectType={changeProjectType}
          userAgent={props.userAgent}
          homeRef={homeRef}
          invoOpRef={invoOpRef}
          dashRef={dashRef}
          invRef={invRef}
          notesRef={notesRef}
          opRef={opRef}
          customerRef={customerRef}
          supplRef={supplRef}
          setRef={setRef}
          paytracRef={paytracRef}
          sheetRef={sheetRef}
        />
      ) : (
        <NavbarMobile
          pageChange={pageChangeMobile}
          name={state.name}
          changeProjectType={changeProjectType}
          userAgent={props.userAgent}
        />
      )}
      {state.name === "home" ? (
        <Home
          changeProjectType={changeProjectType}
          type={state.pType}
          user={props.user}
          pc={true}
          color={state.textColor}
          email={email}
          editor={editor}
          emailEditor={emailEditor}
          mailEditor={mailEditor}
          bthemeColor={state.textColor}
          general={general}
        />
      ) : state.name === "offers" ? (
        <ListOffers
          userAgent={props.userAgent}
          color={color}
          general={general}
          referanceKey={general?.EMAIL?.referanceKey}
          type={state.pType}
          changeProjectType={changeProjectType}
        />
      ) : state.name === "logbook" ? (
        <Logbook
          userAgent={props.userAgent}
          type={state.pType}
          colorSettings={color}
          referanceKey={general?.EMAIL?.referanceKey}
          changeProjectType={changeProjectType}
          general={general}
        />
      ) : state.name === "generalnotes" ? (
        <GeneralNotes
          userAgent={props.userAgent}
          type={state.pType}
          changeProjectType={changeProjectType}
          general={general}
        />
      ) : state.name === "settings" ? (
        <Settings
          userAgent={props.userAgent}
          type={state.pType}
          email={email}
          colorSettings={color}
          general={general}
          getData={getData}
          changeLanguage={changeLang}
          changeProjectType={changeProjectType}
        />
      ) : state.name === "operation" ? (
        <Operation
          userAgent={props.userAgent}
          type={state.pType}
          editor={editor}
          referanceKey={general?.EMAIL?.referanceKey}
          emailEditor={emailEditor}
          mailEditor={mailEditor}
          changeProjectType={changeProjectType}
          general={general}
        />
      ) : state.name === "invoices" ? (
        <Invoices
          userAgent={props.userAgent}
          type={state.pType}
          changeProjectType={changeProjectType}
        />
      ) : state.name === "customers" ? (
        <Customers
          lang={props.userAgent.lang}
          type={state.pType}
          changeProjectType={changeProjectType}
        />
      ) : state.name === "paymenttrackings" ? (
        <PaymentTrackings
          userAgent={props.userAgent}
          type={state.pType}
          changeProjectType={changeProjectType}
          referanceKey={general?.EMAIL?.referanceKey}
          colorSettings={color}
          general={general}
        />
      ) : state.name === "sheet" ? (
        <BalanceSheet />
      ) : (
        <Suppliers
          userAgent={props.userAgent.lang}
          type={state.pType}
          changeProjectType={changeProjectType}
        />
      )}
    </>
  );
};
export default Index;
