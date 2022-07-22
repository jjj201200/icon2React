/**
 * Author: DrowsyFlesh
 * Create: 2022/7/22
 * Description:
 */
import path from '@skpm/path';
import fs from '@skpm/fs';

// 获取模板文件
export const getTemplateSource = (templateFile) => fs.readFileSync(
    path.resolve('./templates/', templateFile),
    {encoding: 'utf8'},
);
