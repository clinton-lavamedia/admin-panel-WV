import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box, Typography, Button, Tabs, Tab, TextField, List, ListItem, ListItemText, Switch, Chip } from '@mui/material';

const Configurations = () => {
  const [colleges, setColleges] = useState([]);
  const [launchEventIn, setLaunchEventIn] = useState('');
  const [liveColleges, setLiveColleges] = useState([]);
  const [isProd] = useState(() => {
    const savedEnv = sessionStorage.getItem('isProd');
    return savedEnv !== null ? JSON.parse(savedEnv) : true;
  });
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('admin');
  const [existingUsers, setExistingUsers] = useState([]);
  const [refreshUsers, setRefreshUsers] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASEURL;
  const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

  const fetchColleges = () => {
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
  };

  const fetchCollegeConfigurations = () => {
    fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-college-config")
      .then(res => res.json())
      .then(
        (result) => {
          if (result) {
            const launchEvent = result.data[0].launchEventIn || '';
            const liveCollegesList = result.data[0].liveColleges || [];
            setLaunchEventIn(launchEvent);
            setLiveColleges(liveCollegesList);
            
            if (launchEvent && !liveCollegesList.includes(launchEvent)) {
              setLiveColleges([...liveCollegesList, launchEvent]);
            }
          }
        },
        (error) => {
          console.error('Error fetching college configurations:', error);
        }
      );
  };

  const fetchExistingUsers = () => {
    fetch(BASE_URL + "/admin-get-admin-users")
      .then(res => res.json())
      .then(
        (result) => {
          if (result && result.data) {
            const processedUsers = result.data.map(user => ({
              ...user,
              email: user.email.includes(':') ? user.email.split(':')[1] : user.email,
              userType: user.email.includes(':') ? user.email.split(':')[0] : 'admin'
            }));
            setExistingUsers(processedUsers);
          }
        },
        (error) => {
          console.error('Error fetching existing users:', error);
        }
      );
  };

  useEffect(() => {
    fetchColleges();
    fetchCollegeConfigurations();
    fetchExistingUsers();
  }, [isProd, BASE_URL, DEV_BASE_URL]);

  useEffect(() => {
    if (refreshUsers) {
      fetchExistingUsers();
      setRefreshUsers(false);
    }
  }, [refreshUsers]);

  const handleLaunchEventChange = (event) => {
    const selectedCollege = event.target.value;
    setLaunchEventIn(selectedCollege);
    if (selectedCollege && !liveColleges.includes(selectedCollege)) {
      setLiveColleges([...liveColleges, selectedCollege]);
    }
  };

  const handleLiveCollegesChange = (event) => {
    const selectedColleges = event.target.value;
    setLiveColleges(selectedColleges);
    if (launchEventIn && !selectedColleges.includes(launchEventIn)) {
      setLiveColleges([...selectedColleges, launchEventIn]);
    }
  };

  const handleSave = () => {
    const configData = {
      launchEventIn,
      liveColleges
    };

    fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-save-college-config", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Configuration saved successfully:', data);
      fetchColleges();
      fetchCollegeConfigurations();
    })
    .catch(error => {
      console.error('Error saving configuration:', error);
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserSave = () => {
    const userEmail = userType === 'campus_ambassador' ? `campus_ambassador:${email}` : email;
    fetch(BASE_URL+ "/create-admin-user-verification", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, password ,active:true}),
    })
    .then(response => response.json())
    .then(data => {
      console.log('User saved successfully:', data);
      setRefreshUsers(true);
      setEmail('');
      setPassword('');
      setUserType('admin');
    })
    .catch(error => {
      console.error('Error saving user:', error);
    });
  };

  const handleUserActiveToggle = (userEmail) => {
    fetch(BASE_URL + "/create-admin-user-verification", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, active: !existingUsers.find(user => user.email === userEmail).active }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('User active status updated successfully:', data);
      setRefreshUsers(true);
    })
    .catch(error => {
      console.error('Error updating user active status:', error);
    });
  };

  return (
    <Box sx={{ width: '100%',  margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Configurations
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="College and Event Setup" />
        <Tab label="User Management" />
      </Tabs>
      
      {tabValue === 0 && (
        <>
          <FormControl style={{width:'50%'}} sx={{ mb: 2 }}>
            <InputLabel id="launch-event-label">Launch Event In</InputLabel>
            <Select
              labelId="launch-event-label"
              id="launch-event-select"
              value={launchEventIn}
              label="Launch Event In"
              onChange={handleLaunchEventChange}
            >
              {colleges.map((college) => (
                <MenuItem key={college.id} value={college.name}>
                  {college.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{width:'50%'}} sx={{ mb: 2 }}>
            <InputLabel id="live-colleges-label">Live Colleges</InputLabel>
            <Select
              labelId="live-colleges-label"
              id="live-colleges-select"
              multiple
              value={liveColleges}
              onChange={handleLiveCollegesChange}
              input={<OutlinedInput label="Live Colleges" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {colleges.map((college) => (
                <MenuItem key={college.id} value={college.name}>
                  {college.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Configurations
          </Button>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Current Configurations
            </Typography>
            <Typography>
              Launch Event In: {launchEventIn || 'Not set'}
            </Typography>
            <Typography>
              Live Colleges: {liveColleges.length > 0 ? liveColleges.join(', ') : 'None'}
            </Typography>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '48%' }}>
              <TextField
                fullWidth
                label="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="user-type-label">User Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="user-type-select"
                  value={userType}
                  label="User Type"
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="campus_ambassador">Campus Ambassador</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleUserSave}>
                Save User
              </Button>
            </Box>
            <Box sx={{ width: '48%' }}>
              <Typography variant="h6" gutterBottom>
                Existing Users
              </Typography>
              <Box sx={{ height: 400, overflow: 'auto' }}>
                <List>
                  {existingUsers.map((user) => (
                    <ListItem key={user.email}>
                      <ListItemText 
                        primary={user.email}
                        secondary={
                          <Chip 
                            label={user.userType} 
                            color={user.userType === 'admin' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        }
                      />
                      <Switch
                        checked={user.active}
                        disabled
                        //onChange={() => handleUserActiveToggle(user.email)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Configurations;
