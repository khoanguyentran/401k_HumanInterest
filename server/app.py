from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.environ.get('PORT', 3001))
DATA_FILE = Path(__file__).parent / 'data.json'

# Mock user data for YTD calculations
MOCK_USER_DATA = {
    'age': 22,
    'annualSalary': 75000,
    'paychecksPerYear': 26,  # bi-weekly
    'ytdContributions': 4500,  # Year-to-date contributions
    'currentYear': datetime.now().year,
    'payPeriodsElapsed': 13,  # Halfway through the year
    'contributionType': 'percentage',  # 'percentage' or 'dollar'
    'contributionRate': 5,  # percentage or dollar amount
    'contributionAmountPerPaycheck': 144.23,  # 5% of $2,884.62 per paycheck
    'contributionAmountAnnual': 3750  # 5% of $75,000 annual salary
}


def initialize_data_file():
    """Initialize data file if it doesn't exist"""
    if not DATA_FILE.exists():
        default_data = {
            'contributionType': MOCK_USER_DATA['contributionType'],
            'contributionRate': MOCK_USER_DATA['contributionRate'],
            'lastUpdated': datetime.now().isoformat()
        }
        with open(DATA_FILE, 'w') as f:
            json.dump(default_data, f, indent=2)


def read_data():
    """Read data from file, falling back to mock user data defaults"""
    try:
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        else:
            return {
                'contributionType': MOCK_USER_DATA['contributionType'],
                'contributionRate': MOCK_USER_DATA['contributionRate'],
                'lastUpdated': datetime.now().isoformat()
            }
    except (json.JSONDecodeError, IOError):
        return {
            'contributionType': MOCK_USER_DATA['contributionType'],
            'contributionRate': MOCK_USER_DATA['contributionRate'],
            'lastUpdated': datetime.now().isoformat()
        }


def write_data(data):
    """Write data to file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)


# Initialize on startup
initialize_data_file()


@app.route('/api/contribution-settings', methods=['GET'])
def get_contribution_settings():
    """Retrieve current contribution settings"""
    try:
        data = read_data()
        return jsonify({
            'success': True,
            'data': {
                'contributionType': data['contributionType'],
                'contributionRate': data['contributionRate'],
                'lastUpdated': data['lastUpdated']
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve contribution settings'
        }), 500


@app.route('/api/contribution-settings', methods=['POST'])
def update_contribution_settings():
    """Update contribution settings"""
    try:
        request_data = request.get_json()
        contribution_type = request_data.get('contributionType')
        contribution_rate = request_data.get('contributionRate')

        # Validation
        if not contribution_type or contribution_type not in ['percentage', 'dollar']:
            return jsonify({
                'success': False,
                'error': 'Invalid contribution type. Must be "percentage" or "dollar"'
            }), 400

        if not isinstance(contribution_rate, (int, float)) or contribution_rate < 0:
            return jsonify({
                'success': False,
                'error': 'Invalid contribution rate. Must be a positive number'
            }), 400

        if contribution_type == 'percentage' and contribution_rate > 100:
            return jsonify({
                'success': False,
                'error': 'Percentage cannot exceed 100%'
            }), 400

        data = {
            'contributionType': contribution_type,
            'contributionRate': contribution_rate,
            'lastUpdated': datetime.now().isoformat()
        }

        write_data(data)

        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to update contribution settings'
        }), 500


@app.route('/api/ytd-data', methods=['GET'])
def get_ytd_data():
    """Retrieve YTD contribution data"""
    try:
        data = read_data()
        paycheck_amount = MOCK_USER_DATA['annualSalary'] / MOCK_USER_DATA['paychecksPerYear']

        if data['contributionType'] == 'percentage':
            contribution_per_paycheck = paycheck_amount * (data['contributionRate'] / 100)
        else:
            contribution_per_paycheck = data['contributionRate']

        projected_annual_contribution = contribution_per_paycheck * MOCK_USER_DATA['paychecksPerYear']

        response_data = {
            **MOCK_USER_DATA,
            'currentContributionPerPaycheck': contribution_per_paycheck,
            'projectedAnnualContribution': projected_annual_contribution,
            'currentSettings': {
                'contributionType': data['contributionType'],
                'contributionRate': data['contributionRate']
            }
        }

        return jsonify({
            'success': True,
            'data': response_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve YTD data'
        }), 500


@app.route('/api/retirement-impact', methods=['GET'])
def get_retirement_impact():
    """Calculate retirement impact"""
    try:
        current_rate = float(request.args.get('currentRate', 0))
        new_rate = float(request.args.get('newRate', 0))
        contribution_type = request.args.get('contributionType', 'percentage')
        age = int(request.args.get('age', MOCK_USER_DATA['age']))

        retirement_age = 65
        # Ensure age is valid and less than retirement age
        if age >= retirement_age:
            age = retirement_age - 1
        years_to_retirement = max(1, retirement_age - age)  # At least 1 year
        annual_return_rate = 0.07  # 7% annual return assumption
        paycheck_amount = MOCK_USER_DATA['annualSalary'] / MOCK_USER_DATA['paychecksPerYear']
        paychecks_per_year = MOCK_USER_DATA['paychecksPerYear']

        # Calculate current contribution per paycheck
        if contribution_type == 'percentage':
            current_contribution = paycheck_amount * (current_rate / 100)
        else:
            current_contribution = current_rate

        # Calculate new contribution per paycheck
        if contribution_type == 'percentage':
            new_contribution = paycheck_amount * (new_rate / 100)
        else:
            new_contribution = new_rate

        additional_contribution = new_contribution - current_contribution
        additional_annual_contribution = additional_contribution * paychecks_per_year

        # Calculate future value using compound interest formula
        # FV = PMT * (((1 + r)^n - 1) / r)
        # where PMT is the annual contribution, r is the annual return rate, n is years
        if annual_return_rate > 0:
            future_value = additional_annual_contribution * \
                ((pow(1 + annual_return_rate, years_to_retirement) - 1) / annual_return_rate)
        else:
            future_value = additional_annual_contribution * years_to_retirement

        return jsonify({
            'success': True,
            'data': {
                'additionalContributionPerPaycheck': additional_contribution,
                'additionalAnnualContribution': additional_annual_contribution,
                'yearsToRetirement': years_to_retirement,
                'projectedRetirementSavings': future_value,
                'annualReturnRate': annual_return_rate
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to calculate retirement impact'
        }), 500


@app.route('/api/current-contribution-impact', methods=['GET'])
def get_current_contribution_impact():
    """Calculate retirement impact of current contribution settings"""
    try:
        data = read_data()
        contribution_type = data['contributionType']
        contribution_rate = data['contributionRate']
        age = int(request.args.get('age', MOCK_USER_DATA['age']))

        retirement_age = 65
        # Ensure age is valid and less than retirement age
        if age >= retirement_age:
            age = retirement_age - 1
        years_to_retirement = max(1, retirement_age - age)  # At least 1 year
        annual_return_rate = 0.07  # 7% annual return assumption
        paycheck_amount = MOCK_USER_DATA['annualSalary'] / MOCK_USER_DATA['paychecksPerYear']
        paychecks_per_year = MOCK_USER_DATA['paychecksPerYear']

        # Calculate current contribution per paycheck
        if contribution_type == 'percentage':
            contribution_per_paycheck = paycheck_amount * (contribution_rate / 100)
        else:
            contribution_per_paycheck = contribution_rate

        annual_contribution = contribution_per_paycheck * paychecks_per_year

        # Calculate future value using compound interest formula
        # FV = PMT * (((1 + r)^n - 1) / r)
        # where PMT is the annual contribution, r is the annual return rate, n is years
        if annual_return_rate > 0:
            future_value = annual_contribution * \
                ((pow(1 + annual_return_rate, years_to_retirement) - 1) / annual_return_rate)
        else:
            future_value = annual_contribution * years_to_retirement

        return jsonify({
            'success': True,
            'data': {
                'contributionPerPaycheck': contribution_per_paycheck,
                'annualContribution': annual_contribution,
                'yearsToRetirement': years_to_retirement,
                'projectedRetirementSavings': future_value,
                'annualReturnRate': annual_return_rate,
                'contributionType': contribution_type,
                'contributionRate': contribution_rate
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Failed to calculate current contribution impact'
        }), 500


if __name__ == '__main__':
    print(f'Server is running on http://localhost:{PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=True)

