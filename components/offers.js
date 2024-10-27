import { useEffect, useState } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import {
  Table,
  Text,
  Grid,
  Image,
  Button,
  Modal,
  ScrollArea,
  Flex,
  SimpleGrid,
  Group,
  ActionIcon,
  TextInput,
} from "@mantine/core";
import Loading from "./global/loading.js";
import useTranslation from "next-translate/useTranslation";
import setLanguage from "next-translate/setLanguage";
import Icons from "../helpers/icon.js";
import { notifications } from "@mantine/notifications";
import { modalStyle, kvkkText } from "../helpers/functions";
import FreightForm from "./freightform.js";
import { useViewportSize } from "@mantine/hooks";
import { Dropzone } from "@mantine/dropzone";
import { useRouter } from "next/router.js";

const Offers = (props) => {
  const router = useRouter();
  const { width } = useViewportSize();
  const { t } = useTranslation("common");
  const [state, setState] = useState({
    loading: true,
    user: "",
    opModal: false,
    checkFormId: false,
    filesData: [],
    deleteModal: false,
    deleteData: [],
    relatedPersons: [],
    refKey: "",
    confirmModal: false,
    name: "",
    lastName: "",
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const getData = async () => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/getOffersData`,
      { userId: props.data.purchasingRep, id: props.data.id }
    );
    if (response.data.success) {
      setState((prev) => ({
        ...prev,
        loading: false,
        user: response.data.user,
        relatedPersons: response.data.relatedPersons,
        checkFormId: response.data.cFormId ? true : false,
        refKey:
          props.type === "domestic"
            ? response.data.setting.generalSettings.EMAIL.domRefKey || "LJSY"
            : response.data.setting.generalSettings.EMAIL.intRefKey || "ÇKR",
      }));
    }
  };

  const confirmFreight = async () => {
    if (!state.name || state.name === "") {
      notifications.show({
        title: t("error"),
        message: t("requiredname"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    if (!state.lastName || state.lastName === "") {
      notifications.show({
        title: t("error"),
        message: t("requiredname"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
      return;
    }
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/confirmFreightForm`,
      {
        id: props.data.id,
        name: state.name,
        lastName: state.lastName,
        purchasingRep: props.data.purchasingRep,
        referanceCode: props.data.referanceCode,
        companyName: props.data.companyName,
      }
    );
    if (response.data.success) {
      props.getData();
      notifications.show({
        title: t("success"),
        color: "green",
        icon: <Icons name="FaRegCheckCircle" />,
        radius: "lg",
      });
    } else {
      notifications.show({
        title: t("error"),
        message: t("error"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
    setState((prev) => ({
      ...prev,
      confirmModal: false,
      name: "",
      lastName: "",
    }));
  };

  let detail = {
    TR: [
      "Sipariş 2 gün içerisinde onaylanmadığı takdirde teklifimiz geçersiz sayılır.",
      "Bu sipariş muhteviyatının satınalınmasında Çakır Global Lojistik A.Ş. Genel Satın alma kuralları geçerlidir.",
      "Çakır Global Lojistik sipariş numarası ve parça numaraları bu sipariş ile ilgili fatura, irsaliye, paket etiketi ve diğer tüm resmi yazışma içeriklerinde mutlaka açıkça belirtilecektir.",
      "Fatura ödemeleri fatura tutarı döviz üzerinden olacaktır. Ödeme teslim CMR'si sonrasında olacaktır.",
      "Bu anlaşma kapsamında, yükleme talimatı alındığında teklifimiz onaylanmış kabul edilir.",
      `Grupaj yüklere dahil olan malzemelerde ;
    -Fiyat teklifimizin kg üzerinden hesaplanması durumunda 1 CBM=333kg , 1 LDM= 1.750kg
    -Fiyat teklifimizin cbm üzerinden hesaplanması durumunda 1 CBM=333kg , 1 LDM= 6,5 CBM esasına göre hesaplama yapılır. Hacimli yüklemelerde hacimli kg baz alınır.
    -Baremli fiyat tekliflerinde, bir üst baremin alt navlununun, bir alt baremin üst navlunundan daha düşük olması halinde, alt barem üst navlunu uygulanacaktır.`,
      "Fiyatlarımız Euro/kg bazında olup; beher araç için maksimum yükleme sınırı 22,5 tondur. Herhangi bir şekilde tonaj fazlası ve/ veya yanlış yükleme yapılması durumunda oluşabilecek cezalar ve benzeri uygulamalar yükleme talimatını veren firmaya yansıtılır.",
      "Ödeme vadesi, fatura kesim tarihi itibari ile 0 gündür. Tahsilat işlemleri faturalandırılan döviz cinsi üzerinden gerçekleştirilir. TL para birimi üzerinden hesaplama talep edilmesi halinde, tahsilat günündeki Garanti Bankası Gişe Satış kuru kullanılmakta olup, ödeme yapmadan önce tarafımız ile kurun teyitleşilmesi rica olunur. Çakır Global Lojistik, fiyat geçerliliğinin kararlaştırıldığı dönem içinde yaşanabilecek kur dalgalanmaları durumunda, bu oranları değiştirme ve/veya CAF (Currency Adjustment Factor) uygulama hakkını saklı tutar.",
      "Teklifimiz gabari dışı ölçülere sahip malzeme, frigo, tehlikeli maddeler ve konvoy gerektiren malzemeler için geçerli olmayıp; özelliği olmayan Kuru yükler için geçerlidir.",
      "ADR sınıfına giren malzemeler için, ayrıca yanıcı farkı navluna dahil edilir. Parsiyel yüklemelerde yanıcı masrafı 150.-Euro olup; komple taşımalarda Yanıcı farkı 200.-Euro’dur.",
      "Sevk edilecek olan malzemelerin taşıma esnasında zarar görmemesi için nakliyeye uygun bir şekilde ambalajlanması ve araçlara yüklenmesi gerekmektedir. Malın ambalajından kaynaklanan veya direkt yüklemelerde; yükleme hatasından kaynaklanan zararlardan firmamız sorumlu tutulmayacaktır. Yükleme, istifleme ve boşaltma işlemleri uluslararası teslim şekli ne olursa olsun tamamiyle gönderen ve alıcı tarafından yapılacak olup; konu ile ilgili tüm sorumluluk (yanlış yükleme&boşaltma, ambalaj hatası vb.) gönderen ve alıcıya aittir.",
      "İhracat taşımalarında, yükleme talimatı ile ihracat beyannamesi arasındaki herhangi bir farklılıktan doğabilecek sorunlardan yükleme talimatını veren firma sorumlu olur. İhracatçı, ithalatçı ve varsa sevkiyata ilişkin diğer kişi ya da firmanın, sevkiyata ait evrakları tam ve eksiksiz olarak zamanında firmamıza teslim etmiş olması gerekmektedir. Aksi durumlarda meydana gelebilecek tüm masraflar yükleme talimatını veren firmaya fatura edilir.",
      "Yükleme talimatı gönderildikten sonra, çıkış tarihine 24 saat kala iptal edilen yüklere ilişkin navlun bedelinin tamamı “Boş navlun faturası” olarak Yükleme talimatını veren firmaya fatura edilir.",
      "Serbest Bölge sevkiyatlarında oluşan masraflar navlun teklifimize dahil değildir. Araç durumumuzun uygun olması halinde Serbest Bölge varış ve çıkışı yapılabilmekte olup; Serbest Bölge ithalat ve ihracatlarınızda oluşan gümrük masrafları minimum 150.- Euro olarak ayrıca tarafınıza fatura edilir.",
      "Bütün taşımalarımız CMR sigorta kapsamı ve şartları dahilinde olup, CMR sigortası hasar anında en fazla brüt kilogram başına Sdr. 8.33 (yaklaşık Euro 9,00 /kg) ödemektedir. Herhangi bir hasar ihtimaline karşı nakliye sigortası yaptırmanızı tavsiye ederiz. Yapmış olduğumuz iş bu taşıma ile ilgili, malların teslim alınma anından depolarda beklemede dahil olmak üzere teslim edilme anına kadar olan tüm aşamalarda CMR konvansiyonu hükümleri geçerlidir. Bu doğrultuda taşıyıcı firma olarak sorumluluğumuz CMR konvansiyon hükümleriyle sınırlıdır.",
      "Komple TIR taşımalarında serbest süre yükleme için 24 saat, boşaltma için ise 48 saat olup; mevzu süreler aracın yükleme ve boşaltma yerlerine varışıyla başlar. Serbest sürelerin aşılması durumunda, bekleme yapılan beher gün için yükleme talimatını veren firmaya 180.-Euro fatura edilmektedir. Ayrıca, bekleme yapmadığı gerekçesi ile yükleme talimatının iptal edilmesi durumunda, navlun bedelinin %50’si tutarında “Boş navlun faturası” yükleme talimatını veren firmaya fatura edilir.",
      "Yazılı veya şifai olarak bildirilen tüm transit süreler; iş günü olarak ve gümrükten gümrüğe şeklinde iletilmekte olup, söz konusu süreler olağan şartlar için geçerli olan sürelerdir. Herhangi bir sebeple muhtemel ve tahmini olarak bildirilen transit sürelere uyulmaması durumunda Çakır Global Lojistik hiç bir şekilde gönderici veya alıcıya tazminat ödemekle yükümlü değildir.",
      "Teklifimizdeki navlun bedeli ödemenin yükleme talimatını veren firmanız tarafından yapılacağı kabul edilerek belirlenmistir.",
      "İş bu teklife bağlı ihtilafların halli için İstanbul Mahkemeleri ve İcra Dairelerinin yetkili olacağı taraflarca kabul edilmiştir.",
      "Teklifimizin özel şartlar kısmı ilgili yükleme için yirmi ( 20 ) maddeden oluşan iş bu navlun teklifi genel şartlarımız ise aksi yazılı olarak ayrıca taraflar arasında kararlaştırılmış olmadıkça firmanız ile firmamız arasında bu tarihten itibaren yapılacak tüm taşımalarda geçerlidir.",
    ],
    EN: [
      "If the order is not confirmed within 2 days, our offer will be considered invalid.",
      "Çakır Global Lojistik A.Ş. General Purchasing rules apply.",
      "Çakır Global Logistics order number and part numbers must be clearly stated in the invoice, waybill, package label and all other official correspondence content related to this order.",
      "Invoice payments will be in foreign currency of the invoice amount. Payment will be after delivery CMR.",
      "Under this agreement, our offer is considered approved when the loading instruction is received.",
      `For materials included in groupage loads;
      - In case our price offer is calculated over kg, 1 CBM = 333kg, 1 LDM = 1.750kg
      - In case our price offer is calculated over cbm, calculation is made on the basis of 1 CBM = 333kg, 1 LDM = 6.5 CBM. For bulky loads, volume is taken as kg.
      - In the price offers with a scale, if the lower freight of an upper scale is lower than the upper freight of a lower scale, the lower scale upper freight will be applied.`,
      "Our prices are based on Euro/kg; The maximum loading limit for each vehicles is 22.5 tons. In case of any excess tonnage and/or wrong loading, fines and similar applications are reflected to the company giving the loading instruction.",
      "The payment term is 0 days as of the invoice date. Collection transactions are carried out in the billed currency. Requesting calculation in TL currency. In case of payment, the Garanti Bank Box Office Sales rate on the day of collection is used, and it is requested to confirm the rate with us before making the payment. Çakır Global Logistics, price validity reserves the right to change these rates and/or apply CAF (Currency Adjustment Factor) in case of exchange rate fluctuations within the agreed period.",
      "Our offer is not valid for materials with out-of-gauge dimensions, refrigerated goods, dangerous goods and materials requiring convoy; It is valid for dry cargoes without special features.",
      "For materials in the ADR class, the flammable difference is also included in the freight, In partial shipments, the combustible cost is 150.-Euro; The flammable difference in complete transport is 200.-Euro.",
      "The materials to be shipped must be properly packaged and loaded into vehicles in order not to be damaged urung transportation. arising from the packaging of the goods or in direct downloads; Our company will not be held responsible for the damages caused by the installation error. Loading, stowing and unloading operations regardless of the international delivery method will be made entirely by the sender and the receiver; All responsibility regarding the subject (wrong loading & unloading, packaging error, etc.) belongs to the sender and the receiver.",
      "In export shipments, the company giving the loading instruction is responsible for any problems that may arise from any difference between the loading instruction and the export declaration exporter, importer and If any, the other person or company related to the shipment must have delivered the shipment documents to our company in full and on time. Otherwise, it may occur All costs are invoiced to the company giving the loading instruction.",
      "After the loading order is sent, the entire freight cost regarding the canceled cargoes 24 hours before the departure date is invoiced to the company that gave the loading instruction as an `empty freight invoice`.",
      "Freight costs incurred in Free Zone shipments are not included in our offer. Free Zone arrival and departure can be made if our vehicle situation is suitable; Free Zone Customs costs incurred in your imports and exports are invoiced separately as a minimum of 150.-Euro.",
      "All of our transports are within the scope and conditions of CMR insurance, and the CMR insurance covers a maximum of Sdr per gross kilogram at the time of damage. It pays 8.33 (approximately EUR 9.00 /kg). We recommend that you take out shipping insurance in case of damage. The work we have done is related to this transportation, from the moment of receipt of the goods to the delivery, including waiting in the warehouses. The provisions of the CMR convention are valid at all stages up to the moment of approval. In this respect, our responsibility as a carrier company is limited to the provisions of the CMR convention.",
      "For complete TIR transports , the free time is 24 hours for loading and 48 hours for unloading; The aforementioned times start with the arrival of the vehicle at the loading and unloading points. Exceeding free times In case of waiting, 180.-Euro is charged to the company that gave the loading order for each day of waiting. In addition, the cancellation of the loading order on the grounds that it does not wait. In this case, an `empty freight invoice` equaling 50% of the freight cost is invoiced to the company that gave the loading instruction.",
      "All transit times notified in writing or verbally; It is transmitted in business days and from customs to customs, and the said periods are valid for ordinary conditions. any Çakır Global Logistics is in no way obliged to pay compensation to the sender or receiver in case of non-compliance with the probable and estimated transit times for this reason.",
      "The freight cost in our offer has been determined by accepting that the payment will be made by your company giving the loading instruction.",
      "It has been accepted by the parties that Istanbul Courts and Enforcement Offices will be authorized for the settlement of disputes related to this offer.",
      "The special conditions part of our offer is our general conditions of this freight offer, which consists of seventeen (20) articles for the relevant shipment, unless otherwise agreed in writing between the parties. It is valid for all transports between your company and our company as of this date.",
    ],
  };

  const filesPopulate = () => {
    const data = state.filesData;
    let temp = [];
    if (state.filesData.length > 0) {
      for (let i = 0; i < data.length; i++) {
        temp.push(
          <Grid key={`files${i}`} className="none-print">
            <Grid.Col style={{ borderBottom: "1px solid black" }} my={10}>
              <Text>
                {data[i]}
                <ActionIcon
                  variant="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      deleteFile: true,
                      deleteData: data[i],
                    }))
                  }
                >
                  <Icons name="FaTrashAlt" color="black" />
                </ActionIcon>
              </Text>
            </Grid.Col>
          </Grid>
        );
      }
    }
    return temp;
  };

  const fileUpload = async (value) => {
    if (value.length !== 0) {
      const data = [];
      for (let k = 0; k < value.length; k++) {
        const fdata = new FormData();
        const fileName = `${value[k].name.replace(/[^\x00-\x7F]/g, "")}`;
        fdata.append("file", value[k]);
        fdata.append("filename", `${fileName}`);
        fdata.append("customerId", props.data.CustomerForm.Customer.id);
        fdata.append("customerName", props.data.companyName);
        fdata.append("purchasingRep", props.data.purchasingRep);
        fdata.append("cFormId", props.data.CustomerForm.id);
        const config = { headers: { "content-type": "multipart/form-data" } };
        const response = await axios.post(
          `${process.env.SERVER_IP}/api/insertFiles`,
          fdata,
          config
        );
        if (response.data.status) {
          notifications.show({
            title: t("success"),
            message: t("uploadsuccess"),
            color: "green",
            icon: <Icons name="FaRegCheckCircle" />,
            radius: "lg",
          });
          data.push(
            `${props.check ? props.data.uuId : props.uuId}-${value[k].name.replace(/[^\x00-\x7F]/g, "")}`
          );
          setState((prev) => {
            let newData = [...prev.filesData];
            newData.push(`${response.data.filename}`);
            return { ...prev, filesData: newData };
          });
        } else {
          notifications.show({
            title: t("error"),
            color: "red",
            icon: <Icons name="FaExclamationTriangle" />,
            radius: "lg",
          });
        }
      }
    }
  };

  const deleteElement = async (name) => {
    const delFile = await axios.post(
      `${process.env.SERVER_IP}/api/deleteFile`,
      {
        fileName: name,
        customerId: props.data.CustomerForm.Customer.id,
        customerName: props.data.companyName,
        purchasingRep: props.data.purchasingRep,
        relatedId: props.data.CustomerForm.id,
        check: false,
      }
    );
    if (delFile.data.status) {
      if (state.check) getData();
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
        deleteFile: false,
        deleteData: [],
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

  const convertOperation = async (values) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/createOperation`,
      values
    );
    if (response.data.success) {
      setState((prev) => ({ ...prev, opModal: false }));
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
        message: t(`${response.data.msg}`),
        color: "red",
        radius: "lg",
        icon: <Icons name="FaExclamationTriangle" />,
      });
    }
  };

  const deleteFreight = async (id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/deleteFreight`,
      { id: id }
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
        title: `${t("freightpassiveerror")}${response.data.msg}`,
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
        autoClose: 7000,
      });
    }
  };

  const changeActive = async (id) => {
    const response = await axios.post(
      `${process.env.SERVER_IP}/api/activedFreight`,
      { id: id }
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
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
        autoClose: 7000,
      });
    }
  };

  const copyUrl = async (type) => {
    const formlink = await axios.post(`${process.env.SERVER_IP}/api/getLink`, {
      id: props.data.id,
    });
    if (formlink.data.success) {
      if (type === "customerform") {
        const linkValue = `${process.env.SERVER_IP}/customerform?&uuId=${formlink.data.data.CustomerForm.uuId}&id=${formlink.data.data.CustomerForm.id}`;
        navigator.clipboard.writeText(linkValue).then(() => {
          notifications.show({
            title: t("copysuccessful"),
            color: "green",
            radius: "lg",
            icon: <Icons name="FaRegCheckCircle" />,
            autoClose: 5000,
          });
        });
      } else {
        const linkValue = `${process.env.SERVER_IP}/offer?&uuId=${formlink.data.data.CustomerForm.uuId}&id=${props.data.id}`;
        navigator.clipboard.writeText(linkValue).then(() => {
          notifications.show({
            title: t("copysuccessful"),
            color: "green",
            radius: "lg",
            icon: <Icons name="FaRegCheckCircle" />,
            autoClose: 5000,
          });
        });
      }
    } else {
      notifications.show({
        title: t("error"),
        color: "red",
        icon: <Icons name="FaExclamationTriangle" />,
        radius: "lg",
      });
    }
    getData();
  };

  useEffect(() => {
    getData();
    changeLanguage(props.customer ? props.lang : props.userAgent.lang);
    console.log("Offers mounted");
    return () => {
      console.log("Offers unmounted");
    };
  }, [props.type]);

  const populateDetail = () => {
    const details = [];
    if (props.customer) {
      detail = props.lang === "tr" ? detail.TR : detail.EN;
    } else {
      detail = props.userAgent.lang === "tr" ? detail.TR : detail.EN;
    }
    for (let i = 0; i < detail.length; i++) {
      details.push(
        <Grid.Col style={{ marginLeft: 10, padding: 0 }} key={`detail${i}`}>
          <Text style={{ fontSize: 10 }}>
            {i + 1} - {detail[i]}
          </Text>
        </Grid.Col>
      );
    }
    return details;
  };

  const rows = (
    <Table.Tr>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.Addresses
          ? props.data.Addresses.filter((x) => x.type === "loadingpoint")
              .map((x) => x.address)
              .join(", ")
          : ""}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.productType}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.Addresses
          ? props.data.Addresses.filter((x) => x.type === "deliveryaddress")
              .map((x) => x.address)
              .join(", ")
          : ""}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.weightType ? t(`${props.data.weightType}`) : ""}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.YDG && props.data.type == "international"
          ? `${props.data.cash} ${t(`${props.data.currency}`)} + YDG`
          : !props.data.YDG && props.data.type == "international"
            ? `${props.data.cash} ${t(`${props.data.currency}`)}`
            : `${props.data.price} ${t(`${props.data.currency}`)} + KDV`}
      </Table.Td>
      {props.type === "domestic" && (
        <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
          {`${props.data.cash} ${t(`${props.data.currency}`)}`}
        </Table.Td>
      )}
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {DateTime.fromISO(props.data.loadDate).toFormat("dd-MM-yyyy")}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {`${props.data.deliveryDate} ${t("day")}` || ""}
      </Table.Td>
      <Table.Td style={{ textAlign: "center", fontSize: 10 }}>
        {props.data.shippingType ? t(props.data.shippingType) : ""}
      </Table.Td>
    </Table.Tr>
  );

  const ths = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("loadingpoint")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("producttype")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("deliveryaddress")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("weight")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("freightquote")}
      </Table.Th>
      {props.type === "domestic" && (
        <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
          {t("totalprice")}
        </Table.Th>
      )}
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("loadingdate")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("deliveryduration")}
      </Table.Th>
      <Table.Th style={{ textAlign: "center", fontSize: 10 }}>
        {t("shippingtype")}
      </Table.Th>
    </Table.Tr>
  );

  return (
    <>
      {state.loading ? (
        <Loading />
      ) : (
        <>
          <Grid>
            <Grid.Col
              mt={30}
              span={{ base: 12, xs: 12, sm: 8 }}
              align={width < 775 ? "center" : "flex-start"}
            >
              <Image
                alt="logo"
                src="/images/Cakir-lojistik-crop.png"
                h={width < 775 ? 250 : 100}
                w="auto"
              />
            </Grid.Col>
            {props.customer && (
              <Grid.Col className="none-print" ml={20}>
                <Flex
                  mih={50}
                  gap="md"
                  justify="flex-start"
                  align="center"
                  direction="row"
                  wrap="wrap"
                >
                  <Button
                    className="buttons"
                    leftSection={<Icons name="MdLanguage" size={20} />}
                    onClick={() =>
                      setLanguage(router.locale === "en" ? "tr" : "en")
                    }
                  >
                    {t("changelanguage")}
                  </Button>
                  {!props.data.Confirmation &&
                  props.data.type !== "domestic" ? (
                    <Button
                      className="buttons"
                      onClick={() =>
                        setState((prev) => ({ ...prev, confirmModal: true }))
                      }
                    >
                      {t("confirmfreightform")}
                    </Button>
                  ) : null}
                </Flex>
              </Grid.Col>
            )}
            <Grid.Col
              span={{ base: 12, xs: 12, sm: 4, md: 4, lg: 4, xl: 4 }}
              align="flex-start"
              mt={30}
              ml={20}
            >
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                {process.env.COMPANY}
              </Text>
              <Text style={{ fontSize: 10 }}>
                {process.env.COMPANY_ADDRESS}
              </Text>
              <Text
                style={{ fontSize: 10 }}
              >{`${t("phone")}: ${process.env.PHONE_NUMBER}`}</Text>
            </Grid.Col>
            <Grid.Col
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <h5>
                {props.data.shippingType === "roadtransport"
                  ? t("roadfreightquote")
                  : props.data.shippingType === "martimetransport"
                    ? t("seafreightquote")
                    : props.data.shippingType === "railtransport"
                      ? t("railfreightquote")
                      : t("airfreightquote")}
              </h5>
            </Grid.Col>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Flex
                w="100%"
                direction="column"
                align="flex-start"
                justify="flex-start"
              >
                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {t("companyname")}:
                  </strong>{" "}
                  {props.data.companyName}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {t("companyaddress")}:
                  </strong>
                  {props.data.companyAddress}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {" "}
                    {t("relatedperson")}:
                  </strong>
                  {props.data.relatedPerson}
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Flex
                w="100%"
                direction="column"
                align={width < 775 ? "flex-start" : "flex-end"}
                justify={width < 775 ? "flex-start" : "flex-end"}
              >
                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {" "}
                    {t("referancecode")}:{" "}
                  </strong>{" "}
                  {`${state.refKey}${props.data.referanceCode}`}
                </Text>

                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {" "}
                    {t("orderdate")}:
                  </strong>{" "}
                  {DateTime.fromISO(props.data.orderDate).toFormat(
                    "dd-MM-yyyy"
                  )}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  <strong style={{ marginRight: "10px" }}>
                    {" "}
                    {t("purchasingrepresentative")}:{" "}
                  </strong>{" "}
                  {state.user}
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={6}>
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Text style={{ fontSize: 10 }}>{t("dear")}</Text>
                <Text style={{ marginLeft: 5, fontSize: 10 }}>
                  {`${props.data.relatedPerson} ,`}
                </Text>
              </div>
            </Grid.Col>
          </Grid>
          <Grid>
            <Table
              style={{ marginBottom: 20 }}
              striped
              withColumnBorders
              withRowBorders={false}
            >
              <Table.Thead>{ths}</Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            {populateDetail()}
            <Grid.Col>
              <div>
                <Text style={{ marginLeft: 20, fontSize: 10 }}>
                  {t("kindregards")},
                </Text>
              </div>
              {width < 750 && (
                <Text
                  w="100%"
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                    marginTop: "20px",
                    textAlign: "center",
                  }}
                >
                  {t("iaccept")}
                </Text>
              )}
              <Flex
                mt={50}
                align="flex-start"
                w="100%"
                direction="row"
                justify="space-between"
              >
                <Flex
                  align="flex-start"
                  justify="center"
                  direction="column"
                  ta="left"
                >
                  <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                    {t("companyname")}:
                  </Text>
                  <Text
                    style={{ marginTop: 20, fontWeight: "bold", fontSize: 12 }}
                  >
                    {t("signaturestamp")}:
                  </Text>
                </Flex>
                {width > 750 && (
                  <Text style={{ fontWeight: "bold", fontSize: 10 }}>
                    {t("iaccept")}
                  </Text>
                )}
                <Flex
                  mr={27}
                  ta="right"
                  align="flex-end"
                  justify="center"
                  direction="column"
                >
                  <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                    {t("companypaymentdetails")}
                  </Text>
                  <Text>
                    {props.data.cMaturityDay
                      ? `${t("maturity")}: ${props.data.cMaturityDay} ${t("day")}`
                      : ""}
                  </Text>
                  <Text>
                    {`${t("paymentmethod")}: ${t(`${props.data.cPaymentMethod}`)}`}
                  </Text>
                </Flex>
              </Flex>
            </Grid.Col>
            <Grid.Col
              className="none-print"
              style={
                props.customer && {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }
              }
            >
              {!props.customer ? (
                <SimpleGrid
                  cols={{ base: 2, sm: 4, md: 4, lg: 4, xl: 4 }}
                  m="auto"
                  maw={760}
                  mt={70}
                >
                  {props.data.status === "active" ||
                  props.data.status === "passive" ||
                  props.customer ? null : (
                    <Button
                      className="buttons"
                      disabled={!state.checkFormId || !props.data.active}
                      onClick={() =>
                        setState((prev) => ({ ...prev, opModal: true }))
                      }
                    >
                      {t("converttooperation")}
                    </Button>
                  )}
                  <>
                    <Button
                      disabled={!props.data.active}
                      className="buttons"
                      onClick={() => copyUrl("customerform")}
                    >
                      {`Link (${t("customerform")})`}
                    </Button>
                    <Button
                      disabled={!props.data.active}
                      className="buttons"
                      onClick={() => copyUrl("offer")}
                    >
                      {`Link (${t("freightform")})`}
                    </Button>
                    <Button
                      disabled={!props.data.active}
                      className="buttons"
                      onClick={() => {
                        setState((prev) => ({ ...prev, freightForm: true }));
                      }}
                    >
                      {t("update")}
                    </Button>
                    <Button
                      className="buttons"
                      onClick={() => {
                        props.data.active
                          ? setState((prev) => ({ ...prev, deleteModal: true }))
                          : changeActive(props.data.id);
                      }}
                    >
                      {props.data.active ? t("delete") : t("active")}
                    </Button>
                  </>
                </SimpleGrid>
              ) : (
                <>
                  {filesPopulate()}
                  <Dropzone
                    className="none-print"
                    w="30%"
                    bg="#F4F4F4"
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
                        fileUpload([file]);
                      });
                    }}
                  >
                    <Group
                      spacing="xl"
                      justify="center"
                      style={{
                        minHeight: 100,
                        pointerEvents: "none",
                        marginTop: 15,
                      }}
                    >
                      <Dropzone.Idle>
                        <Icons name="FaFileUpload" size={30} />
                      </Dropzone.Idle>
                      <Text size="xl" inline>
                        {t(`uploadfile`)}
                      </Text>
                    </Group>
                  </Dropzone>
                </>
              )}
            </Grid.Col>
          </Grid>
          <Modal
            {...modalStyle}
            size="sm"
            scrollAreaComponent={ScrollArea.Autosize}
            opened={state.opModal}
            onClose={() => setState((prev) => ({ ...prev, opModal: false }))}
          >
            <Grid>
              <Grid.Col>
                <Text style={{ marginTop: 10 }}>{t("convert")}</Text>
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
                  onClick={() =>
                    convertOperation({
                      freightId: props.data.id,
                      operationName: `${state.refKey}${props.data.referanceCode}`,
                      creatorId: props.userAgent.id,
                      date: new Date(),
                      status: "operationstarted",
                      active: true,
                      type: props.type,
                      userIds: [props.userAgent.id],
                      companyName: props.data.companyName,
                      cPaymentDay: props.data.cMaturityDay,
                      sPaymentDay: props.data.sMaturityDay,
                      price: props.data.price,
                      cLastPayDay: props.data.cLastPayDay,
                      sLastPayDay: props.data.sLastPayDay,
                    })
                  }
                >
                  {t("yes")}
                </Button>
                <Button
                  className="buttons"
                  onClick={() =>
                    setState((prev) => ({ ...prev, opModal: false }))
                  }
                >
                  {t("no")}
                </Button>
              </Grid.Col>
            </Grid>
          </Modal>
          <Modal
            size="70rem"
            scrollAreaComponent={ScrollArea.Autosize}
            opened={state.freightForm}
            closeOnClickOutside={false}
            onClose={() =>
              setState((prev) => ({ ...prev, freightForm: false }))
            }
            {...modalStyle}
          >
            <FreightForm
              getData={props.getData}
              set={setState}
              userAgent={props.userAgent}
              type={props.type}
              data={props.data}
              edit={true}
              general={props.general}
              relatedPersons={state.relatedPersons}
            />
          </Modal>
        </>
      )}
      <Modal
        {...modalStyle}
        opened={state.deleteModal}
        onClose={() => setState((prev) => ({ ...prev, deleteModal: false }))}
      >
        <Grid>
          <Grid.Col>
            <Text style={{ marginTop: 10 }}>{t("areusuredeletefreight")}</Text>
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
              onClick={() => deleteFreight(props.data.id)}
            >
              {t("yes")}
            </Button>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({ ...prev, deleteModal: false }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        {...modalStyle}
        opened={state.deleteFile}
        onClose={() =>
          setState((prev) => ({ ...prev, deleteFile: false, deleteData: [] }))
        }
      >
        <Grid>
          <Grid.Col>
            {router.locale === "tr"
              ? `${state.deleteData} ${t("areusuredeletefile")}`
              : `${t("areusuredeletefile")} ${state.deleteData} ?`}
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
              onClick={() => deleteElement(state.deleteData)}
            >
              {t("yes")}
            </Button>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  deleteFile: false,
                  deleteData: [],
                }))
              }
            >
              {t("no")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
      <Modal
        closeOnClickOutside={false}
        size="70rem"
        opened={state.confirmModal}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            confirmModal: false,
            name: "",
            lastName: "",
          }))
        }
      >
        {kvkkText(router.locale)}
        <br />
        <br />
        <br />
        <Grid>
          <strong>{t("confirmfreight")}</strong>
          <Grid.Col>
            <TextInput
              label={t("firstname")}
              value={state.name}
              onChange={(e) =>
                setState((prev) => ({ ...prev, name: e.target.value.trim() }))
              }
            />
          </Grid.Col>
          <Grid.Col>
            <TextInput
              label={t("surname")}
              value={state.lastName}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  lastName: e.target.value.trim(),
                }))
              }
            />
          </Grid.Col>
          <Grid.Col
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button className="buttons" onClick={() => confirmFreight()}>
              {t("iagree")}
            </Button>
            <Button
              className="buttons"
              onClick={() =>
                setState((prev) => ({ ...prev, confirmModal: false }))
              }
            >
              {t("idisagree")}
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
};
export default Offers;
