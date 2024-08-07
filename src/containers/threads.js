import React, { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Grid, Avatar, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

const Threads = () => {
    const [threads, setThreads] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [isProd, setIsProd] = useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + '/threads/get-reported-threads');
                const data = await response.json();
                setThreads(data.data || []);
            } catch (error) {
                console.error('Error fetching threads:', error);
            }
        };

        fetchThreads();
    }, [isProd]);

    const handleAccordionChange = async (msgId) => {
        setExpanded((prev) => (prev === msgId ? false : msgId));
        if (expanded !== msgId) {
            try {
                const response = await fetch((isProd ? BASE_URL : DEV_BASE_URL) + `/threads?msgId=${msgId}`);
                const data = await response.json();
                // Update the specific thread data with the fetched data if needed
                console.log(data);
                setThreads((prevThreads) =>
                    prevThreads.map((thread) =>
                        thread.msgId === msgId ? { ...thread, details: data.data } : thread
                    )
                );
            } catch (error) {
                console.error('Error fetching thread details:', error);
            }
        }
    };

    const handleDelete = async (msgId) => {
        const user = localStorage.getItem("token");
        const threadToDelete = threads.find((thread) => thread.msgId === msgId);
        const deletedBy = user; // Replace with the actual logged-in user's email
        const userId = threadToDelete?.details?.sender?.uid;
        const id=threadToDelete?._id;
        const reportedAt = threadToDelete?.reportedAt;
        
        const type = threadToDelete?.details?.metadata ? 'thread' : 'comment';

        try {
            await fetch((isProd ? BASE_URL : DEV_BASE_URL) + `/threads/delete-reported-threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, msgId, deletedBy, userId, type,reportedAt }),
            });
            setThreads((prevThreads) => prevThreads.filter((thread) => thread.msgId !== msgId));
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    const groupedThreads = threads.length > 0 ? threads.reduce((acc, thread) => {
        if (!acc[thread.msgId]) {
            acc[thread.msgId] = {
                groupId: thread.groupId,
                tag: thread.tag,
                lastReportedAt: thread.reportedAt,
                reports: [],
                reasons: {},
                reportedBy: {},
                deletedBy: thread.deletedBy,
                deletedAt: thread.deletedAt
            };
        }
        acc[thread.msgId].reports.push(thread);
        acc[thread.msgId].lastReportedAt = new Date(Math.max(new Date(acc[thread.msgId].lastReportedAt), new Date(thread.reportedAt)));
        acc[thread.msgId].reasons[thread.reason] = (acc[thread.msgId].reasons[thread.reason] || 0) + 1;
        acc[thread.msgId].reportedBy[thread.reportedBy] = (acc[thread.msgId].reportedBy[thread.reportedBy] || 0) + 1;
        return acc;
    }, {}) : {};

    const sortedThreadIds = Object.keys(groupedThreads).sort((a, b) => new Date(groupedThreads[b].lastReportedAt) - new Date(groupedThreads[a].lastReportedAt));

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Reported Threads
            </Typography>
            {sortedThreadIds.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    No reported threads available.
                </Typography>
            ) : (
                sortedThreadIds.map((msgId) => (
                    <Accordion key={msgId} expanded={expanded === msgId && !groupedThreads[msgId].deletedAt} onChange={() => handleAccordionChange(msgId)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <Typography>{`Message ID: ${msgId}`}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography sx={{ fontSize: '14px' }}>
                                        {groupedThreads[msgId].deletedAt 
                                            ? `Deleted at: ${new Date(groupedThreads[msgId].deletedAt).toLocaleString()}` 
                                            : `Last reported at: ${new Date(groupedThreads[msgId].lastReportedAt).toLocaleString()}`}
                                    </Typography>
                                </Grid>
                                {groupedThreads[msgId].deletedAt && (
                                    <Grid item xs={12} sm={4}>
                                        <Typography sx={{ fontSize: '14px' }}>{`Deleted by: ${groupedThreads[msgId].deletedBy}`}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: '14px' }}>{`Number of reports: ${groupedThreads[msgId].reports.length}`}</Typography>
                                <Grid container spacing={1}>
                                    {Object.keys(groupedThreads[msgId].reasons).map((reason) => (
                                        <Grid item key={reason}>
                                            <Chip label={`${reason}: ${groupedThreads[msgId].reasons[reason]}`} color="primary" />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {Object.keys(groupedThreads[msgId].reportedBy).map((reporter) => (
                                        <Grid item key={reporter}>
                                            <Chip label={`${reporter}: ${groupedThreads[msgId].reportedBy[reporter]}`} color="secondary" />
                                        </Grid>
                                    ))}
                                </Grid>
                                {groupedThreads[msgId].reports.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        {groupedThreads[msgId].reports[0].details?.deletedAt ? (
                                            <Typography variant="body2" color="error">{`Message was deleted at ${new Date(groupedThreads[msgId].reports[0].details.deletedAt * 1000).toLocaleString()}`}</Typography>
                                        ) : groupedThreads[msgId].reports[0].details?.id ? (
                                            <>
                                                <Grid container spacing={1} alignItems="center">
                                                    <Grid item>
                                                        <Avatar src={groupedThreads[msgId].reports[0].details.sender.avatar} alt={groupedThreads[msgId].reports[0].details.sender.name} />
                                                    </Grid>
                                                    <Grid item>
                                                        <Typography variant="body2">{`Sender: ${groupedThreads[msgId].reports[0].details.sender.name} (UID: ${groupedThreads[msgId].reports[0].details.sender.uid})`}</Typography>
                                                        <Typography variant="body2">{`Last Active At: ${new Date(groupedThreads[msgId].reports[0].details.sender.lastActiveAt * 1000).toLocaleString()}`}</Typography>
                                                    </Grid>
                                                </Grid>
                                                <Typography variant="body2">{`Message: ${groupedThreads[msgId].reports[0].details.customData?.text || groupedThreads[msgId].reports[0].details.metadata?.text || 'No text available'}`}</Typography>
                                               {/*  {groupedThreads[msgId].reports[0].details.customData?.gif && (
                                                    <img src={groupedThreads[msgId].reports[0].details.customData.gif} alt="custom data gif" style={{ maxWidth: '100%' }} />
                                                )}
                                                {groupedThreads[msgId].reports[0].details.customData?.link && (
                                                    <img src={groupedThreads[msgId].reports[0].details.customData.link} alt="custom data link" style={{ maxWidth: '100%' }} />
                                                )} */}
                                                {groupedThreads[msgId].reports[0].details.customData?.media && (
                                                    <img src={groupedThreads[msgId].reports[0].details.customData.media} alt="custom data media" style={{ maxWidth: '100%' }} />
                                                )}
                                                {groupedThreads[msgId].reports[0].details.metadata?.gif && (
                                                    <img src={groupedThreads[msgId].reports[0].details.metadata.gif} alt="metadata gif" style={{ maxWidth: '100%' }} />
                                                )}
                                               {/*  {groupedThreads[msgId].reports[0].details.metadata?.link && (
                                                    <img src={groupedThreads[msgId].reports[0].details.metadata.link} alt="metadata link" style={{ maxWidth: '100%' }} />
                                                )}
                                                {groupedThreads[msgId].reports[0].details.metadata?.media && (
                                                    <img src={groupedThreads[msgId].reports[0].details.metadata.media} alt="metadata media" style={{ maxWidth: '100%' }} />
                                                )} */}
                                                 <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton onClick={() => handleDelete(msgId)} aria-label="delete" sx={{ color: 'red' }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="error">Message not found</Typography>
                                        )}
                                       
                                    </Box>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </Box>
    );
};

export default Threads;

