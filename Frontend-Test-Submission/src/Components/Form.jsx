import React, { useState } from 'react';
import {
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Paper,
    Divider,
} from '@mui/material';
import Axios from '../Utils/Axios';


export default function ShortenerForm() {
    const [urls, setUrls] = useState([{ url: '', validity: '', shortcode: '' }]);
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState([]);

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const validateShortcode = (shortcode) => {
        if (!shortcode) return null;
        if (shortcode.length < 3) return 'Minimum 3 characters';
        if (shortcode.length > 20) return 'Maximum 20 characters';
        if (!/^[a-z0-9_-]+$/i.test(shortcode)) return 'Only letters, numbers, - and _ allowed';
        return null;
    };

    const handleChange = (index, field, value) => {
        const newUrls = [...urls];
        newUrls[index][field] = value;
        setUrls(newUrls);
    };

    const handleAddRow = () => {
        if (urls.length < 5) {
            setUrls([...urls, { url: '', validity: '', shortcode: '' }]);
        }
    };

    const validateInputs = () => {
        const newErrors = [];

        urls.forEach((item, index) => {
            const itemErrors = {};

            if (!item.url) {
                itemErrors.url = 'URL is required';
            } else if (!isValidUrl(item.url)) {
                itemErrors.url = 'Please enter a valid URL';
            }

            const shortcodeError = validateShortcode(item.shortcode);
            if (shortcodeError) {
                itemErrors.shortcode = shortcodeError;
            }

            if (item.validity && (isNaN(item.validity) || item.validity <= 0)) {
                itemErrors.validity = 'Must be a positive number';
            } else if (item.validity > 525600) {
                itemErrors.validity = 'Maximum validity is 1 year';
            }

            if (Object.keys(itemErrors).length > 0) {
                newErrors.push({ index, errors: itemErrors });
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async () => {
        if (!validateInputs()) return;

        const newResults = [];

        for (const item of urls) {
            if (!item.url) continue;

            try {
                const res = await Axios.post("/shorturls", item);
                newResults.push(res.data);
            } catch (err) {
                newResults.push({ error: err.message || 'Error occurred' });
            }
        }

        setResults(newResults);
    };
    const handleRedirect = async (fullShortLink) => {
        try {
            const shortCode = fullShortLink.trim().split("/").pop();
            window.location.href = `http://localhost:8000/api/${shortCode}`;
        } catch (err) {
            alert('Error redirecting to URL: ' + (err.message || 'Unknown error'));
        }
    };




    return (
        <Box>
            {urls.map((item, index) => (
                <Paper elevation={3} key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">URL #{index + 1}</Typography>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Original URL"
                                fullWidth
                                required
                                value={item.url}
                                onChange={(e) => handleChange(index, 'url', e.target.value)}
                                error={Boolean(errors.find(e => e.index === index)?.errors?.url)}
                                helperText={errors.find(e => e.index === index)?.errors?.url}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Custom Shortcode (optional)"
                                fullWidth
                                value={item.shortcode}
                                onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
                                error={Boolean(errors.find(e => e.index === index)?.errors?.shortcode)}
                                helperText={errors.find(e => e.index === index)?.errors?.shortcode}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Validity (minutes)"
                                type="number"
                                fullWidth
                                value={item.validity}
                                onChange={(e) => handleChange(index, 'validity', e.target.value)}
                                error={Boolean(errors.find(e => e.index === index)?.errors?.validity)}
                                helperText={errors.find(e => e.index === index)?.errors?.validity}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            <Box display="flex" gap={2} mb={3}>
                <Button
                    variant="outlined"
                    onClick={handleAddRow}
                    disabled={urls.length >= 5}
                >
                    Add More
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Shorten URLs
                </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
                {results.map((res, i) =>
                    res.shortLink ? (
                        <Box key={i}>
                            <Typography
                                component="button"
                                onClick={() => handleRedirect(res.shortLink)}
                                sx={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: 'blue',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '1rem',
                                    textAlign: 'left',
                                }}
                            >
                                🔗 {res.shortLink}
                            </Typography>

                            <Typography variant="body2" color="textSecondary" ml={2}>
                                📅 Expires At:{" "}
                                {new Date(res.expiry).toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography key={i} color="error">
                            ❌ {res.error}
                        </Typography>
                    )
                )}
            </Box>

        </Box>
    );
}