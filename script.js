let chartInstance;  // Store the chart instance globally
let simulationCount = 0; // Counter for the number of simulations run

document.getElementById('runSimulation').addEventListener('click', runSimulation);

function runSimulation() {
    simulationCount++; // Increment the counter

    // Check if the simulation has been run 10 times
    if (simulationCount >= 300) {
        location.reload(); // Refresh the page
        return; // Exit the function
    }

    const numTrades = parseInt(document.getElementById('numTrades').value);
    const winRate = parseFloat(document.getElementById('winRate').value) / 100;
    const rrRatio = parseFloat(document.getElementById('rrRatio').value);
    const riskPerTrade = parseFloat(document.getElementById('riskPerTrade').value) / 100;
    const initialBalance = parseFloat(document.getElementById('initialBalance').value);
    const isCompounding = document.getElementById('compoundingToggle').checked;

    const results = simulateTrades(numTrades, winRate, rrRatio, riskPerTrade, initialBalance, isCompounding);

    // Update the statistics
    document.getElementById('totalReturn').textContent = results.totalReturn.toFixed(2);
    document.getElementById('finalBalance').textContent = results.finalBalance.toFixed(2);
    document.getElementById('maxDrawdown').textContent = results.maxDrawdown.toFixed(2);
    document.getElementById('avgGainPerTrade').textContent = results.avgGainPerTrade.toFixed(2);
    document.getElementById('maxWinningStreak').textContent = results.maxWinningStreak;
    document.getElementById('maxLosingStreak').textContent = results.maxLosingStreak;

    // Show winners, losers, and actual win rate
    document.getElementById('numWinners').textContent = results.numWinners;
    document.getElementById('numLosers').textContent = results.numLosers;
    document.getElementById('actualWinRate').textContent = (results.actualWinRate * 100).toFixed(2);

    // Show the output section after simulation run
    document.querySelector('.output-section').style.display = 'block';

    // Show the reset button after simulation run
    document.getElementById('resetButton').style.display = 'block';

    // Show the chart container after simulation run
    document.querySelector('.chart-container').style.display = 'block';

    // Update the equity curve chart
    updateEquityCurve(results.equityCurve);
}


function simulateTrades(numTrades, winRate, rrRatio, riskPerTrade, initialBalance, isCompounding) {
  let equityCurve = [initialBalance];
  let maxBalance = initialBalance;
  let maxDrawdown = 0;
  let winningStreak = 0;
  let losingStreak = 0;
  let maxWinningStreak = 0;
  let maxLosingStreak = 0;
  let numWinners = 0;
  let numLosers = 0;

  for (let i = 0; i < numTrades; i++) {
      const isWin = Math.random() < winRate;
      const lastBalance = equityCurve[equityCurve.length - 1];

      // If compounding, risk is a percentage of current balance; otherwise, it's a percentage of the initial balance
      const riskAmount = isCompounding ? lastBalance * riskPerTrade : initialBalance * riskPerTrade;

      let newBalance;

      if (isWin) {
          numWinners++;
          const profit = riskAmount * rrRatio;
          newBalance = lastBalance + profit;
      } else {
          numLosers++;
          newBalance = lastBalance - riskAmount;
      }

      equityCurve.push(newBalance);

      // Update max balance and drawdown calculations
      maxBalance = Math.max(maxBalance, newBalance);
      let currentDrawdown = (maxBalance - newBalance) / maxBalance;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);

      // Update streaks
      if (isWin) {
          winningStreak++;
          losingStreak = 0;
          maxWinningStreak = Math.max(maxWinningStreak, winningStreak);
      } else {
          losingStreak++;
          winningStreak = 0;
          maxLosingStreak = Math.max(maxLosingStreak, losingStreak);
      }
  }

  const totalReturn = (equityCurve[equityCurve.length - 1] / initialBalance - 1) * 100;
  const changes = equityCurve.slice(1).map((balance, i) => (balance - equityCurve[i]) / equityCurve[i]);
  const avgGainPerTrade = changes.reduce((a, b) => a + b, 0) / changes.length * 100;
  const finalBalance = equityCurve[equityCurve.length - 1];
  const actualWinRate = numWinners / numTrades;

  return {
      equityCurve: equityCurve.slice(1),
      totalReturn,
      maxDrawdown: maxDrawdown * 100,
      avgGainPerTrade,
      maxWinningStreak,
      maxLosingStreak,
      finalBalance,
      numWinners,
      numLosers,
      actualWinRate
  };
}

function updateEquityCurve(equityCurve) {
  const ctx = document.getElementById('equityCurve').getContext('2d');

  // Destroy the old chart instance if it exists to avoid overlap
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new chart instance
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: equityCurve.length }, (_, i) => i + 1),
      datasets: [{
        label: 'Equity Curve',
        data: equityCurve,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Trades' }},
        y: { title: { display: true, text: 'Equity ($)' }}
      }
    }
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('numTrades').value = 100; // Default value
    document.getElementById('winRate').value = '';
    document.getElementById('rrRatio').value = '';
    document.getElementById('riskPerTrade').value = 0.5; // Default value
    document.getElementById('initialBalance').value = 50000; // Default value

    // Hide the output section
    document.querySelector('.output-section').style.display = 'none';

    // Clear the chart
    const ctx = document.getElementById('equityCurve').getContext('2d');
    const chartInstance = Chart.getChart(ctx); // Get the chart instance
    if (chartInstance) {
        chartInstance.destroy(); // Destroy the existing chart
    }

    // Reset the chart canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});

document.getElementById('resetButton').addEventListener('click', function() {
  // Clear input fields
  document.getElementById('numTrades').value = 100; // Default value
  document.getElementById('winRate').value = '';
  document.getElementById('rrRatio').value = '';
  document.getElementById('riskPerTrade').value = 0.5; // Default value
  document.getElementById('initialBalance').value = 50000; // Default value

  // Hide the output section
  document.querySelector('.output-section').style.display = 'none';

  // Clear the chart
  const ctx = document.getElementById('equityCurve').getContext('2d');
  const chartInstance = Chart.getChart(ctx); // Get the chart instance
  if (chartInstance) {
      chartInstance.destroy(); // Destroy the existing chart
  }

  // Reset the chart canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Hide the chart container
  document.querySelector('.chart-container').style.display = 'none';

  // Hide the reset button
  document.getElementById('resetButton').style.display = 'none';
});

document.getElementById('runSimulation').addEventListener('click', function() {
  // Get input values
  const numTradesInput = document.getElementById('numTrades');
  const winRateInput = document.getElementById('winRate');
  const rrRatioInput = document.getElementById('rrRatio');
  const riskPerTradeInput = document.getElementById('riskPerTrade');
  const initialBalanceInput = document.getElementById('initialBalance');

  // Check if any input is empty
  if (!numTradesInput.value || !winRateInput.value || !rrRatioInput.value || !riskPerTradeInput.value || !initialBalanceInput.value) {
      alert('All fields are required. Please fill them out.');
      return;  // Prevent running the simulation
  }

  // Validate inputs
  const numTrades = parseInt(numTradesInput.value);
  const winRate = parseFloat(winRateInput.value);
  const rrRatio = parseFloat(rrRatioInput.value);
  const riskPerTrade = parseFloat(riskPerTradeInput.value);
  const initialBalance = parseFloat(initialBalanceInput.value);

  // Check limits
  if (numTrades < 1 || numTrades > 10000) {
      alert('Number of trades must be between 1 and 10,000.');
      return;  // Prevent running the simulation
  }
  if (winRate < 0 || winRate > 100) {
      alert('Win rate must be between 0% and 100%.');
      return;  // Prevent running the simulation
  }
  if (rrRatio <= 0) {
      alert('Reward-to-risk ratio must be greater than 0.');
      return;  // Prevent running the simulation
  }
  if (riskPerTrade < 0 || riskPerTrade > 100) {
      alert('Risk per trade must be between 0% and 100%.');
      return;  // Prevent running the simulation
  }
  if (initialBalance <= 0) {
      alert('Initial balance must be greater than 0.');
      return;  // Prevent running the simulation
  }

  // All inputs are valid at this point; proceed with the simulation
  runSimulation(numTrades, winRate / 100, rrRatio, riskPerTrade / 100, initialBalance);
});

}