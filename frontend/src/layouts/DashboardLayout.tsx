import React, { useState } from 'react';
import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import {
    User,
    Search,
    LayoutDashboard,
    MessageSquare,
    BookOpen,
    CalendarCheck,
    FileText,
    Menu,
    LogOut,
    TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(167,139,250,0.3)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
            )
        }
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const DashboardLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-white selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-surface/50 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-purple-900/50">
                        <span className="font-bold text-white text-sm">PK</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Project K's
                    </span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
                    <SidebarItem icon={MessageSquare} label="AI Chat" to="/chat" />
                    <SidebarItem icon={BookOpen} label="My Library" to="/library" />
                    <SidebarItem icon={FileText} label="DocSpace" to="/docs" />
                    <SidebarItem icon={CalendarCheck} label="Tasks" to="/tasks" />
                    <SidebarItem icon={TrendingUp} label="Analytics" to="/analytics" />
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <SidebarItem icon={User} label="Profile" to="/profile" />
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/5 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full translate-y-[-50%]" />

                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-10">
                    <div className="text-gray-400 flex items-center gap-2">
                        <Menu
                            className="w-6 h-6 md:hidden cursor-pointer hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        />
                        <div className="relative group hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search papers, chats..."
                                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profile"
                            className="w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-gray-400 hover:text-white"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 md:p-8 z-10 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
