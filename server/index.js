import express from 'express';
import { Risk_Scoring } from './controller/Functions.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Trigger Risk Scoring (for demonstration purposes)
Risk_Scoring()
    .then(() => {
        console.log('Risk scoring process completed.');
    })
    .catch((error) => {
        console.error('Error during risk scoring:', error);
    });
