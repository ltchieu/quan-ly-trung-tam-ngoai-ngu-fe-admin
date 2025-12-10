import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { CourseCategoryResponse } from '../../model/course_category_model';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../../services/course_category_service';

const CategoryPage = () => {
    const [categories, setCategories] = useState<CourseCategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<CourseCategoryResponse | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const apiResponse = await getAllCategories();
            setCategories(apiResponse.data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category?: CourseCategoryResponse) => {
        if (category) {
            setCurrentCategory(category);
            setCategoryName(category.name);
        } else {
            setCurrentCategory(null);
            setCategoryName('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentCategory(null);
        setCategoryName('');
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            setSnackbar({ open: true, message: 'Category name is required', severity: 'error' });
            return;
        }

        try {
            if (currentCategory) {
                await updateCategory(currentCategory.id, { name: categoryName });
                setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
            } else {
                await createCategory({ name: categoryName });
                setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
            }
            fetchCategories();
            handleCloseDialog();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Failed to save category', severity: 'error' });
        }
    };

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete !== null) {
            try {
                await deleteCategory(categoryToDelete);
                setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
                fetchCategories();
            } catch (err) {
                console.error(err);
                setSnackbar({ open: true, message: 'Failed to delete category', severity: 'error' });
            } finally {
                setDeleteConfirmOpen(false);
                setCategoryToDelete(null);
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Category Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Add New Category
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id} hover>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(category)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(category.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Category Name"
                        fullWidth
                        variant="outlined"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveCategory} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this category? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CategoryPage;
