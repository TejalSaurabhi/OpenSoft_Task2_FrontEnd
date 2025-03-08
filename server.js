require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.use(cors());

//News API endpoint
app.get('/news', async (req, res) => {
    try {
        const category = req.query.category || 'general';
        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                category: category,
                country: 'us',
                apiKey: NEWS_API_KEY 
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
