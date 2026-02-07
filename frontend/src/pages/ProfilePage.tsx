import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Building,
    LogOut,
    HelpCircle,
    ShieldCheck,
    CreditCard,
    CheckCircle2,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getCurrentUser, logout, updateCurrentUser } from '../services/auth';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                setUser(data);
                setFullName(data.full_name || data.name || '');
                setCompanyName(data.company || '');
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updateData: any = {
                full_name: fullName,
                company: companyName
            };
            if (newPassword.trim()) {
                updateData.password = newPassword;
            }
            const updatedUser = await updateCurrentUser(updateData);
            setUser(updatedUser);
            setNewPassword('');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const plans = [
        { name: 'Basic', price: 'Free', features: ['3 Daily Syntheses', '1GB Storage', 'Community Support'] },
        { name: 'Premium', price: '$29/mo', features: ['Unlimited Syntheses', '10GB Storage', 'Priority Agents', 'DocSpace Access'], active: true },
        { name: 'Enterprise', price: 'Custom', features: ['Custom Agent Training', 'Unlimited Storage', 'API Access', '24/7 Support'] }
    ];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center p-12 bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Unauthorized</h2>
                <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
                <button onClick={() => navigate('/login')} className="bg-primary text-black px-6 py-2 rounded-xl font-bold">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
                    <p className="text-gray-400 mt-1">Manage your research profile and subscription plans</p>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: User Details */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6"
                    >
                        <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-900/40">
                                {(user.full_name || user.name || 'U').charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user.full_name || user.name}</h2>
                                <p className="text-sm text-primary flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    {user.plan || 'Premium'} Account
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Information</h3>
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-primary/20"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl text-white">
                                        <User className="w-4 h-4 text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="bg-transparent border-none focus:ring-0 w-full p-0 text-white text-sm"
                                            />
                                        ) : (
                                            <span className="text-sm">{user.full_name || user.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                    <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl text-white/50 cursor-not-allowed">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        {isEditing ? "New Password (leave blank to keep current)" : "Password"}
                                    </label>
                                    <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl text-white">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={isEditing ? newPassword : "********"}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            readOnly={!isEditing}
                                            placeholder={isEditing ? "Enter new password" : ""}
                                            className="bg-transparent border-none focus:ring-0 flex-1 p-0 text-white text-sm"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Company / Institution</label>
                                    <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl text-white">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="bg-transparent border-none focus:ring-0 w-full p-0 text-white text-sm"
                                                placeholder="Enter company name"
                                            />
                                        ) : (
                                            <span className="text-sm">{user.company || 'Not Specified'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Get Help
                            </button>
                            <button
                                onClick={logout}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Plans */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Subscription Plans
                    </h3>

                    <div className="space-y-4">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.name}
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                    "p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                                    plan.active
                                        ? "bg-primary/10 border-primary/50"
                                        : "bg-surface/40 border-white/5 hover:border-white/20"
                                )}
                            >
                                {plan.active && (
                                    <div className="absolute top-0 right-0 p-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                                <p className="text-2xl font-black text-white mt-2">{plan.price}</p>
                                <ul className="mt-4 space-y-2">
                                    {plan.features.map(f => (
                                        <li key={f} className="text-xs text-gray-400 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={cn(
                                    "w-full mt-6 py-2 rounded-lg text-xs font-bold transition-all",
                                    plan.active
                                        ? "bg-primary text-black"
                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                )}>
                                    {plan.active ? 'Current Plan' : 'Upgrade Plan'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
