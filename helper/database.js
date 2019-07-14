// packages
//https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/

// insert or update url
// returns shurtUrl
exports.updateURLsStub = (url) => {
  if(url.indexOf("www.freecodecamp.org")!=-1) return 3;
  return 2;
}