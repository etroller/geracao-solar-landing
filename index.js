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

      // Parâmetros de economia considerando perdas de 18% e a Lei 14.300 (75% Fio B + ICMS na TUSD)
      let fatorEconomia = 0.70; // Cooperativas (Certel, Certaja, Cerfox): economia de 70%
      let fatorPayback = 5.2;   // Payback estimado de 5.2 anos
      
      if (concessionaria === 'rge' || concessionaria === 'ceee') {
        fatorEconomia = 0.72;   // Concessionárias (RGE, CEEE): economia de 72%
        fatorPayback = 4.8;     // Payback um pouco menor de 4.8 anos pela tarifa alta
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

    /* ==========================================================================
       4. FORM SUBMISSION & PHONE MASK (ROOT HOMEPAGE)
       ========================================================================== */
    const leadForm = document.getElementById('orcamento-form');
    const submitBtn = document.getElementById('btn-lead-submit');
    const formFeedback = document.getElementById('lead-form-feedback');
    const leadPhoneInput = document.getElementById('lead-phone');

    // WhatsApp Mask
    if (leadPhoneInput) {
      leadPhoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.slice(0, 11);
        
        if (val.length > 10) {
          e.target.value = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
        } else if (val.length > 6) {
          e.target.value = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
        } else if (val.length > 2) {
          e.target.value = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        } else if (val.length > 0) {
          e.target.value = `(${val}`;
        } else {
          e.target.value = '';
        }
      });
    }

    function validarTelefone(phoneStr) {
      const cleaned = phoneStr.replace(/\D/g, '');
      if (cleaned.length !== 10 && cleaned.length !== 11) {
        return { valido: false, erro: 'Número incompleto. Insira o DDD + número (ex: 51 98585-7422).' };
      }
      const ddd = parseInt(cleaned.slice(0, 2));
      if (ddd < 11 || ddd > 99) {
        return { valido: false, erro: 'DDD inválido. Por favor, insira um DDD válido (ex: 51).' };
      }
      if (/^(\d)\1+$/.test(cleaned)) {
        return { valido: false, erro: 'Número inválido. Evite sequências de números repetidos.' };
      }
      return { valido: true, cleaned: cleaned };
    }

    function padronizarTelefone(cleaned) {
      if (cleaned.length === 10 || cleaned.length === 11) {
        return '55' + cleaned;
      }
      return cleaned;
    }

    // Webhook and UTM configuration
    const N8N_WEBHOOK_URL = 'https://webhook.geracaosolarengenharia.com.br/webhook/geracao-solar-leads';

    function getStoredUtms() {
      const utms = {};
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
      utmParams.forEach(param => {
        const val = sessionStorage.getItem(param) || new URLSearchParams(window.location.search).get(param);
        if (val) utms[param] = val;
      });
      return utms;
    }

    async function enviarWebhook(data) {
      if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.includes('seu-servidor-n8n.com')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      const utms = getStoredUtms();
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            ...utms,
            submittedAt: new Date().toISOString(),
            sourceUrl: window.location.href
          })
        });
        return response.ok;
      } catch (error) {
        console.error('Erro ao enviar webhook:', error);
        return false;
      }
    }

    if (leadForm) {
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneRaw = leadPhoneInput.value;
        const validacao = validarTelefone(phoneRaw);
        
        if (!validacao.valido) {
          formFeedback.style.display = 'block';
          formFeedback.style.backgroundColor = '#FFF0F0';
          formFeedback.style.color = '#D00000';
          formFeedback.style.border = '2px solid #D00000';
          formFeedback.innerHTML = `<strong>Erro:</strong> ${validacao.erro}`;
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.style.opacity = '0.8';

        const name = document.getElementById('lead-name').value;
        const email = document.getElementById('lead-email').value;
        const type = document.getElementById('lead-type').value;
        const bill = document.getElementById('lead-bill').value;
        const msg = document.getElementById('lead-msg').value;

        const data = {
          formName: 'contato-home-raiz',
          name: name,
          email: email,
          phone: padronizarTelefone(validacao.cleaned),
          phoneOriginal: phoneRaw,
          installationType: type,
          electricBillRange: bill,
          message: msg
        };

        enviarWebhook(data).then(() => {
          formFeedback.style.display = 'block';
          formFeedback.style.backgroundColor = '#1C1F22';
          formFeedback.style.color = '#FFFFFF';
          formFeedback.style.border = '2px solid #FFC815';
          formFeedback.innerHTML = `
            <span style="color:#FFC815; font-size:1.1rem; font-weight:800; display:block; margin-bottom:4px;">✓ Solicitado com Sucesso!</span>
            Obrigado, ${name}. Retornaremos em breve.
          `;
          
          leadForm.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Solicitar Orçamento Gratuito';
          submitBtn.style.opacity = '1';

          setTimeout(() => {
            formFeedback.style.opacity = '0';
            setTimeout(() => {
              formFeedback.style.display = 'none';
              formFeedback.style.opacity = '1';
            }, 500);
          }, 12000);
        });
      });
    }
});
