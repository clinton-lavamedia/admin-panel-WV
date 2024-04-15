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
import Switch from '@mui/material/Switch';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
const BASE_URL = process.env.REACT_APP_BASEURL

export default function DemoUsers() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [approve, setApproval] = React.useState('reject');
    const [refresh, setRefresh] = React.useState(false);
    const [openReject, setOpenReject] = React.useState(false);
    const [payload, setPayload] = React.useState({});
    const [notes, setNotes] = React.useState('');
    const [rerender, setRerender] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [checked, setChecked] = React.useState(true);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    React.useEffect(() => {
        fetch(BASE_URL + "/admin-get-demo-users")
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
    }, [refresh])
    function openRow(user_id) {
        for (let data in items) {
            if (items[data].user_id == user_id) {
                items[data].open = !items[data].open
            }
        }
        console.log(items)
        setItems(items)
        setRerender(!rerender)
    }
    function Row(row) {
        console.log(row)
        row = row.row

        return (
            <React.Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                    </TableCell>
                    <TableCell component="th" scope="row"><Switch
                        checked={row.enabled}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                    /></TableCell>
                    <TableCell align="right">
                        {row.suid}
                    </TableCell>

                    <TableCell align="right">{row.id}</TableCell>

                    <TableCell align="right">{row.first_name}</TableCell>
                    <TableCell align="right">{row.last_name}</TableCell>

                    <TableCell align="right">{row.college_id}</TableCell>

                </TableRow>
                <TableRow>
                </TableRow>
            </React.Fragment>
        );
    }

    return (
        <Paper /* sx={{ width: '100%', overflow: 'hidden' }} */>

            <Typography variant="h3" gutterBottom textAlign={'center'}>
                Demo users
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small" aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Enabled</TableCell>
                            <TableCell align="right">DemoUser DB ID</TableCell>

                            <TableCell align="right">User DB ID</TableCell>
                            <TableCell align="right">First name</TableCell>
                            <TableCell align="right">Last name</TableCell>

                            <TableCell align="right">College</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <Row key={row.name} row={row} />
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
