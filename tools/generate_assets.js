/*
  this is pretty garbage for now
*/

const fs = require('fs');

const SUPPORTED_ASSETS = ['png', 'json'];
const ASSET_EXTENSION = SUPPORTED_ASSETS.map(
  (extension) => new RegExp(`.*\.${extension}$`)
);
const FILENAME_WITHOUT_EXT = /(.+)\.[a-zA-Z]+$/;
const ROOT = './src/asset';

const getAssetsForDirectory = (dir, root = false) => {
  console.log(dir, '..');
  const dir_without_root = dir.replace(ROOT, '.');

  let imports = [];
  let result = {};

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((e) => {
    if (e.isDirectory()) {
      const sub_results = getAssetsForDirectory(`${dir}/${e.name}`);
      imports = [...imports, ...sub_results.imports];
      result = {
        ...result,
        [e.name]: sub_results.result,
      };
    } else if (e.isFile()) {
      if (ASSET_EXTENSION.some((ext) => e.name.match(ext))) {
        const key = e.name.match(FILENAME_WITHOUT_EXT)[1];
        result[key] = key;

        imports = [
          ...imports,
          `import * as ${key} from 'url:${dir_without_root}/${e.name}';`,
        ];

        console.log('\t', e.name, '✅');
      } else {
        console.log('\t', e.name, '❌');
      }
    }
  });

  return { imports, result };
};

const assets = getAssetsForDirectory(ROOT, true);
const content = `${assets.imports.join(
  '\n'
)}\nexport const Asset = ${JSON.stringify(assets.result)
  .replace(':"', ':')
  .replace('"}', '}')};`;

const target = `${ROOT}/index.ts`;

fs.writeFileSync(target, content, 'utf8');

console.log('\nsaved assets in', target, '💾');
