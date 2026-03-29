const RULES = `
Skitgubbe är ett klassiskt svenskt kortspel för 2–6 spelare. Målet är att bli av med alla sina kort. Den som sitter kvar med kort förlorar och kallas "Skitgubbe".

Spelas med en standardlek med 52 kort (utan jokrar).

KORTENS RANGORDNING (lägst till högst):
3 → 4 → 5 → 6 → 7 → 8 → 9 → J → Q → K → A → 2 → 10
10 är högst, 2 är näst högst. Båda är specialkort.

FÖRBEREDELSER:
- Blanda kortleken.
- Dela ut 3 handkort till varje spelare (hålls dolda).
- Lägg ut 3 öppna bordskort med framsidan upp framför varje spelare.
- Lägg 3 dolda bordskort med baksidan ned under de öppna.
- Resterande kort läggs i en dragstapel mitt på bordet.

FÖRBEREDELSERUNDAN:
Innan spelet börjar får varje spelare fritt flytta kort tills alla är nöjda.
- Flytta fritt kort mellan hand och egna öppna bordskort.
- Lägg ett handkort på valfri motståndares öppna bordskort – de får då fler kort på samma plats. Du drar ett nytt kort från stapeln, men max 3 på handen.
- Motståndaren får fritt hantera sina öppna bordskort.
- Man kan ha fler än 3 kort på handen om de extra kommer från egna öppna bordskort – men aldrig från dragstapeln.
- Den spelare med lägsta kortet på hand börjar. Lika valör? Jämför näst lägsta.

SPELGÅNG:
Spelarna turas om medsols. På sin tur väljer man ett av tre alternativ:
1. Lägg kort: Lägg ett eller flera kort av samma valör, lika högt eller högre än det senast spelade.
2. Ta hela högen: Om du inte kan eller vill lägga tar du upp hela högen till din hand. Nästa spelare får lägga vad den vill.
3. Chansa (en gång per tur): Vänd upp översta kortet från dragstapeln. Är det tillräckligt högt? Lägg det och fortsätt. Är det för lågt? Ta hela högen inklusive det chansade – även om du hade handkort som gått att lägga. Chansning är bara möjligt medan dragstapeln finns kvar.

KORTENS ORDNING UNDER SPELET:
1. Handkort – håll alltid minst 3 på handen (dra efter varje spelat kort medan stapeln finns).
2. Öppna bordskort – spelas när handkorten är slut. Flera av samma valör får läggas samtidigt.
3. Dolda bordskort – vänd upp ett i taget utan att titta. För lågt? Ta upp det plus hela högen.

SPECIALKORT:
- 2 (Tvåan): Kan spelas på vad som helst. Återställer högen – nästa spelare får lägga vad den vill.
- 10 (Tian): Kan spelas på vad som helst. Tar bort hela högen ur spel för alltid. Spelaren spelar igen!
- Fyra lika: Fyra kort av samma valör överst på högen → högen försvinner ur spel. Spelaren som lade sista kortet spelar igen! Gäller även om korten lagts av olika spelare i följd.

VINNA & FÖRLORA:
En spelare är klar när hen spelat alla handkort, öppna bordskort och dolda bordskort. Spelet fortsätter tills bara en spelare är kvar – den är Skitgubbe.
I omgångsspel brukar Skitgubbe dela ut korten nästa runda.

FÖRBJUDNA SISTA DRAG:
Man får inte avsluta med A, 10, 2 eller fyra lika som sitt sista drag (gäller handkort och dolda bordskort).
Måste då ta upp hela högen och fortsätta spela. Om högen är tom: stå över sin tur.

VANLIGA REGELTVISTER:
- Kan man lägga ett 2 på ett 10? Ja. Specialkort (2 och 10) kan alltid spelas oavsett vad som ligger överst.
- Om jag lägger ett 10 och högen försvinner – vad spelar jag sedan? Du spelar vad du vill, eftersom högen är tom.
- Räknas fyra lika om de läggs av olika spelare i följd? Ja, om de fyra sista korten på högen är av samma valör oavsett vem som lade dem.
- Vad händer om dragstapeln tar slut? Spelet fortsätter men du drar inga fler kort. Chansning är inte längre möjligt.
- Måste man lägga om man kan? Nej, du kan alltid välja att ta högen istället.
- Kan man lägga flera kort av olika valör på en gång? Nej, bara flera kort av samma valör.
- Kan man chansa när man har kort på handen som går att lägga? Ja, men misslyckas du måste du ta hela högen.
`;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const question = body.question?.trim();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Ingen fråga angiven.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `Du är en hjälpsam regelexpert för kortspelet Skitgubbe. Svara kortfattat och tydligt på svenska. Basera alltid dina svar enbart på dessa regler:\n\n${RULES}`,
        },
        { role: 'user', content: question },
      ],
      max_tokens: 400,
    });

    return new Response(JSON.stringify({ answer: response.response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Något gick fel. Försök igen.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
