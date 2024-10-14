import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Typography, Grid, InputAdornment, IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Checkbox } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    const [threads, setThreads] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [sendPushNotification, setSendPushNotification] = useState(false);
    const [pushNotificationTitle, setPushNotificationTitle] = useState('');
    const [pushNotificationBody, setPushNotificationBody] = useState('');
    const [launchEventIn, setLaunchEventIn] = useState('');
    const [liveColleges, setLiveColleges] = useState([]);

    const tags = [
        {'label': 'Confession', 'color': '#EF9EFF', 'borderColor': '#D400FF', 'id': 0},
        {'label': 'Meme', 'color': '#92FFF6', 'borderColor': '#00D4C2', 'id': 1},
        {'label': 'Crush', 'color': '#FFA5C9', 'borderColor': '#EC005F', 'id': 2},
        {'label': 'Event', 'color': '#FDFF9F', 'borderColor': '#B4B800', 'id': 3},
        {'label': 'Shoutout', 'color': '#FFAF73', 'borderColor': '#FC6C00', 'id': 4},
        {'label': 'DM me', 'color': '#D2CEFF', 'borderColor': '#1400FD', 'id': 5},
        {'label': 'Question', 'color': '#E6DAC7', 'borderColor': '#807B74', 'id': 6},
    ];

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
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/get-admin-thread", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('Admin thread data:', result);
                    if (result.status === "OK") {
                        const sortedThreads = result.data.sort((a, b) => (a.priority || '').localeCompare(b.priority || ''));
                        setThreads(sortedThreads);
                    }
                },
                (error) => {
                    console.error('Error fetching admin thread:', error);
                }
            );
        
        // Fetch college configurations
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-college-config")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result && result.data && result.data[0]) {
                        const launchEvent = result.data[0].launchEventIn || '';
                        const liveCollegesList = result.data[0].liveColleges || [];
                        setLaunchEventIn(launchEvent);
                        setLiveColleges(liveCollegesList);
                        
                        // Auto-select launchEventIn college in liveColleges if not already there
                        if (launchEvent && !liveCollegesList.includes(launchEvent)) {
                            setLiveColleges([...liveCollegesList, launchEvent]);
                        }
                    }
                },
                (error) => {
                    console.error('Error fetching college configurations:', error);
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
                        let data = result.data.user;
                        data = data.filter(user => !user.course_id || user.course_id.length === 0);

                        const filteredUsers = data.filter(user => user.college_id === selectedCollege);
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

    const handleCreateThread = async () => {
        // Check if at least one of text, image, giphy, or url is provided
        if (!text && !image && !giphy && !url) {
            setSnackbarMessage('Please enter either text, image, gif, or link');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // Check if the selected college is live
        if (!liveColleges.includes(selectedCollege)) {
            setSnackbarMessage('Selected college is not live');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const token = localStorage.getItem("token");
        let uploadedImageUrl = null;

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
                    uploadedImageUrl = signedUrl.split('?')[0]; // Update image with the URL without query parameters
                } else {
                    console.error('Error getting signed URL:', result);
                    setSnackbarMessage('Error uploading image');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    return; // Exit the function if image upload fails
                }
            } catch (err) {
                console.error('Failed to push image to S3. Please try again.', err);
                setSnackbarMessage('Error uploading image');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return; // Exit the function if image upload fails
            }
        }
      
        const threadBody = {
            userId: 'seeded_'+selectedUser,
            user_post:
            {
                category: "custom",
                type: "custom",
                payload: {
                    text: text,
                    media: giphy.split('?')[0] || uploadedImageUrl || null,
                    gif: giphy.split('?')[0] || null,
                    link: url,
                    tag: selectedTag ? selectedTag.label : ""
                },
                group: selectedCollege,
                tags: selectedTag ? [selectedTag.label] : [],
                parentId: null
            },
            priority: priority,
            createdBy:token
        };

        console.log('thread body >> ', JSON.stringify(threadBody));
        try {
            const response = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-create-threads", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(threadBody)
            });
            const data = await response.json();
            console.log('Thread creation successful:', data);
            setSnackbarMessage('Thread creation successful');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Send push notification if enabled
            if (sendPushNotification) {
                let userIds = [];
                if (selectedCollege === launchEventIn) {
                    const realUsersResponse = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-real-users");
                    const realUsersData = await realUsersResponse.json();
                    userIds = realUsersData.data.user
                        .filter(user => liveColleges.includes(user.college_id))
                        .map(user => user.id);
                }

                if (userIds.length > 0) {
                    const notificationBody = {
                        title: pushNotificationTitle,
                        message: pushNotificationBody,
                        user_ids: userIds,
                        type: 'USER_NOTIFICATION'
                    };

                    const notificationResponse = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/send-bulk-user-notification", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(notificationBody)
                    });

                    const notificationResult = await notificationResponse.json();
                    console.log('Push notification sent:', notificationResult);
                }
            }

            // Clear all fields after posting
            setSelectedCollege('');
            setSelectedUser('');
            setText('');
            setImage(null);
            setGiphy('');
            setUrl('');
            setPriority('');
            setMediaType('image');
            setSelectedTag(null);
            setSendPushNotification(false);
            setPushNotificationTitle('');
            setPushNotificationBody('');
        } catch (error) {
            console.error('Error creating thread:', error);
            setSnackbarMessage('Error creating thread');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }

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
            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Create Seeded Thread</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
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
                            <TextField
                                margin="dense"
                                label="URL"
                                type="text"
                                fullWidth
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
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
                            <FormControl component="fieldset" style={{ marginTop: '10px' }}>
                                <FormLabel component="legend">Select a tag</FormLabel>
                                <Box display="flex" flexWrap="wrap" gap={1} marginTop={1}>
                                    {tags.map((tag) => (
                                        <Chip
                                            key={tag.id}
                                            label={tag.label}
                                            onClick={() => setSelectedTag(tag)}
                                            style={{
                                                backgroundColor: tag.color,
                                                border: `2px solid ${tag.borderColor}`,
                                                color: 'black',
                                                fontWeight: 'bold',
                                                opacity: selectedTag && selectedTag.id === tag.id ? 1 : 0.6,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={sendPushNotification}
                                        onChange={(e) => setSendPushNotification(e.target.checked)}
                                    />
                                }
                                label="Send Push Notification"
                            />
                            {sendPushNotification && (
                                <>
                                    <TextField
                                        margin="dense"
                                        label="Push Notification Title"
                                        type="text"
                                        fullWidth
                                        value={pushNotificationTitle}
                                        onChange={(e) => setPushNotificationTitle(e.target.value)}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Push Notification Body"
                                        type="text"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={pushNotificationBody}
                                        onChange={(e) => setPushNotificationBody(e.target.value)}
                                    />
                                </>
                            )}
                        </Grid>
                    </Grid>
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
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Thread ID</TableCell>
                            <TableCell>User ID</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Group</TableCell>
                            <TableCell>Media</TableCell>
                            <TableCell>Text</TableCell>
                            <TableCell>Link</TableCell>
                            <TableCell>Tag</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {threads.map((thread) => (
                            <TableRow key={thread._id}>
                                <TableCell>{thread.threadId}</TableCell>
                                <TableCell>{thread.userId}</TableCell>
                                <TableCell>{thread.priority}</TableCell>
                                <TableCell>{thread.group}</TableCell>
                                <TableCell>
                                    {thread.data.customData.media && (
                                        <img src={thread.data.customData.media} alt="media" style={{ width: '100px' }} />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography style={{ whiteSpace: 'pre-wrap' }}>
                                        {thread.data.customData.text}
                                    </Typography>
                                </TableCell>
                                <TableCell>{thread.data.customData.link}</TableCell>
                                <TableCell>{thread.data.customData.tag}</TableCell>
                                <TableCell>{thread.createdBy}</TableCell>
                                <TableCell>{new Date(thread.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ThreadCreation;
