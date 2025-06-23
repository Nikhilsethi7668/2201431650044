import React, { useEffect, useState } from 'react';
import Axios from '../Utils/Axios';
import {
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    CircularProgress
} from '@mui/material';

function AnalyticsAll() {
    const [urls, setUrls] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';


    useEffect(() => {
        const fetchAllUrls = async () => {
            try {
                const res = await Axios.get('/all/shorturls'); // Correct route
                setUrls(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching URL data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUrls();
    }, []);

    const formatIST = (date) =>
        new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
    if (error) return <Typography color="error">❌ {error}</Typography>;

    return (
        <Box p={4}>
            <Typography variant="h4" mb={3}>📊 All Shortened URLs Analytics</Typography>
            {urls.length === 0 ? (
                <Typography>No URLs found.</Typography>
            ) : (
                urls.length > 0 && urls.map((url, index) => (
                    <Paper key={index} elevation={3} sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            🔗 Short URL:{" "}
                            <a
                                href={`${BACKEND_URL}/${url.shortcode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1976d2", textDecoration: "underline" }}
                            >
                                {`${BACKEND_URL}/${url.shortcode}`}
                            </a>
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Typography
                            sx={{
                                wordBreak: 'break-all',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                            }}
                        >
                            <strong>Original URL:</strong> {url.originalUrl}
                        </Typography>
                        <Typography><strong>Created At:</strong> {formatIST(url.createdAt)}</Typography>
                        <Typography><strong>Expiry:</strong> {url.expiry ? formatIST(url.expiry) : "Never"}</Typography>
                        <Typography><strong>Total Clicks:</strong> {url.totalClicks || 0}</Typography>

                        <Typography variant="subtitle1" mt={2}>📈 Click History:</Typography>
                        {url.clicks && url.clicks.length > 0 ? (
                            <List dense>
                                {url.clicks.map((click, i) => (
                                    <ListItem key={i} sx={{ pl: 0 }}>
                                        <ListItemText
                                            primary={`IP: ${click.ip || 'Unknown'}, Referrer: ${click.referrer || 'Unknown'}`}
                                            secondary={`Time: ${formatIST(click.timestamp)}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>No clicks yet.</Typography>
                        )}
                    </Paper>
                ))
            )}
        </Box>
    );
}

export default AnalyticsAll;
