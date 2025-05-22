document.addEventListener('DOMContentLoaded', () => {
  const totalBetInput = document.getElementById('totalBet');
  const betsTbody     = document.getElementById('bets');
  const profitPercent = document.getElementById('profitPercent');
  const addRowBtn     = document.getElementById('addRowBtn');
  const removeRowBtn  = document.getElementById('removeRowBtn');
  const updateBtn     = document.getElementById('updateBtn');
  const clearBtn      = document.getElementById('clearBtn');

  const animate = (el, value) => {
    el.classList.add('highlight');
    if (el.tagName === 'INPUT') el.value = value.toFixed(2);
    else el.textContent = value.toFixed(2);
    setTimeout(() => el.classList.remove('highlight'), 700);
  };

  const createRow = () => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" class="bet-input" min="0" step="0.01" placeholder="0.00" data-auto="true"/></td>
      <td><input type="number" class="coef" min="1.01" step="0.01" placeholder=""/></td>
      <td class="return">0.00</td>
      <td class="income">0.00</td>
    `;
    tr.style.opacity = 0;
    tr.style.transform = 'translateY(10px)';
    tr.style.transition = 'opacity .3s, transform .3s';
    requestAnimationFrame(() => {
      tr.style.opacity = 1;
      tr.style.transform = 'translateY(0)';
    });
    return tr;
  };

  const getOdds = () =>
    [...betsTbody.querySelectorAll('.coef')]
      .map(i => Math.max(parseFloat(i.value) || 1.01, 1.01));

  const calculate = () => {
    const total = parseFloat(totalBetInput.value) || 0;
    const odds  = getOdds();
    const invSum = odds.reduce((a, b) => a + 1 / b, 0);
    const stakes = odds.map(o => total / o / invSum);
    const totalDist = stakes.reduce((a, b) => a + b, 0);

    stakes.forEach((s, i) => {
      const row = betsTbody.rows[i];
      const inBet = row.querySelector('.bet-input');
      animate(inBet, s);
      inBet.dataset.auto = "true";
      animate(row.querySelector('.income'), s * odds[i] - totalDist);
      animate(row.querySelector('.return'), s * odds[i]);
    });

    const minProfit = Math.min(...stakes.map((s, i) => s * odds[i] - totalDist));
    const pct = totalDist ? (minProfit / totalDist) * 100 : 0;
    profitPercent.textContent = `Porcentagem: ${pct.toFixed(2)}%`;
    profitPercent.style.color = pct > 0 ? '#4cf392' : pct < 0 ? '#e74c3c' : '#fff';
  };

  const update = () => {
    const odds = getOdds();
    const invSum = odds.reduce((a, b) => a + 1 / b, 0);
    const inputs = [...betsTbody.querySelectorAll('.bet-input')];
    const manual = inputs
      .map((inp, i) => inp.dataset.auto === 'false' ? i : -1)
      .filter(i => i >= 0);

    if (!manual.length) return calculate();

    const i0 = manual[0];
    const mStake = parseFloat(inputs[i0].value) || 0;
    const newTotal = mStake * invSum * odds[i0];
    animate(totalBetInput, newTotal);
    totalBetInput.value = newTotal.toFixed(2);

    const stakes = odds.map(o => newTotal / o / invSum);
    const totalDist = stakes.reduce((a, b) => a + b, 0);

    stakes.forEach((s, i) => animate(inputs[i], s));
    stakes.forEach((s, i) => {
      const row = betsTbody.rows[i];
      animate(row.querySelector('.income'), s * odds[i] - totalDist);
      animate(row.querySelector('.return'), s * odds[i]);
    });

    const minProfit = Math.min(...stakes.map((s, i) => s * odds[i] - totalDist));
    const pct = totalDist ? (minProfit / totalDist) * 100 : 0;
    profitPercent.textContent = `Porcentagem: ${pct.toFixed(2)}%`;
    profitPercent.style.color = pct > 0 ? '#4cf392' : pct < 0 ? '#e74c3c' : '#fff';

    inputs.forEach(i => i.dataset.auto = "true");
  };

  const clearAll = () => {
    totalBetInput.value = '';
    betsTbody.querySelectorAll('input').forEach(i => {
      i.value = '';
      if (i.classList.contains('bet-input')) i.dataset.auto = "true";
    });
    betsTbody.querySelectorAll('.income, .return').forEach(c => c.textContent = '0.00');
    profitPercent.textContent = 'Porcentagem: 0%';
    profitPercent.style.color = '#fff';
  };

  totalBetInput.addEventListener('input', calculate);
  betsTbody.addEventListener('input', e => {
    if (e.target.matches('.coef')) calculate();
    if (e.target.matches('.bet-input')) e.target.dataset.auto = "false";
  });

betsTbody.addEventListener('keydown', e => {
  if (e.key === 'Tab' && !e.shiftKey && e.target.matches('.bet-input, .coef')) {
    const curr   = e.target;
    const column = curr.classList.contains('bet-input') ? 'bet-input' : 'coef';
    const cells  = [...betsTbody.querySelectorAll(`.${column}`)];
    const idx    = cells.indexOf(curr);

    if (idx < cells.length - 1) {
      e.preventDefault();
      const next = cells[idx + 1];
      next.focus();
      next.select();
    }
    else if (column === 'bet-input') {
      const nextCol = [...betsTbody.querySelectorAll('.coef')];
      if (nextCol.length) {
        e.preventDefault();
        nextCol[0].focus();
        nextCol[0].select();
      }
    }
  }
});



  addRowBtn.addEventListener('click', () => {
    if (betsTbody.rows.length < 10) {
      betsTbody.appendChild(createRow());
      calculate();
    }
  });

  removeRowBtn.addEventListener('click', () => {
    if (betsTbody.rows.length > 1) {
      const last = betsTbody.lastElementChild;
      last.style.opacity = 0;
      last.style.transform = 'translateY(10px)';
      setTimeout(() => {
        betsTbody.removeChild(last);
        calculate();
      }, 300);
    }
  });

  updateBtn.addEventListener('click', update);
  clearBtn.addEventListener('click', clearAll);

  // Inicialização
  for (let i = 0; i < 2; i++) betsTbody.appendChild(createRow());
  calculate();
});
