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
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Avatar from '@mui/material/Avatar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Router, { useRouter } from 'next/router';


/* Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      }),
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
}; */

const BASE_URL = 'https://ec2-13-126-83-192.ap-south-1.compute.amazonaws.com/'
//const BASE_URL = 'http://192.168.1.104/'
export default function Verification(props) {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);
  //const { row } = items;
  const [open, setOpen] = React.useState(false);
  const [approve, setApproval] = React.useState('reject');
  const [refresh, setRefresh] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [payload, setPayload] = React.useState({});
  const [notes, setNotes] = React.useState('');
  const [rerender, setRerender] = React.useState(false);
  const router = useRouter();

  const handleClose = () => {
    setOpenReject(false);
  };
  const handleSave = () => {
    const token = localStorage.getItem("token");
    setOpenReject(false);
    payload.notes = token +': '+notes;
    handleApprove(payload);
  };
  const handleChange = (event, row) => {
    const token = localStorage.getItem("token");
    console.log(event.target.value, row)
    let payload = {
      id: row.id,
      user_id: row.user_id,
      img_url: row.img_url,
      attempts: row.attempts + 1,
      verified: event.target.value == 'approve' ? true : false,
      admin_id: 2,
      notes: { img: row.img_url, admin_id: token }
    }
    if (event.target.value == 'reject') {
      setPayload(payload);
      setOpenReject(true);
    } else {
      handleApprove(payload)
    }
    console.log(payload)

    //setApproval(option);
  };
  function handleApprove(payload) {
    fetch(BASE_URL + 'public/admin-update-user-verification', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then((result) => {
      setPayload({});
      setNotes('');
      setRefresh(!refresh)
    }, (error) => {
      setPayload({});
      setNotes('');
      setIsLoaded(true);
      setError(error);
      setRefresh(!refresh)
    })
  }
  function srcset(image, size, rows = 1, cols = 1) {
    return {
      src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
      srcSet: `${image}?w=${size * cols}&h=${size * rows
        }&fit=crop&auto=format&dpr=2 2x`,
    };
  }
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
  function handleLogout(){
    localStorage.removeItem("token")
    router.push("/");
  }
  function Row(row) {
    console.log(row)
    row = row.row
    //#d79a84
    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset', /* backgroundColor: (row.attempts = 0 ? '#c8ebf4' : '#84c6d7') */ } }} >
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => openRow(row.user_id)}
            >
              {row.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.user_id}
          </TableCell>
          <TableCell align="center">{row.first_name + ' '+ row.last_name}</TableCell>
          <TableCell align="center">{row.attempts}</TableCell>
          <TableCell align="center">{/* {row.img_url} */}
            <Avatar alt="id_img"
              variant="square"
              sx={{ width: 56, height: 56 }}
              src={row.img_url} />
          </TableCell>
          <TableCell align="center">{row.verified ? 'true' : 'false'}</TableCell>
          <TableCell align="center">
            <ToggleButtonGroup
              variant="contained"
              color="primary"
              size="small"
              value={row?.logs?.length < 1 ? 'null' : (row.verified ? 'approve' : 'reject')}
              exclusive
              // onChange={handleChange/* (row) */}
              onChange={(event) => handleChange(event, row)}
              aria-label="approval"
            >
              <ToggleButton color="error" value="reject">reject</ToggleButton>
              <ToggleButton color="success" value="approve">approve</ToggleButton>
            </ToggleButtonGroup>
          </TableCell>

        </TableRow>
        <TableRow sx={{ '& > *': { border: 0, /* backgroundColor: (row.attempts = 0 ? '#c8ebf4' : '#84c6d7') */ } }} >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={row.open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }} align='center'>


                <img

                  width={300}
                  height={300}
                  src={row.img_url}
                />
                <Typography variant="h6" gutterBottom component="div" align='center'>
                  Profile images
                </Typography>
                <ImageList
                  // sx={{ width: 500, height: 450 }}
                  variant="quilted"
                  cols={4}
                  rowHeight={300}
                >
                  {row?.image_data?.map((item) => (
                    <ImageListItem key={item.img} cols={item.cols || 1} rows={item.rows || 1}>
                      <img
                        {...srcset(item.img, 200, item.rows, item.cols)}
                        alt={item.title}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
        {row.logs.length > 0 &&
          <TableRow>

            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={row.open} timeout="auto" unmountOnExit>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Admin</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>ID image</TableCell>
                    <TableCell>Attempts</TableCell>

                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.logs.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.admin_id}
                      </TableCell>
                      <TableCell>{historyRow.verified ? 'approve' : 'reject'}</TableCell>
                      <TableCell align="center">
                        <Avatar alt="id_img"
                          variant="square"
                          sx={{ width: 56, height: 56 }}
                          src={historyRow.img_url} />
                      </TableCell>

                      <TableCell align="center">{historyRow.attempts}</TableCell>
                      <TableCell align="center">
                        {historyRow.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </Collapse>

            </TableCell>
          </TableRow>
        }

      </React.Fragment>
    );
  }
 
  React.useEffect(() => {
    fetch(BASE_URL + "user/admin-get-user-verification")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          let data = result.data;
          for (let key in data) {
            let image_data = []
            let urls = data[key].image_urls
            for (let images in urls) {
              image_data.push({ img: urls[images] })
            }
            data[key].image_data = image_data
            data[key].logs = data[key].logs.filter(function (val) { return val !== null; })//.join(", ")
            const uniqueArray = data[key].logs.filter((value, index) => {
              const _value = JSON.stringify(value);
              return index === data[key].logs.findIndex(obj => {
                return JSON.stringify(obj) === _value;
              });
            });
            const uniqueImages = data[key].image_data.filter((value, index) => {
              const _value = JSON.stringify(value);
              return index === data[key].image_data.findIndex(obj => {
                return JSON.stringify(obj) === _value;
              });
            });
            data[key].logs = uniqueArray
            data[key].image_data = uniqueImages

            data[key].open = false
            /*  let logs=JSON.stringify(data[key].logs)
             console.log(logs)
             for (let info in logs) {
               console.log(logs[info])
               logs[info]=JSON.parse(logs[info])
             } */
            // data[key].logs=JSON.parse(data[key].logs)
            delete data[key].image_urls
            console.log(data)
            // data.delete( data[key].image_urls)
          }
          setItems(data);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [refresh])
  // console.log(rows)
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>

        <AppBar position="static" style={{ backgroundColor: '#fff' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters >
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="#app-bar-with-responsive-menu"
                sx={{
                  mr: 2,
                  //display: { xs: 'none', md: 'flex' },
                  // fontFamily: 'monospace',
                  fontWeight: 700,
                  // letterSpacing: '.3rem',
                  color: 'black',
                  textDecoration: 'none',
                }}
              >
                HEYO!
              </Typography>
              <Typography variant="h6" color='black' component="div" sx={{ flexGrow: 1 }}>
                User Verification Portal
              </Typography>
              <Button variant="contained" color='error'  onClick={handleLogout}>
                Logout
              </Button>

            </Toolbar>
          </Container>
        </AppBar>
      </Box>
      <div>
        {isLoaded &&

          <div style={{ alignContent: 'center', alignItems: 'center', display: 'flex', margin: 10 }}>

            <TableContainer component={Paper}>
              <Table aria-label="collapsible table" size="small" stickyHeader dense>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>ID</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Attempts</TableCell>
                    <TableCell align="center">ID image</TableCell>
                    <TableCell align="center">Verified</TableCell>
                    <TableCell align="center">Action</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <Row key={row.id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={openReject} onClose={handleClose} fullWidth>
              <DialogTitle>Reject Verification</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Add a reason for rejection
                </DialogContentText>

                <TextField
                  //  autoFocus
                  fullWidth
                  htmlFor="notes"
                  label="notes"
                  //  placeholder="add your notes"
                  // variant="standard"
                  rows={4}
                  multiline
                  onChange={(event) => {
                    setNotes(event.target.value);
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Reject</Button>
              </DialogActions>
            </Dialog>
          </div>}
      </div>
    </div>



  );
}