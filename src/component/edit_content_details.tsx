// src/component/EditContentDetails.tsx
import React, { useState, useEffect } from "react";
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
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import InputFileUpload from "./button_upload_file";
import { getImageUrl, updateModule } from "../services/course_service";
import {
  ContentData,
  DocumentDataForModule,
  ModuleData,
} from "../model/module_model";
import { ModuleUpdateRequest } from "../model/course_model";

interface Props {
  modules: ModuleData[];
  onModulesChange: () => void;
}

function a11yProps(index: number, moduleIndex: number) {
  return {
    id: `module-${moduleIndex}-tab-${index}`,
    "aria-controls": `module-${moduleIndex}-tabpanel-${index}`,
  };
}

const initialDocFormState = { tenfile: "", link: "", mota: "", hinh: "" };
interface EditingContentState {
  moduleIndex: number;
  contentIndex: number;
  contentName: string;
}
interface EditingDocumentState extends DocumentDataForModule {
  docIndex: number;
}

const EditContentDetails: React.FC<Props> = ({
  modules: initialModules,
  onModulesChange,
}) => {
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: number }>({});

  const [newContent, setNewContent] = useState("");
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [currentDocModuleIndex, setCurrentDocModuleIndex] = useState<
    number | null
  >(null);
  const [editingContent, setEditingContent] =
    useState<EditingContentState | null>(null);

  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<EditingDocumentState | null>(null);
  const [docFormData, setDocFormData] = useState(initialDocFormState);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);

  const [savingModuleId, setSavingModuleId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<{ [key: number]: string | null }>(
    {}
  );

  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  // --- Handlers ---
  const handleTabChange = (moduleIndex: number, newValue: number) => {
    setActiveTabs((prev) => ({ ...prev, [moduleIndex]: newValue }));
  };

  // --- Content Handlers---
  const handleContentInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {value } = event.target;
    setNewContent(value);
  };

  const handleAddContent = (moduleIndex: number) => {
    if (newContent.trim() === "") return;
    const updatedModules = modules.map((mod, index) => {
      if (index === moduleIndex) {
        // Thêm object { contentName }
        const newItem = { id: Date.now() * -1, contentName: newContent }; // Dùng ID tạm
        return { ...mod, contents: [...(mod.contents || []), newItem] };
      }
      return mod;
    });
    setModules(updatedModules);
    setNewContent("");
  };

  const handleOpenEditContentDialog = (
    moduleIndex: number,
    contentIndex: number,
    currentContent: ContentData
  ) => {
    setEditingContent({
      moduleIndex,
      contentIndex,
      contentName: currentContent.contentName,
    });
    setContentDialogOpen(true);
  };

  const handleCloseEditContentDialog = () => {
    setContentDialogOpen(false);
    setEditingContent(null);
  };

  const handleSaveContentChanges = () => {
    if (!editingContent || editingContent.contentName.trim() === "") return;
    const { moduleIndex, contentIndex, contentName } = editingContent;
    const newModules = modules.map((mod, mIndex) => {
      if (mIndex === moduleIndex) {
        const updatedContents = (mod.contents || []).map((content, cIndex) =>
          cIndex === contentIndex
            ? { ...content, contentName: contentName }
            : content
        );
        return { ...mod, contents: updatedContents };
      }
      return mod;
    });
    setModules(newModules);
    handleCloseEditContentDialog();
  };

  const handleRemoveContent = (moduleIndex: number, contentIndex: number) => {
    const updatedModules = modules.map((mod, index) => {
      if (index === moduleIndex) {
        return {
          ...mod,
          contents: (mod.contents || []).filter((_, i) => i !== contentIndex),
        };
      }
      return mod;
    });
    setModules(updatedModules);
  };

  // --- Document Handlers (Modify local 'modules' state + Dialogs) ---
  const handleDocInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDocFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocImageUpload = (fileName: string) => {
    setDocFormData((prev) => ({ ...prev, hinh: fileName }));
    setImgPreviewUrl(getImageUrl(fileName));
  };

  const handleOpenAddDocDialog = (moduleIndex: number) => {
    setEditingDocument(null);
    setDocFormData(initialDocFormState);
    setImgPreviewUrl(null);
    setCurrentDocModuleIndex(moduleIndex);
    setDocDialogOpen(true);
  };

  const handleOpenEditDocDialog = (
    moduleIndex: number,
    docIndex: number,
    doc: DocumentDataForModule
  ) => {
    setEditingDocument({ ...doc, docIndex }); // Set editing state
    setDocFormData({
      // Pre-fill form
      tenfile: doc.fileName,
      link: doc.link,
      mota: doc.description,
      hinh: doc.image,
    });
    setImgPreviewUrl(doc.image ? getImageUrl(doc.image) : null);
    setCurrentDocModuleIndex(moduleIndex); // Remember context
    setDocDialogOpen(true);
  };

  const handleCloseDocDialog = () => {
    setDocDialogOpen(false);
    setEditingDocument(null);
    setCurrentDocModuleIndex(null);
    setImgPreviewUrl(null);
  };

  const handleSaveDocument = () => {
    if (currentDocModuleIndex === null || !docFormData.tenfile.trim()) return;

    const updatedModules = modules.map((mod, index) => {
      if (index === currentDocModuleIndex) {
        const newOrUpdatedDoc = {
          // Map form state to ModuleData structure
          documentId: editingDocument
            ? editingDocument.documentId
            : Date.now() * -1, // Use existing ID or temp ID
          fileName: docFormData.tenfile,
          link: docFormData.link,
          description: docFormData.mota,
          image: docFormData.hinh,
        };
        let updatedDocs;
        if (editingDocument) {
          // If editing
          updatedDocs = (mod.documents || []).map((doc, i) =>
            i === editingDocument.docIndex ? newOrUpdatedDoc : doc
          );
        } else {
          // If adding
          updatedDocs = [...(mod.documents || []), newOrUpdatedDoc];
        }
        return { ...mod, documents: updatedDocs };
      }
      return mod;
    });
    setModules(updatedModules);
    handleCloseDocDialog();
  };

  const handleRemoveDocument = (moduleIndex: number, docIndex: number) => {
    const updatedModules = modules.map((mod, index) => {
      if (index === moduleIndex) {
        return {
          ...mod,
          documents: (mod.documents || []).filter((_, i) => i !== docIndex),
        };
      }
      return mod;
    });
    setModules(updatedModules);
  };

  // --- API Save Handler ---
  const handleSaveChangesForModule = async (moduleIndex: number) => {
    const moduleToSave = modules[moduleIndex];
    if (!moduleToSave) return;

    setSavingModuleId(moduleToSave.moduleId);
    setSaveError((prev) => ({ ...prev, [moduleToSave.moduleId]: null }));

    try {
      const updateRequest: ModuleUpdateRequest = {
        moduleName: moduleToSave.moduleName,
        duration: moduleToSave.duration,
        contents: (moduleToSave.contents || []).map((c) => ({
          id: c.id,
          contentName: c.contentName,
        })),
        documents: (moduleToSave.documents || []).map((d) => ({
          fileName: d.fileName,
          link: d.link,
          description: d.description,
          image: d.image || "",
        })),
      };

      await updateModule(moduleToSave.moduleId, updateRequest);
      onModulesChange();
    } catch (err: any) {
      console.error(`Lỗi khi lưu module ${moduleToSave.moduleId}:`, err);
      setSaveError((prev) => ({
        ...prev,
        [moduleToSave.moduleId]:
          err.response?.data?.message ||
          `Lưu module ${moduleToSave.moduleName} thất bại.`,
      }));
    } finally {
      setSavingModuleId(null);
    }
  };

  // --- JSX ---
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Chi tiết Nội dung & Tài liệu Modules
      </Typography>
      {modules.length === 0 && (
        <Typography color="textSecondary">
          Chưa có module nào được thêm.
        </Typography>
      )}
      {modules.map(
        (module, moduleIndex) =>
          module && (
            <Accordion
              key={module.moduleId}
              TransitionProps={{ unmountOnExit: true }}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {/* ... Accordion Summary (Module Name, Duration) ... */}
                <Typography fontWeight="bold">{`Module ${moduleIndex + 1}: ${
                  module.moduleName
                }`}</Typography>
                {module.duration > 0 && (
                  <Typography
                    sx={{ color: "text.secondary", ml: 1 }}
                  >{`(${module.duration} giờ)`}</Typography>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {/* Save Button & Status for this Module */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    pb: 2,
                  }}
                >
                  {saveError[module.moduleId] && (
                    <Alert
                      severity="error"
                      sx={{ flexGrow: 1, mr: 1 }}
                      onClose={() =>
                        setSaveError((prev) => ({
                          ...prev,
                          [module.moduleId]: null,
                        }))
                      }
                    >
                      {saveError[module.moduleId]}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSaveChangesForModule(moduleIndex)}
                    disabled={savingModuleId === module.moduleId}
                  >
                    {savingModuleId === module.moduleId ? (
                      <CircularProgress size={20} />
                    ) : (
                      `Lưu Module ${moduleIndex + 1}`
                    )}
                  </Button>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs
                    value={activeTabs[moduleIndex] || 0}
                    onChange={(_, val) => handleTabChange(moduleIndex, val)}
                    aria-label={`Nội dung và tài liệu cho ${module.moduleName}`}
                  >
                    <Tab
                      label="Nội dung bài học"
                      {...a11yProps(0, moduleIndex)}
                    />
                    <Tab label="Tài liệu" {...a11yProps(1, moduleIndex)} />
                  </Tabs>
                </Box>

                {/* Panel Nội dung */}
                <div
                  role="tabpanel"
                  hidden={(activeTabs[moduleIndex] || 0) !== 0}
                  id={`module-${moduleIndex}-tabpanel-0`}
                  aria-labelledby={`module-${moduleIndex}-tab-0`}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      Thêm nội dung
                    </Typography>
                    <Grid
                      container
                      spacing={1}
                      sx={{ mb: 2 }}
                      alignItems="flex-start"
                    >
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          name="title"
                          label="Nội dung"
                          value={newContent}
                          onChange={handleContentInputChange}
                          fullWidth
                          size="small"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleAddContent(moduleIndex)}
                          size="small"
                          fullWidth
                          sx={{ height: "100%" }}
                        >
                          Thêm
                        </Button>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      Danh sách
                    </Typography>
                    <List dense>
                      {(module.contents || []).map((content, contentIndex) => (
                        <ListItem
                          key={content.id || contentIndex}
                          disableGutters
                        >
                          <ListItemText
                            primary={content.id}
                            secondary={content.contentName}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </div>

                {/* Panel Tài liệu */}
                <div
                  role="tabpanel"
                  hidden={(activeTabs[moduleIndex] || 0) !== 1}
                  id={`module-${moduleIndex}-tabpanel-1`}
                  aria-labelledby={`module-${moduleIndex}-tab-1`}
                >
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenAddDocDialog(moduleIndex)}
                      sx={{ mb: 2 }}
                    >
                      {" "}
                      Thêm tài liệu{" "}
                    </Button>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      Danh sách
                    </Typography>
                    <List dense>
                      {(module.documents || []).map((doc, docIndex) => (
                        <ListItem
                          key={doc.documentId || docIndex}
                          disableGutters /* ... secondaryAction with Edit/Delete buttons calling handlers ... */
                        >
                          <ListItemText
                            primary={doc.fileName}
                            secondary={doc.link || doc.description}
                          />
                          {doc.image && (
                            <img
                              src={getImageUrl(doc.image)} /* ... style ... */
                            />
                          )}
                        </ListItem>
                      ))}
                      {/* ... No document message ... */}
                    </List>
                  </Box>
                </div>
              </AccordionDetails>
            </Accordion>
          )
      )}

      {/* Dialog Thêm/Sửa Tài liệu */}
      <Dialog open={docDialogOpen} onClose={handleCloseDocDialog} /* ... */>
        <DialogTitle>
          {editingDocument ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{xs: 12}}>
              <TextField
                required
                name="tenfile"
                label="Tên file/tài liệu"
                fullWidth
                value={docFormData.tenfile}
                onChange={handleDocInputChange}
                size="small"
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField
                name="link"
                label="Link (nếu có)"
                fullWidth
                value={docFormData.link}
                onChange={handleDocInputChange}
                size="small"
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <TextField
                name="mota"
                label="Mô tả"
                fullWidth
                multiline
                rows={2}
                value={docFormData.mota}
                onChange={handleDocInputChange}
                size="small"
              />
            </Grid>
            <Grid size={{xs: 12}} container alignItems="center" spacing={2}>
              <Grid size={{xs: 8}}>
                <TextField
                  name="hinh"
                  label="Ảnh (tên file)"
                  fullWidth
                  value={docFormData.hinh}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
              </Grid>
              <Grid size={{xs: 4}}>
                <InputFileUpload onUploadSuccess={handleDocImageUpload} />
              </Grid>
            </Grid>

            {imgPreviewUrl && (
              <Grid size={{xs: 12}} >
                <Box
                  component="img"
                  src={imgPreviewUrl}
                  sx={{ maxWidth: 150, mt: 1 }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={handleCloseDocDialog}>Hủy</Button>
          <Button onClick={handleSaveDocument} variant="contained">
            {editingDocument ? "Lưu thay đổi" : "Lưu tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Sửa Nội dung */}
      <Dialog
        open={contentDialogOpen}
        onClose={handleCloseEditContentDialog}
      >
        {/* ... Dialog content/actions for editing content ... */}
      </Dialog>
    </Box>
  );
};

export default EditContentDetails;
