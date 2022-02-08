export default class Wordle {
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