const {google} = require('googleapis');
const sloth = require('@justinbeckwith/sloth/build/src/issue');
const spreadsheetId = '1VV5Clqstgoeu1qVwpbKkYOxwEgjvhMhSkVCBLMqg24M';

exports.sync = async function() {
  try {
    // grab stuff from sloth
    console.log('fetching github data...');
    const repos = await sloth.getIssues();
    const issues = [];
    repos.forEach(r => {
      r.issues.forEach(i => issues.push(i));
    });
    const values = issues.map(i => {
      return [
        i.repo,
        i.language,
        i.types ? i.types.join(', ') : '',
        i.api,
        i.isOutOfSLO,
        i.isTriaged,
        i.pri,
        i.isPR,
        i.number,
        i.createdAt,
        i.title,
        i.url,
        i.labels ? i.labels.join(', ') : ''
      ];
    });
    values.unshift([
      'Repo',
      'Language',
      'Types',
      'API',
      'OutOfSLO',
      'Triaged',
      'Priority',
      'PR',
      'Number',
      'Created At',
      'Title',
      'Url',
      'Labels'
    ]);

    const auth = await google.auth.getClient({
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    const sheets = google.sheets({
      version: 'v4',
      auth
    });
    // clear the current text in the sheet
    console.log('clearing existing data...');
    let res = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'A1:Z10000'
    });

    // insert it into the sheet
    console.log('inserting data...');
    res = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'A1',
            values
          }
        ]
      }
    });
    console.log('update complete');
  } catch (e) {
    console.error(e);
    throw e;
  }
}
