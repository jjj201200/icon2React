export default (name, depth = 0, svgString) => `import * as React from 'react';
import {IconProps} from '${depth ? Array(depth).fill('..').join('/') : '.'}/types';

export const ${name}Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({color = 'currentColor', ...props}, forwardedRef) => {
        return ${svgString};
    }
);
${name}Icon.displayName = '${name}Icon';

export default ${name}Icon;`
