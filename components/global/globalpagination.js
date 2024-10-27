import { Pagination, Flex, Select } from "@mantine/core";
import useTranslation from "next-translate/useTranslation";
import { useEffect } from "react";
import { useViewportSize } from "@mantine/hooks";

const GlobalPagination = ({ getData, page, perPage, total }) => {
  const { t } = useTranslation("common");
  const { width } = useViewportSize();

  useEffect(() => {
    console.log("globalpagination mounted");
    return () => {
      console.log("globalpagination unmounted");
    };
  }, []);

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={20}
      style={{ fontSize: 14, margin: 10 }}
      direction={{
        base: "column",
        xs: "column",
        sm: "row",
        md: "row",
        lg: "row",
        xl: "row",
      }}
    >
      {width > 770 ? (
        <>
          {t("total")} : {total}
          <Flex
            align="center"
            gap={10}
            direction={{
              base: "column",
              xs: "column",
              sm: "row",
              md: "row",
              lg: "row",
              xl: "row",
            }}
          >
            <Select
              className="pagination-select"
              style={{ marginRight: 10 }}
              onChange={(e) => getData({ page: 1, perPage: e })}
              data={["10", "20", "30", "50", "100"]}
              value={perPage}
            />
            <Pagination
              color="dark"
              size="sm"
              total={
                total % Number(perPage) === 0
                  ? total / Number(perPage)
                  : Math.floor(total / Number(perPage)) + 1
              }
              value={page}
              onChange={(e) => getData({ page: e })}
            />
          </Flex>
        </>
      ) : (
        <>
          <Flex align="center" justify="space-between" gap={10} direction="row">
            {t("total")} : {total}
            <Select
              className="pagination-select"
              style={{ marginRight: 10 }}
              onChange={(e) => getData({ page: 1, perPage: e })}
              data={["10", "20", "30", "50", "100"]}
              value={perPage}
            />
          </Flex>
          <Pagination
            size="sm"
            total={
              total % Number(perPage) === 0
                ? total / Number(perPage)
                : Math.floor(total / Number(perPage)) + 1
            }
            value={page}
            onChange={(e) => getData({ page: e })}
          />
        </>
      )}
    </Flex>
  );
};
export default GlobalPagination;
