/**
 * GERAÇÃO SOLAR ENGENHARIA - HOMEPAGE JAVASCRIPT
 * Lógica do Simulador, Menu Responsivo e Animações
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. MENU RESPONSIVO MOBILE
     ========================================================================== */
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('active');
      navbarMenu.classList.toggle('active');
    });

    // Fecha o menu ao clicar em links
    const navLinks = navbarMenu.querySelectorAll('.navbar-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     2. REVEAL-ON-SCROLL (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }

  /* ==========================================================================
     3. SIMULADOR DE ECONOMIA INTEGRADO (LEI 14.300 / 2026 - RS)
     ========================================================================== */
  const billSlider = document.getElementById('sim-bill-slider');
  const billDisplay = document.getElementById('sim-bill-display');
  const monthlySaveDisplay = document.getElementById('sim-monthly-save');
  const totalSaveDisplay = document.getElementById('sim-total-save');
  const reductionDisplay = document.getElementById('sim-reduction');
  const paybackDisplay = document.getElementById('sim-payback');
  const concessionariaSelect = document.getElementById('sim-concessionaria');

  if (billSlider) {
    function atualizarSimulador() {
      const conta = parseFloat(billSlider.value);
      const concessionaria = concessionariaSelect ? concessionariaSelect.value : 'certel';
      
      // Atualiza o display de input
      if (billDisplay) {
        billDisplay.textContent = `R$ ${conta.toLocaleString('pt-BR')}`;
      }

      // Parâmetros de economia considerando perdas de 18% e a Lei 14.300 em 2026 no RS
      // RGE possui tarifas de energia um pouco mais altas que a Certel (cooperativa)
      let fatorEconomia = 0.91; // Certel: 91%
      let fatorPayback = 3.6;   // Anos médios de payback (Certel)
      
      if (concessionaria === 'rge') {
        fatorEconomia = 0.93;   // RGE: 93% (tarifação mais pesada da distribuidora)
        fatorPayback = 3.4;     // Payback um pouco mais rápido pela tarifa alta
      }

      // 1. Economia Mensal
      const economiaMensal = conta * fatorEconomia;
      
      // 2. Economia acumulada em 25 anos (vida útil das placas) com inflação energética modesta
      const economiaTotal = economiaMensal * 12 * 25;

      // 3. Porcentagem de redução
      const reducaoPercentual = Math.round(fatorEconomia * 100);

      // 4. Payback dinâmico dependendo da faixa de consumo (escala de economia)
      let payback = fatorPayback;
      if (conta > 2000) {
        payback = payback - 0.6; // Grandes contas amortizam o investimento mais rápido
      } else if (conta < 300) {
        payback = payback + 0.8; // Sistemas muito pequenos demoram um pouco mais
      }

      // Renderização na tela
      if (monthlySaveDisplay) {
        monthlySaveDisplay.textContent = `R$ ${Math.round(economiaMensal).toLocaleString('pt-BR')}`;
      }
      if (totalSaveDisplay) {
        totalSaveDisplay.textContent = `R$ ${Math.round(economiaTotal).toLocaleString('pt-BR')}`;
      }
      if (reductionDisplay) {
        reductionDisplay.textContent = `${reducaoPercentual}%`;
      }
      if (paybackDisplay) {
        paybackDisplay.textContent = `${payback.toFixed(1).replace('.', ',')} anos`;
      }
    }

    // Ouvintes
    billSlider.addEventListener('input', atualizarSimulador);
    if (concessionariaSelect) {
      concessionariaSelect.addEventListener('change', atualizarSimulador);
    }
    
    // Inicialização
    atualizarSimulador();
  }
});
