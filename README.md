# 401(k) Contribution Management Application

A single-page web application for managing 401(k) retirement contributions with an intuitive interface and backend API service.

## Features

- **Contribution Type Selection**: Choose between percentage of paycheck or fixed dollar amount per paycheck
- **Interactive Rate Adjustment**: Use a slider or text input to set your desired contribution rate
- **Year-to-Date (YTD) Display**: View your current YTD contributions with mock data
- **Retirement Impact Calculator**: See how your contribution changes will affect your retirement savings
- **Persistent Storage**: Save and load your contribution settings via backend API

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
   cd client
   npm install
   cd ..
   ```
   
   Or use the convenience script:
   ```bash
   npm run install-all
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
    "age": 30,
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
Calculates the retirement impact of changing contribution rates.

**Query Parameters:**
- `currentRate`: Current contribution rate
- `newRate`: New contribution rate
- `contributionType`: "percentage" or "dollar"
- `age`: User's current age (optional, defaults to 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "additionalContributionPerPaycheck": 144.23,
    "additionalAnnualContribution": 3750,
    "yearsToRetirement": 35,
    "projectedRetirementSavings": 500000,
    "annualReturnRate": 0.07
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
│   │   └── ...
│   └── package.json
├── requirements.txt      # Python dependencies
├── package.json          # Root package.json with scripts
└── README.md
```

## Mock Data

The application uses the following mock data for demonstration:
- **Annual Salary**: $75,000
- **Pay Frequency**: Bi-weekly (26 paychecks per year)
- **YTD Contributions**: $4,500
- **Pay Periods Elapsed**: 13 (halfway through the year)
- **Default Age**: 30 years old
- **Retirement Age**: 65
- **Assumed Annual Return**: 7%

## Usage

1. **Select Contribution Type**: Choose between "Percentage of Paycheck" or "Fixed Dollar Amount"
2. **Adjust Contribution Rate**: Use the slider or type directly into the input field
3. **View Preview**: See how much you'll contribute per paycheck and annually
4. **Check Retirement Impact**: Adjust your age and see how your contribution changes will affect your retirement savings
5. **Save Settings**: Click "Save Contribution Settings" to persist your choices

## Development

### Backend Development
- The backend server uses Flask with debug mode enabled for auto-reloading during development
- Data is stored in `server/data.json` (created automatically on first run)
- To run the Flask server in development mode, use: `python server/app.py` (debug mode is enabled by default)

### Frontend Development
- The React app uses Create React App
- The frontend proxies API requests to `http://localhost:3001` (configured in `client/package.json`)

## Troubleshooting

**Python Not Found:**
- Make sure Python 3.7+ is installed. Check with: `python --version` or `python3 --version`
- On some systems, you may need to use `python3` instead of `python`

**Port Already in Use:**
- If port 3000 or 3001 is already in use, you can:
  - Stop the process using those ports
  - Or modify the ports in `server/app.py` (PORT) and `client/package.json` (proxy)

**CORS Issues:**
- The backend is configured with CORS enabled for local development
- If you encounter CORS errors, ensure the backend is running on port 3001

**Data Not Persisting:**
- Ensure the `server/data.json` file has write permissions
- Check that the server has write access to the `server/` directory

**Module Not Found Errors:**
- Make sure you've installed Python dependencies: `pip install -r requirements.txt`
- Consider using a virtual environment:
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```

