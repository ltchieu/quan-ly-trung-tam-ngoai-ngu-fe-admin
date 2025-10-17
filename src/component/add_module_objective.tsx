// src/pages/admin/course/Step2_Curriculum.tsx
import React, { useState } from 'react';
import {
  TextField, Button, List, ListItem, ListItemText, IconButton,
  Box, Typography, Divider, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewCourseState } from '../pages/add_course';

interface Props {
  data: NewCourseState;
  setData: React.Dispatch<React.SetStateAction<NewCourseState>>;
}

const Step2Curriculum: React.FC<Props> = ({ data, setData }) => {
  const [newObjective, setNewObjective] = useState('');
  const [newModule, setNewModule] = useState({ tenmodule: '', thoiluong: 0 });

  const handleAddObjective = () => {
    if (newObjective.trim() !== '') {
      setData(prev => ({ ...prev, muctieu: [...prev.muctieu, { tenmuctieu: newObjective }] }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setData(prev => ({ ...prev, muctieu: prev.muctieu.filter((_, i) => i !== index) }));
  };
  
  const handleAddModule = () => {
    if (newModule.tenmodule.trim() !== '') {
        setData(prev => ({...prev, modules: [...prev.modules, {...newModule, noidung: [], tailieu: []}]}));
        setNewModule({ tenmodule: '', thoiluong: 0 });
    }
  }

  const handleRemoveModule = (index: number) => {
    setData(prev => ({...prev, modules: prev.modules.filter((_, i) => i !== index)}));
  }

  return (
    <Grid container spacing={4}>
      {/* Phần mục tiêu */}
      <Grid size={{xs: 12, md: 6}}>
        <Typography variant="h6" gutterBottom>Mục tiêu khóa học</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            label="Tên mục tiêu"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            fullWidth
          />
          <Button variant="outlined" onClick={handleAddObjective}>Thêm</Button>
        </Box>
        <List>
          {data.muctieu.map((item, index) => (
            <ListItem key={index} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveObjective(index)}><DeleteIcon /></IconButton>}>
              <ListItemText primary={item.tenmuctieu} />
            </ListItem>
          ))}
        </List>
      </Grid>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Phần Module */}
      <Grid size={{xs: 12, md: 6}}>
        <Typography variant="h6" gutterBottom>Chương trình học (Modules)</Typography>
         <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField label="Tên Module" value={newModule.tenmodule} onChange={(e) => setNewModule({...newModule, tenmodule: e.target.value})} fullWidth />
            <TextField label="Thời lượng (giờ)" type="number" value={newModule.thoiluong} onChange={(e) => setNewModule({...newModule, thoiluong: Number(e.target.value)})} sx={{width: 150}}/>
            <Button variant="outlined" onClick={handleAddModule}>Thêm</Button>
        </Box>
         <List>
          {data.modules.map((item, index) => (
            <ListItem key={index} secondaryAction={<IconButton edge="end" onClick={() => handleRemoveModule(index)}><DeleteIcon /></IconButton>}>
              <ListItemText primary={item.tenmodule} secondary={`${item.thoiluong} giờ`} />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default Step2Curriculum;