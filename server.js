require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// ✅ Error handling if NEWS_API_KEY is missing
if (!NEWS_API_KEY) {
    console.error("❌ NEWS_API_KEY is missing! Set it in the environment variables.");
    process.exit(1); // Stop the server if API key is missing
}

// ✅ Enable CORS
app.use(cors());

// ✅ Serve a welcome message at `/`
app.get('/', (req, res) => {
    res.send("✅ Server is running! Use /news?category=general to get news.");
});

// ✅ Serve the frontend files if a frontend exists
app.use(express.static(path.join(__dirname, 'public')));

// ✅ News API endpoint with Debug Logging
app.get('/news', async (req, res) => {
    try {
        const category = req.query.category || 'general';
        console.log(`🔍 Fetching news for category: ${category}`);

        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                category: category,
                country: 'us',
                apiKey: NEWS_API_KEY
            }
        });

        console.log("📡 NewsAPI Response Status:", response.status); // Log HTTP status code
        console.log("📰 NewsAPI Response Data:", JSON.stringify(response.data, null, 2)); // Log full response

        if (!response.data.articles || response.data.articles.length === 0) {
            console.log("❌ No articles found");
            return res.json({ error: "No articles found" });
        }

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching news:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${process.env.NODE_ENV === 'production' ? 'your DigitalOcean URL' : `http://localhost:${PORT}`}`);
});
