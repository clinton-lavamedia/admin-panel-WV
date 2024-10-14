import React, { useState, useEffect } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Grid, Avatar, IconButton, Card, CardContent, CardMedia, Link } from '@mui/material';
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
        const deletedBy = user;
        const userId = threadToDelete?.details?.sender?.uid;
        const id = threadToDelete?._id;
        const reportedAt = threadToDelete?.reportedAt;
        const reportedBy = threadToDelete?.reportedBy;
        const type = threadToDelete?.details?.parentMessageId ? 'comment' : 'thread';
        const threadDetails = threadToDelete?.details;
        const customData = threadToDelete?.details?.customData;
        const metadata = threadToDelete?.details?.metadata;      

        try {
            await fetch((isProd ? BASE_URL : DEV_BASE_URL) + `/threads/delete-reported-threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id, msgId, deletedBy, userId, type, reportedAt, reportedBy, threadDetails, customData, metadata}),
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
            {sortedThreadIds.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    No reported threads available.
                </Typography>
            ) : (
                sortedThreadIds.map((msgId) => (
                    <Card key={msgId} sx={{ mb: 2 }}>
                        <Accordion expanded={expanded === msgId} onChange={() => handleAccordionChange(msgId)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle1">{`Message ID: ${msgId}`}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="textSecondary">
                                            {groupedThreads[msgId].deletedAt 
                                                ? `Deleted at: ${new Date(groupedThreads[msgId].deletedAt).toLocaleString()}` 
                                                : `Last reported at: ${new Date(groupedThreads[msgId].lastReportedAt).toLocaleString()}`}
                                        </Typography>
                                    </Grid>
                                    {groupedThreads[msgId].deletedAt && (
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body2" color="error">{`Deleted by: ${groupedThreads[msgId].deletedBy}`}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>{`Number of reports: ${groupedThreads[msgId].reports.length}`}</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Reasons:</Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(groupedThreads[msgId].reasons).map(([reason, count]) => (
                                                <Grid item key={reason}>
                                                    <Chip label={`${reason}: ${count}`} color="primary" variant="outlined" />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Reported By:</Typography>
                                        <Grid container spacing={1}>
                                            {Object.entries(groupedThreads[msgId].reportedBy).map(([reporter, count]) => (
                                                <Grid item key={reporter}>
                                                    <Chip label={`${reporter}: ${count}`} color="secondary" variant="outlined" />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                    {groupedThreads[msgId].reports.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            {groupedThreads[msgId].deletedAt ? (
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="h6" color="error" gutterBottom>Deleted Thread</Typography>
                                                        <Typography variant="body2">{`Group ID: ${groupedThreads[msgId].reports[0].groupId}`}</Typography>
                                                        <Typography variant="body2">{`Tag: ${groupedThreads[msgId].reports[0].tag}`}</Typography>
                                                        <Typography variant="body2">{`Reported By: ${groupedThreads[msgId].reports[0].reportedBy}`}</Typography>
                                                        <Typography variant="body2">{`Reported At: ${new Date(groupedThreads[msgId].reports[0].reportedAt).toLocaleString()}`}</Typography>
                                                        <Typography variant="body2">{`Reason: ${groupedThreads[msgId].reports[0].reason}`}</Typography>
                                                        {groupedThreads[msgId].reports[0].customData && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="subtitle2" gutterBottom>Custom Data:</Typography>
                                                                {groupedThreads[msgId].reports[0].customData.text && (
                                                                    <Typography variant="body2">{`Text: ${groupedThreads[msgId].reports[0].customData.text}`}</Typography>
                                                                )}
                                                                {groupedThreads[msgId].reports[0].customData.tag && (
                                                                    <Typography variant="body2">{`Tag: ${groupedThreads[msgId].reports[0].customData.tag}`}</Typography>
                                                                )}
                                                                {groupedThreads[msgId].reports[0].customData.link && (
                                                                    <Typography variant="body2">
                                                                        Link: <Link href={groupedThreads[msgId].reports[0].customData.link} target="_blank" rel="noopener noreferrer">
                                                                            {groupedThreads[msgId].reports[0].customData.link}
                                                                        </Link>
                                                                    </Typography>
                                                                )}
                                                                {groupedThreads[msgId].reports[0].customData.media && (
                                                                    <Box mt={1}>
                                                                        <Typography variant="body2">Media:</Typography>
                                                                        <CardMedia
                                                                            component="img"
                                                                            image={groupedThreads[msgId].reports[0].customData.media}
                                                                            alt="Media"
                                                                            sx={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                                                        />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        )}
                                                        <Typography variant="body2">{`Deleted At: ${new Date(groupedThreads[msgId].reports[0].deletedAt).toLocaleString()}`}</Typography>
                                                        <Typography variant="body2">{`Deleted By: ${groupedThreads[msgId].reports[0].deletedBy}`}</Typography>
                                                        <Typography variant="body2">{`Type: ${groupedThreads[msgId].reports[0].type}`}</Typography>
                                                        <Typography variant="body2">{`Created by: ${groupedThreads[msgId].reports[0].userId}`}</Typography>
                                                    </CardContent>
                                                </Card>
                                            ) : groupedThreads[msgId].reports[0].details?.id ? (
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid item>
                                                                <Avatar src={groupedThreads[msgId].reports[0].details.sender.avatar} alt={groupedThreads[msgId].reports[0].details.sender.name} />
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography variant="subtitle1">{`Created by: ${groupedThreads[msgId].reports[0].details.sender.name}`}</Typography>
                                                                <Typography variant="body2" color="textSecondary">{`UID: ${groupedThreads[msgId].reports[0].details.sender.uid}`}</Typography>
                                                                <Typography variant="body2" color="textSecondary">{`Last Active: ${new Date(groupedThreads[msgId].reports[0].details.sender.lastActiveAt * 1000).toLocaleString()}`}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Box sx={{ mt: 2 }}>
                                                            <Typography variant="body1">{`Message: ${groupedThreads[msgId].reports[0].details.customData?.text || groupedThreads[msgId].reports[0].details.metadata?.text || 'No text available'}`}</Typography>
                                                            <Typography variant="body2" color="textSecondary">{`Tag: ${groupedThreads[msgId].reports[0].details.customData?.tag || 'No tag available'}`}</Typography>
                                                        </Box>
                                                        {(groupedThreads[msgId].reports[0].details.customData?.media || groupedThreads[msgId].reports[0].details.metadata?.gif || groupedThreads[msgId].reports[0].details.metadata?.media) && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2" gutterBottom>Media:</Typography>
                                                                <CardMedia
                                                                    component="img"
                                                                    image={groupedThreads[msgId].reports[0].details.customData?.media || groupedThreads[msgId].reports[0].details.metadata?.gif || groupedThreads[msgId].reports[0].details.metadata?.media}
                                                                    alt="Thread media"
                                                                    sx={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                                                />
                                                            </Box>
                                                        )}
                                                        {groupedThreads[msgId].reports[0].details.metadata?.link && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2" gutterBottom>Link:</Typography>
                                                                <Link href={groupedThreads[msgId].reports[0].details.metadata.link} target="_blank" rel="noopener noreferrer">
                                                                    {groupedThreads[msgId].reports[0].details.metadata.link}
                                                                </Link>
                                                            </Box>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <Typography variant="body2" color="error">Message not found</Typography>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                    <IconButton onClick={() => handleDelete(msgId)} aria-label="delete" sx={{ color: 'error.main' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Card>
                ))
            )}
        </Box>
    );
};

export default Threads;
