import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import SeededUsers from './seededusers';
import ThreadCreation from './thread_creation';
import Threads from './threads';

const SeededThread = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
              <Typography variant="h3" gutterBottom textAlign={'center'}>
                Seeded Users & Threads
            </Typography>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Seeded Users" />
                    <Tab label="Thread Creation" />
                    <Tab label="Reported Threads" />
            </Tabs>

            <Box sx={{ padding: 2 }}>
                {tabValue === 0 && <SeededUsers />}
                {tabValue === 1 && <ThreadCreation />}
                {tabValue === 2 && <Threads />}
            </Box>
        </Box>
    );
};

export default SeededThread;
