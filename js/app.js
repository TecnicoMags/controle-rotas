// Constantes globais
const zonas = ["Zona Norte", "Zona Sul", "Zona Oeste", "Baixada", "Região Serrana"];

// Funções de autenticação
/*function alternarLogin() {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.auth().signOut().then(() => {
      document.getElementById('btnLogin').innerText = 'Login';
      document.getElementById('btnSalvar').classList.add('d-none');
      document.getElementById('btnAdicionarRota').classList.add('d-none');
      document.querySelectorAll('.btn-editar-postos, .btn-remover-rota, .btn-remover-posto').forEach(btn => btn.classList.add('d-none'));
    });
  } else {
    document.getElementById('adminModal').style.display = 'flex';
  }
}*/

function alternarLogin() {
  const logado = document.getElementById('btnLogin').innerText === 'Sair';
  if (logado) {
    document.getElementById('btnLogin').innerText = 'Login';
    document.getElementById('btnSalvar').classList.add('d-none');
    document.getElementById('btnAdicionarRota').classList.add('d-none');
    document.querySelectorAll('.btn-editar-postos, .btn-remover-rota, .btn-remover-posto').forEach(btn => btn.classList.add('d-none'));
  } else {
    // Aqui está o ponto mais importante:
    document.getElementById('adminModal').style.display = 'flex';
  }
}


/*function verificarSenha() {
  const email = document.getElementById('emailAdmin').value;
  const senha = document.getElementById('senhaAdmin').value;
  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(() => {
      document.getElementById('adminModal').style.display = 'none';
      habilitarEdicao();
    })
    .catch(err => alert('Erro ao autenticar: ' + err.message));
}*/

function verificarSenha() {
  const email = document.getElementById('emailAdmin').value.trim();
  const senha = document.getElementById('senhaAdmin').value.trim();

  // Login simples com e-mail e senha fixos
  if (email === 'admin@grupomags.com.br' && senha === 'Mags@631a') {
    document.getElementById('adminModal').style.display = 'none';
    habilitarEdicao();
  } else {
    alert('E-mail ou senha incorretos.'); //LOGIN OFF PRA SER REMOVIDO DEPOIS
  }
}

function fecharLogin() {
  document.getElementById('adminModal').style.display = 'none';
}

function habilitarEdicao() {
  document.querySelectorAll('td[contenteditable]').forEach(td => td.contentEditable = true);
  document.querySelectorAll('.zona-select').forEach(s => s.disabled = false);
  document.querySelectorAll('.btn-editar-postos, .btn-remover-rota, .btn-remover-posto').forEach(btn => btn.classList.remove('d-none'));
  document.getElementById('btnSalvar').classList.remove('d-none');
  document.getElementById('btnAdicionarRota').classList.remove('d-none');
  document.getElementById('btnLogin').innerText = 'Sair';
}

// Funções de manipulação de rotas
function criarRota(container, numero, zona, postos = []) {
  const col = document.createElement('div');
  col.className = 'col-md-4';

  const card = document.createElement('div');
  card.className = 'p-3 border rounded position-relative';

  const titulo = document.createElement('h5');
  titulo.className = 'text-center';
  titulo.textContent = `Rota ${numero}`;

  const btnRemover = document.createElement('button');
  btnRemover.textContent = 'X';
  btnRemover.className = 'btn btn-sm btn-danger btn-remover-rota d-none';
  btnRemover.onclick = () => col.remove();

  const select = document.createElement('select');
  select.className = 'form-select form-select-sm zona-select';
  zonas.forEach(z => {
    const opt = document.createElement('option');
    opt.value = z;
    opt.text = z;
    if (z === zona) opt.selected = true;
    select.appendChild(opt);
  });
  select.disabled = true;

  const tabela = document.createElement('table');
  tabela.className = 'table table-sm table-bordered';
  const tbody = document.createElement('tbody');

  if (postos.length === 0) postos = ["Posto 1"];
  postos.forEach((p, idx) => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = p;
    td.setAttribute('contenteditable', 'false');

    const btnX = document.createElement('span');
    btnX.textContent = ' ✖';
    btnX.className = 'btn-remover-posto d-none';
    btnX.onclick = () => tr.remove();
    td.appendChild(btnX);

    tr.appendChild(td);
    tbody.appendChild(tr);
  });

  tabela.appendChild(tbody);

  const btnQtd = document.createElement('button');
  btnQtd.className = 'btn btn-sm btn-outline-primary btn-editar-postos d-none';
  btnQtd.textContent = 'Quantidade';
  btnQtd.onclick = () => editarPostos(tbody);

  card.appendChild(titulo);
  card.appendChild(btnRemover);
  card.appendChild(select);
  card.appendChild(tabela);
  card.appendChild(btnQtd);
  col.appendChild(card);
  container.appendChild(col);
}

function editarPostos(tbody) {
  const qtd = parseInt(prompt("Quantos postos deseja?"));
  if (isNaN(qtd) || qtd < 1) return;
  tbody.innerHTML = '';
  for (let i = 0; i < qtd; i++) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = `Posto ${i + 1}`;
    td.setAttribute('contenteditable', 'true');

    const btnX = document.createElement('span');
    btnX.textContent = ' ✖';
    btnX.className = 'btn-remover-posto';
    btnX.onclick = () => tr.remove();
    td.appendChild(btnX);

    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function adicionarRota() {
  const container = document.getElementById('rotaContainer');
  const numero = document.querySelectorAll('.col-md-4').length + 1;
  criarRota(container, numero, zonas[0]);
}

// Funções de exportação
function salvarLocal() {
  const rotas = [];
  document.querySelectorAll('.col-md-4').forEach((col, i) => {
    const zona = col.querySelector('select').value;
    const postos = Array.from(col.querySelectorAll('tbody tr')).map(tr => tr.cells[0].innerText.replace('✖', '').trim());
    rotas.push({ rota: i + 1, zona, postos });
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rotas>\n';
  rotas.forEach(r => {
    xml += `  <rota zona=\"${r.zona}\">\n`;
    r.postos.forEach(p => {
      xml += `    <posto>${p}</posto>\n`;
    });
    xml += `  </rota>\n`;
  });
  xml += '</rotas>';

  const blob = new Blob([xml], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'rotas.xml';
  link.click();
  URL.revokeObjectURL(link.href);

  alert('Arquivo rotas.xml gerado e baixado. Substitua no repositório para atualizar.');
}

function exportarImagem() {
  html2canvas(document.getElementById('rotaContainer')).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = 'rotas.png';
    a.click();
  });
}

function exportarXLS() {
  const wb = XLSX.utils.book_new();
  document.querySelectorAll('.table').forEach((table, i) => {
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, `Rota ${i + 1}`);
  });
  XLSX.writeFile(wb, 'rotas.xlsx');
}

function imprimirRotas() {
    const originalContent = document.body.innerHTML;
    const rotasContent = document.getElementById('rotaContainer').outerHTML;
    
    document.body.innerHTML = `
        <h2 class="text-center mb-4">Controle de Rotas - Relatório</h2>
        ${rotasContent}
        <div class="text-center mt-4">
            <small>Impresso em ${new Date().toLocaleDateString()}</small>
        </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
}

// Função para carregar dados iniciais
async function carregarXMLDoGitHub() {
  const baseURL = location.hostname.includes("github.io")
    ? "https://tecnicomags.github.io/controle-rotas/"
    : "";
  const url = baseURL + "data/rotas.xml";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao baixar XML');
    const textoXML = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXML, "text/xml");

    const container = document.getElementById('rotaContainer');
    container.innerHTML = '';

    const rotas = xmlDoc.getElementsByTagName("rota");
    for (let i = 0; i < rotas.length; i++) {
      const zona = rotas[i].getAttribute("zona") || 'Zona Norte';
      const postos = Array.from(rotas[i].getElementsByTagName("posto")).map(p => p.textContent);
      criarRota(container, i + 1, zona, postos);
    }
  } catch (err) {
    console.warn("Arquivo XML não encontrado. Importe novos dados ou crie uma nova tabela de rotas.");
  }
}

//ler e atualizar por input o xml
function importarXMLLocal() {
  const input = document.getElementById('xmlInput');
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const xmlString = e.target.result;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const container = document.getElementById('rotaContainer');
    container.innerHTML = '';

    const rotas = xmlDoc.getElementsByTagName("rota");
    for (let i = 0; i < rotas.length; i++) {
      const zona = rotas[i].getAttribute("zona") || 'Zona Norte';
      const postos = Array.from(rotas[i].getElementsByTagName("posto")).map(p => p.textContent);
      criarRota(container, i + 1, zona, postos);
    }

    alert("Dados carregados com sucesso.");
  };
  reader.readAsText(file);
}

// Inicialização da aplicação
window.addEventListener("load", () => {
  carregarXMLDoGitHub();
  document.getElementById('adminModal').style.display = 'none';
});