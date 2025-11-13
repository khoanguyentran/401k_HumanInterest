# 401(k) Contribution Management Application

A single-page web application for managing 401(k) retirement contributions with an intuitive interface and Flask backend API service.

## Features

- **Contribution Type Selection**: Choose between percentage of paycheck or fixed dollar amount per paycheck
- **Interactive Rate Adjustment**: Use a slider or text input to set your desired contribution rate
- **Year-to-Date (YTD) Display**: View your current YTD contributions with mock data
- **Current Contribution Retirement Impact**: Always-visible component showing projected retirement savings from your current saved contribution rate
- **Additional Contribution Impact**: See how increasing your contribution will affect your retirement savings
- **Persistent Storage**: Save and load your contribution settings via backend API
- **Age-Adjustable Calculations**: Adjust your age to see how it affects retirement projections

## Technical Stack

- **Frontend**: React 19.2.0
- **Backend**: Python 3 with Flask
- **Storage**: JSON file-based storage (no database required)

## Prerequisites

- Python 3.7 or higher
- Node.js (v14 or higher) - for the React frontend
- npm (v6 or higher) - for the React frontend
- pip (Python package manager)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd 401k_HumanInterest
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or if you're using Python 3 specifically:
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Install frontend dependencies:**
   ```bash
   npm run install-all
   ```
   
   Or manually:
   ```bash
   cd client
   npm install
   cd ..
   ```

## Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the root directory, run:
```bash
npm run dev
```

This will start both the backend server (port 3001) and the frontend development server (port 3000) concurrently.

### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
python server/app.py
```
Or if you're using Python 3 specifically:
```bash
python3 server/app.py
```
The backend API will be available at `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
cd client
npm start
```
The frontend will automatically open in your browser at `http://localhost:3000`

## API Endpoints

The backend provides the following REST API endpoints:

### GET `/api/contribution-settings`
Retrieves the current contribution settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "contributionType": "percentage",
    "contributionRate": 5,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST `/api/contribution-settings`
Updates the contribution settings.

**Request Body:**
```json
{
  "contributionType": "percentage",
  "contributionRate": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contributionType": "percentage",
    "contributionRate": 5,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET `/api/ytd-data`
Retrieves year-to-date contribution data and mock user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "age": 22,
    "annualSalary": 75000,
    "paychecksPerYear": 26,
    "ytdContributions": 4500,
    "currentYear": 2024,
    "payPeriodsElapsed": 13,
    "currentContributionPerPaycheck": 144.23,
    "projectedAnnualContribution": 3750,
    "currentSettings": {
      "contributionType": "percentage",
      "contributionRate": 5
    }
  }
}
```

### GET `/api/retirement-impact`
Calculates the retirement impact of changing contribution rates (additional contribution only).

**Query Parameters:**
- `currentRate`: Current saved contribution rate
- `newRate`: New contribution rate being considered
- `contributionType`: "percentage" or "dollar"
- `age`: User's current age (optional, defaults to mock data age)

**Response:**
```json
{
  "success": true,
  "data": {
    "additionalContributionPerPaycheck": 57.69,
    "additionalAnnualContribution": 1499.94,
    "yearsToRetirement": 43,
    "projectedRetirementSavings": 350000,
    "annualReturnRate": 0.07
  }
}
```

### GET `/api/current-contribution-impact`
Calculates the retirement impact of the current saved contribution settings.

**Query Parameters:**
- `age`: User's current age (optional, defaults to mock data age)

**Response:**
```json
{
  "success": true,
  "data": {
    "contributionPerPaycheck": 144.23,
    "annualContribution": 3750,
    "yearsToRetirement": 43,
    "projectedRetirementSavings": 875000,
    "annualReturnRate": 0.07,
    "contributionType": "percentage",
    "contributionRate": 5
  }
}
```

## Project Structure

```
401k_HumanInterest/
├── server/
│   ├── app.py            # Flask backend server
│   └── data.json         # Data storage (created automatically)
├── client/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   ├── index.js      # React entry point
│   │   └── ...
│   ├── public/           # Static assets
│   └── package.json
├── requirements.txt      # Python dependencies
├── package.json          # Root package.json with scripts
└── README.md
```

## Mock Data

The application uses the following mock data for demonstration (defined in `server/app.py`):

- **Age**: 22 years old
- **Annual Salary**: $75,000
- **Pay Frequency**: Bi-weekly (26 paychecks per year)
- **YTD Contributions**: $4,500
- **Pay Periods Elapsed**: 13 (halfway through the year)
- **Default Contribution Type**: Percentage
- **Default Contribution Rate**: 5%
- **Contribution Amount Per Paycheck**: $144.23 (5% of $2,884.62)
- **Contribution Amount Annual**: $3,750 (5% of $75,000)
- **Retirement Age**: 65
- **Assumed Annual Return**: 7%

## Usage

1. **View YTD Contributions**: See your year-to-date contributions and annual salary information
2. **Select Contribution Type**: Choose between "Percentage of Paycheck" or "Fixed Dollar Amount"
3. **Adjust Contribution Rate**: Use the slider or type directly into the input field to set your desired rate
4. **View Preview**: See how much you'll contribute per paycheck and annually based on your selection
5. **Check Current Contribution Impact**: View the always-visible retirement impact card showing projected savings from your current saved contribution rate
6. **Check Additional Impact**: When adjusting your rate above the saved rate, see how the additional contribution will affect your retirement savings
7. **Adjust Age**: Change your age in the retirement impact card to see how it affects projections
8. **Save Settings**: Click "Save Contribution Settings" to persist your choices

## Retirement Impact Calculations

The application uses the **Future Value of an Annuity** formula to calculate retirement savings:

```
FV = PMT × (((1 + r)^n - 1) / r)
```

Where:
- **FV** = Future Value (projected retirement savings)
- **PMT** = Annual contribution amount
- **r** = Annual return rate (7% = 0.07)
- **n** = Years to retirement (65 - current age)

This formula accounts for compound interest over time, showing how regular contributions grow with investment returns.

## Development

### Backend Development
- The backend server uses Flask with debug mode enabled for auto-reloading during development
- Data is stored in `server/data.json` (created automatically on first run)
- To run the Flask server in development mode: `python server/app.py` (debug mode is enabled by default)
- Mock user data is defined in `MOCK_USER_DATA` at the top of `server/app.py`

### Frontend Development
- The React app uses Create React App
- The frontend proxies API requests to `http://localhost:3001` (configured in `client/package.json`)
- Main application logic is in `client/src/App.js`
- Styles are in `client/src/App.css`

