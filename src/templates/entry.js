export default (iconNameList) => iconNameList.map(([name, path]) => `export {default as ${name}Icon} from './${path}Icon';`).join('\n');
