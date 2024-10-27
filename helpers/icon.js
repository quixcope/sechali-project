import {
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaTrashAlt,
  FaFileUpload,
  FaTruckMoving,
  FaReply,
  FaUserPlus,
  FaHome,
  FaEye,
  FaMoneyBillAlt,
} from "react-icons/fa";
import {
  AiOutlineClose,
  AiOutlinePlusSquare,
  AiFillDelete,
  AiOutlineMergeCells,
  AiOutlineFolderView,
  AiOutlineCheck,
} from "react-icons/ai";
import { RiShareForward2Fill } from "react-icons/ri";
import { BiMailSend, BiSolidOffer, BiSearchAlt } from "react-icons/bi";
import { MdSubject, MdOutlineSettings } from "react-icons/md";
import { ImAttachment, ImBlocked } from "react-icons/im";
import { LiaShippingFastSolid, LiaFileInvoiceSolid } from "react-icons/lia";
import {
  FaDownload,
  FaHourglassStart,
  FaTruckPlane,
  FaBookBookmark,
  FaRegNoteSticky,
  FaPeopleGroup,
} from "react-icons/fa6";
import { IoLanguageOutline, IoPersonSharp } from "react-icons/io5";
import { GrPowerCycle } from "react-icons/gr";
import {
  MdClear,
  MdOutlinePreview,
  MdMarkEmailRead,
  MdLanguage,
  MdSignalWifiStatusbarConnectedNoInternet2,
} from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { CiSettings } from "react-icons/ci";
import { IoMdPower } from "react-icons/io";
import { CgDanger } from "react-icons/cg";
import { HiOutlinePlusSm } from "react-icons/hi";
import { FcSearch } from "react-icons/fc";
import { GoX } from "react-icons/go";
import { TbReload } from "react-icons/tb";
import {
  PiNumberCircleOneBold,
  PiNumberCircleTwoBold,
  PiNumberCircleThreeBold,
  PiNumberCircleFourBold,
  PiNumberCircleFiveBold,
  PiNumberCircleSixBold,
  PiNumberCircleSevenBold,
  PiNumberCircleEightBold,
  PiNumberCircleNineBold,
} from "react-icons/pi";
import { HiMiniPlusSmall } from "react-icons/hi2";

const Icons = (props) => {
  let icons = {
    MdSignalWifiStatusbarConnectedNoInternet2: (
      <MdSignalWifiStatusbarConnectedNoInternet2
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    TbReload: (
      <TbReload
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    GoX: (
      <GoX
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FcSearch: (
      <FcSearch
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaEye: (
      <FaEye
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiOutlineCheck: (
      <AiOutlineCheck
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiOutlineClose: (
      <AiOutlineClose
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdLanguage: (
      <MdLanguage
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    HiOutlinePlusSm: (
      <HiOutlinePlusSm
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    CgDanger: (
      <CgDanger
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdOutlineSettings: (
      <MdOutlineSettings
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    IoPersonSharp: (
      <IoPersonSharp
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaPeopleGroup: (
      <FaPeopleGroup
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaRegNoteSticky: (
      <FaRegNoteSticky
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    LiaFileInvoiceSolid: (
      <LiaFileInvoiceSolid
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaBookBookmark: (
      <FaBookBookmark
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    BiSolidOffer: (
      <BiSolidOffer
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaHome: (
      <FaHome
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    IoMdPower: (
      <IoMdPower
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    ImBlocked: (
      <ImBlocked
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdMarkEmailRead: (
      <MdMarkEmailRead
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    CiSettings: (
      <CiSettings
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaUserPlus: (
      <FaUserPlus
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    RxCross1: (
      <RxCross1
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdOutlinePreview: (
      <MdOutlinePreview
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdClear: (
      <MdClear
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    GrPowerCycle: (
      <GrPowerCycle
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiOutlineFolderView: (
      <AiOutlineFolderView
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    ImAttachment: (
      <ImAttachment
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    BiMailSend: (
      <BiMailSend
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    MdSubject: (
      <MdSubject
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiFillDelete: (
      <AiFillDelete
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    RiShareForward2Fill: (
      <RiShareForward2Fill
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaReply: (
      <FaReply
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiOutlinePlusSquare: (
      <AiOutlinePlusSquare
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    AiOutlineMergeCells: (
      <AiOutlineMergeCells color={props.color} size={props.size} />
    ),
    IoLanguageOutline: (
      <IoLanguageOutline
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaTrashAlt: (
      <FaTrashAlt
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    LiaShippingFastSolid: (
      <LiaShippingFastSolid
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaTruckPlane: (
      <FaTruckPlane
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaTruckMoving: (
      <FaTruckMoving
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaHourglassStart: (
      <FaHourglassStart
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaFileUpload: (
      <FaFileUpload
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaRegCheckCircle: (
      <FaRegCheckCircle
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaExclamationTriangle: (
      <FaExclamationTriangle
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    FaDownload: (
      <FaDownload
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleOneBold: (
      <PiNumberCircleOneBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleTwoBold: (
      <PiNumberCircleTwoBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleThreeBold: (
      <PiNumberCircleThreeBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleFourBold: (
      <PiNumberCircleFourBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleFiveBold: (
      <PiNumberCircleFiveBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleSixBold: (
      <PiNumberCircleSixBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleSevenBold: (
      <PiNumberCircleSevenBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleEightBold: (
      <PiNumberCircleEightBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    PiNumberCircleNineBold: (
      <PiNumberCircleNineBold
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    HiMiniPlusSmall: (
      <HiMiniPlusSmall
        style={{ opacity: props.opacity }}
        color={props.color}
        size={props.size}
      />
    ),
    BiSearchAlt: <BiSearchAlt size={props.size} />,
    FaMoneyBillAlt: <FaMoneyBillAlt size={props.size} />,
  };

  return icons[props.name];
};

export default Icons;
