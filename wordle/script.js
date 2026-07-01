// wordle/script.js — German Wordle (5 letters, 6 attempts, umlauts as 1 slot)
//
// Contract: every DOM id and every CSS class referenced below must match
// wordle.html and style.css. CSS feedback colors live in:
//   .cell-green / .cell-yellow / .cell-wrong
//   .cell.filled / .cell.reveal / .row.row-shake
//   .status / .status-win / .status-lose / .status-shake
//   .new-game-btn.pulse
//
// Algorithm: two-pass Wordle evaluation. Greens win over yellows; duplicate
// letters in the guess are bounded by the unmatched count of that letter in
// the answer. Trace: answer="apfel", guess="puppe"
//   -> [yellow, wrong, wrong, wrong, yellow]   (only one P can be yellow)
//
// Robustness: words.txt is fetched when available (HTTP server), but the
// game ALWAYS reaches 'playing' because the wordpool is also inlined below.
// The game therefore works via file:// too, without a static server.

const TARGET_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const REVEAL_STAGGER_MS = 70;
const REVEAL_ANIM_MS = 460;

const GAME = {
  answer: '',
  currentRow: 0,
  rows: [],
  status: 'loading', // 'loading' | 'playing' | 'revealing' | 'won' | 'lost'
  pool: []
};

// DOM contract — IDs must match wordle.html.
const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const counterEl = document.getElementById('attempt-counter');
const wordCounterEl = document.getElementById('word-counter');
const newGameBtn = document.getElementById('newGameBtn');
const inputRow = document.getElementById('inputRow');
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');

// Letters allowed in the playable alphabet. ß is its own slot, not "ss".
const VALID_LETTER_RE = /^[a-zäöüß]$/;

// Embedded fallback word pool — same shape as words.txt: one word per
// line, lowercase, already filtered to TARGET_LENGTH. The runtime pool
// size is 1492.
const EMBEDDED_WORDS_TEXT = "abend\nabgas\nabweg\nachse\nacker\nadern\nadler\naffen\nafter\nagent\nahnen\nahorn\nakten\naktie\nalarm\nalben\nalbum\nalgen\nalibi\nallee\nalles\naltar\nalter\nampel\namsel\nanbau\nangel\nangst\nanker\nanmut\nanruf\nantik\napfel\napril\narche\narena\narmee\narmut\naroma\nasche\nassel\naster\natlas\natmen\naudio\naugee\nauges\nautoe\nautor\nautos\nbache\nbacke\nbackt\nbaden\nbader\nbahre\nbande\nbange\nbanke\nbarde\nbaren\nbarge\nbasis\nbauch\nbauen\nbauer\nbaume\nbaums\nbeben\nbeere\nbesen\nbeten\nbeule\nbeute\nbiber\nbiene\nbilde\nbilds\nbinde\nbirke\nbirne\nbitte\nbiwak\nblase\nblatt\nblaue\nblech\nblick\nblind\nblitz\nblock\nblond\nblüte\nboden\nbogen\nbohne\nboote\nborte\nboten\nbraun\nbraut\nbrief\nbrise\nbrote\nbruch\nbrust\nbuben\nbuche\nbuchs\nbucht\nbuggy\nbulle\nbunde\nbusch\nbusen\nbäder\nbälle\nbände\nbänke\nbärte\nbässe\nbäume\nbüste\ncello\nchaos\ncheck\nchlor\nclown\ncobra\ncouch\ncover\ncreme\ndabei\ndachs\ndafür\ndaher\ndahin\ndamen\ndampf\ndanke\ndaran\ndarin\ndarum\ndaten\ndatum\ndauer\ndaune\ndecke\ndegen\ndeich\ndeine\ndelle\ndenke\nderen\ndesto\ndicht\ndicke\ndiebe\ndiese\ndinge\ndolch\ndonau\ndosis\ndraht\ndrall\ndrang\ndrauf\ndreck\ndrehe\ndring\ndroge\ndruck\ndrüse\ndübel\ndürre\ndüsen\nebene\necken\nedlen\negeln\neiben\neiche\neifer\neigen\neilig\neimer\neisen\neitel\nekeln\nekzem\nelche\neleve\nelfen\nelite\nellen\nengel\nenkel\nenorm\nenten\nerben\nerbin\nerbst\nerdöl\nernte\nerste\nesche\neseln\nessen\nessig\netage\nethik\neulen\neuter\nextra\nfabel\nfachs\nfaden\nfahne\nfahrt\nfalle\nfallt\nfalte\nfarbe\nfasan\nfaser\nfaust\nfazit\nfeder\nfegen\nfeige\nfeile\nfeind\nfelge\nfelle\nferne\nferse\nfeste\nfette\nfeuer\nfiale\nfibel\nficht\nficks\nfigur\nfilou\nfilze\nfinde\nfinke\nfinne\nfisch\nfixen\nflach\nflair\nflame\nflaps\nflora\nfloss\nflott\nfluch\nfluss\nflöte\nfohle\nfolge\nfolie\nfonds\nforen\nforst\nforum\nfotos\nfrack\nfrage\nfrank\nfrass\nfratz\nfraue\nfraus\nfrech\nfreie\nfremd\nfress\nfreut\nfried\nfries\nfrist\nfrohe\nfront\nfrost\nfrust\nfuchs\nfuhre\nfunde\nfunke\nfurie\nfurze\nfusse\ngabel\ngagen\ngalle\ngasse\ngatte\ngeben\ngebot\ngegen\ngehen\ngehet\ngehst\ngehte\ngehör\ngeier\ngeige\ngeist\ngelbe\ngelde\ngelen\ngelle\ngemüt\ngenau\ngenom\ngenre\ngenug\ngerne\ngerte\ngeste\ngetue\ngeweb\ngicht\ngilde\ngirls\nglanz\nglatt\nglaub\ngleis\nglied\nglück\ngnade\ngosse\ngrabe\ngramm\ngraph\ngreif\ngreis\ngrill\ngrube\ngruft\ngrund\ngrupp\ngruss\ngrüne\ngrüße\ngucke\ngummi\ngurke\ngänge\ngänse\ngäste\ngötze\ngülle\nhaare\nhaben\nhacke\nhafen\nhafer\nhagel\nhahne\nhaken\nhalbe\nhalde\nhalle\nhalte\nhaltt\nhande\nhands\nharfe\nharke\nharte\nhasen\nhaube\nhaupt\nhause\nhauss\nhebel\nhecht\nhecke\nheere\nhefen\nhefte\nheide\nheile\nheime\nheinz\nheiss\nhelfe\nhelle\nhemde\nhemmt\nherde\nherne\nherre\nherta\nherze\nherzs\nhetze\nheute\nhexen\nhilfe\nhille\nhimbe\nhinke\nhinzu\nhirne\nhirte\nhitze\nhobby\nhobel\nhoffe\nhofft\nholen\nholet\nholst\nholte\nholze\nhonig\nhorde\nhoren\nhosen\nhotel\nhuben\nhunde\nhunds\nhupen\nhuren\nhuste\nhänge\nhäute\nhöhle\nhölle\nhören\nhöret\nhörig\nhörst\nhörte\nhügel\nhülle\nhürde\nhüten\nhütte\nigeln\nihnen\niller\nimage\nimker\nimmer\nimmun\nindex\nindio\ninsel\nintim\nionen\nirren\nirrig\nismus\njacke\njagdt\njahre\njambo\njapan\njause\njeans\njeden\njeder\njedes\njenen\njener\njenes\njetzt\njolle\njubel\njuden\njungs\njurte\njuste\njuwel\njäger\nkabel\nkacke\nkaden\nkahle\nkahns\nkakao\nkalbe\nkamee\nkamin\nkampf\nkanal\nkanne\nkante\nkappe\nkarat\nkarte\nkasse\nkaste\nkater\nkatze\nkatzs\nkauen\nkaufe\nkauft\nkebab\nkegel\nkehle\nkeile\nkeime\nkelle\nkenia\nkerbe\nkerle\nkerne\nkerze\nkette\nkeule\nkiele\nkiese\nkilos\nkinde\nkinds\nkinns\nkiosk\nkiste\nkitte\nklage\nklamm\nklang\nklaps\nklare\nklass\nklaue\nkleid\nklein\nklick\nklima\nklotz\nklubs\nkluft\nknabe\nknall\nknapp\nknast\nkneif\nknete\nknopf\nknote\nkobol\nkobra\nkohle\nkojen\nkokon\nkolik\nkomet\nkomik\nkomma\nkonto\nkopfe\nkopfs\nkopie\nkoral\nkoste\nkotze\nkrach\nkraft\nkrank\nkranz\nkrapp\nkrass\nkraut\nkrebs\nkreis\nkreuz\nkrieg\nkrimi\nkrone\nkropf\nkrume\nkrumm\nkrupp\nkröte\nkrüge\nkugel\nkunde\nkunst\nkurve\nkusse\nkutte\nkäfer\nkälte\nköche\nköpfe\nküche\nkühen\nkühle\nkühne\nkürze\nküste\nlabil\nlache\nlachs\nlacke\nladen\nlagen\nlager\nlahme\nlaken\nlampe\nlande\nlands\nlanze\nlappe\nlarve\nlasch\nlasse\nlasst\nlaste\nlatte\nlaube\nlauch\nlaufe\nlauft\nlaune\nlause\nlaute\nleben\nleber\nlebet\nlebst\nlebte\nleder\nledig\nleere\nlegen\nleget\nlegst\nlegte\nlehen\nlehre\nleide\nleier\nleihe\nleine\nleise\nlende\nlenze\nlerne\nlernt\nlesen\nleset\nlesst\nleste\nletzt\nleute\nlicht\nliebe\nliebt\nliege\nliese\nlilie\nlinie\nlinks\nlippe\nlisch\nliten\nlitze\nloben\nlobet\nlobst\nlobte\nloche\nlocke\nloden\nlogik\nlohne\nlokal\nluchs\nlukas\nlunge\nlunte\nluxus\nlyrik\nlänge\nlärms\nlöwen\nlücke\nlügen\nmache\nmacht\nmacis\nmacke\nmaden\nmagen\nmager\nmagie\nmagma\nmahle\nmakel\nmalen\nmaler\nmalet\nmalst\nmalte\nmamas\nmamma\nmampf\nmande\nmanko\nmanne\nmanns\nmappe\nmarge\nmarke\nmarkt\nmaske\nmasse\nmaste\nmathe\nmauer\nmaues\nmause\nmauss\nmeere\nmehle\nmehre\nmeile\nmeine\nmeise\nmeist\nmelde\nmenge\nmensa\nmenüs\nmerke\nmesse\nmiete\nmilch\nmilde\nmiliz\nminze\nmiste\nmitte\nmoden\nmodus\nmogen\nmohns\nmolke\nmonat\nmonch\nmonde\nmoral\nmorde\nmotel\nmotor\nmotte\nmucke\nmulde\nmulti\nmumie\nmunde\nmunds\nmurks\nmusen\nmusik\nmusst\nmutig\nmutze\nmythe\nmädel\nmähne\nmäuse\nmöbel\nmöwen\nmühle\nmünze\nnabel\nnaben\nnacht\nnackt\nnadel\nnagel\nnahen\nnahme\nnamen\nnarbe\nnarre\nnasee\nnases\nnatur\nnebel\nneben\nneffe\nneger\nneide\nnelke\nnenne\nnerva\nnette\nnetze\nneuen\nneunt\nnicht\nnickt\nniere\nniete\nnisse\nnixen\nnobel\nnocke\nnonne\nnotar\nnoten\nnotiz\nnovum\nnudel\nnutze\nnutzt\nnüsse\noasen\nobhut\nochse\nodium\nofens\noffen\noheim\nohren\nokapi\noktan\noktav\nolive\nonkel\nopake\nopern\nopium\noptik\norale\norgel\novale\nozean\npaare\npacht\npaket\npalme\npampa\npanda\npanik\npanne\npappe\npapst\nparka\nparks\nparte\nparty\npasse\npasta\npaten\npauke\npause\npegel\npeile\npelze\nperle\npfade\npfahl\npfalz\npfand\npfaue\npfeil\npferd\npfiff\npflug\npfote\npfuhl\npfund\nphare\nphase\nphlox\npiano\npickt\npille\npilze\npints\npirat\npisse\npiste\npixel\npizza\nplage\nplane\nplatz\nplebs\nplump\npokal\npolen\npolio\npolst\nponto\npopos\nporno\nporta\nporto\nposen\nposse\nprall\npreis\nprima\nprint\nprinz\nprobe\nprofi\npromi\nprosa\nprost\nprunk\nprüfe\npuder\npulks\npulle\npumpe\npunkt\npuppe\npuste\nputen\npöbel\npüree\nqualm\nquant\nquarg\nquart\nquarz\nquast\nquell\nquere\nquote\nrache\nradau\nrades\nradio\nraffe\nragen\nrahms\nrande\nranke\nrappe\nrasen\nrasse\nraten\nratio\nratte\nraube\nrauch\nraudi\nrauer\nraupe\nrecht\nreden\nredet\nredst\nredte\nreell\nregen\nregie\nreibe\nreich\nreife\nreihe\nreims\nreise\nreite\nreitt\nreizt\nrekel\nrente\nreste\nrette\nreuen\nrhein\nrhyth\nriese\nriffe\nrinde\nringe\nrinne\nrisik\nritze\nrobbe\nrocke\nrohen\nrohre\nrolle\nroman\nroste\nrotes\nroute\nrubin\nrudel\nruder\nrufen\nrufet\nrufst\nrufte\nruhen\nruhms\nruine\nrumpf\nrunde\nruppe\nrusse\nruten\nränge\nräume\nrüben\nrüste\nsache\nsacht\nsagen\nsaget\nsagst\nsagte\nsahne\nsalat\nsalbe\nsaldo\nsalon\nsalto\nsalze\nsamen\nsande\nsanft\nsatte\nsatze\nsauce\nsaure\nsaute\nschaf\nscham\nschar\nschau\nschuh\nseele\nsegel\nsegen\nsehen\nsehet\nsehne\nsehst\nsehte\nseide\nseife\nseile\nseine\nseite\nsekte\nselbe\nsemit\nsenat\nsende\nsenfe\nsenge\nsenke\nsense\nserin\nserum\nsetze\nsexta\nshows\nsicht\nsiege\nsilbe\nsilos\nsimse\nsinge\nsingt\nsinne\nsirup\nsitze\nsitzt\nskala\nskalp\nskate\nskier\nskill\nslave\nsocke\nsoges\nsogle\nsohle\nsohne\nsolar\nsolch\nsomme\nsonar\nsonde\nsonne\nsonst\nsorge\nsorte\nsozia\nspalt\nspann\nspare\nspass\nspatz\nspeck\nspeer\nspiel\nspieß\nspion\nspitz\nsplit\nsport\nspott\nspreu\nsprit\nspule\nspund\nspurt\nspäte\nstaat\nstabe\nstadt\nstahl\nstamm\nstand\nstark\nstarr\nstatt\nstaub\nstaun\nsteak\nstehe\nsteht\nsteif\nsteig\nstein\nstell\nstern\nstete\nstets\nstich\nstier\nstift\nstile\nstill\nstimm\nstirn\nstock\nstoff\nstolz\nstopp\nstore\nstoss\nstraf\nstrom\nstube\nstufe\nstuhl\nstumm\nsturm\nstute\nstutz\nstößt\nstück\nsuche\nsucht\nsuppe\nszene\nsäfte\nsärge\nsäuen\nsünde\ntadel\ntafel\ntagel\ntages\ntaiga\ntaler\ntalgt\ntalso\ntante\ntanze\ntanzt\ntapes\ntapet\ntappe\ntapse\ntarde\ntarne\ntarte\ntasse\ntaste\ntaten\ntatze\ntaube\ntauen\ntaufe\ntaxen\ntaxis\nteams\nteddy\nteich\nteile\nteils\nteilt\nteint\ntelle\ntempi\ntempo\ntenne\ntenor\ntermi\ntests\nteuer\ntexte\ntheke\nthema\nthese\nthron\nticks\ntiefe\ntiere\ntiger\ntilde\ntille\ntinte\ntipps\ntiran\ntisch\ntitan\ntitel\ntitte\ntoast\ntoben\ntoden\ntodes\ntofus\ntolle\ntonen\ntonne\ntores\ntorso\ntorte\ntotal\ntoten\ntotes\ntrabe\ntrafo\ntrage\ntrakt\ntrank\ntraue\ntraum\ntreff\ntreib\ntrend\ntrete\ntreue\ntrick\ntrieb\ntrift\ntritt\ntrost\ntrotz\ntrugs\ntruhe\ntrunk\ntrupp\ntrübe\ntulpe\ntunen\ntunik\ntupfe\nturbo\ntypen\ntöpfe\ntüren\ntürme\nufern\nuhren\nulken\nulmen\nultim\numbau\numher\numzug\nunart\nunbar\nunden\nunfug\nunion\nunmut\nunruh\nunser\nunten\nunter\nuralt\nurnen\nuroma\nuropa\nurtyp\nutopi\nvasen\nvater\nvatis\nvegan\nvenen\nvenus\nvideo\nviehs\nviels\nviren\nvisum\nvlies\nvogel\nvokal\nvolke\nvolle\nvorab\nvoran\nvorer\nvorig\nvorne\nvotum\nvögel\nwaage\nwache\nwachs\nwacht\nwaffe\nwagen\nwahns\nwahre\nwalde\nwales\nwalze\nwange\nwanke\nwanne\nwanze\nwaren\nwarne\nwarte\nwartt\nwarum\nwasen\nwatte\nweben\nwedel\nwegen\nwehen\nweich\nweide\nweihe\nweile\nweine\nweise\nweite\nwelle\nwelte\nwende\nwenig\nwerbe\nwerfe\nwerke\nwerte\nwesen\nweste\nwette\nwicht\nwider\nwiege\nwiese\nwilde\nwille\nwinde\nwinke\nwirft\nwirke\nwirkt\nwirts\nwisch\nwitwe\nwitze\nwobei\nwoche\nwogen\nwohin\nwohle\nwolke\nwolle\nwomit\nwonne\nworan\nworte\nworts\nworum\nwovon\nwuchs\nwulst\nwunde\nwurms\nwurst\nwähle\nwälle\nwände\nwärme\nwölfe\nwürze\nwüste\nxenon\nyacht\nyogas\nzahle\nzahlt\nzange\nzanke\nzaren\nzarte\nzaune\nzebra\nzecke\nzehen\nzehnt\nzeige\nzeigt\nzeile\nzelle\nzelte\nzenti\nzentr\nzeren\nzerge\nzeter\nzeuge\nziehe\nzieht\nziele\nziere\nzigar\nzilli\nzinke\nzinne\nzirpe\nzitat\nzitze\nzivil\nzobel\nzofen\nzogen\nzolle\nzomby\nzonen\nzopfe\nzorns\nzoten\nzotig\nzotte\nzuber\nzucht\nzucke\nzuges\nzunft\nzunge\nzupfe\nzuruf\nzutat\nzuvor\nzwack\nzwang\nzweck\nzweig\nzwerg\nzwieb\nzwill\nzwirn\nzwist\nzwole\nzyade\nzygot\nzähen\nzähle\nzählt\nzähne\nzügel\nübbar\nübens\nübung\nüppig";

// Pure parser shared by the fetched list and the embedded fallback.
function parseWords(text) {
  return Array.from(new Set(
    text.split('\n')
      .map(function (w) { return w.trim().toLowerCase().normalize('NFC'); })
      .filter(function (w) { return w.length === TARGET_LENGTH; })
      .filter(function (w) {
        for (let i = 0; i < w.length; i++) {
          if (!VALID_LETTER_RE.test(w[i])) return false;
        }
        return true;
      })
  ));
}

function buildGrid() {
  gridEl.innerHTML = '';
  GAME.rows = [];
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.dataset.row = String(r);
    const row = [];
    for (let c = 0; c < TARGET_LENGTH; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      rowEl.appendChild(cell);
      row.push({ letter: '', color: null });
    }
    gridEl.appendChild(rowEl);
    GAME.rows.push(row);
  }
}

function renderCell(row, col) {
  const cellEl = gridEl.children[row] && gridEl.children[row].children[col];
  if (!cellEl) return;
  const data = GAME.rows[row][col];

  // Always strip every legacy color class so a previous game's feedback
  // cannot bleed into the current one.
  cellEl.classList.remove('cell-green', 'cell-yellow', 'cell-wrong');
  cellEl.textContent = data.letter;
  cellEl.style.animationDelay = '';

  // Keep .filled on during 'revealing' too: if the user smashes Enter
  // right after the last keystroke, the cellPop bounce is still playing
  // and we don't want to interrupt it with the flip animation.
  const visiblyFilled = !!data.letter && (GAME.status === 'playing' || GAME.status === 'revealing');
  cellEl.classList.toggle('filled', visiblyFilled);
  cellEl.classList.toggle('reveal', !!data.color);

  if (data.color) {
    cellEl.classList.add('cell-' + data.color);
    cellEl.style.animationDelay = (col * REVEAL_STAGGER_MS) + 'ms';
  }
}

function updateCounter() {
  const cur = Math.min(GAME.currentRow + 1, MAX_ATTEMPTS);
  counterEl.textContent = 'Versuch ' + cur + ' / ' + MAX_ATTEMPTS;
}

function clearStatusClasses() {
  statusEl.classList.remove('status-win', 'status-lose', 'status-shake');
}

// Standard two-pass Wordle evaluation. Greens win over yellows and "use up"
// matches; the second pass only turns on yellow when there's still budget
// left in `remaining` for that letter.
function evaluate(guess, answer) {
  const colors = new Array(TARGET_LENGTH).fill(null);
  const remaining = {};
  for (let i = 0; i < TARGET_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      colors[i] = 'green';
    } else if (answer[i]) {
      remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < TARGET_LENGTH; i++) {
    if (colors[i] === 'green') continue;
    const ch = guess[i];
    if (ch && remaining[ch] > 0) {
      colors[i] = 'yellow';
      remaining[ch]--;
    } else {
      colors[i] = 'wrong';
    }
  }
  return colors;
}

function flashStatus(msg, tone) {
  statusEl.textContent = msg;
  clearStatusClasses();
  if (tone === 'win') statusEl.classList.add('status-win');
  if (tone === 'lose') statusEl.classList.add('status-lose');
  if (tone === 'bump') {
    statusEl.classList.add('status-shake');
    setTimeout(function () { statusEl.classList.remove('status-shake'); }, 400);
  }
}

// Normalize the text input into a clean string of up to TARGET_LENGTH valid
// German letters. NFD → NFC first so 'a\u0308' (a + combining diaeresis)
// becomes 'ä' rather than silently stripping the diacritic.
function readCleanGuess() {
  const normalized = guessInput.value.normalize('NFC').toLowerCase();
  let out = '';
  for (let i = 0; i < normalized.length && out.length < TARGET_LENGTH; i++) {
    const ch = normalized[i];
    if (VALID_LETTER_RE.test(ch)) out += ch;
  }
  return out;
}

// Mirror the text input into the active row. We never write back to
// guessInput.value here so native IME / dead-key composition for ü ö ä ß
// is not interrupted — the browser keeps full control of the field.
function syncInputToRow() {
  if (GAME.status !== 'playing') return;
  const cleaned = readCleanGuess();
  const row = GAME.rows[GAME.currentRow];
  if (!row) return;
  for (let c = 0; c < TARGET_LENGTH; c++) {
    const letter = cleaned[c] || '';
    if (row[c].letter !== letter) {
      row[c].letter = letter;
      renderCell(GAME.currentRow, c);
    }
  }
}

function evaluateRow() {
  if (GAME.status !== 'playing') return;
  const row = GAME.currentRow;
  const guess = GAME.rows[row].map(function (c) { return c.letter; }).join('');
  if (guess.length !== TARGET_LENGTH) {
    flashStatus('Bitte genau ' + TARGET_LENGTH + ' Buchstaben eingeben.', 'bump');
    const rowEl = gridEl.children[row];
    if (rowEl) {
      rowEl.classList.add('row-shake');
      setTimeout(function () { rowEl.classList.remove('row-shake'); }, 400);
    }
    return;
  }
  GAME.status = 'revealing';
  guessInput.disabled = true;
  const colors = evaluate(guess, GAME.answer);
  for (let i = 0; i < TARGET_LENGTH; i++) {
    GAME.rows[row][i].color = colors[i];
    renderCell(row, i);
  }
  const totalReveal = TARGET_LENGTH * REVEAL_STAGGER_MS + REVEAL_ANIM_MS;
  setTimeout(function () {
    if (guess === GAME.answer) {
      GAME.status = 'won';
      flashStatus('Gewonnen! Das Wort war: ' + GAME.answer.toUpperCase(), 'win');
      showNewGame(true);
      return;
    }
    if (row + 1 >= MAX_ATTEMPTS) {
      GAME.status = 'lost';
      flashStatus('Verloren! Das Wort war: ' + GAME.answer.toUpperCase(), 'lose');
      showNewGame(true);
      return;
    }
    GAME.status = 'playing';
    GAME.currentRow++;
    updateCounter();
    flashStatus('Versuche es weiter.', null);
    guessInput.value = '';
    syncInputToRow();
    guessInput.disabled = false;
    guessInput.focus();
  }, totalReveal);
}

function showNewGame(visible) {
  newGameBtn.hidden = !visible;
  inputRow.style.display = visible ? 'none' : '';
  if (visible) newGameBtn.classList.add('pulse');
}

// newGame() is bound both to loadWords() and to the NEUES SPIEL button,
// so we keep a defensive guard for an empty pool — prevents the random
// indexing from returning undefined if anything ever hands us a 0-length
// pool (e.g. an empty words.txt plus a corrupted embed).
function newGame() {
  if (!GAME.pool || GAME.pool.length === 0) {
    flashStatus('Wörter werden geladen…', null);
    return;
  }
  GAME.answer = GAME.pool[Math.floor(Math.random() * GAME.pool.length)];
  GAME.currentRow = 0;
  GAME.status = 'playing';
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    for (let c = 0; c < TARGET_LENGTH; c++) {
      GAME.rows[r][c] = { letter: '', color: null };
      renderCell(r, c);
    }
  }
  guessInput.value = '';
  guessInput.disabled = false;
  // IMPORTANT: restore display BEFORE focusing, otherwise the browser
  // silently drops focus when the input's ancestor is hidden.
  inputRow.style.display = '';
  guessInput.focus();
  updateCounter();
  flashStatus('Tippe los!', null);
  newGameBtn.hidden = true;
  newGameBtn.classList.remove('pulse');
}

function setupInput() {
  // Track IME / dead-key composition so we don't fight the OS mid-way
  // through typing an umlaut. The grid mirrors the final composed
  // result via the 'compositionend' handler.
  let composing = false;
  guessInput.addEventListener('compositionstart', function () { composing = true; });
  guessInput.addEventListener('compositionend', function () {
    composing = false;
    syncInputToRow();
  });
  guessInput.addEventListener('input', function () {
    if (composing) return; // defer until compositionend
    syncInputToRow();
  });

  guessInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      evaluateRow();
    }
  });

  submitBtn.addEventListener('click', function () { evaluateRow(); });
}

async function loadWords() {
  // Try words.txt from the HTTP server first. On any failure — fetch
  // throws (file:// CORS), non-OK response, or empty content — fall
  // back to the embedded pool. We always end up with a non-empty pool
  // so the game reaches 'playing'.
  let pool = [];
  try {
    const res = await fetch('words.txt');
    if (res && res.ok) {
      pool = parseWords(await res.text());
    }
  } catch (err) {
    // file:// or no HTTP server — fall through to embedded pool.
  }
  if (pool.length === 0) {
    pool = parseWords(EMBEDDED_WORDS_TEXT);
  }
  GAME.pool = pool;
  wordCounterEl.textContent = pool.length + ' Wörter im Pool';
  if (pool.length > 0) {
    newGame();
  } else {
    // Truly catastrophic — both sources empty. Surface a clear error
    // so the user knows what happened (typing into the input still
    // updates .value; only the grid mirror bails when status stays
    // stuck at 'loading').
    flashStatus('Keine Wörter verfügbar.', null);
  }
}

function init() {
  buildGrid();
  setupInput();
  updateCounter();
  newGameBtn.addEventListener('click', newGame);

  // Forgiveness: clicking anywhere in the game container (apart from
  // existing interactive elements) refocuses the input. Covers cases
  // where focus drifted (browser stole it) or was never set.
  var container = document.querySelector('.game-container');
  if (container) {
    container.addEventListener('click', function (e) {
      if (e.target === guessInput) return;
      if (e.target === newGameBtn) return;
      if (e.target === submitBtn) return;
      // Don't yank focus if the user clicked the theme toggle.
      var t = e.target;
      while (t && t !== container) {
        if (t.classList && t.classList.contains('theme-toggle')) return;
        t = t.parentNode;
      }
      if (GAME.status !== 'playing') return;
      if (guessInput.disabled) return;
      guessInput.focus();
    });
  }

  loadWords();
}

init();
