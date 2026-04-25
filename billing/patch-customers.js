const fs = require('fs');
const file = 'D:/PROJECT/RT-RWNET_PAKAAM/frontend/src/app/(dashboard)/customers/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state
if (!code.includes('activeSessions')) {
    code = code.replace(
        /const \[customers, setCustomers\] = useState<Customer\[\]>\(\[\]\);/,
        const [customers, setCustomers] = useState<Customer[]>([]);\n  const [activeSessions, setActiveSessions] = useState<Record<string, any>>({});
    );

    // Add fetch active sessions inside fetchCustomers or a separate useEffect
    const fetchCustomersFn = 
  const fetchActiveSessions = async () => {
    try {
      const res = await api.get('/monitor/customers/active');
      if (res && res.active_usernames) {
        setActiveSessions(res.active_usernames);
      }
    } catch(err) { console.error('Failed active sessions', err); }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);
    ;
    code = code.replace('useEffect(() => {', fetchCustomersFn + '\n  useEffect(() => {');

    // Add Online Badge below Mikrotik Username
    const originalRender = <p className="text-xs text-gray-500">{c.mikrotik_username}</p>;
    const replacementRender = <p className="text-xs text-gray-500 flex items-center space-x-2">
                            <span>{c.mikrotik_username}</span>
                            {activeSessions[c.mikrotik_username] ? (
                              <span className="flex items-center text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                Online ({activeSessions[c.mikrotik_username].uptime || '0s'})
                              </span>
                            ) : (
                              <span className="flex items-center text-[10px] text-slate-500 font-semibold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
                                Offline
                              </span>
                            )}
                          </p>;
    code = code.replace(originalRender, replacementRender);

    fs.writeFileSync(file, code);
    console.log('Customers list patched successfully with active sessions.');
} else {
    console.log('Already patched.');
}
