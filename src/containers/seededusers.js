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

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Typography from '@mui/material/Typography';

const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

export default function SeededUsers() {
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
  const [isProd, setIsProd] = React.useState(() => {
    const savedEnv = sessionStorage.getItem('isProd');
    return savedEnv !== null ? JSON.parse(savedEnv) : true;
});
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  React.useEffect(() => {
    fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-seeded-users")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          let data = result.data.user;
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
      if (items[data].id == user_id) {
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
    function srcset(image, size, rows = 1, cols = 1) {
      return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows
          }&fit=crop&auto=format&dpr=2 2x`,
      };
    }
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => openRow(row.id)}
            >
              {row.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.id}
          </TableCell>
          <TableCell align="center">{row.username}</TableCell>
          <TableCell align="center">{row.first_name}</TableCell>
          <TableCell align="center">{row.last_name}</TableCell>
          <TableCell align="center">{row.age}</TableCell>
          <TableCell align="center">{row.gender}</TableCell>
          <TableCell align="right">{row.strapi_id}</TableCell>
          <TableCell align="center">{row.country_code}</TableCell>
          <TableCell align="center">{row.degree}</TableCell>
          <TableCell align="center">{row.course_year}</TableCell>
          <TableCell align="center">{row.college_id}</TableCell>
          <TableCell align="center">{row.course_id}</TableCell>

        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={row.open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow >

                      <ImageList
                        variant="quilted"
                        cols={4}
                        rowHeight={200}
                      >
                        {row.images?.map((item) => (
                          <ImageListItem key={item.id} cols={item.cols || 1} rows={item.rows || 1}>
                            <img
                              {...srcset(item.image_url, 200, item.rows, item.cols)}
                              alt={item.title}
                              loading="lazy"
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>


                    </TableRow>

                    <TableRow>
                      <TableCell>Interests</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.interests?.map((row) => (
                      <TableRow key={row.id}>{row.subtopic} </TableRow>
                    ))}
                    <TableRow key={row.id}>

                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
 <Typography variant="h3" gutterBottom textAlign={'center'}>
            Seeded users
      </Typography>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small" aria-label="collapsible table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>DB ID</TableCell>
              <TableCell align="center">Username</TableCell>
              <TableCell align="center">First name</TableCell>
              <TableCell align="center">Last name</TableCell>
              <TableCell align="center">Age</TableCell>
              <TableCell align="center">Gender</TableCell>
              <TableCell align="center">Strapi ID</TableCell>
              <TableCell align="center">Country Code</TableCell>
              <TableCell align="center">Degree</TableCell>
              <TableCell align="center">Year</TableCell>
              <TableCell align="center">College</TableCell>
              <TableCell align="center">Course</TableCell>

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
