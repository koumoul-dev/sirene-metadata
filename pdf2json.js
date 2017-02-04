#!/usr/bin/nodejs

const fs = require('fs')
const PDFParser = require('pdf2json')

const pdfParser = new PDFParser()

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError))
pdfParser.on('pdfParser_dataReady', pdfData => {
  var fields = pdfData.formImage.Pages.slice(9, pdfData.formImage.Pages.length).map(function(page) {
    return parsePageText(page.Texts)
  })
  fs.writeFileSync('./metadata/' + pdfData.formImage.Agency + '.json', JSON.stringify(fields, null, 2))
})

// pdfParser.loadPDF('./resources/dessin_L2_description_complete.pdf');
pdfParser.loadPDF('./resources/dessin_XL2_description_complete.pdf')

function parsePageText(texts) {
  var field = {}
  var current = null
  texts.forEach(function(text) {
    if (text.y > 3 && text.y < 49) {
      // text.R[0].TS[1] > 17 should do it too
      if (text.R[0].TS[1] > 17) {
        field.title = (field.title || '') + decodeURIComponent(text.R[0].T)
      } else {
        if (text.x < 4) {
          current = decodeURIComponent(text.R[0].T).trim()
          field[current] = ''
        } else {
          field[current] += decodeURIComponent(text.R[0].T)
        }
      }
    }
  })
  var toks = field.title.split(' - ')
  field.id = toks[1]
  field.title = toks[0]
  Object.keys(field).forEach(function(prop) {
    field[prop] = field[prop].trim()
  })
  return field
}
