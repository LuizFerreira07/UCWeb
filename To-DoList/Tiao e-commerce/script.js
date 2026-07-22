// --- BASE DE DADOS SIMULADA (Refletindo o SQL fornecido) ---
const produtosDB = [
    { id: "013", nome: "Amortecedor Dianteiro", ref: "GP30129 (Cofap)", aplicacao: "Gol G5/G6", preco: 499.90, img: "https://via.placeholder.com/250x200?text=Amortecedor+Cofap" },
    { id: "001", nome: "Filtro de Óleo", ref: "PSL560 (Tecfil)", aplicacao: "Gol/Fox/Polo", preco: 50.00, img: "https://via.placeholder.com/250x200?text=Filtro+de+Oleo" },
    { id: "004", nome: "Jogo de Velas", ref: "BKR7ESB-D (NGK)", aplicacao: "Motores 1.0/1.6", preco: 160.00, img: "https://via.placeholder.com/250x200?text=Jogo+de+Velas" },
    { id: "025", nome: "Óleo de Motor", ref: "5W40-MAX", aplicacao: "Norma 502.00", preco: 75.00, img: "https://via.placeholder.com/250x200?text=Oleo+5W40" },
    { id: "011", nome: "Pastilha de Freio", ref: "PD/58 (Fras-le)", aplicacao: "Gol G5/Polo", preco: 120.00, img: "https://via.placeholder.com/250x200?text=Pastilha+Freio" },
    { id: "007", nome: "Correia Dentada", ref: "CT453", aplicacao: "Motor 1.0/1.6", preco: 110.00, img: "https://via.placeholder.com/250x200?text=Correia+Dentada" }
];

let valorFreteGlobal = 0.00;

document.addEventListener("DOMContentLoaded", () => {
    renderizarCatalogo(produtosDB);
    atualizarContadorMenu();
    renderizarPaginaCarrinho();
});

// --- 1. ROTEAMENTO SIMPLES (SPA) ---
function navegarPara(secao) {
    document.querySelectorAll('.secao').forEach(el => el.classList.remove('ativo'));
    if (secao === 'vitrine') {
        document.getElementById('sec-vitrine').classList.add('ativo');
    } else if (secao === 'carrinho') {
        document.getElementById('sec-carrinho').classList.add('ativo');
        renderizarPaginaCarrinho();
    }
}

// --- 2. FORMATADORES ---
const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// --- 3. CATÁLOGO E BUSCA ---
function renderizarCatalogo(produtos) {
    const grid = document.getElementById("gridProdutos");
    grid.innerHTML = ""; // Limpa a grid

    if(produtos.length === 0) {
        grid.innerHTML = "<p>Nenhuma peça encontrada.</p>";
        return;
    }

    produtos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "card-produto";
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.nome}">
            <h3>${prod.nome}</h3>
            <span class="ref">Cód: ${prod.ref} | Aplicação: ${prod.aplicacao}</span>
            <span class="preco">${formatarMoeda(prod.preco)}</span>
            <button class="btn-add" onclick="adicionarAoCarrinho('${prod.id}')">Adicionar ao Carrinho</button>
        `;
        grid.appendChild(card);
    });
}

function filtrarCatalogo() {
    const termo = document.getElementById("inputBusca").value.toLowerCase();
    const filtrados = produtosDB.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        p.ref.toLowerCase().includes(termo)
    );
    renderizarCatalogo(filtrados);
}

// --- 4. LÓGICA DO CARRINHO ---
function adicionarAoCarrinho(idProduto) {
    const produto = produtosDB.find(p => p.id === idProduto);
    let carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    
    const index = carrinho.findIndex(item => item.id === idProduto);
    if (index !== -1) {
        carrinho[index].quantidade += 1;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }

    localStorage.setItem("carrinhoTiao", JSON.stringify(carrinho));
    atualizarContadorMenu();
    exibirToast(`✅ ${produto.nome} adicionado!`);
}

function atualizarContadorMenu() {
    const carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    const totalQtd = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    document.getElementById("contadorCarrinhoMenu").innerText = totalQtd;
}

// --- 5. PÁGINA DO CARRINHO ---
function renderizarPaginaCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    const tbody = document.getElementById("corpoTabelaCarrinho");
    let totalProdutos = 0;

    tbody.innerHTML = "";

    if (carrinho.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Seu carrinho está vazio.</td></tr>";
    } else {
        carrinho.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            totalProdutos += subtotal;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.nome}</strong><br><small>${item.ref}</small></td>
                <td>${formatarMoeda(item.preco)}</td>
                <td>
                    <div class="qtd-controle">
                        <button onclick="alterarQtdCarrinho('${item.id}', -1)">-</button>
                        <input type="text" value="${item.quantidade}" readonly>
                        <button onclick="alterarQtdCarrinho('${item.id}', 1)">+</button>
                    </div>
                </td>
                <td><strong>${formatarMoeda(subtotal)}</strong></td>
                <td><button class="btn-remover" onclick="removerDoCarrinho('${item.id}')">Excluir</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    atualizarTotais(totalProdutos);
}

function alterarQtdCarrinho(id, delta) {
    let carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    const index = carrinho.findIndex(item => item.id === id);
    
    if (index !== -1) {
        carrinho[index].quantidade += delta;
        if (carrinho[index].quantidade <= 0) {
            carrinho.splice(index, 1); // Remove se zerar
        }
        localStorage.setItem("carrinhoTiao", JSON.stringify(carrinho));
        renderizarPaginaCarrinho();
        atualizarContadorMenu();
    }
}

function removerDoCarrinho(id) {
    let carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem("carrinhoTiao", JSON.stringify(carrinho));
    renderizarPaginaCarrinho();
    atualizarContadorMenu();
    exibirToast("Item removido do carrinho.");
}

function atualizarTotais(valorProdutos) {
    document.getElementById("totalProdutos").innerText = formatarMoeda(valorProdutos);
    document.getElementById("valorFrete").innerText = formatarMoeda(valorFreteGlobal);
    
    const final = valorProdutos + valorFreteGlobal;
    document.getElementById("totalFinal").innerText = formatarMoeda(final);
}

// --- 6. API DE FRETE ---
function aplicarMascaraCEP(event) {
    let input = event.target;
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length > 5) input.value = input.value.replace(/^(\d{5})(\d)/, '$1-$2');
}

async function calcularFrete() {
    const cep = document.getElementById("cepFrete").value.replace(/\D/g, '');
    const resultado = document.getElementById("resultadoFrete");

    if (cep.length !== 8) {
        resultado.innerHTML = "<span style='color:red;'>CEP inválido.</span>";
        return;
    }

    resultado.innerHTML = "Calculando...";
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await response.json();

        if (dados.erro) throw new Error();

        // Simula valor de frete
        valorFreteGlobal = dados.uf === 'RS' ? 20.00 : 55.00;
        resultado.innerHTML = `<span style='color:green;'>Entrega em ${dados.localidade}-${dados.uf}</span>`;
        
        renderizarPaginaCarrinho(); // Recalcula o total com o frete
    } catch {
        resultado.innerHTML = "<span style='color:red;'>Erro ao buscar CEP.</span>";
        valorFreteGlobal = 0.00;
    }
}

function finalizarCompra() {
    const carrinho = JSON.parse(localStorage.getItem("carrinhoTiao")) || [];
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    alert("Pedido finalizado com sucesso! (Integração com backend pendente)");
    localStorage.removeItem("carrinhoTiao");
    valorFreteGlobal = 0;
    navegarPara('vitrine');
    atualizarContadorMenu();
}

// --- 7. UX (TOAST) ---
function exibirToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "toast mostrar";
    setTimeout(() => { toast.className = toast.className.replace("mostrar", ""); }, 3000);
}
