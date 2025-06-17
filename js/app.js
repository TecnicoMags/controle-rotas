// Constantes globais
const zonas = ["Zona Norte", "Zona Sul", "Zona Oeste", "Baixada", "Região Serrana"];

// Funções de autenticação
function alternarLogin() {
  const logado = document.getElementById('btnLogin').innerText === 'Sair';
  if (logado) {
    document.getElementById('btnLogin').innerText = 'Entrar';
    document.getElementById('painelAdmin').classList.add('d-none');
    document.querySelectorAll('.btn-editar-postos, .btn-remover-rota, .btn-remover-posto').forEach(btn => btn.classList.add('d-none'));
  } else {
    // Corrigido: Usar o método Bootstrap para mostrar o modal
    const modal = new bootstrap.Modal(document.getElementById('adminModal'));
    modal.show();
  }
}

function verificarSenha() {
  const email = document.getElementById('emailAdmin').value.trim();
  const senha = document.getElementById('senhaAdmin').value.trim();

  const hash = btoa(email + ':' + senha); // simples Mascará "ofuscação"

  const senhaEsperada = "YWRtQGdydXBvbWFncy5jb20uYnI6TWFnc0A2MzFh"; // Mascará de "email:senha"

  if (hash === senhaEsperada) {
    document.getElementById('adminModal').style.display = 'none';
    habilitarEdicao();
  } else {
    alert("E-mail ou senha incorretos.");
  }
}

// esconde tela de login
function fecharLogin() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('adminModal'));
  modal.hide();
}

function habilitarEdicao() {
  document.querySelectorAll('td[contenteditable]').forEach(td => td.contentEditable = true);
  document.querySelectorAll('.zona-select').forEach(s => s.disabled = false);
  document.querySelectorAll('.btn-editar-postos, .btn-remover-rota, .btn-remover-posto').forEach(btn => btn.classList.remove('d-none'));
  document.getElementById('btnLogin').innerText = 'Sair';
  document.getElementById('painelAdmin').classList.remove('d-none');
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
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }
  const container = document.getElementById('rotaContainer');
  const numero = document.querySelectorAll('.col-md-4').length + 1;
  criarRota(container, numero, zonas[0]);
}

// Funções de exportação
function salvarLocal() {
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }

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
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }

  html2canvas(document.getElementById('rotaContainer')).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = 'rotas.png';
    a.click();
  });
}

function exportarXLS() {
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const data = [];

  document.querySelectorAll('.table').forEach((table, i) => {
    data.push([`Rota ${i + 1}`]);
    const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
      [tr.innerText.replace('✖', '').trim()]
    );
    data.push(...rows);
    data.push(['']);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas');
  XLSX.writeFile(wb, 'rotas.xlsx');
}

function imprimirRotas() {
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }

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

// Carrega XML inicial
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

function importarXMLLocal() {
  if (document.getElementById('btnLogin').innerText !== 'Sair') {
    alert("Você precisa estar logado como administrador.");
    return;
  }

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

// Inicialização
window.addEventListener("load", () => {
  carregarXMLDoGitHub();
  document.getElementById('adminModal').style.display = 'none';
});
