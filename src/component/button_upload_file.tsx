import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import { uploadImage } from "../services/file_service";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Props {
  onUploadSuccess: (fileUrl: string) => void;
}
const InputFileUpload: React.FC<Props> = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);

  //Xử lý upload hinh ảnh
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileName = await uploadImage(file);

      console.log(fileName);
      onUploadSuccess(fileName);

    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      alert("Upload ảnh thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      sx={{ backgroundColor: "rgba(92, 83, 250, 1)" }}
    >
      Upload ảnh
      <VisuallyHiddenInput
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
    </Button>
  );
};

export default InputFileUpload;
