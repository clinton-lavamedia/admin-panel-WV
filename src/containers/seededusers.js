import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

export default function SeededUsers() {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [refresh, setRefresh] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [isProd, setIsProd] = React.useState(() => {
    const savedEnv = sessionStorage.getItem('isProd');
    return savedEnv !== null ? JSON.parse(savedEnv) : true;
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [colleges, setColleges] = React.useState([]);
  const [selectedCollege, setSelectedCollege] = React.useState('');
  const [collegeDialogOpen, setCollegeDialogOpen] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    fetch((isProd ? BASE_URL.replace('/user', '') : DEV_BASE_URL.replace('/user', '')) + "/admin/app-data")
      .then(res => res.json())
      .then(
        (result) => {
          setColleges(result.data.colleges);
        },
        (error) => {
          setError(error);
        }
      )
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleCreateUser = () => {
    const userPayload = {
      username: username,
      college: selectedCollege
    };

    fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin/create-seeded-user", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userPayload)
    })
    .then(res => res.json())
    .then(
      (result) => {
        if (result.success) {
          setRefresh(!refresh);
        } else {
          setError(result.message);
        }
      },
      (error) => {
        setError(error);
      }
    );
    setDialogOpen(false);
  };

  const handleCollegeDialogOpen = () => {
    fetch((isProd ? BASE_URL.replace('/user', '') : DEV_BASE_URL.replace('/user', '')) + "/admin/app-data")
      .then(res => res.json())
      .then(
        (result) => {
          setColleges(result.data.colleges);
        },
        (error) => {
          setError(error);
        }
      )
      setCollegeDialogOpen(true);
  };

  const handleCollegeDialogClose = () => {
    setCollegeDialogOpen(false);
  };

  const handleCreateCollege = async () => {
    let uploadedImageUrl = null;

    if (profileImage) {
      const generateRandomFilename = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let filename = '';
        for (let i = 0; i < 10; i++) {
          filename += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return 'seeded-colleges/' + filename + '.png';
      };

      const randomFilename = generateRandomFilename();
      const payload = {
        filename: randomFilename,
        bucket: 'heyo-public-assets'
      };

      try {
        const response = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-threads-upload-url", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.status === "OK") {
          const signedUrl = result.data.signedUrl;
          // Compress the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = URL.createObjectURL(profileImage);
          await new Promise((resolve) => {
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              canvas.width = 720;
              canvas.height = 720 / aspectRatio;
              if (canvas.height < 200) {
                canvas.height = 200;
                canvas.width = 200 * aspectRatio;
              }
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve();
            };
          });
          const compressedImage = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/png', 0.9); // Adjust the quality as needed
          });

          await fetch(signedUrl, {
            method: 'PUT',
            body: compressedImage,
            headers: {
              'Content-Type': 'image/png'
            }
          });
          console.log('Image upload to S3 successful');
          uploadedImageUrl = signedUrl.split('?')[0]; // Update image with the URL without query parameters

          const userPayload = {
            username: username,
            college: selectedCollege,
            profileImage: uploadedImageUrl
          };
         
      
          fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin/create-seeded-user", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userPayload)
          })
          .then(res => res.json())
          .then(
            (result) => {
              if (result.success) {
                setRefresh(!refresh);
              } else {
                setError(result.message);
              }
            },
            (error) => {
              setError(error);
            }
          );
        } else {
          console.error('Error getting signed URL:', result);
          setError('Error uploading image');
          return; // Exit the function if image upload fails
        }
      } catch (err) {
        console.error('Failed to push image to S3. Please try again.', err);
        setError('Error uploading image');
        return; // Exit the function if image upload fails
      }
    }
    
    setCollegeDialogOpen(false);
  };

  React.useEffect(() => {
    fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-seeded-users")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          let data = result.data.user;
          data = data.filter(user => !user.course_id || user.course_id.length === 0);
          setItems(data);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [refresh])

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={handleCollegeDialogOpen}>
          Create seeded college
        </Button>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
          Create seeded user
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Create Seeded User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="College"
            fullWidth
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
          >
            {colleges.map((college) => (
              <MenuItem key={college.id} value={college.name}>
                {college.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateUser} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={collegeDialogOpen} onClose={handleCollegeDialogClose}>
        <DialogTitle>Create Seeded College</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            margin="dense"
            label="Username (typically college/brand name)"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="College (thread group name)"
            fullWidth
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
          >
            {colleges.map((college) => (
              <MenuItem key={college.id} value={college.name}>
                {college.name}
              </MenuItem>
            ))}
          </TextField>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span">
              Upload Profile Image
            </Button>
          </label>
          {profileImage && <Typography variant="body2">{profileImage.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollegeDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateCollege} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small" aria-label="seeded users table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Profile Image</TableCell>
              <TableCell>DB ID</TableCell>
              <TableCell align="center">Username</TableCell>
              <TableCell align="center">College</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Avatar src={row.images && row.images[0] ? row.images[0].image_url : ''} />
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="center">{row.username}</TableCell>
                <TableCell align="center">{row.college_id}</TableCell>
              </TableRow>
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
