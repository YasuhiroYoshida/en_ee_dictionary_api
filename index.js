'use strict';

const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const cors = require('cors');

// Parse the help page of the dictionary every time the frontend sends a request.
// The page gives also annotations explanation for each rule.
// The page has a table structure with a number of rows.
function setupHelp(help) {
  request('http://www.eki.ee/dict/qs/muuttyybid.html', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // const help = {};
      const $ = cheerio.load(body);
      $('table td > span[class=nr]').each((i, e) => {
        const number = $(e).text().trim();
        const row = $(e).parent().parent();
        const base = row.find('td:nth-child(2)').text().trim();
        const result = { base };

        const nextRow = row.next().text();
        const marker = 'võrdlus:';
        const indexOfMarker = nextRow.indexOf(marker);
        if (indexOfMarker >= 0) {
          const additional = nextRow.substring(indexOfMarker + marker.length).trim();
          result.additional = additional;
        }
        // eslint-disable-next-line no-param-reassign
        help[number] = result;
      });
    }
    return undefined;
  });
}

const help = {};
setupHelp(help);

// Parse the definition page of the Estonian word
// - returns the definitions and Rule numbers
function parseCompleteEST(html, estTerm) {
  const $ = cheerio.load(html);

  // Inside .tervikart element, there can be words ending with a "+"
  // Such word is eliminated here
  const tervikart = $('.tervikart').filter((i, x) => {
    return !$(x).text().trim().startsWith(`${estTerm}+`);
  });

  // notes is actually a single element
  const notes = tervikart.last().find('.grg .mvq').text();
  // numbers here correspond to a Rule number listed on the help page
  const numbersAsString = tervikart.last().find('.grg .mt').text();
  const re = /\d+[a-z]?/ig;
  const numbers = numbersAsString.match(re);
  return { notes, numbers };
}

// For the given Estonian term, get the complete defitions.
function fetchCompleteEST(term, done) {
  const url = `http://www.eki.ee/dict/qs/index.cgi?&F=M&C01=1&C02=1&Q=${encodeURI(term.estTerm)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const infos = parseCompleteEST(body, term.estTerm);
      const result = { estTerm: term.estTerm };

      if (infos.notes !== '') {
        result.notes = infos.notes;
      }

      const numbers = infos.numbers;
      let rule = '';
      if (numbers && numbers[0] !== '') {
        rule = numbers.map((x) => {
          if (x !== '' && x in help) {
            return { number: x, text: help[x].base };
          }
          return undefined;
        });
        result.rule = rule;
      }
      done(null, result);
    } else {
      done(error);
    }
  });
}

// After retrieving the body, parse for all the Estonian terms (to the orignal English term)
// For a English word, several Estonian words can exist
function parseENtoEST(html, englTerm, done) {
  const $ = cheerio.load(html);
  const terms = [];
  // check for the entries that are eqivalent to our term
  // and then get all the possible words from there
  $('span[lang=en]').each((i, e) => {
    if ($(e).text() === englTerm) {
      $(e).parent().find('.x').each((ii, ee) => terms.push({ estTerm: ee.children[0].data }));
    }
  });

  return async.map(terms, fetchCompleteEST, (error, result) => {
    if (!error) {
      const filtered = result;
      // I am not sure if the result needs to get filterd. If yes, use the below.
      // const filtered = result.filter(x => x !== null);
      // const filtered = result;
      done(null, { englTerm, list: filtered });
    } else {
      done(error);
    }
  });
}

// Translate the English term to Estonian and proceed
function fetchENtoEST(englTerm, done) {
  const url = `http://www.eki.ee/dict/ies/index.cgi?F=M&C06=en&C01=1&C02=1&C12=1&C13=1&Q=${encodeURI(englTerm)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      parseENtoEST(body, englTerm, done);
    } else {
      done(error);
    }
  });
}

// 5 suggestions are returned
function getSuggestions(term, res) {
  const url = `http://www.eki.ee/dict/shs_soovita.cgi?D=ies&F=M&term=${encodeURI(term)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let suggestions = JSON.parse(body).map((x) => {
        const start = x.indexOf('>') + 1;
        const end = x.indexOf('</');
        const s = x.substring(start, end);
        return s;
      });

      // if suggestions include the search word, it will be prepended to suggestions
      if (suggestions.indexOf(term) === -1) {
        suggestions = [term].concat(suggestions);
      }
      // if suggestions end up being a 6-element array, the last one will be chopped off
      suggestions = suggestions.slice(0, 5);

      async.map(suggestions, fetchENtoEST, (error2, result) => {
        if (!error2) {
          const filtered = result.filter(x => x.list.length > 0);
          res.json(filtered);
        } else {
          res.status(500).send(error);
        }
      });
    }
  });
}

const app = express();
app.use(cors());

app.get('/eestikeelt', (req, res) => {
  const term = req.query.term;
  if (typeof term !== 'undefined') {
    getSuggestions(term.toLowerCase(), res);
  } else {
    res.json({ error: 'No Terms Were Provided' });
  }
});

app.listen(process.env.PORT);
