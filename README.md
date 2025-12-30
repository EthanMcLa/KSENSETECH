# KSenseTech Patient Risk Scoring Assessment

This project implements a patient risk scoring system for a job assessment. It fetches patient data from an API, calculates risk scores based on blood pressure, temperature, and age, and submits alert lists for high-risk patients, fever patients, and data quality issues.

## Features

- **Patient Data Fetching**: Retrieves patient data from the KSenseTech API across multiple pages.
- **Risk Scoring**:
  - Blood Pressure: Categorized into Normal, Elevated, Stage 1, Stage 2.
  - Temperature: Scored based on fever thresholds.
  - Age: Scored based on age groups.
- **Alert Lists**:
  - High-Risk Patients: Total risk score ≥ 4.
  - Fever Patients: Temperature ≥ 99.6°F.
  - Data Quality Issues: Missing or invalid data.
- **Automatic Submission**: Posts results to the assessment API.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EthanMcLa/KSENSETECH.git
   cd ksensetech
   ```

2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` from `server/controller/.env` or create your own with:
     ```
     API_BASE=https://assessment.ksensetech.com/api
     API_KEY=your_api_key_here
     ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will automatically run the risk scoring process and submit results upon startup.

## Project Structure

- `server/index.js`: Main server file.
- `server/controller/API.js`: Contains functions for fetching patients and risk scoring.
- `server/controller/.env`: Environment variables (not committed).
- `server/package.json`: Dependencies and scripts.

## API Endpoints

- GET `/patients`: Fetches patient data (paginated).
- POST `/api/submit-assessment`: Submits alert lists.

## Scoring Logic

- **BP Score**: 0 (Normal: <120/80), 1 (Elevated: 120-129/<80), 2 (Stage 1: 130-139 or 80-89), 3 (Stage 2: ≥140 or ≥90).
- **Temp Score**: 0 (<99.5), 1 (99.6-100.9), 2 (≥101.0).
- **Age Score**: 0 (<40), 1 (40-65), 2 (>65).
- **Total Risk**: Sum of scores; ≥4 is high-risk.

## Technologies Used

- Node.js
- Express
- dotenv
- Fetch API

## License

This project is for assessment purposes only.