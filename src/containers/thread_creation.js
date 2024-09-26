import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Typography, Grid, InputAdornment, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';

import { GiphyFetch } from '@giphy/js-fetch-api'
const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;
const gf = new GiphyFetch('47Dk4ZUwcjCX5zbX6EJOqo5moXBI3lwi')

const ThreadCreation = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [giphy, setGiphy] = useState('');
    const [url, setUrl] = useState('');
    const [priority, setPriority] = useState('');
    const [isProd, setIsProd] = useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });
    const [giphyDialogOpen, setGiphyDialogOpen] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [mediaType, setMediaType] = useState('image');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        fetch((isProd ? BASE_URL.replace('/user', '') : DEV_BASE_URL.replace('/user', '')) + "/admin/app-data")
            .then(res => res.json())
            .then(
                (result) => {
                    setColleges(result.data.colleges);
                },
                (error) => {
                    console.error('Error fetching colleges:', error);
                }
            );
    }, []);

    useEffect(() => {
        if (selectedCollege) {
            fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-seeded-users")
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log(result.data.user)
                        const filteredUsers = result.data.user.filter(user => user.college_id === selectedCollege);
                        console.log(filteredUsers);
                        setUsers(filteredUsers);
                    },
                    (error) => {
                        console.error('Error fetching users:', error);
                    }
                );
        }
    }, [selectedCollege]);

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleCreateThread = () => {
        const token = localStorage.getItem("token");
        // Handle thread creation logic here
        if (image) {
            const generateRandomFilename = () => {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let filename = '';
                for (let i = 0; i < 10; i++) {
                    filename += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return filename + '.png';
            };

            const randomFilename = generateRandomFilename();
            const payload = {
                filename: randomFilename
            };

            fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-threads-upload-url", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(
                    async (result) => {
                        if (result.status === "OK") {
                            const signedUrl = result.data.signedUrl;
                            try {
                                // Compress the image
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                const img = new Image();
                                img.src = URL.createObjectURL(image);
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
                                image = signedUrl.split('?')[0]; // Update image with the URL without query parameters
                            } catch (err) {
                                console.error('Failed to push image to S3. Please try again.', err);
                            }
                        } else {
                            console.error('Error getting signed URL:', result);
                        }
                    },
                    (error) => {
                        console.error('Error uploading image:', error);
                    }
                );
        }
       /*  const threadPayload = {
            college: selectedCollege,
            user: selectedUser,
            text: text,
            image: image,
            giphy: giphy,
            url: url,
            priority: priority
        }; */
          const threadBody = {
            userId: 'seeded_'+selectedUser,
            user_post:
            {
                category: "custom",
                type: "custom",
                payload: {
                    text: text,
                    media: giphy.split('?')[0] || image,
                    gif: giphy.split('?')[0] || null,
                    link: url,
                    tag: "" 
                },
                group: selectedCollege,
                tags: [],
                parentId: null
            },
            priority: priority,
            createdBy:token
        };

        console.log('thread body >> ', JSON.stringify(threadBody));
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-create-threads", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(threadBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Thread creation successful:', data);
            setSnackbarMessage('Thread creation successful');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            // Clear all fields after posting
            setSelectedCollege('');
            setSelectedUser('');
            setText('');
            setImage(null);
            setGiphy('');
            setUrl('');
            setPriority('');
            setMediaType('image');
        })
        .catch((error) => {
            console.error('Error creating thread:', error);
            setSnackbarMessage('Error creating thread');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        });

        setDialogOpen(false);
    };

    const handleGiphySearch = async () => {
        const { data: gifs } = await gf.search(giphy, { sort: 'relevant', lang: 'es', limit: 10, type: 'stickers' });
        setGifs(gifs);
        setGiphyDialogOpen(true);
    };

    const handleGiphySelect = (gifUrl) => {
        setGiphy(gifUrl);
        setGiphyDialogOpen(false);
    };

    const handleGiphyDialogClose = () => {
        setGiphyDialogOpen(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleDialogOpen}>
                    Create seeded thread
                </Button>
            </Box>
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Create Seeded Thread</DialogTitle>
                <DialogContent>
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
                    <TextField
                        select
                        margin="dense"
                        label="User"
                        fullWidth
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        disabled={!selectedCollege}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.username}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Priority (for pinned threads)"
                        type="number"
                        fullWidth
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Text"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <FormControl component="fieldset" style={{ marginTop: '10px' }}>
                        <FormLabel component="legend">Media Type</FormLabel>
                        <RadioGroup
                            row
                            aria-label="media-type"
                            name="media-type"
                            value={mediaType}
                            onChange={(e) => setMediaType(e.target.value)}
                        >
                            <FormControlLabel value="image" control={<Radio />} label="Image" />
                            <FormControlLabel value="giphy" control={<Radio />} label="Giphy" />
                            <FormControlLabel value="link" control={<Radio />} label="Link" />
                        </RadioGroup>
                    </FormControl>
                    {mediaType === 'image' && (
                        <Button
                            variant="contained"
                            component="label"
                            fullWidth
                            style={{ marginTop: '10px' }}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                onChange={handleImageUpload}
                            />
                        </Button>
                    )}
                    {mediaType === 'giphy' && (
                        <TextField
                            margin="dense"
                            label="Search GIPHY"
                            type="text"
                            fullWidth
                            value={giphy}
                            onChange={(e) => setGiphy(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleGiphySearch}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    {mediaType === 'link' && (
                        <TextField
                            margin="dense"
                            label="URL"
                            type="text"
                            fullWidth
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateThread} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={giphyDialogOpen} onClose={handleGiphyDialogClose}>
                <DialogTitle>Select a Giphy</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {gifs.map((gif) => (
                            <Grid item xs={4} key={gif.id}>
                                <img
                                    src={gif.images.fixed_height.url}
                                    alt={gif.title}
                                    style={{ cursor: 'pointer', width: '100%' }}
                                    onClick={() => handleGiphySelect(gif.images.fixed_height.url)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleGiphyDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ThreadCreation;
