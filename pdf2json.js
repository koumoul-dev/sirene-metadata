#!/usr/bin/nodejs

const fs = require('fs')
const PDFParser = require('pdf2json');

['dessin_XL2_description_complete', 'dessin_L2_description_complete'].forEach(fileKey => {
  const pdfParser = new PDFParser()
  pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError))
  pdfParser.on('pdfParser_dataReady', pdfData => {
    var fields = pdfData.formImage.Pages.slice(9, pdfData.formImage.Pages.length).map(page => {
      return parsePageText(page.Texts)
    })
    fs.writeFileSync('./metadata/' + fileKey + '.json', JSON.stringify(fields, null, 2))
  })

  pdfParser.loadPDF('./resources/' + fileKey + '.pdf')
})

function parsePageText(texts) {
  var field = {}
  var current = null
  var currentValeurPossible = null
  var valeurPossibleY = null
  texts.forEach(text => {
    // header et footer
    if (text.y <= 3 || text.y >= 49) return

    // texte large est le titre
    if (text.R[0].TS[1] > 17) {
      field.title = field.title || ''
      field.title += decodeURIComponent(text.R[0].T)
      return
    }

    // texte aligné à gauche est une clé de propriété
    if (text.x < 4) {
      current = decodeURIComponent(text.R[0].T).trim()
      field[current] = ''
      return
    }

    // le reste est du contenu
    field[current] += decodeURIComponent(text.R[0].T)

    // extrait la liste des valeurs possible depuis le champ "liste des modalités"
    if (current === 'Liste des modalités') {
      field.valeursPossibles = field.valeursPossibles || {}
      // aligné à gauche -> 1 clé, 1 commentaire ou la suite d'une valeur
      // console.log(JSON.stringify(text))
      if (text.x < 12) {
        // trop long pour une clé et pas encore de valeur -> 1 commentaire de début
        if (text.R[0].T.length > 10 && !currentValeurPossible) {
          currentValeurPossible = null
          return
        }

        // trop long pour une clée, saut de ligne depuis valeur en cours -> 1 commentaire de fin
        if (text.R[0].T.length > 10 && text.y - valeurPossibleY > 1) {
          // console.log('commentaire de fin ? - ' + decodeURIComponent(text.R[0].T), text.y - valeurPossibleY)
          currentValeurPossible = null
          return
        }

        // trop long pour une clé et valeur en cours -> suite d'une valeur
        if (text.R[0].T.length > 10) {
          field.valeursPossibles[currentValeurPossible] += decodeURIComponent(text.R[0].T)
          return
        }

        // 1 nouvelle clé
        currentValeurPossible = decodeURIComponent(text.R[0].T).trim()
        valeurPossibleY = text.y
        if (currentValeurPossible === '""') currentValeurPossible = ''
        field.valeursPossibles[currentValeurPossible] = ''
      } else {
        if (currentValeurPossible) field.valeursPossibles[currentValeurPossible] += decodeURIComponent(text.R[0].T)
      }
    }
  })

  var toks = field.title.split(' - ')
  field.id = toks[1].trim()
  field.title = toks[0].trim()

  if (field.id === 'EFETCENT') {
    delete field.valeursPossibles
  }

  if (field.valeursPossibles) {
    Object.keys(field.valeursPossibles).forEach(key => {
      if (!field.valeursPossibles[key]) delete field.valeursPossibles[key]
      else field.valeursPossibles[key] = field.valeursPossibles[key].trim()
    })
  }

  if (field.valeursPossibles && !Object.keys(field.valeursPossibles).length) {
    delete field.valeursPossibles
  }

  Object.keys(field).forEach(prop => {
    if (typeof field[prop] === 'string') field[prop] = field[prop].trim()
  })
  return field
}
