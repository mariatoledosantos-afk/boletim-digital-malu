const dadosBrutos = [
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

/* 
  Conceito: 
  - Variável: um espaço na memória para guardar dados (como const e let).
  - Objeto: estrutura que guarda informações agrupadas (como os dados de uma disciplina).
  - Array: uma lista que guarda vários itens (como a lista de disciplinas ou de faltas).
  - Função: um bloco de código que executa uma tarefa específica quando é chamado.
*/

// Função para normalizar notas para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string com vírgula, troca por ponto para converter em número
  let numero = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : Number(valor);

  if (isNaN(numero)) {
    return null;
  }

  // Se estiver entre 10 e 100 (ex: 82, 100), divide por 10
  if (numero > 10 && numero <= 100) {
    numero = numero / 10;
  }

  // Valida se está na faixa correta de 0 a 10
  if (numero < 0 || numero > 10) {
    return null;
  }

  return numero;
}

// Função para formatar a nota para exibição (com vírgula e 1 casa decimal, ex: 8,5)
function formatarNotaExibicao(notaNormalizada) {
  if (notaNormalizada === null) {
    return "—";
  }
  return notaNormalizada.toFixed(1).replace(".", ",");
}

// Processa os dados brutos aplicando a normalização e calculando médias e faltas
const disciplinasProcessadas = dadosBrutos.map(item => {
  const t1 = normalizarNota(item.tri1);
  const t2 = normalizarNota(item.tri2);
  const t3 = normalizarNota(item.tri3);

  // Filtra apenas as notas válidas para calcular a média
  const notasValidas = [t1, t2, t3].filter(n => n !== null);
  
  let media = null;
  if (notasValidas.length > 0) {
    const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
    media = soma / notasValidas.length;
  }

  // Soma das faltas dos 3 trimestres
  const totalFaltas = item.faltas.reduce((acc, curr) => acc + curr, 0);

  // Define a situação baseada na média (referência: 6,0)
  let situacao = "Nota ainda não disponível";
  let classeSituacao = "situacao-neutro";

  if (media !== null) {
    if (media >= 6.0) {
      situacao = "Bom desempenho";
      classeSituacao = "situacao-bom";
    } else {
      situacao = "Atenção";
      classeSituacao = "situacao-atencao";
    }
  }

  return {
    disciplina: item.disciplina,
    tri1: t1,
    tri2: t2,
    tri3: t3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao,
    classeSituacao: classeSituacao
  };
});

// Preenche a tabela no HTML usando forEach (passa por cada item da lista)
const tbody = document.getElementById("tabela-corpo");

disciplinasProcessadas.forEach(item => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.disciplina}</td>
    <td>${formatarNotaExibicao(item.tri1)}</td>
    <td>${formatarNotaExibicao(item.tri2)}</td>
    <td>${formatarNotaExibicao(item.tri3)}</td>
    <td>${formatarNotaExibicao(item.media)}</td>
    <td>${item.faltas}</td>
    <td class="${item.classeSituacao}">${item.situacao}</td>
  `;

  tbody.appendChild(tr);
});

// Cálculo e preenchimento dos Cards de Resumo
function atualizarResumo() {
  // Média Geral
  const mediasValidas = disciplinasProcessadas.map(d => d.media).filter(m => m !== null);
  const somaMedias = mediasValidas.reduce((acc, curr) => acc + curr, 0);
  const mediaGeral = mediasValidas.length > 0 ? (somaMedias / mediasValidas.length) : null;

  document.getElementById("card-media-geral").textContent = mediaGeral !== null ? mediaGeral.toFixed(1).replace(".", ",") : "—";

  // Total de Faltas
  const totalFaltasGeral = disciplinasProcessadas.reduce((acc, curr) => acc + curr.faltas, 0);
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;

  // Disciplinas com Bom Desempenho e Atenção
  const bomDesempenhoCount = disciplinasProcessadas.filter(d => d.situacao === "Bom desempenho").length;
  const atencaoCount = disciplinasProcessadas.filter(d => d.situacao === "Atenção").length;

  document.getElementById("card-bom-desempenho").textContent = bomDesempenhoCount;
  document.getElementById("card-atencao").textContent = atencaoCount;
}

// Executa a função de resumo ao carregar a página
atualizarResumo();

/*
  Nota sobre a Frequência:
  A frequência de 92% exibida nos cards é APENAS FICTÍCIA E DEMONSTRATIVA nesta versão inicial.
  Ela será calculada dinamicamente a partir de dados reais de presença em etapas futuras do projeto.
*/