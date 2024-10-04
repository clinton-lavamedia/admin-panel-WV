import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Box, Typography, Button } from '@mui/material';

const Configurations = () => {
  const [colleges, setColleges] = useState([]);
  const [launchEventIn, setLaunchEventIn] = useState('');
  const [liveColleges, setLiveColleges] = useState([]);
  const [isProd] = useState(() => {
    const savedEnv = sessionStorage.getItem('isProd');
    return savedEnv !== null ? JSON.parse(savedEnv) : true;
  });

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
  };

  useEffect(() => {
    fetchColleges();
    fetchCollegeConfigurations();
  }, [isProd, BASE_URL, DEV_BASE_URL]);

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
      // Refresh everything after saving
      fetchColleges();
      fetchCollegeConfigurations();
    })
    .catch(error => {
      console.error('Error saving configuration:', error);
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        College Configurations
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
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
      <FormControl fullWidth sx={{ mb: 2 }}>
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
    </Box>
  );
};

export default Configurations;
