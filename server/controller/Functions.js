import 'dotenv/config.js';

import dotenv from 'dotenv';
dotenv.config({ path: './controller/.env' });

const API_BASE = process.env.API_BASE;
const API_KEY = process.env.API_KEY;

export const getPatients = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(`${API_BASE}/patients?${page}&${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
        });
        if (!response) {
            throw new Error(`No Patients found ${response.status}`);
        } else {
            return response.json();
        }
    } catch (error) {
        return error.status;
    }
};

//RISK SCORING

const high_risk_patients = [];
const fever_patients = [];
const data_quality_issues = [];

const calculateBPScore = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) return 0; // Normal
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return 1; // Elevated
    if (
        (systolic >= 130 && systolic < 140) ||
        (diastolic >= 80 && diastolic < 90)
    )
        return 2; // Stage 1
    if (systolic >= 140 || diastolic >= 90) return 3; // Stage 2
    return 0; // Default
};

const calculateTempScore = (temp) => {
    if (temp <= 99.5) return 0;
    if (temp >= 99.6 && temp <= 100.9) return 1;
    if (temp >= 101.0) return 2;
    return 0;
};

const calculateAgeScore = (age) => {
    if (age < 40) return 0;
    if (age >= 40 && age <= 65) return 1;
    if (age > 65) return 2;
    return 0;
};

export const Risk_Scoring = async () => {
    let allPatients = [];
    let page = 1;
    const limit = 10; // Adjust if needed

    while (true) {
        const response = await getPatients(page, limit);
        if (!response || !response.data || !Array.isArray(response.data)) break;
        allPatients.push(...response.data);
        if (!response.pagination || !response.pagination.hasNext) break;
        page++;
    }

    if (allPatients.length === 0) return;

    allPatients.forEach((patient) => {
        let totalScore = 0;
        let hasDataIssue = false;

        // BP Score
        if (
            patient.blood_pressure &&
            typeof patient.blood_pressure === 'string'
        ) {
            const bpParts = patient.blood_pressure
                .split('/')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
            if (bpParts.length === 2) {
                const systolic = parseInt(bpParts[0]);
                const diastolic = parseInt(bpParts[1]);
                if (!isNaN(systolic) && !isNaN(diastolic)) {
                    totalScore += calculateBPScore(systolic, diastolic);
                } else {
                    hasDataIssue = true;
                }
            } else {
                hasDataIssue = true;
            }
        } else {
            hasDataIssue = true;
        }

        // Temp Score
        if (patient.temperature && typeof patient.temperature === 'number') {
            totalScore += calculateTempScore(patient.temperature);
            if (patient.temperature >= 99.6) {
                fever_patients.push(patient.patient_id);
            }
        } else {
            hasDataIssue = true;
        }

        // Age Score
        if (patient.age && typeof patient.age === 'number') {
            totalScore += calculateAgeScore(patient.age);
        } else {
            hasDataIssue = true;
        }

        // Check for high risk
        if (totalScore >= 4) {
            high_risk_patients.push(patient.patient_id);
        }

        // Check for data issues
        if (hasDataIssue) {
            data_quality_issues.push(patient.patient_id);
        }
    });

    // Submit the alert lists
    try {
        const response = await fetch(`${API_BASE}/api/submit-assessment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify({
                high_risk_patients,
                fever_patients,
                data_quality_issues,
            }),
        });
        if (response.ok) {
            console.log('Assessment submitted successfully');
        } else {
            console.error('Submission failed:', response.status);
        }
    } catch (error) {
        console.error('Error submitting assessment:', error);
    }
};
