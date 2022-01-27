require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const COLOR = {
  GRAY: 0,
  YELLOW: 1,
  GREEN: 2
};

const BASE_AGG = [{
  $sample: {
    size: 1
  }
}];

const AGG_WITH_REGEX = (regex) => [{
  $search: {
    index: 'wordle_dictionary',
    regex: {
      query: regex,
      path: 'word',
      allowAnalyzedField: true
    }
  }
}, {
  $sample: {
    size: 1
  }
}];

class Wordle {
  constructor () {
    this.schema = [];
  }

  agg () {
    if (this.schema.length === 0) {
      return BASE_AGG;
    }
    const regexes = [{ in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }];
    const and = [];
    for (let col = 0; col < 5; col++) {
      for (const row of this.schema) {
        switch (row[col].color) {
          case COLOR.GRAY:
            regexes.forEach(r => { r.out += row[col].letter; });
            break;
          case COLOR.YELLOW:
            regexes[col].out += row[col].letter;
            and.push(row[col].letter);
            break;
          case COLOR.GREEN:
            regexes[col].in = row[col].letter;
            break;
        }
      }
    }
    let regex = '';
    if (and.length > 0) {
      regex += and.map(a => `.*${a}.*`).join('&');
      regex += '&';
    }
    regex += regexes.map(r => r.in ? r.in : `[^${r.out}]`).join('');
    return AGG_WITH_REGEX(regex);
  }

  pushRow (sequence) {
    this.schema.push(sequence);
  }
}

(async function () {
  const client = new MongoClient(process.env.atlas_conn_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  try {
    // Use connect method to connect to the Server
    await client.connect();

    const db = client.db('wordle_solver');
    const collection = db.collection('dictionary');

    const w = new Wordle();
    w.pushRow([
      { letter: 'e', color: COLOR.YELLOW },
      { letter: 'v', color: COLOR.GRAY },
      { letter: 'o', color: COLOR.GRAY },
      { letter: 'k', color: COLOR.GRAY },
      { letter: 'e', color: COLOR.YELLOW }
    ]);
    w.pushRow([
      { letter: 's', color: COLOR.GRAY },
      { letter: 'a', color: COLOR.YELLOW },
      { letter: 'n', color: COLOR.GRAY },
      { letter: 'e', color: COLOR.YELLOW },
      { letter: 'r', color: COLOR.GRAY }
    ]);
    w.pushRow([
      { letter: 'm', color: COLOR.GRAY },
      { letter: 'e', color: COLOR.YELLOW },
      { letter: 'a', color: COLOR.YELLOW },
      { letter: 't', color: COLOR.GRAY },
      { letter: 'y', color: COLOR.GRAY }
    ]);
    w.pushRow([
      { letter: 'p', color: COLOR.GRAY },
      { letter: 'l', color: COLOR.GRAY },
      { letter: 'e', color: COLOR.GREEN },
      { letter: 'a', color: COLOR.GREEN },
      { letter: 'd', color: COLOR.GREEN }
    ]);

    const cursor = collection.aggregate(w.agg());
    while (await cursor.hasNext()) {
      const {
        word
      } = await cursor.next();
      console.log(word);
    }
  } catch (err) {
    console.error(err);
  }
  client.close();
})();
