// ==========================================
// FUNCIONALIDADE 1: MODO ESCURO/CLARO
// ==========================================

const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'theme-preference';

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const isDark = theme === 'dark';
    themeToggle.innerHTML = `<i class="bi bi-${isDark ? 'sun' : 'moon'}-fill"></i>`;
    themeToggle.classList.toggle('btn-outline-warning', isDark);
    themeToggle.classList.toggle('btn-outline-light', !isDark);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// ==========================================
// FUNCIONALIDADE 2: CRIAR E GERENCIAR POSTS
// ==========================================

const btnPostar = document.getElementById('btn-postar');
const postTitulo = document.getElementById('post-titulo');
const postConteudo = document.getElementById('post-conteudo');
const postsContainer = document.getElementById('posts-container');
const POSTS_KEY = 'posts-data';

// Armazenar posts no localStorage
let posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];

// Carregar e exibir posts ao carregar a página
function carregarPosts() {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center text-muted">Nenhum post ainda. Seja o primeiro a compartilhar!</p>';
        return;
    }
    
    // Exibir posts em ordem reversa (mais recentes primeiro)
    posts.slice().reverse().forEach((post, index) => {
        const postIndex = posts.length - 1 - index;
        const postElement = criarElementoPost(post, postIndex);
        postsContainer.appendChild(postElement);
    });
}

// Criar elemento visual do post
function criarElementoPost(post, index) {
    const div = document.createElement('div');
    div.className = 'card mb-4 shadow-sm post-card';
    
    const dataFormatada = new Date(post.data).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">${escapeHtml(post.titulo)}</h5>
                <button class="btn btn-sm btn-outline-danger" onclick="deletarPost(${index})" title="Deletar post">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <small class="text-muted">${dataFormatada}</small>
            <p class="card-text mt-3">${escapeHtml(post.conteudo)}</p>
            
            <div class="d-flex align-items-center mt-3 border-top pt-3">
                <button class="btn btn-sm btn-outline-danger like-btn" 
                    onclick="curtirPost(${index})" 
                    oncontextmenu="descurtirPost(${index}); return false;" 
                    title="Clique: curtir | Clique direito: descurtir">
                    <i class="bi bi-heart-fill"></i>
                    <span class="like-count">${post.curtidas}</span>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

// Criar novo post
function criarPost() {
    const titulo = postTitulo.value.trim();
    const conteudo = postConteudo.value.trim();
    
    if (!titulo || !conteudo) {
        alert('Por favor, preencha o título e o conteúdo do post!');
        return;
    }
    
    const novoPost = {
        id: Date.now(),
        titulo: titulo,
        conteudo: conteudo,
        data: new Date().toISOString(),
        curtidas: 0
    };
    
    posts.push(novoPost);
    salvarPosts();
    carregarPosts();
    
    // Limpar formulário
    postTitulo.value = '';
    postConteudo.value = '';
    postTitulo.focus();
    
    // Feedback visual
    mostrarNotificacao('Post criado com sucesso!', 'success');
}

// ==========================================
// FUNCIONALIDADE 3: BOTÃO DE CURTIR COM CONTADOR
// ==========================================

function curtirPost(index) {
    if (validarIndex(index)) {
        posts[index].curtidas++;
        salvarPosts();
        carregarPosts();
        animarBotao(event.target, 'like-animation');
    }
}

function descurtirPost(index) {
    if (validarIndex(index)) {
        if (posts[index].curtidas > 0) {
            posts[index].curtidas--;
            salvarPosts();
            carregarPosts();
            animarBotao(event.target, 'unlike-animation');
            mostrarNotificacao('Curtida removida!', 'info');
        } else {
            mostrarNotificacao('Nenhuma curtida para remover!', 'warning');
        }
    }
}

function validarIndex(index) {
    return index >= 0 && index < posts.length;
}

function animarBotao(elemento, classAnimacao) {
    const btn = elemento.closest('.like-btn');
    if (btn) {
        btn.classList.add(classAnimacao);
        setTimeout(() => btn.classList.remove(classAnimacao), 300);
    }
}

// Deletar post
function deletarPost(index) {
    if (confirm('Tem certeza que deseja deletar este post?')) {
        posts.splice(index, 1);
        salvarPosts();
        carregarPosts();
        mostrarNotificacao('Post deletado!', 'danger');
    }
}

// Salvar posts no localStorage
function salvarPosts() {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

// Escapar caracteres HTML para segurança
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alerta.style.zIndex = '9999';
    alerta.innerHTML = `${mensagem}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

btnPostar.addEventListener('click', criarPost);
postConteudo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) criarPost();
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    carregarPosts();
});// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    applyThemeStyles();
    carregarPosts();
});
