var marked = require('color-marked')
marked.defaults['color'] = true;
var fs = require('fs')
var path = require('path')

var files = fs.readdirSync('doc')
var template = fs.readFileSync(path.resolve(__dirname, 'templates', 'template.html'), 'utf8')
var sidebar = fs.readFileSync(path.resolve(__dirname, 'templates', 'sidebar.html'), 'utf8')

files.forEach(function (file) {
  var name = file.replace(/\.md$/, '') + '.html'
  var content = fs.readFileSync(path.resolve(__dirname, 'doc', file), 'utf8')
  var res = template.replace('{{content}}', marked(content))
    .replace('{{sidebar}}', sidebar)
    .replace('{{script}}', '')
  fs.writeFileSync(name, res, 'utf8')
})

var content = fs.readFileSync(path.resolve(__dirname, 'templates/demo.html'), 'utf8')
var res = content.replace('{{sidebar}}', sidebar)
fs.writeFileSync(path.resolve(__dirname, 'demo.html'), res, 'utf8')
