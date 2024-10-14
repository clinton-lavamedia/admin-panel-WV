import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import BroadcastChat from './broadcastchat';

const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

export default function Notification() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [dateFilter, setDateFilter] = React.useState('');
    const [isProd, setIsProd] = React.useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });
    const [tabValue, setTabValue] = React.useState(0);
    const [liveColleges, setLiveColleges] = React.useState([]);
    const [selectedColleges, setSelectedColleges] = React.useState([]);
    const [notificationTitle, setNotificationTitle] = React.useState('');
    const [notificationBody, setNotificationBody] = React.useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleDateFilterChange = (event) => {
        setDateFilter(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    React.useEffect(() => {
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-notification-data")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setItems(result.data);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )

        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-college-config")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result && result.data && result.data[0]) {
                        const liveCollegesList = result.data[0].liveColleges || [];
                        setLiveColleges(liveCollegesList);
                    }
                },
                (error) => {
                    console.error('Error fetching college configurations:', error);
                }
            );
    }, [isProd])

    function formatDateToIST(dateString) {
        const date = new Date(dateString);
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    function Row(row) {
        row = row.row;
        return (
            <TableRow>
                <TableCell component="th" scope="row">{row.userId}</TableCell>
                <TableCell align="left">{row.data.type}</TableCell>
                <TableCell>{row.data.mode}</TableCell>
                <TableCell align="left">{row.notificationTitle}</TableCell>
                <TableCell align="left">{row.notificationBody}</TableCell>
                <TableCell align="right">{formatDateToIST(row.createdAt)}</TableCell>
            </TableRow>
        );
    }

    const handleExportToExcel = () => {
        const headers = ['User ID', 'Type', 'Mode', 'Title', 'Body', 'Sent At'];
        const rows = items.map(item => [
            item.userId,
            item.data.type,
            item.data.mode,
            item.notificationTitle,
            item.notificationBody,
            formatDateToIST(item.createdAt)
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.map(value => `"${value}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "notification_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendBulkNotification = async () => {
        if (selectedColleges.length === 0 || !notificationTitle || !notificationBody) {
            alert('Please fill all fields');
            return;
        }

        try {
            const realUsersResponse = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-real-users");
            const realUsersData = await realUsersResponse.json();
            const userIds = realUsersData.data.user
                .filter(user => selectedColleges.includes(user.college_id))
                .map(user => user.id);

            if (userIds.length > 0) {
                const notificationPayload = {
                    title: notificationTitle,
                    message: notificationBody,
                    user_ids: userIds,
                    type: 'USER_NOTIFICATION'
                };

                const notificationResponse = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/send-bulk-user-notification", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(notificationPayload)
                });

                const notificationResult = await notificationResponse.json();
                console.log('Push notification sent:', notificationResult);
                alert('Bulk push notification sent successfully');
            } else {
                alert('No users found for the selected colleges');
            }
        } catch (error) {
            console.error('Error sending bulk push notification:', error);
            alert('Error sending bulk push notification');
        }
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h3" gutterBottom textAlign={'center'}>
                Notifications
            </Typography>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Notification History" />
                <Tab label="Send Bulk Push Notifications" />
                <Tab label="Send Bulk Chat Message" />
            </Tabs>
            {tabValue === 0 && (
                !isProd ? (
                    <Typography variant="body1" sx={{ m: 2 }}>
                        Notification History is not available in dev mode.
                    </Typography>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', m: 2 }}>
                            <TextField
                                id="date-filter"
                                label="Date Filter"
                                type="date"
                                value={dateFilter}
                                onChange={handleDateFilterChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={handleExportToExcel}>
                                Download logs
                            </Button>
                        </Box>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Mode</TableCell>
                                        <TableCell align="center">Title</TableCell>
                                        <TableCell align="center">Body</TableCell>
                                        <TableCell>Sent At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.filter(item => item.createdAt.includes(dateFilter)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <Row key={row._id} row={row} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={items.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )
            )}
            {tabValue === 1 && (
                <Box sx={{ m: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="college-select-label">Colleges</InputLabel>
                        <Select
                            labelId="college-select-label"
                            multiple
                            value={selectedColleges}
                            onChange={(e) => setSelectedColleges(e.target.value)}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {liveColleges.map((college) => (
                                <MenuItem key={college} value={college}>
                                    <Checkbox checked={selectedColleges.indexOf(college) > -1} />
                                    <ListItemText primary={college} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Notification Title"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Notification Body"
                        value={notificationBody}
                        onChange={(e) => setNotificationBody(e.target.value)}
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                    />
                    <Button variant="contained" color="primary" onClick={handleSendBulkNotification}>
                        Send Bulk Push Notification
                    </Button>
                </Box>
            )}
            {tabValue === 2 && (
                <BroadcastChat />
            )}
        </Paper>
    );
}
