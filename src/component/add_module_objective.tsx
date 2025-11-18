import React, { useEffect, useRef, useState } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  InputAdornment,
  Alert,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { NewCourseState } from "../pages/add_course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faPen } from "@fortawesome/free-solid-svg-icons";
import { SkillResponse } from "../model/course_model";
import { getAllSkills } from "../services/course_service";

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

interface EditingModule {
  index: number;
  tenmodule: string;
  duration: number;
  skillId: number;
}

interface ModuleInputState {
  [key: number]: {
    tenmodule: string;
    duration: string;
  };
}

const Step2Curriculum: React.FC<Props> = ({ data, setData }) => {
  const [newObjective, setNewObjective] = useState("");
  const [allSkills, setAllSkills] = useState<SkillResponse[]>([]);
  const [moduleInputs, setModuleInputs] = useState<ModuleInputState>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<EditingModule | null>(
    null
  );

  const nameInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getAllSkills();
        if (res.data) {
          setAllSkills(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải kỹ năng:", error);
      }
    };
    fetchSkills();
  }, []);

  const handleAddObjective = (event: React.FormEvent) => {
    event.preventDefault();
    if (newObjective.trim() !== "") {
      setData((prev) => ({
        ...prev,
        muctieu: [...prev.muctieu, { tenmuctieu: newObjective }],
      }));
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setData((prev) => ({
      ...prev,
      muctieu: prev.muctieu.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (
    skillId: number,
    field: "tenmodule" | "duration",
    value: string
  ) => {
    setModuleInputs((prev) => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value,
      },
    }));
  };

  // Build map of skillHours for quick lookup
  const skillHoursMap = new Map<number, number>();
  (data.skillHours || []).forEach((s) => {
    skillHoursMap.set(s.skillId, s.hours);
  });

  const handleAddModule = (skillId: number) => {
    const input = moduleInputs[skillId];

    if (!input || !input.tenmodule.trim()) {
      alert("Vui lòng nhập tên module");
      return;
    }

    const durationVal = parseFloat(input.duration);
    if (!input.duration || isNaN(durationVal) || durationVal <= 0) {
      alert("Vui lòng nhập thời lượng hợp lệ (>0)");
      return;
    }

    const expectedSkillHours = skillHoursMap.get(skillId) || 0;
    const currentSkillHours = data.modules
      .filter((m) => m.skillId === skillId)
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    if (currentSkillHours + durationVal > expectedSkillHours) {
      alert(
        `Thêm module vượt quá số giờ cho kỹ năng này. Giới hạn: ${expectedSkillHours}h – Đã dùng: ${currentSkillHours}h`
      );
      return;
    }

    const newModuleData = {
      tenmodule: input.tenmodule,
      duration: durationVal,
      skillId: skillId,
      noidung: [],
      tailieu: [],
    };

    setData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModuleData],
    }));

    // Reset input của skill đó
    setModuleInputs((prev) => ({
      ...prev,
      [skillId]: { tenmodule: "", duration: "" },
    }));

    setTimeout(() => {
      if (nameInputRefs.current[skillId]) {
        nameInputRefs.current[skillId]?.focus();
      }
    }, 0);
  };

  const handleRemoveModule = (globalIndex: number) => {
    // globalIndex là index trong mảng data.modules gốc
    setData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== globalIndex),
    }));
  };

  // --- Handlers cho Edit Module ---
  const handleOpenEditDialog = (
    module: { tenmodule: string; duration?: number; skillId: number },
    index: number // index trong mảng gốc
  ) => {
    setEditingModule({
      index,
      tenmodule: module.tenmodule,
      duration: module.duration || 0,
      skillId: module.skillId,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingModule(null);
  };

  const handleSaveChanges = () => {
    if (!editingModule || editingModule.tenmodule.trim() === "") {
      alert("Tên module không được rỗng.");
      return;
    }
    if (editingModule.duration <= 0) {
      alert("Thời lượng phải lớn hơn 0.");
      return;
    }

    // Validate against skillHours
    const expected = skillHoursMap.get(editingModule.skillId) || 0;
    const usedExceptThis = data.modules
      .filter((_, i) => i !== editingModule.index)
      .filter((m) => m.skillId === editingModule.skillId)
      .reduce((s, m) => s + (m.duration || 0), 0);

    if (usedExceptThis + editingModule.duration > expected) {
      alert(
        `Sửa module vượt quá số giờ cho kỹ năng này. Giới hạn: ${expected}h – Đã dùng (không tính module này): ${usedExceptThis}h`
      );
      return;
    }

    setData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === editingModule.index
          ? {
              ...module,
              tenmodule: editingModule.tenmodule,
              duration: editingModule.duration,
            }
          : module
      ),
    }));
    handleCloseEditDialog();
  };

  // Lọc ra các kỹ năng đã được chọn ở Step 1
  const selectedSkills = allSkills.filter((s) => data.skillIds.includes(s.id));

  // --- TÍNH TOÁN THỜI LƯỢNG ---
  if (data.sogiohoc == 0) {
    return <Alert severity="error">Tổng số giờ học phải lớn hơn 0</Alert>;
  }

  return (
    <Grid container spacing={4}>
      {/* Phần mục tiêu */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          Mục tiêu khóa học
        </Typography>
        <Box
          component="form"
          sx={{ display: "flex", gap: 1, mb: 2 }}
          onSubmit={handleAddObjective}
        >
          <TextField
            label="Tên mục tiêu"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="outlined">
            Thêm
          </Button>
        </Box>
        <List>
          {data.muctieu.length === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Chưa có mục tiêu nào.
            </Typography>
          )}
          {data.muctieu.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveObjective(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={item.tenmuctieu} />
            </ListItem>
          ))}
        </List>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Divider orientation="horizontal" />
      </Grid>

      {/* Phần Module */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          Chương trình học (Modules)
        </Typography>

        {selectedSkills.length === 0 ? (
          <Typography color="error">
            Vui lòng chọn Kỹ năng ở Bước 1 để thêm Module.
          </Typography>
        ) : (
          (() => {
            //Tính toán lại tổng giờ đã phân bổ cho các skill
            const totalAllocatedHours = (data.skillHours || []).reduce(
              (sum, item) => sum + (item.hours || 0),
              0
            );

            //Kiểm tra xem có khớp với tổng giờ khóa học (data.sogiohoc) không
            const isStep1Valid =
              data.sogiohoc > 0 &&
              totalAllocatedHours == data.sogiohoc &&
              data.skillIds.length > 0;

            // --- TRƯỜNG HỢP 1: CHƯA HỢP LỆ -> HIỆN ALERT CẢNH BÁO ---
            if (!isStep1Valid) {
              return (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{ mt: 1, border: "1px solid #d32f2f" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Vui lòng hoàn tất phân bổ thời lượng ở Bước 1 trước khi nhập
                    Module.
                  </Typography>

                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    <li>
                      Tổng giờ khóa học yêu cầu: <b>{data.sogiohoc}h</b>
                    </li>
                    <li>
                      Tổng giờ các kỹ năng hiện tại:{" "}
                      <b>{totalAllocatedHours}h</b>
                    </li>
                    {data.skillIds.length === 0 && (
                      <li>Chưa chọn kỹ năng nào.</li>
                    )}

                    {totalAllocatedHours !== data.sogiohoc && (
                      <li style={{ color: "#d32f2f", fontWeight: "bold" }}>
                        {totalAllocatedHours < data.sogiohoc
                          ? `Còn thiếu: ${data.sogiohoc - totalAllocatedHours}h`
                          : `Đang dư: ${totalAllocatedHours - data.sogiohoc}h`}
                      </li>
                    )}
                  </Box>
                </Alert>
              );
            }

            // --- TRƯỜNG HỢP 2: HỢP LỆ -> HIỆN UI NHẬP MODULE ---
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {selectedSkills.map((skill) => {
                  const skillModules = data.modules
                    .map((m, idx) => ({ ...m, originalIndex: idx }))
                    .filter((m) => m.skillId === skill.id);

                  const currentInput = moduleInputs[skill.id] || {
                    tenmodule: "",
                    duration: "",
                  };

                  const expected = skillHoursMap.get(skill.id) || 0;
                  const used = skillModules.reduce(
                    (s, m) => s + (m.duration || 0),
                    0
                  );
                  const remain = parseFloat((expected - used).toFixed(2));
                  const isFull = expected > 0 && remain <= 0;

                  const handleEnterKey = (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" && !isFull) {
                      e.preventDefault();
                      handleAddModule(skill.id);
                    }
                  };

                  return (
                    <Paper
                      key={skill.id}
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderTop: "4px solid #1976d2",
                      }}
                    >
                      {/* Header & Progress bar */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ gap: 2 }}
                      >
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Chip label={skill.skillName} color="primary" />
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", mb: 1 }}
                        >
                          Thời lượng kỹ năng: {expected} giờ
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2, mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={
                            expected
                              ? Math.min((used / expected) * 100, 100)
                              : 0
                          }
                          sx={{ height: 10, borderRadius: 5, mb: 1 }}
                          color={
                            used === expected
                              ? "success"
                              : used > expected
                              ? "error"
                              : "primary"
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          Đã dùng {used}/{expected} giờ{" "}
                          {expected ? `• còn ${remain} giờ` : ""}
                        </Typography>
                      </Box>

                      {/* Các Alert trạng thái nhỏ bên trong */}
                      {expected === 0 && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                          Kỹ năng này chưa được khai báo số giờ.
                        </Alert>
                      )}
                      {expected > 0 && used < expected && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          Tiến độ: <b>{used}h</b> / <b>{expected}h</b>
                        </Alert>
                      )}
                      {used > expected && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          Đã dùng <b>{used}h</b> — vượt quá{" "}
                          <b>{parseFloat((used - expected).toFixed(2))}h</b>
                        </Alert>
                      )}
                      {expected > 0 && used === expected && (
                        <Alert severity="success" sx={{ mb: 1 }}>
                          Đã đủ giờ.
                        </Alert>
                      )}

                      {/* Danh sách Module đã thêm */}
                      <List>
                        {skillModules.map((mod) => (
                          <ListItem
                            key={mod.originalIndex}
                            sx={{
                              bgcolor: "background.paper",
                              mb: 1,
                              border: "1px solid #eee",
                              borderRadius: 1,
                            }}
                            secondaryAction={
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleOpenEditDialog(
                                      mod as any,
                                      mod.originalIndex
                                    )
                                  }
                                >
                                  <FontAwesomeIcon icon={faPen} size="xs" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleRemoveModule(mod.originalIndex)
                                  }
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            }
                          >
                            <ListItemText
                              primary={mod.tenmodule}
                              secondary={
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  <FontAwesomeIcon icon={faClock} />{" "}
                                  {mod.duration} giờ
                                </span>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>

                      {/* Form thêm Module */}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <TextField
                          label={
                            isFull ? "Đã đủ số giờ quy định" : "Tên Module mới"
                          }
                          size="small"
                          value={currentInput.tenmodule}
                          onChange={(e) =>
                            handleInputChange(
                              skill.id,
                              "tenmodule",
                              e.target.value
                            )
                          }
                          fullWidth
                          onKeyDown={handleEnterKey}
                          disabled={isFull || expected === 0}
                          // Ref focus (nếu bạn đã thêm phần ref ở câu trước)
                          inputRef={(el) =>
                            (nameInputRefs.current[skill.id] = el)
                          }
                        />
                        <TextField
                          label="Giờ"
                          size="small"
                          type="number"
                          value={currentInput.duration}
                          onChange={(e) =>
                            handleInputChange(
                              skill.id,
                              "duration",
                              e.target.value
                            )
                          }
                          sx={{ width: "100px" }}
                          InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                          onKeyDown={handleEnterKey}
                          disabled={isFull || expected === 0}
                        />
                        <Button
                          variant="contained"
                          color={isFull ? "success" : "secondary"}
                          onClick={() => handleAddModule(skill.id)}
                          sx={{ height: "40px", whiteSpace: "nowrap" }}
                          disabled={isFull || expected === 0}
                        >
                          {isFull ? "Đã đủ" : "Thêm"}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            );
          })()
        )}
      </Grid>

      {/* === Dialog Chỉnh sửa Module === */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Module</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên Module"
              fullWidth
              value={editingModule?.tenmodule || ""}
              onChange={(e) =>
                setEditingModule((prev) =>
                  prev ? { ...prev, tenmodule: e.target.value } : null
                )
              }
            />
            <TextField
              label="Thời lượng (giờ)"
              type="number"
              fullWidth
              value={editingModule?.duration || ""}
              onChange={(e) =>
                setEditingModule((prev) =>
                  prev
                    ? { ...prev, duration: parseFloat(e.target.value) }
                    : null
                )
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">giờ</InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button onClick={handleSaveChanges} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Step2Curriculum;
