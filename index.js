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

  // Parâmetros Técnicos atualizados para 2026 (Lei 14.300 - Cobrança de 60% do Fio B)
  const CUSTO_MINIMO_CONEXAO = 85.00; // Taxa de disponibilidade média em R$ (trifásico)
  const FATOR_FIO_B_2026 = 0.84; // Impacto da cobrança de 60% do Fio B na parcela injetada
  
  function calculateEconomy(billValue) {
    billValue = parseFloat(billValue);

    // 1. Mostrar valor atual no slider
    billDisplay.textContent = `R$ ${billValue.toLocaleString('pt-BR')}`;

    // 2. A economia líquida em 2026 deduz o custo de conexão e a tarifa de injeção (60% do Fio B)
    let economiaMensal = (billValue - CUSTO_MINIMO_CONEXAO) * FATOR_FIO_B_2026;
    if (economiaMensal < 0) economiaMensal = 0;

    const economiaAnual = economiaMensal * 12;
    const percentualReducao = Math.round((economiaMensal / billValue) * 100);

    // 3. Estimativa de Payback (Tempo de retorno do investimento pós-Marco Legal)
    const investimentoEstimado = 9500 + (billValue * 18.5);
    let paybackAnos = investimentoEstimado / economiaAnual;
    
    // Forçar o payback a limites realistas de mercado em 2026 (4.2 a 6.2 anos no Sudeste devido ao Fio B)
    if (paybackAnos < 4.2) paybackAnos = 4.2;
    if (paybackAnos > 6.2) paybackAnos = 6.2;

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
     6. FORM SUBMISSION (BUILT FOR HIGH CONVERSION)
     ========================================================================== */
  const leadForm = document.getElementById('orcamento-form');
  const submitBtn = document.getElementById('btn-lead-submit');
  const formFeedback = document.getElementById('lead-form-feedback');

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Desabilitar o botão e iniciar animação de carregamento
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando Dados...';
    submitBtn.style.opacity = '0.8';

    const name = document.getElementById('lead-name').value;

    // Simulação de chamada de API externa
    setTimeout(() => {
      // Exibir feedback positivo de sucesso com as cores da Geração Solar
      formFeedback.style.display = 'block';
      formFeedback.style.backgroundColor = '#1C1F22'; // Grafite escuro
      formFeedback.style.color = '#FFFFFF';
      formFeedback.style.border = '2px solid #FFC815'; // Borda amarela solar
      
      formFeedback.innerHTML = `
        <span style="color:#FFC815; font-size:1.1rem; font-weight:800; display:block; margin-bottom:4px;">✓ Solicitado com Sucesso!</span>
        Obrigado, <strong>${name}</strong>. Nossa equipe técnica de engenharia já recebeu seus dados e iniciou a análise preliminar da sua rede. Entraremos em contato via telefone/WhatsApp em até 2 horas.
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

    }, 1500);
  });

  /* ==========================================================================
     7. HERO FORM SUBMISSION
     ========================================================================== */
  const heroForm = document.getElementById('hero-lead-form');
  const heroSubmitBtn = document.getElementById('btn-hero-submit');
  const heroFormFeedback = document.getElementById('hero-form-feedback');

  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();

    heroSubmitBtn.disabled = true;
    heroSubmitBtn.textContent = 'Enviando...';
    heroSubmitBtn.style.opacity = '0.8';

    const name = document.getElementById('hero-name').value;

    setTimeout(() => {
      heroFormFeedback.style.display = 'block';
      heroFormFeedback.style.backgroundColor = '#FFFFFF';
      heroFormFeedback.style.color = '#F25C05';
      heroFormFeedback.style.border = '2px solid #FFC815';
      
      heroFormFeedback.innerHTML = `
        <span style="font-size:1rem; font-weight:800; display:block; margin-bottom:2px;">✓ Enviado!</span>
        Obrigado, ${name}. Retornaremos em até 2 horas.
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

    }, 1500);
  });

  /* ==========================================================================
     8. PROJETOS REALIZADOS CAROUSEL
     ========================================================================== */
  const PROJETOS_DADOS = [
    {
      img: 'assets/Projetos Concluídos/DJI_0713-Copia.jpg.webp',
      cidade: 'Westfália - RS',
      tipo: 'Residencial',
      potencia: '7,2 kWp',
      tag: 'residencial'
    },
    {
      img: 'assets/Projetos Concluídos/DJI_0320-scaled-e1631833665750.jpg.webp',
      cidade: 'Westfália - RS',
      tipo: 'Comercial',
      potencia: '45,72 kWp',
      tag: 'comercial'
    },
    {
      img: 'assets/Projetos Concluídos/DJI_0727-Copia.jpg.webp',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '19,2 kWp',
      tag: 'comercial'
    },
    {
      img: 'assets/Projetos Concluídos/DJI_0741-Copia.jpg.webp',
      cidade: 'Forquetinha - RS',
      tipo: 'Comercial',
      potencia: '13,5 kWp',
      tag: 'comercial'
    },
    {
      img: 'assets/Projetos Concluídos/Geovanne-foto-post-1024x750.jpg.webp',
      cidade: 'Roca Sales - RS',
      tipo: 'Residencial',
      potencia: '7,04 kWp',
      tag: 'residencial'
    },
    {
      img: 'assets/Projetos Concluídos/WhatsApp Image 2023-06-26 at 16.07.38.jpeg',
      cidade: 'Lajeado - RS',
      tipo: 'Residencial',
      potencia: '4,4 kWp',
      tag: 'residencial'
    },
    {
      img: 'assets/Projetos Concluídos/WhatsApp Image 2023-07-10 at 22.55.20 (1).jpeg',
      cidade: 'Muçum - RS',
      tipo: 'Residencial',
      potencia: '10,8 kWp',
      tag: 'residencial'
    },
    {
      img: 'assets/Projetos Concluídos/aoCt9Q7.jpg',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '20,06 kWp',
      tag: 'comercial'
    },
    {
      img: 'assets/Projetos Concluídos/hotel.webp',
      cidade: 'Lajeado - RS',
      tipo: 'Comercial',
      potencia: '41,86 kWp',
      tag: 'comercial'
    }
  ];

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
