import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="seeded thread tabs">
                    <Tab label="Seeded Users" />
                    <Tab label="Thread Creation" />
                    <Tab label="Reported Threads" />
                </Tabs>
            </Box>
            <Box sx={{ padding: 2 }}>
                {tabValue === 0 && <SeededUsers />}
                {tabValue === 1 && <ThreadCreation />}
                {tabValue === 2 && <Threads />}
            </Box>
        </Box>
    );
};

export default SeededThread;
