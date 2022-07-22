export default (directoryNameList) => directoryNameList.map(name => `export * from './${name}';`).join('\n');
