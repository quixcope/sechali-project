import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.js";
import { Pagination, Grid, Flex } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import Loading from "./loading";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const PDFViewer = ({ file }) => {
  const { width } = useViewportSize();
  const [numPages, setNumPages] = useState(null);
  const [state, setState] = useState({
    page: 1,
    loading: true,
    filePath: file,
  });

  useEffect(() => {
    if (file) {
      setState((prev) => ({ ...prev, loading: false }));
    }
    console.log("PDFViewer mounted");
    return () => {
      console.log("PDFViewer unmounted");
    };
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (page) => {
    setState((prev) => ({ ...prev, page }));
  };

  return state.loading ? (
    <Loading />
  ) : (
    <Grid style={{ padding: 0, margin: 0, width: "100%" }}>
      <Grid.Col style={{ padding: 10 }}>
        <Pagination
          color="dark"
          radius="md"
          total={numPages || 1}
          value={state.page}
          onChange={changePage}
        />
      </Grid.Col>
      <Grid.Col>
        <Flex w="100%" justify="center" align="center" h="100%">
          <Document
            file={state.filePath}
            onLoadSuccess={(e) => onDocumentLoadSuccess(e)}
            loading={<Loading />}
          >
            <Page
              pageNumber={state.page}
              width={width > 1000 ? width - (width / 3) * 1.5 : width}
              renderAnnotationLayer={false}
            />
          </Document>
        </Flex>
      </Grid.Col>
    </Grid>
  );
};
export default PDFViewer;
