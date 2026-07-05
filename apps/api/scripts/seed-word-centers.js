const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

const CENTERS = [
  ['Województwo dolnośląskie', 'WORD Legnica', 'Legnica', 'ul. Bydgoska 30c', 'http://www.word-legnica.pl'],
  ['Województwo dolnośląskie', 'WORD Legnica OT Lubin', 'Lubin', 'ul. Szpakowa 1', 'http://www.word-legnica.pl'],
  ['Województwo dolnośląskie', 'WORD Jelenia Góra', 'Jelenia Góra', 'ul. Rataja 9', 'http://www.wordjg.pl'],
  ['Województwo dolnośląskie', 'WORD Wrocław', 'Wrocław', 'ul. Łagiewnicka 12', 'http://www.word.wroc.pl'],
  ['Województwo dolnośląskie', 'WORD Wałbrzych', 'Wałbrzych', 'ul. Piotra Wysockiego 28', 'http://www.word.walbrzych.pl'],
  ['Województwo dolnośląskie', 'WORD Wałbrzych OT Kłodzko', 'Kłodzko', 'ul. Warty 19', 'http://www.word.walbrzych.pl'],
  ['Województwo dolnośląskie', 'WORD Wałbrzych OT Świdnica', 'Świdnica', 'ul. Głowackiego 1', 'http://www.word.walbrzych.pl'],
  ['Województwo dolnośląskie', 'WORD Jelenia Góra OT Bolesławiec', 'Bolesławiec', 'ul. Lubańska 71a', 'http://www.wordjg.pl'],
  ['Województwo dolnośląskie', 'WORD Jelenia Góra OT Głogów', 'Głogów', 'ul. Folwarczna 52b', 'http://www.wordjg.pl'],
  ['Województwo dolnośląskie', 'WORD Wrocław OT Oleśnica', 'Oleśnica', 'ul. Wrocławska 30', 'http://www.word.wroc.pl'],
  ['Województwo dolnośląskie', 'WORD Wrocław OT Oława', 'Oława', 'ul. Różana 8', 'http://www.word.wroc.pl'],

  ['Województwo kujawsko-pomorskie', 'WORD OT Grudziądz', 'Grudziądz', 'ul. Waryńskiego 4', 'http://www.word.torun.pl'],
  ['Województwo kujawsko-pomorskie', 'WORD Bydgoszcz', 'Bydgoszcz', 'ul. Stefana Kardynała Wyszyńskiego 54', 'http://www.word.bydgoszcz.pl'],
  ['Województwo kujawsko-pomorskie', 'WORD Bydgoszcz OT Innowrocław', 'Innowrocław', 'ul. Orłowska 48', 'http://www.word.bydgoszcz.pl/oddzial-inowroclaw/'],
  ['Województwo kujawsko-pomorskie', 'WORD Toruń', 'Toruń', 'ul. Polna 109/111', 'http://www.word.torun.pl'],
  ['Województwo kujawsko-pomorskie', 'WORD Włocławek', 'Włocławek', 'ul. Zielna 2/4', 'http://www.word.wloclawek.pl'],

  ['Województwo lubelskie', 'WORD Zamość', 'Zamość', 'ul. Droga Męczenników Rotundy 2', 'http://www.word.zamosc.pl'],
  ['Województwo lubelskie', 'WORD Biała Podlaska', 'Biała Podlaska', 'ul. Orzechowa 60', 'http://www.wordbp.pl'],
  ['Województwo lubelskie', 'WORD Lublin', 'Lublin', 'ul. Hutnicza 3', 'http://www.word.lublin.pl'],
  ['Województwo lubelskie', 'WORD Chełm', 'Chełm', 'ul. Bieławin 2a', 'http://www.word.chelm.pl'],
  ['Województwo lubelskie', 'WORD Biała Podlaska OT Łuków', 'Łuków', 'ul. Piłsudskiego 29', 'http://www.wordbp.pl'],
  ['Województwo lubelskie', 'WORD Lublin OT Puławy', 'Puławy', 'ul. Składowa 6a', 'http://word.lublin.pl'],

  ['Województwo lubuskie', 'WORD Gorzów Wlkp.', 'Gorzów Wielkopolski', 'ul. Podmiejska 18', 'http://www.wordgorzow.pl'],
  ['Województwo lubuskie', 'WORD Zielona Góra', 'Zielona Góra', 'ul. Nowa 4b', 'http://www.zgora.wordy.pl'],

  ['Województwo łódzkie', 'WORD Łódź', 'Łódź', 'ul. Smutna 28', 'http://www.word.lodz.pl'],
  ['Województwo łódzkie', 'WORD Sieradz', 'Sieradz', 'ul. 3 Maja 7', 'http://www.wordsieradz.pl'],
  ['Województwo łódzkie', 'WORD Skierniewice', 'Skierniewice', 'ul. Stanisława Kaczyńskiego 7', 'http://www.word-skierniewice.pl'],
  ['Województwo łódzkie', 'WORD Piotrków Trybunalski', 'Piotrków Trybunalski', 'ul. Gliniana 17', 'http://www.word-piotrkow.pl'],

  ['Województwo małopolskie', 'MORD Kraków', 'Kraków', 'ul. Nowohucka 33a', 'http://www.mord.krakow.pl'],
  ['Województwo małopolskie', 'MORD Kraków OT Kraków', 'Kraków', 'ul. Balicka 127', 'http://www.mord.krakow.pl'],
  ['Województwo małopolskie', 'MORD Kraków OT Oświęcim', 'Oświęcim', 'ul. Stanisławy Leszczyńskiej 7', 'http://www.mord.krakow.pl'],
  ['Województwo małopolskie', 'MORD Tarnów', 'Tarnów', 'ul. Okrężna 2f', 'http://www.mord.tarnow.pl'],
  ['Województwo małopolskie', 'MORD Nowy Sącz', 'Nowy Sącz', 'ul. 29 Listopada 10', 'http://www.mord.pl'],
  ['Województwo małopolskie', 'MORD Nowy Sącz OT Nowy Targ', 'Nowy Targ', 'ul. Wojska Polskiego 9', 'http://www.mord.pl'],

  ['Województwo mazowieckie', 'WORD Radom', 'Radom', 'ul. Sucha 13', 'http://www.word.radom.pl'],
  ['Województwo mazowieckie', 'WORD Ostrołęka', 'Ostrołęka', 'ul. Rolna 30', 'http://www.word-ostroleka.pl'],
  ['Województwo mazowieckie', 'WORD Ciechanów', 'Ciechanów', 'ul. Mleczarska 27', 'http://www.word.ciechanow.pl'],
  ['Województwo mazowieckie', 'WORD Płock', 'Płock', 'ul. Otolińska 25', 'http://www.wordplock.pl'],
  ['Województwo mazowieckie', 'WORD Warszawa', 'Warszawa', 'ul. Odlewnicza 8', 'http://www.word.waw.pl'],
  ['Województwo mazowieckie', 'WORD Warszawa', 'Warszawa', 'ul. Powstańców Śląskich 127', 'http://www.word.waw.pl'],
  ['Województwo mazowieckie', 'WORD Warszawa', 'Warszawa', 'ul. Radarowa 1', 'http://www.word.waw.pl'],
  ['Województwo mazowieckie', 'WORD Siedlce', 'Siedlce', 'ul. Składowa 46', 'http://www.word.siedlce.pl'],
  ['Województwo mazowieckie', 'WORD Płock OT Sochaczew', 'Sochaczew', 'ul. Żeromskiego 12', 'http://www.wordplock.pl'],
  ['Województwo mazowieckie', 'WORD Radom OT Zwoleń', 'Zwoleń', 'ul. Wojska Polskiego 78', 'http://www.word.radom.pl'],
  ['Województwo mazowieckie', 'WORD Radom OT Kozienice', 'Kozienice', 'ul. Warszawska 25', 'http://www.word.radom.pl'],
  ['Województwo mazowieckie', 'WORD Siedlce OT Garwolin', 'Garwolin', 'ul. Aleja Legionów 48', 'http://www.word.siedlce.pl'],
  ['Województwo mazowieckie', 'WORD Ciechanów OT Mława', 'Mława', 'ul. Kopernika 38', 'http://www.word.ciechanow.pl'],
  ['Województwo mazowieckie', 'WORD Warszawa OT Grójec', 'Grójec', 'ul. Sportowa 16', 'http://www.word.waw.pl'],

  ['Województwo opolskie', 'WORD Opole', 'Opole', 'ul. Oleska 127', 'http://www.word.opole.pl'],

  ['Województwo podkarpackie', 'WORD Tarnobrzeg', 'Tarnobrzeg', 'ul. Sikorskiego 86a', 'http://www.word.tarnobrzeg.pl'],
  ['Województwo podkarpackie', 'WORD Rzeszów', 'Rzeszów', 'al. Wyzwolenia 4', 'http://www.word.rzeszow.pl'],
  ['Województwo podkarpackie', 'WORD Przemyśl', 'Przemyśl', 'ul. Topolowa 7', 'http://www.wordprzemysl.pl'],
  ['Województwo podkarpackie', 'WORD Krosno', 'Krosno', 'ul. Tysiąclecia 7', 'http://www.wordkrosno.pl'],

  ['Województwo podlaskie', 'WORD Suwałki', 'Suwałki', 'ul. Waryńskiego 24', 'http://www.word.suwalki.pl'],
  ['Województwo podlaskie', 'WORD Łomża', 'Łomża', 'ul. Zjazd 21', 'http://www.word.4lomza.pl'],
  ['Województwo podlaskie', 'WORD Białystok', 'Białystok', 'ul. Wiewiórcza 64', 'http://www.word.bialystok.pl'],

  ['Województwo pomorskie', 'WORD Słupsk', 'Słupsk', 'ul. Mierosławskiego 10', 'http://www.word.slupsk.pl'],
  ['Województwo pomorskie', 'PORD Gdańsk', 'Gdańsk', 'ul. Równa 19/21', 'http://www.pord.pl'],
  ['Województwo pomorskie', 'PORD Gdańsk OT Gdynia', 'Gdynia', 'ul. Opata Hackiego 10A', 'http://www.pord.pl'],

  ['Województwo śląskie', 'WORD Częstochowa', 'Częstochowa', 'ul. Hallera 1', 'http://www.word.czest.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Katowice', 'ul. Francuska 78', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Bytom', 'ul. Strzelców Bytomskich 98', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Dąbrowa Górnicza', 'ul. Tysiąclecia 56', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Rybnik', 'ul. Ekonomiczna 21', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Jastrzębie Zdrój', 'ul. Armii Krajowej 31', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD Katowice', 'Tychy', 'ul. Jana Pawła II 3', 'http://www.word.katowice.pl'],
  ['Województwo śląskie', 'WORD w Bielsku-Białej', 'Bielsko-Biała', 'al. Armii Krajowej 220a', 'http://www.word.bielsko.pl'],

  ['Województwo świętokrzyskie', 'WORD Kielce', 'Kielce', 'ul. Domaszowska 141b', 'http://www.word.kielce.pl'],
  ['Województwo świętokrzyskie', 'WORD Kielce OT Ostrowiec Świętokrzyski', 'Ostrowiec Świętokrzyski', 'ul. Świętokrzyska 22', 'http://www.word.kielce.pl'],

  ['Województwo warmińsko-mazurskie', 'WORD Elbląg', 'Elbląg', 'ul. Skrzydlata 1', 'http://www.word.elblag.pl'],
  ['Województwo warmińsko-mazurskie', 'WORD-RCBRD Olsztyn', 'Olsztyn', 'ul. Towarowa 17', 'http://www.word.olsztyn.pl'],

  ['Województwo wielkopolskie', 'WORD Piła', 'Piła', 'ul. Lotnicza 6', 'http://www.word.pila.pl'],
  ['Województwo wielkopolskie', 'WORD Poznań', 'Poznań', 'ul. Wilczak 53', 'http://www.word.poznan.pl'],
  ['Województwo wielkopolskie', 'WORD Konin', 'Konin', 'ul. Zakładowa 4b', 'http://www.word.konin.pl'],
  ['Województwo wielkopolskie', 'WORD Leszno', 'Leszno', 'ul. Opalińskich 1A', 'http://www.word.leszno.pl'],
  ['Województwo wielkopolskie', 'WORD Kalisz', 'Kalisz', 'ul. Braci Niemojowskich 3-5', 'http://www.word.kalisz.pl'],

  ['Województwo zachodniopomorskie', 'WORD Szczecin', 'Szczecin', 'ul. Maksymiliana Golisza 10b', 'http://www.word.szczecin.pl'],
  ['Województwo zachodniopomorskie', 'ZORD Koszalin', 'Koszalin', 'ul. Mieszka I 39', 'http://www.zord.pl'],
];

async function main() {
  const existing = await p.wordCenter.count();
  if (existing > 0) {
    console.log(`word_centers jadvalida allaqachon ${existing} ta yozuv bor. Avval tozalanadi.`);
    await p.wordCenter.deleteMany({});
  }

  let order = 0;
  for (const [voivodeship, name, city, address, website] of CENTERS) {
    await p.wordCenter.create({
      data: { voivodeship, name, city, address, website, order: order++ },
    });
  }

  console.log(`${CENTERS.length} ta WORD markazi yuklandi.`);
  const total = await p.wordCenter.count();
  console.log(`Jami bazada: ${total} ta yozuv.`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
