const { loadJS } = _utilslibCore

const corePath =  'https://unpkg.com/@utilslib/core/dist/index.global.js'
const domPath =  'https://unpkg.com/@utilslib/dom/dist/index.global.js'


// 场景1: 加载一个JavaScript文件
loadJS(corePath)
  .then(() => console.log('Script 1 loaded'))
  .catch(error => console.error('Failed to load script 1:', error));

// 场景2: 加载多个JavaScript文件
loadJS([corePath, domPath])
  .then(() => console.log('Scripts 2 and 3 loaded'))
  .catch(error => console.error('Failed to load scripts 2 and 3:', error));

// 场景3: 加载一个JavaScript文件并设置script标签的属性
loadJS(corePath, { type: 'module', async: false })
  .then(() => console.log('Script 4 loaded'))
  .catch(error => console.error('Failed to load script 4:', error));

// 场景4: 加载多个JavaScript文件并设置script标签的属性
loadJS([corePath, domPath], { type: 'module', async: false })
  .then(() => console.log('Scripts 5 and 6 loaded'))
  .catch(error => console.error('Failed to load scripts 5 and 6:', error));