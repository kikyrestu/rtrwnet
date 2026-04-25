const fs = require('fs');
let code = fs.readFileSync('d:/PROJECT/RT-RWNET_PAKAAM/frontend/src/app/(dashboard)/dashboard/page.tsx', 'utf8');

if (!code.includes('handlePayInvoice')) {
    const rf = 
    const handlePayInvoice = async (invoiceId: string) => {
        try {
            await api.post('/invoices/' + invoiceId + '/pay', {});
            const res = await api.get('/dashboard-summary');
            setData(res);
        } catch (err: any) {
            console.error('Failed to pay invoice', err.response?.data || err);
            alert(err.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    useEffect(() => {
    ;
    code = code.replace(/useEffect\(\(\) => \{/, rf);
    
    // find 'Konfirmasi Lunas ' + user.name + ' secara manual segera rilis.'
    code = code.replace(/<button onClick=\{\(\) => alert\('Konfirmasi Lunas ' \+ (\w+)\.name \+ ' secara manual segera rilis\.'\)\}[^>]+>([^<]+)<\/button>/g, '<button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handlePayInvoice(.id); }} className=\"w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors\"></button>');
    fs.writeFileSync('d:/PROJECT/RT-RWNET_PAKAAM/frontend/src/app/(dashboard)/dashboard/page.tsx', code);
    console.log('Patched');
} else {
    console.log('Already');
}
