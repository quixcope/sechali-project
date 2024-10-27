import { useEffect, useCallback, useState } from "react";

const useContextMenu = (outerRef) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleContextMenu = useCallback(
    (event) => {
      if (outerRef || outerRef.current.contains(event.target)) {
        setAnchorPoint({ x: event.pageX, y: event.pageY });
        setShow(true);
      }
    },
    [setShow, outerRef, setAnchorPoint]
  );

  const handleClick = useCallback(() => setShow(false), []);
  const handleScroll = useCallback(
    () => (show ? setShow(false) : null),
    [show]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("scroll", handleScroll);
    };
  });

  return { anchorPoint, show };
};

export default useContextMenu;
