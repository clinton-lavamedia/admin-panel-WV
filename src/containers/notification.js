import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
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
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const BASE_URL = 'http://ec2-65-1-12-87.ap-south-1.compute.amazonaws.com/user/admin-get-notification-data';

export default function Notification() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [dateFilter, setDateFilter] = React.useState('');

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

    React.useEffect(() => {
        fetch(BASE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setIsLoaded(true);
                    let data = result.data;
                    for (let key in data) {
                        data[key].open = false
                        console.log(data)
                    }
                    setItems(data);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    function openRow(notificationId) {
        for (let data in items) {
            if (items[data]._id === notificationId) {
                items[data].open = !items[data].open
            }
        }
        console.log(items)
        setItems(items)
    }

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
        console.log(row)
        row = row.row

        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    
                    <TableCell component="th" scope="row">
                        {row.userId}
                    </TableCell>
                    <TableCell align="left">{row.data.type}</TableCell>

                    <TableCell>{row.data.mode}</TableCell>

                    <TableCell align="left">{row.notificationTitle}</TableCell>
                    <TableCell align="left">{row.notificationBody}</TableCell>
                    <TableCell align="right">{formatDateToIST(row.createdAt)}</TableCell>


                </TableRow>
                
            </React.Fragment>
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

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h3" gutterBottom textAlign={'center'}>
                Notification logs
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                <Button variant="contained" color="primary" onClick={handleExportToExcel} style={{ marginTop: '10px' }}>
                    Download logs
                </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small" >
                    <TableHead>
                        <TableRow>
                            <TableCell>User ID</TableCell>
                            <TableCell>Type</TableCell>

                            <TableCell>Mode</TableCell>

                            <TableCell align="center">Title</TableCell>
                            <TableCell align="center">Body</TableCell>
                            <TableCell >Sent At</TableCell>

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
           
        </Paper>
    );
}

