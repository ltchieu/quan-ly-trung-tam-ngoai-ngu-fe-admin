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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { RoomResponse } from '../../model/room_model';
import {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom
} from '../../services/room_service';
import { useNavigate } from 'react-router-dom';
import { useAxiosPrivate } from '../../hook/useAxiosPrivate';

const RoomPage = () => {
    useAxiosPrivate();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<RoomResponse | null>(null);
    const [roomName, setRoomName] = useState('');
    const [roomCapacity, setRoomCapacity] = useState<number | string>('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await getAllRooms();
            setRooms(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Failed to load rooms';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (room?: RoomResponse) => {
        if (room) {
            setCurrentRoom(room);
            setRoomName(room.roomName);
            setRoomCapacity(room.capacity);
        } else {
            setCurrentRoom(null);
            setRoomName('');
            setRoomCapacity('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentRoom(null);
        setRoomName('');
        setRoomCapacity('');
    };

    const handleSaveRoom = async () => {
        if (!roomName.trim()) {
            setSnackbar({ open: true, message: 'Room name is required', severity: 'error' });
            return;
        }
        if (!roomCapacity || Number(roomCapacity) <= 0) {
            setSnackbar({ open: true, message: 'Valid capacity is required', severity: 'error' });
            return;
        }

        try {
            if (currentRoom) {
                // Update not available in API
                setSnackbar({ open: true, message: 'Update room feature is not available', severity: 'error' });
                return;
            } else {
                const requestData = { roomName: roomName, capacity: Number(roomCapacity) };
                await createRoom(requestData);
                setSnackbar({ open: true, message: 'Room created successfully', severity: 'success' });
            }
            fetchRooms();
            handleCloseDialog();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.response?.data?.message || 'Failed to save room';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleDeleteClick = (id: number) => {
        setRoomToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (roomToDelete !== null) {
            try {
                // Delete not available in API
                setSnackbar({ open: true, message: 'Delete room feature is not available', severity: 'error' });
            } catch (err: any) {
                console.error(err);
                const errorMessage = err?.response?.data?.message || 'Failed to delete room';
                setSnackbar({ open: true, message: errorMessage, severity: 'error' });
            } finally {
                setDeleteConfirmOpen(false);
                setRoomToDelete(null);
            }
        }
    };

    const handleViewDetail = (roomId: number) => {
        navigate(`/rooms/${roomId}`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Quản lý phòng
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Thêm phòng mới
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Room Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rooms.map((room) => (
                                <TableRow key={room.roomId} hover>
                                    <TableCell>{room.roomId}</TableCell>
                                    <TableCell>{room.roomName}</TableCell>
                                    <TableCell>{room.capacity}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            color="info"
                                            onClick={() => handleViewDetail(room.roomId)}
                                            sx={{ mr: 1 }}
                                            title="View Details"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(room)}
                                            sx={{ mr: 1 }}
                                            title="Edit Room"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(room.roomId)}
                                            title="Delete Room"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rooms.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        No rooms found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Room Name"
                        fullWidth
                        variant="outlined"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Capacity"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={roomCapacity}
                        onChange={(e) => setRoomCapacity(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveRoom} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this room? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RoomPage;
