require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

//Stop the server if NEWS_API_KEY is missing
if (!NEWS_API_KEY) {
    console.error("NEWS_API_KEY is missing! Set it in the environment variables.");
    process.exit(1); 
}

app.use(cors());

//Serve frontend files, allowing `.html` and `.htm` extensions
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html', 'htm']
}));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/news', async (req, res) => {
    try {
        const category = req.query.category || 'general';
        console.log(`🔍 Fetching news for category: ${category}`);

        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                category: category,
                apiKey: NEWS_API_KEY
            }
        });

        console.log("📡 NewsAPI Response Status:", response.status);
        console.log("📰 NewsAPI Response Data:", JSON.stringify(response.data, null, 2));

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${
      process.env.NODE_ENV === 'production' 
        ? 'your DigitalOcean URL' 
        : `http://localhost:${PORT}`
    }`);
});
