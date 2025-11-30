import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DocumentData, NewCourseState } from "../pages/admin/add_course";
import InputFileUpload from "./button_upload_file";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { getImageUrl } from "../services/file_service";

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

// Kiểu dữ liệu tạm thời cho document đang thêm
const initialNewDocumentState: Omit<DocumentData, "hinh"> & { hinh: string } = {
  tenfile: "",
  link: "",
  mota: "",
  hinh: "",
};

function a11yProps(index: number, moduleIndex: number) {
  return {
    id: `module-${moduleIndex}-tab-${index}`,
    "aria-controls": `module-${moduleIndex}-tabpanel-${index}`,
  };
}

interface EditingContent {
  moduleIndex: number;
  contentIndex: number;
  tennoidung: string;
}

const Step3Content: React.FC<Props> = ({ data, setData }) => {
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: number }>({});
  const [newContent, setNewContent] = useState("");
  const [isSuccess, setIsSuccess] = useState<Boolean>(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [currentDocModuleIndex, setCurrentDocModuleIndex] = useState<
    number | null
  >(null);
  const [editingDocIndex, setEditingDocIndex] = useState<number | null>(null);
  const [docFormData, setDocFormData] = useState(initialNewDocumentState);

  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<EditingContent | null>(
    null
  );

  const handleTabChange = (moduleIndex: number, newValue: number) => {
    setActiveTabs((prev) => ({ ...prev, [moduleIndex]: newValue }));
  };

  const handleAddContent = (moduleIndex: number, event: React.FormEvent) => {
    event.preventDefault()
    if (newContent.trim() === "") return;
    const newModules = data.modules.map((mod, index) => {
      if (index === moduleIndex) {
        const updatedNoidung = [
          ...(mod.noidung || []),
          { tennoidung: newContent },
        ];
        return { ...mod, noidung: updatedNoidung };
      }
      return mod;
    });
    setData((prev) => ({ ...prev, modules: newModules }));
    setNewContent("");
  };

  const handleRemoveContent = (moduleIndex: number, contentIndex: number) => {
    const newModules = data.modules.map((mod, index) => {
      if (index === moduleIndex) {
        const updatedNoidung = (mod.noidung || []).filter(
          (_, i) => i !== contentIndex
        );
        return { ...mod, noidung: updatedNoidung };
      }
      return mod;
    });
    setData((prev) => ({ ...prev, modules: newModules }));
  };

  const handleOpenEditContentDialog = (
    moduleIndex: number,
    contentIndex: number,
    currentContent: { tennoidung: string }
  ) => {
    setEditingContent({
      moduleIndex,
      contentIndex,
      tennoidung: currentContent.tennoidung,
    });
    setContentDialogOpen(true);
  };

  const handleCloseEditContentDialog = () => {
    setContentDialogOpen(false);
    setEditingContent(null);
  };

  const handleSaveContentChanges = () => {
    if (!editingContent || editingContent.tennoidung.trim() === "") return;
    const { moduleIndex, contentIndex, tennoidung } = editingContent;
    const newModules = data.modules.map((mod, mIndex) => {
      if (mIndex === moduleIndex) {
        const updatedNoidung = (mod.noidung || []).map((content, cIndex) =>
          cIndex === contentIndex
            ? { ...content, tennoidung: tennoidung }
            : content
        );
        return { ...mod, noidung: updatedNoidung };
      }
      return mod;
    });
    setData((prev) => ({ ...prev, modules: newModules }));
    handleCloseEditContentDialog();
  };

  const handleOpenAddDocDialog = (moduleIndex: number) => {
    setCurrentDocModuleIndex(moduleIndex);
    setEditingDocIndex(null);
    setDocFormData(initialNewDocumentState);
    setDocDialogOpen(true);
  };

  const handleOpenEditDocDialog = (
    moduleIndex: number,
    docIndex: number,
    docData: DocumentData
  ) => {
    setCurrentDocModuleIndex(moduleIndex);
    setEditingDocIndex(docIndex);
    setDocFormData({ ...docData, hinh: docData.hinh || "" });
    setDocDialogOpen(true);
  };

  const handleCloseDocDialog = () => {
    setDocDialogOpen(false);
    setCurrentDocModuleIndex(null);
    setEditingDocIndex(null);
    setIsSuccess(false);
  };

  const handleDocFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDocFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocImageUpload = (imageUrl: string) => {
    setDocFormData((prev) => ({ ...prev, hinh: imageUrl }));
    setIsSuccess(true);
    const url = getImageUrl(imageUrl);
    setImgUrl(url);
  };

  const handleSaveDocument = () => {
    if (currentDocModuleIndex === null || !docFormData.tenfile) return;

    const isEditing = editingDocIndex !== null;
    const newModules = data.modules.map((mod, mIndex) => {
      if (mIndex === currentDocModuleIndex) {
        let updatedTailieu;
        if (isEditing) {
          // Update existing document
          updatedTailieu = (mod.tailieu || []).map((doc, dIndex) =>
            dIndex === editingDocIndex ? { ...docFormData } : doc
          );
        } else {
          // Add new document
          updatedTailieu = [...(mod.tailieu || []), { ...docFormData }];
        }
        return { ...mod, tailieu: updatedTailieu };
      }
      return mod;
    });
    setData((prev) => ({ ...prev, modules: newModules }));
    handleCloseDocDialog();
  };
  const handleRemoveDocument = (moduleIndex: number, docIndex: number) => {
    const newModules = [...data.modules];
    newModules[moduleIndex].tailieu = newModules[moduleIndex].tailieu.filter(
      (_, i) => i !== docIndex
    );
    setData((prev) => ({ ...prev, modules: newModules }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chi tiết chương trình học
      </Typography>
      {data.modules.map((module, moduleIndex) => (
        <Accordion
          key={moduleIndex}
          TransitionProps={{ unmountOnExit: true }}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{`Module ${moduleIndex + 1}: ${module.tenmodule
              }`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTabs[moduleIndex] || 0}
                onChange={(_, val) => handleTabChange(moduleIndex, val)}
                aria-label={`Nội dung và tài liệu cho ${module.tenmodule}`}
              >
                <Tab label="Nội dung bài học" {...a11yProps(0, moduleIndex)} />
                <Tab label="Tài liệu" {...a11yProps(1, moduleIndex)} />
              </Tabs>
            </Box>

            {/* ==================== TAB NỘI DUNG ==================== */}
            {(activeTabs[moduleIndex] === 0 ||
              activeTabs[moduleIndex] === undefined) && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Thêm nội dung bài học
                  </Typography>
                  <Box component="form" onSubmit={(event) => handleAddContent(moduleIndex, event)} sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      label="Tên nội dung"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      type="submit"
                      size="small"
                    >
                      Thêm
                    </Button>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Danh sách nội dung
                  </Typography>
                  <List dense>
                    {(module.noidung || []).map((content, contentIndex) => (
                      <ListItem
                        key={contentIndex}
                        alignItems="flex-start"
                        secondaryAction={
                          <>
                            <IconButton
                              edge="end"
                              size="small"
                              sx={{ mr: 0.5 }}
                              onClick={() =>
                                handleOpenEditContentDialog(
                                  moduleIndex,
                                  contentIndex,
                                  content
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveContent(moduleIndex, contentIndex)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        }
                      >
                        <ListItemText
                          primary={content.tennoidung}
                          sx={{
                            whiteSpace: "normal",
                            width: '100%',
                            overflowWrap: 'break-word',
                            mr: 7
                          }}
                        />
                      </ListItem>
                    ))}
                    {(!module.noidung || module.noidung.length === 0) && (
                      <Typography variant="body2" color="textSecondary">
                        Chưa có nội dung nào.
                      </Typography>
                    )}
                  </List>
                </Box>
              )}

            {/* ==================== TAB TÀI LIỆU ==================== */}
            {activeTabs[moduleIndex] === 1 && (
              <Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddDocDialog(moduleIndex)}
                  sx={{ mb: 2 }}
                >
                  Thêm tài liệu mới
                </Button>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Danh sách tài liệu
                </Typography>
                <List dense>
                  {(module.tailieu || []).map((doc, docIndex) => (
                    <ListItem
                      key={docIndex}
                      secondaryAction={
                        <>
                          <IconButton
                            edge="end"
                            size="small"
                            sx={{ mr: 0.5 }}
                            onClick={() =>
                              handleOpenEditDocDialog(
                                moduleIndex,
                                docIndex,
                                doc
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveDocument(moduleIndex, docIndex)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      }
                    >
                      <ListItemText
                        primary={doc.tenfile}
                        secondary={doc.mota}
                        sx={{
                          whiteSpace: "normal",
                          width: '100%',
                          overflowWrap: 'break-word',
                          mr: 7
                        }}
                      />
                    </ListItem>
                  ))}
                  {(!module.tailieu || module.tailieu.length === 0) && (
                    <Typography variant="body2" color="textSecondary">
                      Chưa có tài liệu nào.
                    </Typography>
                  )}
                </List>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialog thêm/sửa tài liệu */}
      <Dialog
        open={docDialogOpen}
        onClose={handleCloseDocDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDocIndex !== null
            ? "Chỉnh sửa tài liệu"
            : "Thêm tài liệu mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                name="tenfile"
                label="Tên file/tài liệu"
                fullWidth
                value={docFormData.tenfile}
                onChange={handleDocFormChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="link"
                label="Link (nếu có)"
                fullWidth
                value={docFormData.link}
                onChange={handleDocFormChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="mota"
                label="Mô tả"
                fullWidth
                multiline
                rows={2}
                value={docFormData.mota}
                onChange={handleDocFormChange}
              />
            </Grid>

            {imgUrl && (
              <Grid size={{ xs: 12, md: 7 }}>
                <Box component="img" src={imgUrl} width="80%" />
              </Grid>
            )}

            <Grid size={{ xs: 4, md: 5 }}>
              <InputFileUpload onUploadSuccess={handleDocImageUpload} />
            </Grid>

            <Grid size={{ xs: 12 }} display={isSuccess ? "block" : "none"}>
              <Typography variant="h6" fontWeight="bold" color="green">
                Upload ảnh bìa thành công
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocDialog}>Hủy</Button>
          <Button onClick={handleSaveDocument} variant="contained">
            {editingDocIndex !== null ? "Lưu thay đổi" : "Lưu tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== DIALOG SỬA NỘI DUNG ==================== */}
      <Dialog
        open={contentDialogOpen}
        onClose={handleCloseEditContentDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên nội dung"
            type="text"
            fullWidth
            variant="outlined"
            value={editingContent?.tennoidung || ""}
            onChange={(e) =>
              setEditingContent((prev) =>
                prev ? { ...prev, tennoidung: e.target.value } : null
              )
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={handleCloseEditContentDialog}>Hủy</Button>
          <Button onClick={handleSaveContentChanges} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Step3Content;
