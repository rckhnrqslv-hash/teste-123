/**
 * BookShelf - Script do Perfil
 * Gerencia o sistema de abas dinâmicas, editor de texto, chat, publicação e formulário de contato.
 */
document.addEventListener("DOMContentLoaded", () => {
  function sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  // 1. Sistema de Abas Dinâmicas no Main
  const tabButtons = document.querySelectorAll(
    ".perfil-controles__btn[data-tab]",
  );
  const dynamicContainer = document.getElementById("dynamicMainContainer");

  const tabContents = {
    shelf: `
      <section class="board-container" style="box-shadow: none; padding: 0;">
        <h2 class="board-container__title">suas literaturas salvas</h2>
        <div class="carousel">
          <button class="carousel__nav-btn carousel__nav-btn--prev" aria-label="Anterior">&lt;</button>
          <div class="carousel__track">
            <article class="book-card">
              <div class="book-card__cover"><div class="cover-grid"></div></div>
              <header class="book-card__header"><h3 class="book-card__title">Dom Casmurro</h3></header>
              <div class="book-card__tracker">
                <input type="range" class="book-card__range" min="0" max="250" value="80">
                <output class="book-card__count">80 / 250 pág.</output>
              </div>
              <footer class="book-card__actions"><span class="book-card__score">100</span></footer>
            </article>
          </div>
          <button class="carousel__nav-btn carousel__nav-btn--next" aria-label="Próximo">&gt;</button>
        </div>
      </section>
    `,
    draft: `
      <div class="text-editor">
        <div class="text-editor__toolbar">
          <button type="button" class="perfil-controles__btn" data-command="bold" style="padding: 6px 12px; font-size: 0.8rem;">Negrito</button>
          <button type="button" class="perfil-controles__btn" data-command="italic" style="padding: 6px 12px; font-size: 0.8rem;">Itálico</button>
          <button type="button" class="perfil-controles__btn" data-command="underline" style="padding: 6px 12px; font-size: 0.8rem;">Sublinhado</button>
        </div>
        <div contenteditable="true" class="text-editor__textarea" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; min-height: 200px; outline: none; background: #fff; color: #252b42;">Comece a escrever seu rascunho literário aqui...</div>
      </div>
    `,
    chat: `
      <div class="social-chat">
        <div class="social-chat__input-group">
          <input type="text" id="chatInput" class="social-chat__input" placeholder="O que você está pensando sobre sua leitura atual?">
          <button type="button" id="chatSubmit" class="formulario-contato__btn" style="padding: 10px 16px;">Enviar</button>
        </div>
        <div class="social-chat__feed" id="chatFeed" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          <div class="social-chat__post" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #3b82f6; display: block; margin-bottom: 4px;">Leitor Ávido</strong>
            <p style="color: #252b42; font-size: 0.95rem;">Terminei o capítulo 3. Incrível como a narrativa prende a atenção!</p>
          </div>
        </div>
      </div>
    `,
    publish: `
      <div class="publish-section" style="display: flex; flex-direction: column; gap: 16px;">
        <h3 style="font-size: 1.1rem; color: var(--text-dark);">Revisão Ortográfica e Publicação</h3>
        <button type="button" id="startValidationBtn" class="formulario-contato__btn">Iniciar Validação</button>
        <div class="progress-container" style="display: none; width: 100%; background: #e2e8f0; border-radius: 8px; height: 16px; overflow: hidden;">
          <div id="progressBar" style="width: 0%; height: 100%; background: var(--accent-blue); transition: width 0.1s linear;"></div>
        </div>
        <p id="validationStatus" style="font-size: 0.9rem; color: #64748b;"></p>
        <div id="publishActions" style="display: none; gap: 10px; margin-top: 10px;">
          <button type="button" class="formulario-contato__btn" style="background: #10b981;">Publicar como eBook</button>
          <button type="button" class="formulario-contato__btn" style="background: #6366f1;">Preparar para Impressão</button>
        </div>
      </div>
    `,
  };

  function initDynamicTabLogic(tabKey) {
    if (tabKey === "draft") {
      document.querySelectorAll(".text-editor__toolbar button").forEach((b) => {
        b.addEventListener("click", () =>
          document.execCommand(b.getAttribute("data-command"), false, null),
        );
      });
    } else if (tabKey === "chat") {
      const chatSubmit = document.getElementById("chatSubmit");
      const chatInput = document.getElementById("chatInput");
      const chatFeed = document.getElementById("chatFeed");
      if (chatSubmit && chatInput && chatFeed) {
        chatSubmit.addEventListener("click", () => {
          const text = chatInput.value.trim();
          if (text) {
            const sanitized = sanitizeHTML(text);
            const postHTML = `<div class="social-chat__post" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;"><strong style="color: #3b82f6; display: block; margin-bottom: 4px;">Leitor Ávido</strong><p style="color: #252b42; font-size: 0.95rem;">${sanitized}</p></div>`;
            chatFeed.insertAdjacentHTML("afterbegin", postHTML);
            chatInput.value = "";
          }
        });
      }
    } else if (tabKey === "publish") {
      const startBtn = document.getElementById("startValidationBtn");
      const progressBar = document.getElementById("progressBar");
      const progressContainer = startBtn?.parentElement.querySelector(
        ".progress-container",
      );
      const statusText = document.getElementById("validationStatus");
      const publishActions = document.getElementById("publishActions");

      if (
        startBtn &&
        progressBar &&
        progressContainer &&
        statusText &&
        publishActions
      ) {
        startBtn.addEventListener("click", () => {
          startBtn.disabled = true;
          progressContainer.style.display = "block";
          statusText.textContent =
            "Analisando ortografia e estrutura literária...";
          let progress = 0;
          const interval = setInterval(() => {
            progress += 2;
            progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
              clearInterval(interval);
              statusText.textContent = "Validação concluída com sucesso!";
              publishActions.style.display = "flex";
            }
          }, 30);
        });
      }
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tabKey = btn.getAttribute("data-tab");
      if (tabContents[tabKey]) {
        dynamicContainer.innerHTML = tabContents[tabKey];
        initDynamicTabLogic(tabKey);
      }
    });
  });

  // 2. Validação do Formulário de Contato
  const contactForm = document.querySelector(".formulario-contato form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = contactForm.querySelectorAll(".formulario-contato__campo");
      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      inputs.forEach((input) => {
        const val = input.value.trim();
        if (!val || (input.type === "email" && !emailRegex.test(val))) {
          isValid = false;
          input.style.borderColor = "#ef4444";
        } else {
          input.style.borderColor = "#10b981";
        }
      });

      if (isValid) {
        alert("Mensagem enviada com sucesso!");
        contactForm.reset();
        inputs.forEach((input) => (input.style.borderColor = ""));
      } else {
        alert("Por favor, preencha todos os campos corretamente.");
      }
    });
  }

  // 3. Botão para voltar à Home
  const homeToggleBtn = document.getElementById("homeToggleBtn");
  if (homeToggleBtn) {
    homeToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "index.html";
    });
  }
});
