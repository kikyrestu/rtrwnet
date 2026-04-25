const fs = require('fs');
const path = require('path');
function walk(dir) {
    let count = 0;
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            count += walk(p);
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            let c = fs.readFileSync(p, 'utf8');
            if (c.includes('alert(')) {
                let nC = c.replace(/import (.*?) from '(.*?)';/, "$&\nimport Swal from 'sweetalert2';");
                nC = nC.replace(/alert\((.*)\)/g, "Swal.fire({text: $1, background: '#1e293b', color: '#f8fafc', icon: 'info'})");
                fs.writeFileSync(p, nC);
                console.log('Fixed alerts in ' + p);
                count++;
            }
        }
    });
    return count;
}
console.log('Total fixed:', walk('D:/PROJECT/RT-RWNET_PAKAAM/frontend/src'));