import { Modal, Image } from "@mantine/core";

const ImageModal = ({ opened, onClose, src }) => {
  return (
    <Modal
      fullScreen
      opened={opened}
      styles={{
        modal: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
      onClose={onClose}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Image
          h="auto"
          w="auto"
          src={src}
          alt="AttachmentImage"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>
    </Modal>
  );
};

export default ImageModal;
