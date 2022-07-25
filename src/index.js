// documentation: https://developer.sketchapp.com/reference/api/
import sketch from 'sketch';
import UI from 'sketch/ui';
import path from '@skpm/path';
import dialog from '@skpm/dialog';
import fs from '@skpm/fs';
import {tmpdir} from '@skpm/os';
import {readFilesSync} from './utils/readFiles';
import {optimize, loadConfig} from 'svgo';
import ICON_TEMPLATE from './templates/named-icon.js';
import TYPE_TEMPLATE from './templates/types.js';
import svgoConfig from '../svgo.config';
import {createFiber} from 'sketch/async';


export default function() {
    const document = sketch.getSelectedDocument();
    const symbols = document.getSymbols();
    const fiber = createFiber();

    // get save path
    let savePath = dialog.showOpenDialogSync({properties: ['openDirectory']});
    if (!savePath || !savePath.length) {
        return;
    }

    savePath = savePath[0];
    const targetSavePath = savePath + path.sep + 'Icons';
    //console.log('targetSavePath', targetSavePath);

    // clear target directory
    if (fs.existsSync(targetSavePath)) {
        fs.rmdirSync(targetSavePath);
    }

    fs.mkdirSync(targetSavePath, {recursive: true});

    // create temp directory to save svg
    const tempPath2SaveSvg = fs.mkdtempSync(path.join(tmpdir(), 'sketchPlugin-icon2React-'));

    // export temp svg files
    sketch.export(symbols, {formats: 'svg', compact: true, output: tempPath2SaveSvg});

    UI.message(`Icon → React: Exported svg number ${symbols.slice(0, 10).length}`);

    // read and get svg string for component
    const svgContents = readFilesSync(targetSavePath, tempPath2SaveSvg);
    const svgContentMap = Object.entries(svgContents);
    const sum = svgContentMap.length;

    svgContentMap.forEach(([filePath, svgString], index) => {
        const tempOptimizedPath = path.resolve(tempPath2SaveSvg, 'optimized', filePath);
        const result = optimize(svgString, {
            ...svgoConfig,
            path: tempOptimizedPath,
        }).data;
        const optimisedSvgString = result.replace(/stroke=['|"]currentColor['|"]/g, 'stroke={color}')
                                         .replace(/fill=['|"]currentColor['|"]/g, 'fill={color}')
                                         .replace('props="..."', '{...props}')
                                         .replace('ref="forwardedRef"', 'ref={forwardedRef}')
                                         .replace(/(\w+-\w+)="/g, (match) => `${_.camelCase(match)}="`);

        const componentName = filePath.split(path.sep).slice(-1).join() + 'Icon';
        const selfPath = filePath.split(path.sep).slice(0, -1).join(path.sep);
        const targetFileSavePath = path.resolve(targetSavePath, selfPath);

        const componentSource = ICON_TEMPLATE(componentName, filePath.split(path.sep).slice(0, -1).length, optimisedSvgString);

        if (!fs.existsSync(targetFileSavePath)) {
            console.log(targetSavePath, selfPath);
            fs.mkdirSync(targetFileSavePath, {recursive: true});
        }

        fs.writeFileSync(path.resolve(targetFileSavePath, componentName) + '.tsx', componentSource);

        UI.message(`Icon → React: Convert progress ${index + 1}/${sum}`);
    });

    fs.writeFileSync(path.resolve(targetSavePath, 'types.ts'), TYPE_TEMPLATE);

    // clear temp directory
    fs.rmdirSync(tempPath2SaveSvg);

    fiber.cleanup();
}
