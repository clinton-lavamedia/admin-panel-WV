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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Sector, Cell, Recharts } from 'recharts';
/* import { HeatMap, Tooltip as HeatMapTooltip } from 'recharts';
 */
const BASE_URL = 'http://ec2-65-1-12-87.ap-south-1.compute.amazonaws.com/user/admin-stats';

export default function Dashboard() {
    const [error, setError] = React.useState(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [stats, setStats] = React.useState({});
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
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
                    // Convert binary strings to counts
                    data.last_login_date=data.counts.last_login_date
                    for (let category in data.counts) {
                        for (let key in data.counts[category]) {
                            if (typeof data.counts[category][key] === 'string') {
                                data.counts[category][key] = (data.counts[category][key].match(/1/g) || []).length;
                            } else if (typeof data.counts[category][key] === 'object') {
                                for (let subKey in data.counts[category][key]) {

                                    data.counts[category][key][subKey] = (data.counts[category][key][subKey].match(/1/g) || []).length;
                                }
                            }
                        }
                    }
                    console.log(data)

                    // Format dates to month and year, and count each month
                    let lastLoginDates = data.last_login_date;
                    let monthlyCounts = {};
                    for (let date in lastLoginDates) {
                        let month = new Date(date).toLocaleString('default', { month: 'long' });
                        let year = new Date(date).getFullYear();
                        if (!monthlyCounts[year]) {
                            monthlyCounts[year] = {};
                        }
                        if (!monthlyCounts[year][month]) {
                            monthlyCounts[year][month] = 0;
                        }
                        monthlyCounts[year][month]++;
                    }
                    data.last_login_date = Object.entries(monthlyCounts).map(([year, months]) => {
                        return Object.entries(months).map(([month, count]) => ({ name: `${month} ${year}`, value: count }));
                    }).flat().sort((b, a) => new Date(b.name) - new Date(a.name));
                    data.last_login_date = data.last_login_date.reduce((acc, subtopic) => {
                        acc[subtopic.name] = Number(subtopic.value);
                        return acc;
                    }, {});
                    // Process mostUsedSubtopics for male vs female
                    if (result.data.mostUsedSubtopics) {
                        let maleSubtopics = result.data.mostUsedSubtopics.filter(subtopic => subtopic.gender === 'male');
                        let femaleSubtopics = result.data.mostUsedSubtopics.filter(subtopic => subtopic.gender === 'female');
                        data.maleSubtopics = maleSubtopics.reduce((acc, subtopic) => {
                            acc[subtopic.subtopic] = Number(subtopic.count);
                            return acc;
                        }, {});
                        data.femaleSubtopics = femaleSubtopics.reduce((acc, subtopic) => {
                            acc[subtopic.subtopic] = Number(subtopic.count);
                            return acc;
                        }, {});
                    }
                    console.log(data)
                    setStats(data);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

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
        const headers = ['Category', 'Subcategory', 'Count'];
        const rows = Object.entries(stats.counts || {}).flatMap(([category, subcategories]) => 
            Object.entries(subcategories || {}).map(([subcategory, count]) => 
                [category, subcategory, count]
            )
        );
        const csvContent = [headers.join(','), ...rows.map(row => row.map(value => `"${value}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "stats.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
           
           
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Gender
                    </Typography>
                    <PieChart width={450} height={300}>
                        <Pie dataKey="value" isAnimationActive={false} data={Object.entries(stats?.counts?.gender || {}).map(([key, value], index) => ({ name: key, value, fill: `linear-gradient(to right, #000000, #FFFFFF)` }))} outerRadius={80} label={(entry) => entry.name} />
                        <Tooltip />
                    </PieChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Platform
                    </Typography>
                    <PieChart width={450} height={300}>
                        <Pie dataKey="value" isAnimationActive={false} data={Object.entries(stats?.counts?.platform || {}).map(([key, value], index) => ({ name: key, value, fill: `linear-gradient(to right, #000000, #FFFFFF)` }))} outerRadius={80} label={(entry) => entry.name} />
                        <Tooltip />
                    </PieChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Degree
                    </Typography>
                    <PieChart width={450} height={300}>
                        <Pie dataKey="value" isAnimationActive={false} data={Object.entries(stats?.counts?.degree || {}).map(([key, value], index) => ({ name: key, value, fill: `linear-gradient(to right, #000000, #FFFFFF)` }))} outerRadius={80} label={(entry) => entry.name} />
                        <Tooltip />
                    </PieChart>
                </Box>
            </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h5" gutterBottom textAlign={'center'}>
                        College
                    </Typography>
                    <LineChart width={1000} height={250} data={Object.entries(stats?.counts?.college_id || {}).map(([key, value], index) => ({ name: key, value: value, fill: `linear-gradient(to right, #ADD8E6, #000000)` }))} margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#000" activeDot={{ r: 8 }} />
                    </LineChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Course
                    </Typography>
                    <LineChart width={1000} height={250} data={Object.entries(stats?.counts?.course_id || {}).map(([key, value], index) => ({ name: key, value: value, fill: `linear-gradient(to right, #ADD8E6, #000000)` }))} margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#000" activeDot={{ r: 8 }} />
                    </LineChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Last login
                    </Typography>
                    <LineChart width={1000} height={250} data={Object.entries(stats?.last_login_date || {}).map(([key, value], index) => ({ name: key, value: value, fill: `linear-gradient(to right, #ADD8E6, #000000)` }))} margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#000" activeDot={{ r: 8 }} />
                    </LineChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Male subtopics
                    </Typography>
                    <LineChart width={1100} height={350} data={Object.entries(stats?.maleSubtopics || {}).map(([key, value], index) => ({ name: key, value: value, fill: `linear-gradient(to right, #ADD8E6, #000000)` }))} margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#000" activeDot={{ r: 8 }} />
                    </LineChart>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h5" gutterBottom textAlign={'center'}>
                        Female subtopics
                    </Typography>
                    <LineChart width={1100} height={350} data={Object.entries(stats?.femaleSubtopics || {}).map(([key, value], index) => ({ name: key, value: value, fill: `linear-gradient(to right, #ADD8E6, #000000)` }))} margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#000" activeDot={{ r: 8 }} />
                    </LineChart>
                </Box>
        </Paper>
    );
}

