import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

function App() {
  const [contributionType, setContributionType] = useState('percentage');
  const [contributionRate, setContributionRate] = useState(5);
  const [ytdData, setYtdData] = useState(null);
  const [retirementImpact, setRetirementImpact] = useState(null);
  const [currentContributionImpact, setCurrentContributionImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userAge, setUserAge] = useState(30);

  // Load current settings and YTD data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Calculate retirement impact when rate, type, age, or ytdData changes
  useEffect(() => {
    if (ytdData && contributionRate !== null) {
      calculateRetirementImpact();
      calculateCurrentContributionImpact();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributionRate, contributionType, userAge, ytdData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, ytdRes] = await Promise.all([
        fetch(`${API_BASE}/api/contribution-settings`),
        fetch(`${API_BASE}/api/ytd-data`)
      ]);

      const settingsData = await settingsRes.json();
      const ytdDataResponse = await ytdRes.json();

      if (settingsData.success) {
        setContributionType(settingsData.data.contributionType);
        setContributionRate(settingsData.data.contributionRate);
      }

      if (ytdDataResponse.success) {
        setYtdData(ytdDataResponse.data);
        // Initialize user age from YTD data if available
        if (ytdDataResponse.data.age) {
          setUserAge(ytdDataResponse.data.age);
        }
        // Update contribution rate if it differs from saved settings
        if (settingsData.success &&
          settingsData.data.contributionRate !== ytdDataResponse.data.currentSettings.contributionRate) {
          setContributionRate(ytdDataResponse.data.currentSettings.contributionRate);
          setContributionType(ytdDataResponse.data.currentSettings.contributionType);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRetirementImpact = async () => {
    if (!ytdData) return;

    try {
      const currentRate = ytdData.currentSettings.contributionRate;
      const response = await fetch(
        `${API_BASE}/api/retirement-impact?currentRate=${currentRate}&newRate=${contributionRate}&contributionType=${contributionType}&age=${userAge}`
      );
      const data = await response.json();
      if (data.success) {
        setRetirementImpact(data.data);
      }
    } catch (error) {
      console.error('Error calculating retirement impact:', error);
    }
  };

  const calculateCurrentContributionImpact = async () => {
    if (!ytdData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/current-contribution-impact?age=${userAge}`
      );
      const data = await response.json();
      if (data.success) {
        setCurrentContributionImpact(data.data);
      }
    } catch (error) {
      console.error('Error calculating current contribution impact:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      const response = await fetch(`${API_BASE}/api/contribution-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contributionType,
          contributionRate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        // Reload YTD data to reflect new settings
        const ytdRes = await fetch(`${API_BASE}/api/ytd-data`);
        const ytdDataResponse = await ytdRes.json();
        if (ytdDataResponse.success) {
          setYtdData(ytdDataResponse.data);
          // Recalculate current contribution impact after saving
          const currentImpactRes = await fetch(
            `${API_BASE}/api/current-contribution-impact?age=${userAge}`
          );
          const currentImpactData = await currentImpactRes.json();
          if (currentImpactData.success) {
            setCurrentContributionImpact(currentImpactData.data);
          }
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save contribution settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type) => {
    setContributionType(type);
    // Reset to reasonable defaults when switching types
    if (type === 'percentage') {
      setContributionRate(5);
    } else {
      // For dollar amount, set to a reasonable default (e.g., $200 per paycheck)
      setContributionRate(200);
    }
  };

  const getMaxRate = () => {
    if (contributionType === 'percentage') {
      return 100;
    } else {
      // Max dollar amount per paycheck (assuming max 50% of paycheck)
      return ytdData ? (ytdData.annualSalary / ytdData.paychecksPerYear) * 0.5 : 2000;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const paycheckAmount = ytdData ? ytdData.annualSalary / ytdData.paychecksPerYear : 0;
  const contributionPerPaycheck = contributionType === 'percentage'
    ? paycheckAmount * (contributionRate / 100)
    : contributionRate;
  const annualContribution = contributionPerPaycheck * (ytdData?.paychecksPerYear || 26);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>401(k) Contribution Management</h1>
          <p className="subtitle">Manage your retirement savings contributions</p>
        </header>

        <div className="main-content">
          {/* YTD Contributions Card */}
          <div className="card ytd-card">
            <h2>Year-to-Date Contributions</h2>
            <div className="ytd-amount">{formatCurrency(ytdData?.ytdContributions || 0)}</div>
            <div className="ytd-details">
              <div className="detail-item">
                <span className="label">Annual Salary:</span>
                <span className="value">{formatCurrency(ytdData?.annualSalary || 0)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Pay Periods Elapsed:</span>
                <span className="value">{ytdData?.payPeriodsElapsed || 0} of {ytdData?.paychecksPerYear || 26}</span>
              </div>
            </div>
          </div>

          {/* Contribution Settings Card */}
          <div className="card settings-card">
            <h2>Contribution Settings</h2>

            <div className="type-selector">
              <label>Contribution Type:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="percentage"
                    checked={contributionType === 'percentage'}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  />
                  <span>Percentage of Paycheck</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="dollar"
                    checked={contributionType === 'dollar'}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  />
                  <span>Fixed Dollar Amount</span>
                </label>
              </div>
            </div>

            <div className="rate-input-section">
              <label htmlFor="contribution-rate">
                {contributionType === 'percentage' ? 'Contribution Percentage:' : 'Contribution Amount per Paycheck:'}
              </label>
              <div className="input-group">
                <input
                  type="range"
                  id="contribution-rate"
                  min="0"
                  max={getMaxRate()}
                  step={contributionType === 'percentage' ? 0.1 : 10}
                  value={contributionRate}
                  onChange={(e) => setContributionRate(parseFloat(e.target.value))}
                  className="slider"
                />
                <input
                  type="number"
                  min="0"
                  max={getMaxRate()}
                  step={contributionType === 'percentage' ? 0.1 : 10}
                  value={contributionRate}
                  onChange={(e) => setContributionRate(parseFloat(e.target.value) || 0)}
                  className="number-input"
                />
                <span className="input-suffix">
                  {contributionType === 'percentage' ? '%' : '$'}
                </span>
              </div>
            </div>

            <div className="preview-section">
              <div className="preview-item">
                <span className="preview-label">Per Paycheck:</span>
                <span className="preview-value">{formatCurrency(contributionPerPaycheck)}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Annual Contribution:</span>
                <span className="preview-value">{formatCurrency(annualContribution)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`save-button ${saveSuccess ? 'success' : ''}`}
            >
              {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Contribution Settings'}
            </button>
          </div>

          {/* Current Contribution Retirement Impact Card */}
          {currentContributionImpact && (
            <div className="card impact-card">
              <h2>Current Contribution Retirement Impact</h2>
              <div className="age-input-section">
                <label htmlFor="user-age">Your Age:</label>
                <input
                  type="number"
                  id="user-age"
                  min="18"
                  max="64"
                  value={userAge}
                  onChange={(e) => {
                    const age = parseInt(e.target.value);
                    if (!isNaN(age) && age >= 18 && age < 65) {
                      setUserAge(age);
                    } else if (!isNaN(age) && age >= 65) {
                      setUserAge(64);
                    } else if (!isNaN(age) && age < 18) {
                      setUserAge(18);
                    }
                  }}
                  className="age-input"
                />
              </div>

              <div className="impact-summary">
                <p className="impact-text">
                  With your current contribution of{' '}
                  <strong>{formatCurrency(currentContributionImpact.contributionPerPaycheck)}</strong> per paycheck,
                  you're contributing{' '}
                  <strong>{formatCurrency(currentContributionImpact.annualContribution)}</strong> per year.
                </p>
                <p className="impact-text">
                  Assuming a {formatPercentage(currentContributionImpact.annualReturnRate * 100)} annual return,
                  your current contribution rate could grow to approximately{' '}
                  <strong className="highlight">
                    {formatCurrency(currentContributionImpact.projectedRetirementSavings)}
                  </strong>{' '}
                  by age 65.
                </p>
              </div>
              <div className="impact-details">
                <div className="impact-item">
                  <span className="impact-label">Years to Retirement:</span>
                  <span className="impact-value">{currentContributionImpact.yearsToRetirement} years</span>
                </div>
                <div className="impact-item">
                  <span className="impact-label">Annual Contribution:</span>
                  <span className="impact-value">{formatCurrency(currentContributionImpact.annualContribution)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Retirement Impact Card (when adjusting) */}
          {retirementImpact && retirementImpact.additionalContributionPerPaycheck > 0 && (
            <div className="card impact-card">
              <h2>Impact of Increasing Contribution</h2>
              <div className="impact-summary">
                <p className="impact-text">
                  By increasing your contribution by{' '}
                  <strong>{formatCurrency(retirementImpact.additionalContributionPerPaycheck)}</strong> per paycheck,
                  you'll contribute an additional{' '}
                  <strong>{formatCurrency(retirementImpact.additionalAnnualContribution)}</strong> per year.
                </p>
                <p className="impact-text">
                  Assuming a {formatPercentage(retirementImpact.annualReturnRate * 100)} annual return,
                  this could add approximately{' '}
                  <strong className="highlight">
                    {formatCurrency(retirementImpact.projectedRetirementSavings)}
                  </strong>{' '}
                  to your retirement savings by age 65.
                </p>
              </div>
              <div className="impact-details">
                <div className="impact-item">
                  <span className="impact-label">Years to Retirement:</span>
                  <span className="impact-value">{retirementImpact.yearsToRetirement} years</span>
                </div>
                <div className="impact-item">
                  <span className="impact-label">Additional Annual Contribution:</span>
                  <span className="impact-value">{formatCurrency(retirementImpact.additionalAnnualContribution)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
