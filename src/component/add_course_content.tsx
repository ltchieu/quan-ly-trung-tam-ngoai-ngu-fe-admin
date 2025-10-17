// src/pages/admin/course/Step3_Content.tsx
import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Box, Tabs, Tab,
  TextField, Button, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewCourseState } from '../pages/add_course';

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

const Step3Content: React.FC<Props> = ({ data, setData }) => {
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: number }>({});
  const [newContent, setNewContent] = useState('');

  const handleTabChange = (moduleIndex: number, newValue: number) => {
    setActiveTabs(prev => ({ ...prev, [moduleIndex]: newValue }));
  };

  const handleAddContent = (moduleIndex: number) => {
    if (newContent.trim() === '') return;
    const newModules = [...data.modules];
    newModules[moduleIndex].noidung.push({ tennoidung: newContent });
    setData(prev => ({ ...prev, modules: newModules }));
    setNewContent('');
  }

  const handleRemoveContent = (moduleIndex: number, contentIndex: number) => {
    const newModules = [...data.modules];
    newModules[moduleIndex].noidung = newModules[moduleIndex].noidung.filter((_, i) => i !== contentIndex);
    setData(prev => ({ ...prev, modules: newModules }));
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chi tiết chương trình học
      </Typography>
      {data.modules.map((module, moduleIndex) => (
        <Accordion key={moduleIndex}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{`Module ${moduleIndex + 1}: ${module.tenmodule}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTabs[moduleIndex] || 0} onChange={(_, val) => handleTabChange(moduleIndex, val)}>
                <Tab label="Nội dung bài học" />
                <Tab label="Tài liệu" />
              </Tabs>
            </Box>
            
            {/* Tab Panel cho Nội dung */}
            {activeTabs[moduleIndex] === 0 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField label="Tên nội dung" value={newContent} onChange={(e) => setNewContent(e.target.value)} fullWidth />
                    <Button variant="outlined" onClick={() => handleAddContent(moduleIndex)}>Thêm</Button>
                </Box>
                <List>
                    {module.noidung.map((content, contentIndex) => (
                        <ListItem key={contentIndex} secondaryAction={<IconButton onClick={() => handleRemoveContent(moduleIndex, contentIndex)}><DeleteIcon/></IconButton>}>
                            <ListItemText primary={content.tennoidung} />
                        </ListItem>
                    ))}
                </List>
              </Box>
            )}

            {/* Tab Panel cho Tài liệu */}
            {activeTabs[moduleIndex] === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography>
                  Giao diện quản lý tài liệu (tải file, thêm link) sẽ ở đây.
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Step3Content;