/**
 * Author: DrowsyFlesh
 * Create: 2022/7/22
 * Description:
 */
import path from '@skpm/path';
import fs from '@skpm/fs';
import _ from 'lodash';
import ENTRY_TEMPLATE from '../templates/entry';
import INDEX_TEMPLATE from '../templates/index';

export function readFilesSync(savePath, dirname, result = {}) {
    const paths = fs.readdirSync(dirname);

    const directories = paths.filter((path) => String(path).toLowerCase().slice(-4) !== '.svg');
    const files = paths.filter((path) => !directories.includes(path));

    const componentNames = [];
    const directoryNames = [];

    files.forEach(function(filePath) {
        const fullPath = path.resolve(dirname, filePath);
        const stat = fs.lstatSync(fullPath);
        if (stat.isFile()) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const filePathWithoutExt = filePath.slice(0, -4);
            const componentName = _.upperFirst(_.camelCase(filePath.split(path.sep).slice(-1).join().slice(0, -4)));
            const setPath = filePathWithoutExt.split(path.sep)
                                              .map((str) => str.trim())
                                              .map(str => _.upperFirst(_.camelCase(str))).join(path.sep);
            componentNames.push([componentName, setPath]);
            _.set(result, setPath, content);
        } else if (stat.isDirectory()) {
            const directoryName = filePath.split(path.sep).slice(-1).join();
            directoryNames.push(directoryName);
            readFilesSync(fullPath, result);
        }
    });

    let indexContent = '';

    if (directoryNames.length) {
        indexContent += INDEX_TEMPLATE(directoryNames.sort());
    }

    if (componentNames.length) {
        indexContent += ENTRY_TEMPLATE(componentNames.sort());
    }

    if (indexContent && indexContent.length) {
        fs.writeFileSync(path.resolve(savePath, 'index.ts'), indexContent);
    }

    return result;
}
