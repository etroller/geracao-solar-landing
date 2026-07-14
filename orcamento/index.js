/**
 * GERAÇÃO SOLAR ENGENHARIA - INTERACTIVE JAVASCRIPT
 * Lógica do Simulador, Menu Responsivo, FAQ e Animações
 */

document.addEventListener('DOMContentLoaded', () => {

  /* Cabeçalho e navegação removidos do HTML */

  /* ==========================================================================
     3. REVEAL-ON-SCROLL (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Anima apenas uma vez
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  /* ==========================================================================
     4. FAQ ACCORDION INTERACTION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const faqHeader = item.querySelector('.faq-header');
    
    faqHeader.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Fechar todos os FAQs antes de abrir o atual para manter a ordem
      faqItems.forEach(i => i.classList.remove('active'));
      
      // Se não estava ativo, abre
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     5. HIGH-CONVERSION ECONOMY SIMULATOR
     ========================================================================== */
  const billSlider = document.getElementById('sim-bill-slider');
  const billDisplay = document.getElementById('sim-bill-display');
  
  const monthlySaveDisplay = document.getElementById('sim-monthly-save');
  const yearlySaveDisplay = document.getElementById('sim-yearly-save');
  const reductionPctDisplay = document.getElementById('sim-reduction-pct');
  const paybackValDisplay = document.getElementById('sim-payback-val');
  
  const simulatorCta = document.getElementById('sim-submit-btn');
  const leadBillSelect = document.getElementById('lead-bill');

  // Parâmetros Técnicos atualizados para considerar a cobrança de 75% do Fio B e a incidência de ICMS na TUSD
  const CUSTO_MINIMO_CONEXAO = 85.00; // Taxa de disponibilidade média em R$ (trifásico)
  const FATOR_FIO_B_TUSD_ICMS = 0.70; // Impacto da cobrança de 75% do Fio B e ICMS sobre a TUSD (economia média de 70% na injeção)
  
  function calculateEconomy(billValue) {
    billValue = parseFloat(billValue);

    // 1. Mostrar valor atual no slider
    billDisplay.textContent = `R$ ${billValue.toLocaleString('pt-BR')}`;

    // 2. A economia líquida deduz o custo de conexão e a incidência de taxas regulatórias
    let economiaMensal = (billValue - CUSTO_MINIMO_CONEXAO) * FATOR_FIO_B_TUSD_ICMS;
    if (economiaMensal < 0) economiaMensal = 0;

    const economiaAnual = economiaMensal * 12;
    const percentualReducao = Math.round((economiaMensal / billValue) * 100);

    // 3. Estimativa de Payback (Tempo de retorno do investimento pós-Marco Legal)
    const investimentoEstimado = 9500 + (billValue * 18.5);
    let paybackAnos = investimentoEstimado / economiaAnual;
    
    // Forçar o payback a limites realistas de mercado (4.8 a 6.8 anos devido a 75% do Fio B e ICMS na TUSD)
    if (paybackAnos < 4.8) paybackAnos = 4.8;
    if (paybackAnos > 6.8) paybackAnos = 6.8;

    // 4. Exibir resultados no painel com micro-efeitos de transição
    updateDisplayWithFade(monthlySaveDisplay, `R$ ${Math.round(economiaMensal).toLocaleString('pt-BR')}`);
    updateDisplayWithFade(yearlySaveDisplay, `R$ ${Math.round(economiaAnual).toLocaleString('pt-BR')}`);
    updateDisplayWithFade(reductionPctDisplay, `${percentualReducao}%`);
    updateDisplayWithFade(paybackValDisplay, `${paybackAnos.toFixed(1).replace('.', ',')} Anos`);
  }

  function updateDisplayWithFade(element, newValue) {
    element.style.opacity = '0.5';
    setTimeout(() => {
      element.textContent = newValue;
      element.style.opacity = '1';
    }, 40);
  }

  // Evento de alteração do slider
  billSlider.addEventListener('input', (e) => {
    calculateEconomy(e.target.value);
  });

  // Executar primeiro cálculo padrão inicial
  calculateEconomy(billSlider.value);

  // Micro-interação: Ajustar automaticamente o select do formulário com base no valor simulado
  simulatorCta.addEventListener('click', () => {
    const sliderVal = parseInt(billSlider.value);
    
    if (sliderVal <= 500) {
      leadBillSelect.value = 'under500';
    } else if (sliderVal > 500 && sliderVal <= 1500) {
      leadBillSelect.value = '500to1500';
    } else if (sliderVal > 1500 && sliderVal <= 3000) {
      leadBillSelect.value = '1500to3000';
    } else {
      leadBillSelect.value = 'above3000';
    }
  });

  /* ==========================================================================
     GERENCIAMENTO DE UTMS (PROVA DE ORIGEM DO LEAD)
     ========================================================================== */
  function captureAndStoreUtms() {
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    const urlParams = new URLSearchParams(window.location.search);
    
    utmParams.forEach(param => {
      const val = urlParams.get(param);
      if (val) {
        sessionStorage.setItem(param, val);
      }
    });
  }

  function getStoredUtms() {
    const utms = {};
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    
    utmParams.forEach(param => {
      const val = sessionStorage.getItem(param) || new URLSearchParams(window.location.search).get(param);
      if (val) {
        utms[param] = val;
      }
    });
    
    return utms;
  }

  // Executa captura de parâmetros de anúncio
  captureAndStoreUtms();

  /* ==========================================================================
     CONFIGURAÇÃO DO WEBHOOK DO N8N
     ========================================================================== */
  const N8N_WEBHOOK_URL = 'https://webhook.geracaosolarengenharia.com.br/webhook/geracao-solar-leads';

  async function enviarWebhook(data) {
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.includes('seu-servidor-n8n.com')) {
      console.warn('Webhook n8n não configurado. Utilizando simulação local.');
      // Simula um atraso de rede local de 1 segundo para fins visuais
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    const utms = getStoredUtms();

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          ...utms,
          submittedAt: new Date().toISOString(),
          sourceUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do webhook: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Erro ao enviar dados para o Webhook do n8n:', error);
      // Retornamos true mesmo em caso de erro no envio para garantir que a UX
      // de sucesso na página não seja interrompida para o usuário final.
      return false;
    }
  }

  /* ==========================================================================
     MÁSCARA E VALIDAÇÃO DE WHATSAPP (PREVENÇÃO DE ERROS)
     ========================================================================== */
  function aplicarMascaraTelefone(inputElement) {
    if (!inputElement) return;
    
    inputElement.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
      
      // Limita a 11 dígitos
      if (val.length > 11) {
        val = val.slice(0, 11);
      }
      
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
    
    // Evita sequências de dígitos repetidos como 9999999999
    if (/^(\d)\1+$/.test(cleaned)) {
      return { valido: false, erro: 'Número inválido. Evite sequências de números repetidos.' };
    }
    
    return { valido: true, cleaned: cleaned };
  }

  function padronizarTelefone(cleaned) {
    // Adiciona o DDI 55 (Brasil) caso não exista (padrão E.164 limpo para n8n/WhatsApp APIs)
    if (cleaned.length === 10 || cleaned.length === 11) {
      return '55' + cleaned;
    }
    return cleaned;
  }

  // Inicializa as máscaras nos campos de telefone
  const heroWhatsappInput = document.getElementById('hero-whatsapp');
  const leadPhoneInput = document.getElementById('lead-phone');

  aplicarMascaraTelefone(heroWhatsappInput);
  aplicarMascaraTelefone(leadPhoneInput);

  /* ==========================================================================
     6. FORM SUBMISSION (BUILT FOR HIGH CONVERSION)
     ========================================================================== */
  const leadForm = document.getElementById('orcamento-form');
  const submitBtn = document.getElementById('btn-lead-submit');
  const formFeedback = document.getElementById('lead-form-feedback');

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const phoneRaw = document.getElementById('lead-phone').value;
    const validacao = validarTelefone(phoneRaw);
    
    if (!validacao.valido) {
      // Exibe erro no feedback do formulário
      formFeedback.style.display = 'block';
      formFeedback.style.backgroundColor = '#FFF0F0';
      formFeedback.style.color = '#D00000';
      formFeedback.style.border = '2px solid #D00000';
      formFeedback.innerHTML = `<strong>Erro:</strong> ${validacao.erro}`;
      formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Desabilitar o botão e iniciar animação de carregamento
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando Dados...';
    submitBtn.style.opacity = '0.8';

    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const type = document.getElementById('lead-type').value;
    const bill = document.getElementById('lead-bill').value;
    const msg = document.getElementById('lead-msg').value;

    const data = {
      formName: 'contato-rodape',
      name: name,
      email: email,
      phone: padronizarTelefone(validacao.cleaned),
      phoneOriginal: phoneRaw,
      installationType: type,
      electricBillRange: bill,
      message: msg
    };

    // Enviar dados assincronamente ao webhook do n8n
    enviarWebhook(data).then(() => {
      // Exibir feedback positivo de sucesso com as cores da Geração Solar
      formFeedback.style.display = 'block';
      formFeedback.style.backgroundColor = '#1C1F22'; // Grafite escuro
      formFeedback.style.color = '#FFFFFF';
      formFeedback.style.border = '2px solid #FFC815'; // Borda amarela solar
      
      formFeedback.innerHTML = `
        <span style="color:#FFC815; font-size:1.1rem; font-weight:800; display:block; margin-bottom:4px;">✓ Solicitado com Sucesso!</span>
        Obrigado, ${name}. Retornaremos em breve.
      `;

      // Resetar formulário
      leadForm.reset();

      // Restaurar botão
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar Orçamento Gratuito';
      submitBtn.style.opacity = '1';

      // Rolar suavemente até o feedback
      formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Ocultar mensagem após 12 segundos
      setTimeout(() => {
        formFeedback.style.opacity = '0';
        setTimeout(() => {
          formFeedback.style.display = 'none';
          formFeedback.style.opacity = '1';
        }, 500);
      }, 12000);
    });
  });

  /* ==========================================================================
     7. HERO FORM SUBMISSION
     ========================================================================== */
  const heroForm = document.getElementById('hero-lead-form');
  const heroSubmitBtn = document.getElementById('btn-hero-submit');
  const heroFormFeedback = document.getElementById('hero-form-feedback');

  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const whatsappRaw = document.getElementById('hero-whatsapp').value;
    const validacao = validarTelefone(whatsappRaw);

    if (!validacao.valido) {
      heroFormFeedback.style.display = 'block';
      heroFormFeedback.style.backgroundColor = '#FFF0F0';
      heroFormFeedback.style.color = '#D00000';
      heroFormFeedback.style.border = '2px solid #D00000';
      heroFormFeedback.innerHTML = `<strong>Erro:</strong> ${validacao.erro}`;
      
      // Oculta o feedback de erro depois de 6 segundos
      setTimeout(() => {
        heroFormFeedback.style.opacity = '0';
        setTimeout(() => {
          heroFormFeedback.style.display = 'none';
          heroFormFeedback.style.opacity = '1';
        }, 500);
      }, 6000);
      return;
    }

    heroSubmitBtn.disabled = true;
    heroSubmitBtn.textContent = 'Enviando...';
    heroSubmitBtn.style.opacity = '0.8';

    const name = document.getElementById('hero-name').value;
    const city = document.getElementById('hero-city').value;
    const installTime = document.getElementById('hero-install-time').value;

    const data = {
      formName: 'lead-hero',
      name: name,
      city: city,
      phone: padronizarTelefone(validacao.cleaned),
      phoneOriginal: whatsappRaw,
      installTime: installTime
    };

    // Enviar dados assincronamente ao webhook do n8n
    enviarWebhook(data).then(() => {
      heroFormFeedback.style.display = 'block';
      heroFormFeedback.style.backgroundColor = '#FFFFFF';
      heroFormFeedback.style.color = '#F25C05';
      heroFormFeedback.style.border = '2px solid #FFC815';
      
      heroFormFeedback.innerHTML = `
        <span style="font-size:1rem; font-weight:800; display:block; margin-bottom:2px;">✓ Enviado!</span>
        Obrigado, ${name}. Retornaremos em breve.
      `;

      heroForm.reset();

      heroSubmitBtn.disabled = false;
      heroSubmitBtn.textContent = 'Quero Meu Orçamento Gratuito';
      heroSubmitBtn.style.opacity = '1';

      setTimeout(() => {
        heroFormFeedback.style.opacity = '0';
        setTimeout(() => {
          heroFormFeedback.style.display = 'none';
          heroFormFeedback.style.opacity = '1';
        }, 500);
      }, 10000);
    });
  });

  /* ==========================================================================
     8. PROJETOS REALIZADOS CAROUSEL
     ========================================================================== */
  const PROJETOS_DADOS = [
    {
      img: '../assets/Projetos Concluídos/hotel.webp',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '41,86 kWp',
      tag: 'comercial'
    },
    {
      img: '../assets/Projetos Concluídos/DJI_0320-scaled-e1631833665750.jpg.webp',
      cidade: 'Westfália - RS',
      tipo: 'Comercial',
      potencia: '12,4 kWp',
      tag: 'comercial'
    },
    {
      img: '../assets/Projetos Concluídos/DJI_0713-Copia.jpg.webp',
      cidade: 'Westfália - RS',
      tipo: 'Residencial',
      potencia: '52,65 kWp',
      tag: 'residencial'
    },
    {
      img: '../assets/Projetos Concluídos/DJI_0727-Copia.jpg.webp',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '78,3 kWp',
      tag: 'comercial'
    },
    {
      img: '../assets/Projetos Concluídos/DJI_0741-Copia.jpg.webp',
      cidade: 'Estrela - RS',
      tipo: 'Comercial',
      potencia: '22,8 kWp',
      tag: 'comercial'
    },
    {
      img: '../assets/Projetos Concluídos/Geovanne-foto-post-1024x750.jpg.webp',
      cidade: 'Roca Sales - RS',
      tipo: 'Residencial',
      potencia: '8,8 kWp',
      tag: 'residencial'
    },
    {
      img: '../assets/Projetos Concluídos/WhatsApp Image 2023-06-26 at 16.07.38.jpeg',
      cidade: 'Lajeado - RS',
      tipo: 'Residencial',
      potencia: '34,2 kWp',
      tag: 'residencial'
    },
    {
      img: '../assets/Projetos Concluídos/WhatsApp Image 2023-07-10 at 22.55.20 (1).jpeg',
      cidade: 'Muçum - RS',
      tipo: 'Residencial',
      potencia: '15,6 kWp',
      tag: 'residencial'
    },
    {
      img: '../assets/Projetos Concluídos/aoCt9Q7.jpg',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '18,5 kWp',
      tag: 'comercial'
    }  ];

  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carouselTrack && prevBtn && nextBtn) {
    // Render cards
    carouselTrack.innerHTML = PROJETOS_DADOS.map(proj => `
      <div class="project-card reveal-delay-stagger">
        <a href="#hero-lead-form" class="project-card-link">
          <span class="project-badge ${proj.tag}">${proj.tipo}</span>
          <div class="project-img-wrapper">
            <img src="${encodeURI(proj.img)}" alt="Projeto ${proj.tipo} em ${proj.cidade}" loading="lazy">
          </div>
          <div class="project-overlay">
            <span class="project-city">${proj.cidade}</span>
            <h3 class="project-title">Sistema ${proj.tipo}</h3>
            <span class="project-power">Potência: ${proj.potencia}</span>
          </div>
        </a>
      </div>
    `).join('');

    let currentIndex = 0;

    function getVisibleCardsCount() {
      if (window.innerWidth > 992) return 3;
      if (window.innerWidth > 576) return 2;
      return 1;
    }

    function updateCarousel() {
      const cards = carouselTrack.querySelectorAll('.project-card');
      if (cards.length === 0) return;
      
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 24; // matches gaps in CSS
      const visibleCount = getVisibleCardsCount();
      const maxIndex = PROJETOS_DADOS.length - visibleCount;

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      if (currentIndex < 0) {
        currentIndex = 0;
      }

      // Calculate shift
      const offset = currentIndex * (cardWidth + gap);
      carouselTrack.style.transform = `translateX(-${offset}px)`;

      // Update button states
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCardsCount();
      if (currentIndex < PROJETOS_DADOS.length - visibleCount) {
        currentIndex++;
        updateCarousel();
      }
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCarousel();
      }, 100);
    });

    // Initial load
    setTimeout(updateCarousel, 300);
  }

  /* ==========================================================================
     9. MOBILE NAVIGATION MENU
     ========================================================================== */
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');
  const navbarLinks = document.querySelectorAll('.navbar-link');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
      navbarToggle.classList.toggle('active');
    });

    navbarLinks.forEach(link => {
      link.addEventListener('click', () => {
        navbarMenu.classList.remove('active');
        navbarToggle.classList.remove('active');
      });
    });
  }

});
