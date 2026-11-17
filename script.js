// Configuração fixa do aluno
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 25,
  apiUrl: "https://profbt.com.br"
};

// Dados fictícios padronizados do 9º Ano (usados caso não existam dados salvos na API)
const dadosIniciais = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Estado da sessão em memória
let dadosBoletim = [];
let pinSessao = "";
let modoEdicao = false;

// Frequência fictícia/demonstrativa para esta etapa (será calculada dinamicamente no futuro)
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Função para normalizar qualquer formato de nota antiga para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se a nota vier como texto (ex: "8,5"), troca vírgula por ponto e converte para número
  if (typeof valor === "string") {
    valor = parseFloat(valor.replace(",", "."));
  }

  if (isNaN(valor)) {
    return null;
  }

  // Se a nota estiver maior que 10 e até 100, divide por 10 (ex: 85 vira 8.5)
  if (valor > 10 && valor <= 100) {
    valor = valor / 10;
  }

  // Garante que a nota esteja dentro do limite de 0 a 10
  if (valor >= 0 && valor <= 10) {
    return valor;
  }

  return null;
}

// Validação estrita para notas digitadas pelo aluno na edição (0 a 10 ou vazio)
function validarNotaDigitada(texto) {
  const limpo = texto.trim();
  if (limpo === "") {
    return { valido: true, valor: null };
  }

  // Aceita apenas dígitos com opcional separador decimal (. ou ,)
  if (!/^\d+([.,]\d+)?$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = parseFloat(limpo.replace(",", "."));
  if (isNaN(numero) || numero < 0 || numero > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

// Validação estrita para faltas digitadas pelo aluno na edição (inteiro >= 0, não vazio)
function validarFaltaDigitada(texto) {
  const limpo = texto.trim();
  if (limpo === "" || !/^\d+$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = parseInt(limpo, 10);
  if (isNaN(numero) || numero < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

// Helper para formatar número na tela com vírgula
function formatarNumeroTela(valor) {
  if (valor === null || valor === undefined) {
    return "—";
  }
  return Number(valor).toFixed(1).replace(".", ",");
}

// Helper para exibir mensagem de status
function exibirStatus(elementoId, texto, tipo) {
  const el = document.getElementById(elementoId);
  el.textContent = texto;
  el.classList.remove("mensagem-erro", "mensagem-sucesso");
  if (tipo === "erro") {
    el.classList.add("mensagem-erro");
  } else if (tipo === "sucesso") {
    el.classList.add("mensagem-sucesso");
  }
}

// Função para renderizar a tabela e atualizar os cards de resumo
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasValidas = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach((item, index) => {
    // Normaliza as notas de cada trimestre
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Garante array de faltas com 3 posições
    const faltasArr = Array.isArray(item.faltas) ? item.faltas :;
    const f1 = Number(faltasArr[0]) || 0;
    const f2 = Number(faltasArr[1]) || 0;
    const f3 = Number(faltasArr[2]) || 0;

    // Calcula a média ignorando trimestres sem nota
    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
    let mediaFormatada = "—";
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const somaNotas = notasValidas.reduce((acc, curr) => acc + curr, 0);
      const media = somaNotas / notasValidas.length;
      mediaFormatada = media.toFixed(1).replace(".", ",");

      somaMediasValidas += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        qtdAtencao++;
      }
    }

    // Soma total de faltas da disciplina
    const totalFaltasDisciplina = f1 + f2 + f3;
    totalFaltasGeral += totalFaltasDisciplina;

    // Cria a linha da tabela HTML via DOM com segurança
    const tr = document.createElement("tr");

    // Coluna Disciplina (segura com textContent)
    const tdDisciplina = document.createElement("td");
    tdDisciplina.textContent = item.disciplina;
    tr.appendChild(tdDisciplina);

    // Colunas 1º, 2º e 3º Trimestre
    const notasTri = [n1, n2, n3];
    notasTri.forEach((nota, triIdx) => {
      const tdNota = document.createElement("td");
      if (modoEdicao) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-edicao";
        input.dataset.index = index;
        input.dataset.campo = `tri${triIdx + 1}`;
        input.value = nota !== null ? String(nota).replace(".", ",") : "";
        input.addEventListener("input", () => input.classList.remove("invalido"));
        tdNota.appendChild(input);
      } else {
        tdNota.textContent = formatarNumeroTela(nota);
      }
      tr.appendChild(tdNota);
    });

    // Coluna Média
    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = mediaFormatada;
    tdMedia.appendChild(strongMedia);
    tr.appendChild(tdMedia);

    // Coluna Faltas
    const tdFaltas = document.createElement("td");
    if (modoEdicao) {
      const divFaltas = document.createElement("div");
      divFaltas.className = "grupo-faltas";

      [f1, f2, f3].forEach((faltaVal, fIdx) => {
        const inputF = document.createElement("input");
        inputF.type = "text";
        inputF.className = "input-edicao";
        inputF.title = `Faltas ${fIdx + 1}º Tri`;
        inputF.dataset.index = index;
        inputF.dataset.faltaTri = fIdx;
        inputF.value = String(faltaVal);
        inputF.addEventListener("input", () => inputF.classList.remove("invalido"));
        divFaltas.appendChild(inputF);
      });

      tdFaltas.appendChild(divFaltas);
    } else {
      tdFaltas.textContent = totalFaltasDisciplina;
    }
    tr.appendChild(tdFaltas);

    // Coluna Situação
    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao;
    tdSituacao.textContent = situacao;
    tr.appendChild(tdSituacao);

    corpoTabela.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo da página
  const mediaGeralGlobal = qtdDisciplinasComMedia > 0
    ? (somaMediasValidas / qtdDisciplinasComMedia).toFixed(1).replace(".", ",")
    : "—";

  document.getElementById("card-media-geral").textContent = mediaGeralGlobal;
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
  document.getElementById("card-frequencia").textContent = FREQUENCIA_DEMONSTRATIVA;
}

// Autenticação e carregamento inicial pela API
async function abrirBoletim() {
  const inputPin = document.getElementById("input-pin");
  const btnEntrar = document.getElementById("btn-entrar");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    exibirStatus("mensagem-login", "Digite seu PIN para entrar.", "erro");
    return;
  }

  btnEntrar.disabled = true;
  exibirStatus("mensagem-login", "Conectando...", "info");

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      exibirStatus("mensagem-login", "Turma, chamada ou PIN inválidos.", "erro");
      btnEntrar.disabled = false;
      return;
    }

    if (resposta.status === 429) {
      exibirStatus("mensagem-login", "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
      btnEntrar.disabled = false;
      return;
    }

    if (!resposta.ok) {
