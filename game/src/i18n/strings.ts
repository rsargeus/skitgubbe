/**
 * Every user-facing string, in one place.
 *
 * The English follows the vocabulary the rules page already uses, so a visitor
 * moving between the rules and the game meets the same words: Gamble, the pile,
 * draw pile, and Skitgubbe left untranslated.
 */

export type Language = 'sv' | 'en';

export const LANGUAGES: Language[] = ['sv', 'en'];

const sv = {
  'app.title': 'Skitgubbe',
  'app.tagline': 'Bli av med dina kort – eller bli Skitgubbe 💩',

  'start.heading': 'Nytt parti',
  'start.opponents': 'Motståndare',
  'start.difficulty': 'Svårighetsgrad',
  'start.play': 'Spela',
  'start.resume': 'Fortsätt pågående parti',
  'start.rules': 'Läs reglerna',
  'start.bots.one': '1 bot',
  'start.bots.many': '{n} bottar',

  'level.1': 'Nybörjare',
  'level.2': 'Van',
  'level.3': 'Räknare',
  'level.4': 'Taktiker',
  'level.5': 'Hajen',
  'level.1.desc': 'Spelar rätt, men slarvar ibland.',
  'level.2.desc': 'Felfri. Sparar tvåor och tior till nödläge.',
  'level.3.desc': 'Minns korten som visats och bedömer risken att chansa.',
  'level.4.desc': 'Räknar odds och bygger mot fyra lika.',
  'level.5.desc': 'Räknar allt. Planerar slutspelet.',

  'zone.hand': 'Din hand',
  'zone.öppna': 'Öppna bordskort',
  'zone.dolda': 'Dolda bordskort',
  'zone.högen': 'Högen',
  'zone.dragstapeln': 'Dragstapeln',
  'zone.empty': 'Tom',

  'action.play': 'Lägg {n} kort',
  'action.playOne': 'Lägg kortet',
  'action.turn': 'Vänd kortet',
  'action.takeHögen': 'Ta högen',
  'action.chansa': 'Chansa',
  'action.ståÖver': 'Stå över',
  'action.skip': 'Hoppa över animationer',
  'action.unskip': 'Visa animationer',

  'hint.selectSameRank': 'Bara kort av samma valör kan läggas ihop.',
  'hint.tapHögen': 'Tryck på högen för att lägga.',
  'hint.noDragstapel': 'Chansa går inte – dragstapeln är slut.',
  'hint.alreadyChansat': 'Du har redan chansat den här turen.',
  'hint.chansaHandOnly': 'Chansa går bara medan du har kort på handen.',
  'hint.yourTurn': 'Din tur.',
  'hint.waiting': 'Väntar på {name}…',
  'hint.mustTake': 'Inget går att lägga. Ta högen.',
  'hint.dolda': 'Välj ett dolt bordskort och vänd det. Du ser det inte först.',

  'event.played': '{name} la {cards}',
  'event.tookHögen': '{name} tog högen ({n} kort)',
  'event.chansaWin': '{name} chansade och fick {card} – gick vägen',
  'event.chansaFail': '{name} chansade, fick {card} – för lågt, tog högen',
  'event.turnWin': '{name} vände {card} – gick vägen',
  'event.turnFail': '{name} vände {card} – för lågt, tog högen',
  'event.burnTia': '{name} la en tia – högen försvinner, spelar igen',
  'event.burnFyraLika': 'Fyra lika! Högen försvinner – {name} spelar igen',
  'event.stoodOver': '{name} stod över',
  'event.finished': '{name} är klar',

  'end.heading': 'Partiet är slut',
  'end.skitgubbe': '{name} är Skitgubbe 💩',
  'end.youAreSkitgubbe': 'Du är Skitgubbe 💩',
  'end.youWon': 'Du blev klar först!',
  'end.place': '{place}. {name}',
  'end.again': 'Spela igen',
  'end.newSettings': 'Ändra inställningar',

  'player.you': 'Du',
  'player.bot': 'Bot {n}',
} as const;

type Key = keyof typeof sv;

const en: Record<Key, string> = {
  'app.title': 'Skitgubbe',
  'app.tagline': 'Get rid of your cards – or become the Skitgubbe 💩',

  'start.heading': 'New game',
  'start.opponents': 'Opponents',
  'start.difficulty': 'Difficulty',
  'start.play': 'Play',
  'start.resume': 'Resume game in progress',
  'start.rules': 'Read the rules',
  'start.bots.one': '1 bot',
  'start.bots.many': '{n} bots',

  'level.1': 'Beginner',
  'level.2': 'Steady',
  'level.3': 'Counter',
  'level.4': 'Tactician',
  'level.5': 'Shark',
  'level.1.desc': 'Plays by the rules, but slips up now and then.',
  'level.2.desc': 'Makes no mistakes. Saves twos and tens for emergencies.',
  'level.3.desc': 'Remembers the cards shown and weighs the risk of a gamble.',
  'level.4.desc': 'Works out the odds and builds towards four of a kind.',
  'level.5.desc': 'Counts everything. Plans the endgame.',

  'zone.hand': 'Your hand',
  'zone.öppna': 'Face-up cards',
  'zone.dolda': 'Face-down cards',
  'zone.högen': 'The pile',
  'zone.dragstapeln': 'Draw pile',
  'zone.empty': 'Empty',

  'action.play': 'Play {n} cards',
  'action.playOne': 'Play the card',
  'action.turn': 'Turn the card',
  'action.takeHögen': 'Take the pile',
  'action.chansa': 'Gamble',
  'action.ståÖver': 'Stand over',
  'action.skip': 'Skip animations',
  'action.unskip': 'Show animations',

  'hint.selectSameRank': 'Only cards of the same rank can be played together.',
  'hint.tapHögen': 'Tap the pile to play.',
  'hint.noDragstapel': 'You cannot gamble – the draw pile is empty.',
  'hint.alreadyChansat': 'You have already gambled this turn.',
  'hint.chansaHandOnly': 'You can only gamble while you have cards in hand.',
  'hint.yourTurn': 'Your turn.',
  'hint.waiting': 'Waiting for {name}…',
  'hint.mustTake': 'Nothing can be played. Take the pile.',
  'hint.dolda': 'Pick a face-down card and turn it. You do not get to look first.',

  'event.played': '{name} played {cards}',
  'event.tookHögen': '{name} took the pile ({n} cards)',
  'event.chansaWin': '{name} gambled and got {card} – high enough',
  'event.chansaFail': '{name} gambled, got {card} – too low, took the pile',
  'event.turnWin': '{name} turned {card} – high enough',
  'event.turnFail': '{name} turned {card} – too low, took the pile',
  'event.burnTia': '{name} played a ten – the pile is gone, plays again',
  'event.burnFyraLika': 'Four of a kind! The pile is gone – {name} plays again',
  'event.stoodOver': '{name} stood over',
  'event.finished': '{name} is out',

  'end.heading': 'Game over',
  'end.skitgubbe': '{name} is the Skitgubbe 💩',
  'end.youAreSkitgubbe': 'You are the Skitgubbe 💩',
  'end.youWon': 'You went out first!',
  'end.place': '{place}. {name}',
  'end.again': 'Play again',
  'end.newSettings': 'Change settings',

  'player.you': 'You',
  'player.bot': 'Bot {n}',
};

const TABLES: Record<Language, Record<Key, string>> = { sv, en };

export type Translate = (key: Key, params?: Record<string, string | number>) => string;

export function translator(language: Language): Translate {
  const table = TABLES[language];
  return (key, params) => {
    let text: string = table[key];
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

export type StringKey = Key;
