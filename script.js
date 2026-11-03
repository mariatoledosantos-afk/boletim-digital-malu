// Dados fictícios padronizados do 9º Ano
const dadosBoletim = [
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

// Frequência fictícia/demonstrativa para esta etapa (será calculada dinamicamente no futuro)
const FREQUENCIA_DEMONSTRATIVA = "92%";

// Função para normalizar qualquer formato de nota para a escala de 0 a 10
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

// Função para renderizar a tabela e atualizar os cards de resumo
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasValidas = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach((item) => {
    // Normaliza as notas de cada trimestre
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

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
    const totalFaltasDisciplina = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Formatação visual para a tabela
    const displayN1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
    const displayN2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
    const displayN3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";

    // Cria a linha da tabela HTML via DOM
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.disciplina}</td>
      <td>${displayN1}</td>
      <td>${displayN2}</td>
      <td>${displayN3}</td>
      <td><strong>${mediaFormatada}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;

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

// Executa a função principal assim que a página carregar
document.addEventListener("DOMContentLoaded", renderizarBoletim);