
document.addEventListener("DOMContentLoaded", () => {
    console.log("Módulo do painel de Detalhes da Obra carregado com sucesso.");

    // Elementos principais do DOM
    const btnRead = document.querySelector(".btn-read");
    const backLink = document.querySelector(".back-link");
    const bookTitle = document.querySelector(".book-info h2")?.textContent || "Obra";

    // Captura o evento de clique para início de leitura
    if (btnRead) {
        btnRead.addEventListener("click", (event) => {
            // Registra o log de abertura de sessão da editora
            console.log(`[Bookshelf Engine] Sessão de leitura iniciada para a obra: "${bookTitle}"`);
            
            // Simulação opcional de salvamento de estado local
            localStorage.setItem("bookshelf_last_read", bookTitle);
            localStorage.setItem("bookshelf_read_timestamp", new Date().toISOString());
        });
    }

    // Captura o link de retorno para controle de estado na aplicação
    if (backLink) {
        backLink.addEventListener("click", () => {
            console.log("[Bookshelf Engine] Retornando ao catálogo geral de obras.");
        });
    }
});