const UNIDADES = [
  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis",
  "dezessete", "dezoito", "dezenove",
];
const DEZENAS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta",
  "oitenta", "noventa",
];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function trioPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) {
    if (resto < 20) {
      partes.push(UNIDADES[resto]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  const bilhoes = Math.floor(n / 1_000_000_000);
  const milhoes = Math.floor((n % 1_000_000_000) / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const centenas = n % 1000;

  const partes: string[] = [];
  if (bilhoes > 0)
    partes.push(
      `${trioPorExtenso(bilhoes)} ${bilhoes === 1 ? "bilhão" : "bilhões"}`
    );
  if (milhoes > 0)
    partes.push(
      `${trioPorExtenso(milhoes)} ${milhoes === 1 ? "milhão" : "milhões"}`
    );
  if (milhares > 0)
    partes.push(milhares === 1 ? "mil" : `${trioPorExtenso(milhares)} mil`);
  if (centenas > 0) partes.push(trioPorExtenso(centenas));

  if (partes.length === 1) return partes[0];
  const ultima = partes.pop()!;
  // "e" antes do último grupo quando ele é < 100 ou múltiplo de 100
  const ultimoValor = centenas;
  const usaE =
    ultimoValor > 0 && (ultimoValor < 100 || ultimoValor % 100 === 0);
  return usaE ? `${partes.join(", ")} e ${ultima}` : `${partes.join(", ")} ${ultima}`;
}

/** Converte um valor em reais para extenso: 5700 → "Cinco mil e setecentos reais" */
export function valorPorExtenso(valor: number): string {
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  const partes: string[] = [];
  if (inteiro > 0) {
    partes.push(
      `${inteiroPorExtenso(inteiro)} ${inteiro === 1 ? "real" : "reais"}`
    );
  }
  if (centavos > 0) {
    partes.push(
      `${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`
    );
  }
  if (partes.length === 0) return "Zero reais";

  const texto = partes.join(" e ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Formata número como moeda brasileira: 5700 → "R$ 5.700,00" */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Data por extenso: "2026-03-21" → "21 de março de 2026" */
export function dataPorExtenso(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
