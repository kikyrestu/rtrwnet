'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 relative print:bg-white print:text-black">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 print:hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="print:hidden">
                <Sidebar />
            </div>
            
            <div className="flex-1 z-10 flex flex-col min-h-screen pl-64 print:pl-0">
                <div className="print:hidden">
                    <Navbar />
                </div>
                <main className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible">
                    {children}
                </main>
            </div>
        </div>
    );
}
