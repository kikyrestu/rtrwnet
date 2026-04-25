const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('D:/PROJECT/RT-RWNET_PAKAAM/frontend/src/app', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let edited = false;
        if (content.includes("import Swal from 'sweetalert2';")) {
            content = content.replace(/import Swal from 'sweetalert2';/g, "import Swal from '@/lib/swal';");
            edited = true;
        }
        if (content.includes("background: '#1e293b'")) {
            content = content.replace(/background:\s*'#1e293b',?/g, "");
            edited = true;
        }
        if (content.includes("color: '#f8fafc'")) {
            content = content.replace(/color:\s*'#f8fafc',?/g, "");
            edited = true;
        }
        if (edited) {
            fs.writeFileSync(filePath, content);
            console.log("Updated: " + filePath);
        }
    }
});