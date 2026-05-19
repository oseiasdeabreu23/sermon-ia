// Bible verse database (cached/static data)
// In production, integrate with real Bible API: https://scripture.api.bible/

const VERSICULOS_CACHE: { [key: string]: string } = {
  'Mateus:5:1': 'Vendo Jesus a multidão, subiu ao monte; e, tendo-se sentado, achegaram-se a ele os seus discípulos; E ele, abrindo a boca, os ensinava, dizendo: Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.',
  'Mateus:5:3': 'Bem-aventurados os pobres de espírito, porque deles é o reino dos céus.',
  'Mateus:5:4': 'Bem-aventurados os que choram, porque serão consolados.',
  'Mateus:5:5': 'Bem-aventurados os mansos, porque herdarão a terra.',
  'Mateus:5:6': 'Bem-aventurados os que têm fome e sede de justiça, porque serão fartos.',
  'Mateus:5:7': 'Bem-aventurados os misericordiosos, porque alcançarão misericórdia.',
  'Mateus:5:8': 'Bem-aventurados os limpos de coração, porque verão a Deus.',
  'Mateus:5:9': 'Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.',
  'Mateus:5:10': 'Bem-aventurados os que padecem perseguição por causa da justiça, porque deles é o reino dos céus.',
  'Gênesis:1:1': 'No princípio criou Deus os céus e a terra.',
  'Gênesis:1:27': 'E criou Deus o homem à sua imagem: à imagem de Deus o criou: homem e mulher os criou.',
  'João:1:1': 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
  'João:3:16': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  'Romanos:3:23': 'Porque todos pecaram e carecem da glória de Deus.',
  'Romanos:6:23': 'Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna em Cristo Jesus nosso Senhor.',
  'Salmos:23:1': 'O Senhor é o meu pastor, nada me faltará.',
  'Salmos:91:1': 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.',
  'Filipenses:4:8': 'Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude e se há algum louvor, nisso pensai.',
  'Provérbios:3:5': 'Confia no Senhor de todo o teu coração, e não te estribes na tua prudência.',
  'Isaías:40:31': 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como a das águias; correrão, e não se cansarão; caminharão, e não se fatigarão.',
};

export async function obterVersiculo(
  livro: string,
  capitulo: number,
  versiculo: number
): Promise<string> {
  const chave = `${livro}:${capitulo}:${versiculo}`;

  // Check cache first
  if (VERSICULOS_CACHE[chave]) {
    return VERSICULOS_CACHE[chave];
  }

  // TODO: Integrate with real Bible API when needed
  // Example using scripture.api.bible:
  // const response = await fetch(
  //   `https://api.scripture.api.bible/v1/bibles/{bibleId}/verses/{osisId}?content-type=text&include-notes=false`,
  //   {
  //     headers: { 'api-key': process.env.BIBLE_API_KEY },
  //   }
  // );
  // const data = await response.json();
  // return data.data.content;

  // For now, return a generic placeholder
  return `${livro} ${capitulo}:${versiculo} - Versículo não encontrado no cache. Integre com uma Bible API real.`;
}

export async function obterVersiculosIntervalo(
  livro: string,
  capitulo: number,
  inicio: number,
  fim: number
): Promise<string> {
  const versiculos: string[] = [];

  for (let i = inicio; i <= fim; i++) {
    const verso = await obterVersiculo(livro, capitulo, i);
    versiculos.push(`${i}. ${verso}`);
  }

  return versiculos.join('\n\n');
}
