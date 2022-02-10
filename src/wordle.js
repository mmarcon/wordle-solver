export default class Wordle {
  
  static COLOR = {
    absent: 0,
    present: 1,
    correct: 2,
    undefined: -1
  };

  static AGG_WITH_REGEX = (regex) => [{
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

  static BASE_AGG = [{
    $sample: {
      size: 1
    }
  }];

  static color(colorCode) {
    for (const [k, v] of Object.entries(Wordle.COLOR)) {
      if (colorCode === v) {
        return k;
      }
    }
  }

  constructor () {
    this.schema = [];
  }

  agg () {
    if (this.schema.length === 0) {
      return Wordle.BASE_AGG;
    }
    const regexes = [{ in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }, { in: '', out: '' }];
    const and = [];
    for (let col = 0; col < 5; col++) {
      for (const row of this.schema) {
        switch (row[col].color) {
          case Wordle.COLOR.absent:
            regexes.forEach(r => { r.out += row[col].letter; });
            break;
          case Wordle.COLOR.present:
            regexes[col].out += row[col].letter;
            and.push(row[col].letter);
            break;
          case Wordle.COLOR.correct:
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
    return Wordle.AGG_WITH_REGEX(regex);
  }

  pushRow (sequence) {
    this.schema.push(sequence);
  }
}