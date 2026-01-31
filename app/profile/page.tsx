"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    MapPin,
    Bell,
    Shield,
    Plus,
    Pencil,
    Trash2,
    Home,
    Briefcase,
    Phone,
    Mail,
    Globe,
    ChevronRight,
    Loader2,
    Laptop,
    Smartphone,
    LogOut,
    Calendar,
    CheckCircle2,
    Fingerprint
} from "lucide-react";
import { Bow } from "@/components/icons/bow";
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} from "@/app/actions/address";
import { updateProfile, getUserSessions, revokeSession, deleteUploadedFile } from "@/app/actions/user";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TUNISIA_GOVERNORATES, TUNISIA_LOCATIONS } from "@/lib/constants/tunisia";
import { UploadButton } from "@/lib/uploadthing";

export default function ProfilePage() {
    const { data: session, isPending: isSessionPending } = useSession();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Profile Update State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentTab = searchParams.get("tab") || "addresses";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Sessions State
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    // Form state for address
    const [addressForm, setAddressForm] = useState({
        name: "",
        fullName: "",
        phoneNumber: "",
        governorate: "",
        city: "",
        detailedAddress: "",
    });

    useEffect(() => {
        if (session) {
            loadAddresses();
            loadSessions();
        }
    }, [session]);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        const result = await getUserSessions();
        if (result.success) {
            setSessions(result.data || []);
        }
        setIsLoadingSessions(false);
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            const result = await revokeSession(sessionId);
            if (result.success) {
                toast.success("Session revoked 🔒");
                loadSessions();
            } else {
                toast.error(result.error || "Failed to revoke session");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const loadAddresses = async () => {
        setIsLoadingAddresses(true);
        const result = await getAddresses();
        if (result.success) {
            setAddresses(result.data || []);
        }
        setIsLoadingAddresses(false);
    };

    const handleOpenAddressModal = (address?: any) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                name: address.name,
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                governorate: address.governorate,
                city: address.city,
                detailedAddress: address.detailedAddress,
            });
        } else {
            setEditingAddress(null);
            setAddressForm({
                name: "",
                fullName: session?.user?.name || "",
                phoneNumber: "",
                governorate: "",
                city: "",
                detailedAddress: "",
            });
        }
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async () => {
        // Validation
        if (!addressForm.name || !addressForm.fullName || !addressForm.phoneNumber || !addressForm.governorate || !addressForm.city || !addressForm.detailedAddress) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSavingAddress(true);
        try {
            let result;
            if (editingAddress) {
                result = await updateAddress(editingAddress.id, addressForm);
            } else {
                result = await createAddress(addressForm);
            }

            if (result.success) {
                toast.success(editingAddress ? "Address updated! 🎀" : "Address saved! 🎀");
                setIsAddressModalOpen(false);
                loadAddresses();
            } else {
                toast.error(result.error || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Failed to save address.");
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const result = await deleteAddress(id);
            if (result.success) {
                toast.success("Address deleted.");
                loadAddresses();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to delete address.");
        }
    };

    const handleSetDefaultAddress = async (address: any) => {
        try {
            const result = await updateAddress(address.id, {
                ...address,
                isDefault: true
            });

            if (result.success) {
                toast.success("Default address updated! 🎀");
                loadAddresses();
            } else {
                toast.error(result.error || "Failed to set default address");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleUpdateProfile = async () => {
        if (!profileName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const result = await updateProfile({
                name: profileName,
                image: profileImage || undefined
            });
            if (result.success) {
                toast.success("Profile updated! ✨");
                setIsProfileModalOpen(false);
                router.refresh(); // This will refresh the server components
                // Force a reload to ensure the new image is fetched fresh if needed
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const selectedGov = addressForm.governorate;
    const availableCities = selectedGov ? TUNISIA_LOCATIONS[selectedGov] || [] : [];

    if (isSessionPending) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <Navbar />
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-flora-dark">Not Signed In</h1>
                    <p className="text-gray-500 font-bold">Please sign in to view your profile and manage your addresses.</p>
                    <Button asChild className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-6 font-black text-lg shadow-xl shadow-pink-100">
                        <Link href="/signin">Sign In Now</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-12 rounded-[40px] bg-gradient-to-br from-flora-purple/10 via-pink-50/50 to-white p-8 lg:p-12 overflow-hidden border border-pink-50">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-flora-purple rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-flora-dark">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-4xl lg:text-5xl font-black text-flora-dark tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                                    Hello, {session.user.name.split(' ')[0]}!
                                    <Bow className="w-8 h-8 text-primary animate-bounce-slow" />
                                </h1>
                                <p className="text-gray-500 font-bold flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4 text-pink-300" />
                                    {session.user.email}
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    setProfileName(session.user.name);
                                    setProfileImage(session.user.image || null);
                                    setIsProfileModalOpen(true);
                                }}
                                className="bg-white hover:bg-pink-50 text-flora-dark border border-pink-100 rounded-full px-8 py-6 font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105"
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </div>

                    {/* Profile Tabs */}
                    {/* Profile Tabs */}
                    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-12">
                        <div className="flex justify-center">
                            <TabsList className="bg-gray-100/50 p-1 rounded-full h-16 border border-gray-100">
                                <TabsTrigger
                                    value="addresses"
                                    className="rounded-full px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Addresses
                                </TabsTrigger>
                                <TabsTrigger
                                    value="account"
                                    className="rounded-full px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="rounded-full px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Security
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Addresses Content */}
                        <TabsContent value="addresses" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-4 space-y-4">
                                    <h2 className="text-2xl font-black text-flora-dark">Saved Addresses</h2>
                                    <p className="text-gray-400 font-bold leading-relaxed">
                                        Manage your shipping locations for a faster, seamless checkout experience across all your devices.
                                    </p>
                                    <Button
                                        onClick={() => handleOpenAddressModal()}
                                        className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-2xl py-8 font-black text-lg shadow-lg shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add New Address
                                    </Button>
                                </div>

                                <div className="lg:col-span-8">
                                    {isLoadingAddresses ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="h-48 bg-gray-50 rounded-[40px] animate-pulse border border-gray-100" />
                                            ))}
                                        </div>
                                    ) : addresses.length === 0 ? (
                                        <div className="bg-pink-50/20 rounded-[40px] border-2 border-dashed border-pink-100 p-12 text-center">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <MapPin className="w-8 h-8 text-pink-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-flora-dark mb-2">No addresses yet</h3>
                                            <p className="text-gray-400 font-bold mb-6">You haven't saved any shipping addresses yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className={`group relative bg-white p-8 rounded-[40px] border-2 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/30 ${addr.isDefault ? "border-primary bg-pink-50/5" : "border-pink-50 hover:border-pink-100"
                                                        }`}
                                                >
                                                    {addr.isDefault && (
                                                        <div className="absolute top-6 right-6">
                                                            <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-pink-200">
                                                                Default
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col h-full">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className={`p-2 rounded-xl ${addr.name.toLowerCase() === 'home' ? 'bg-blue-50 text-blue-400' : addr.name.toLowerCase() === 'work' ? 'bg-purple-50 text-purple-400' : 'bg-gray-50 text-gray-400'}`}>
                                                                {addr.name.toLowerCase() === 'home' ? <Home className="w-4 h-4" /> : addr.name.toLowerCase() === 'work' ? <Briefcase className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                            </div>
                                                            <h4 className="font-black text-flora-dark uppercase tracking-widest text-xs">{addr.name}</h4>
                                                        </div>

                                                        <div className="space-y-1 mb-8 flex-1">
                                                            <p className="font-black text-flora-dark text-lg">{addr.fullName}</p>
                                                            <p className="font-bold text-gray-400 text-sm flex items-center gap-2">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                {addr.phoneNumber}
                                                            </p>
                                                            <p className="font-bold text-gray-400 text-sm mt-3 leading-relaxed">
                                                                {addr.detailedAddress},<br />
                                                                {addr.city}, {addr.governorate}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3 pt-4 border-t border-pink-50">
                                                            <button
                                                                onClick={() => handleOpenAddressModal(addr)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-pink-50 hover:text-primary transition-all group/btn"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                                                                Edit
                                                            </button>
                                                            {!addr.isDefault && (
                                                                <button
                                                                    onClick={() => handleSetDefaultAddress(addr)}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-pink-50 hover:text-primary transition-all group/btn"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="24"
                                                                        height="24"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110"
                                                                    >
                                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                                                    </svg>
                                                                    Set Default
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr.id, addr.name)}
                                                                className="w-12 flex items-center justify-center py-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group/del"
                                                            >
                                                                <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Other content placeholders */}
                        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm p-8 max-w-2xl mx-auto">
                                <h3 className="text-2xl font-black text-flora-dark mb-8">Personal Information</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">Your Name</Label>
                                            <div className="relative group/input cursor-pointer" onClick={() => {
                                                setProfileName(session.user.name);
                                                setProfileImage(session.user.image || null);
                                                setIsProfileModalOpen(true);
                                            }}>
                                                <Input
                                                    value={session.user.name}
                                                    readOnly
                                                    className="rounded-2xl border-gray-100 bg-gray-50/50 py-7 px-5 font-bold text-flora-dark text-lg cursor-pointer group-hover/input:bg-pink-50/50 group-hover/input:border-pink-100 transition-all"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <Pencil className="w-4 h-4 text-gray-300 group-hover/input:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">Email Address</Label>
                                            <div className="relative">
                                                <Input
                                                    value={session.user.email}
                                                    disabled
                                                    className="rounded-2xl border-gray-100 bg-gray-50/50 py-7 px-5 font-bold text-flora-dark text-lg"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <Mail className="w-5 h-5 text-gray-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">Member Since</Label>
                                            <div className="relative">
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 py-4 px-5 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-flora-dark text-sm">
                                                            {new Date(session.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Flora</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">Account Status</Label>
                                            <div className="relative">
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 py-4 px-5 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.user.emailVerified ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                                        {session.user.emailVerified ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-flora-dark text-sm">
                                                            {session.user.emailVerified ? 'Verified Account' : 'Unverified'}
                                                        </p>
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${session.user.emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {session.user.emailVerified ? 'Active & Secure' : 'Action Required'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[30px] bg-purple-50/50 border border-purple-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                    <Globe className="w-6 h-6 text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-flora-dark">Account Details</h4>
                                                    <p className="text-xs font-bold text-purple-400">Connected via Email</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-white text-purple-500 hover:bg-white shadow-sm">Active</Badge>
                                        </div>

                                        <div className="pt-4 border-t border-purple-100/50 flex items-center gap-3">
                                            <Fingerprint className="w-4 h-4 text-purple-300" />
                                            <p className="font-mono text-[10px] text-purple-400 bg-white/50 px-2 py-1 rounded-md border border-purple-100 truncate w-full">
                                                ID: {session.user.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm p-8 max-w-2xl mx-auto space-y-8">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                        <Shield className="w-10 h-10 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-flora-dark mb-2">Security & Privacy</h3>
                                        <p className="text-gray-400 font-bold">Manage your account security and active devices.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50/50 rounded-[30px] p-6 border border-gray-100">
                                        <h4 className="font-black text-flora-dark mb-4 flex items-center gap-2">
                                            <Laptop className="w-5 h-5 text-primary" />
                                            Active Sessions
                                        </h4>

                                        <div className="space-y-4">
                                            {isLoadingSessions ? (
                                                <div className="flex justify-center p-4">
                                                    <Loader2 className="w-6 h-6 animate-spin text-pink-300" />
                                                </div>
                                            ) : sessions.length > 0 ? (
                                                sessions.map((sess) => (
                                                    <div key={sess.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sess.userAgent.toLowerCase().includes("mobile") ? "bg-purple-50" : "bg-blue-50"}`}>
                                                                {sess.userAgent.toLowerCase().includes("mobile") ? (
                                                                    <Smartphone className="w-5 h-5 text-purple-400" />
                                                                ) : (
                                                                    <Laptop className="w-5 h-5 text-blue-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-bold text-flora-dark text-sm">
                                                                    {sess.userAgent.toLowerCase().includes("windows") ? "Windows PC" :
                                                                        sess.userAgent.toLowerCase().includes("mac") ? "Macbook" :
                                                                            sess.userAgent.toLowerCase().includes("iphone") ? "iPhone" :
                                                                                sess.userAgent.toLowerCase().includes("android") ? "Android Device" : "Unknown Device"}
                                                                </p>
                                                                <p className="text-xs text-gray-400 font-medium">
                                                                    {sess.ipAddress} • {new Date(sess.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {sess.isCurrent ? (
                                                            <Badge className="bg-green-100 text-green-600 border-none hover:bg-green-100">Current</Badge>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevokeSession(sess.id)}
                                                                className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm text-center">No active sessions found.</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full rounded-2xl py-8 border-gray-100 text-flora-dark font-bold hover:bg-gray-50 flex items-center justify-between px-8 group">
                                        Change Password
                                        <ChevronRight className="w-5 h-5 opacity-30 group-hover:translate-x-1 transition-all" />
                                    </Button>

                                    <Button variant="outline" className="w-full rounded-2xl py-8 border-red-50 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 flex items-center justify-between px-8 group mt-4">
                                        Delete Account
                                        <LogOut className="w-5 h-5 opacity-30 group-hover:scale-110 transition-all" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />

            {/* Address Modal */}
            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-xl">
                    <div className="p-6 lg:p-8 space-y-6 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-flora-dark text-center flex items-center justify-center">
                                {editingAddress ? "Update Address" : "New Address"}
                                <MapPin className="ml-2 w-8 h-8 text-primary" />
                            </DialogTitle>
                            <DialogDescription className="text-center font-bold text-gray-400">
                                {editingAddress ? "Refine your shipping location details." : "Add a new treasure delivery destination."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Address Label (Home/Work/Other) */}
                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Address Name (e.g., Home, Office)</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Give your address a nickname"
                                        className="rounded-2xl border-pink-100 focus:ring-pink-200 py-7 px-5 font-bold text-lg text-flora-dark"
                                        value={addressForm.name}
                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Full Name</Label>
                                    <Input
                                        placeholder="Who's receiving the package?"
                                        className="rounded-2xl border-pink-100 focus:ring-pink-200 py-7 px-5 font-bold text-flora-dark"
                                        value={addressForm.fullName}
                                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Phone Number</Label>
                                    <Input
                                        placeholder="Mobile number"
                                        className="rounded-2xl border-pink-100 focus:ring-pink-200 py-7 px-5 font-bold text-flora-dark"
                                        value={addressForm.phoneNumber}
                                        onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Governorate</Label>
                                    <Select
                                        value={addressForm.governorate}
                                        onValueChange={(v) => setAddressForm({ ...addressForm, governorate: v, city: "" })}
                                    >
                                        <SelectTrigger className="w-full rounded-2xl border-pink-100 focus:ring-pink-200 h-14 font-bold text-flora-dark bg-white">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-pink-100 shadow-xl max-h-60">
                                            {TUNISIA_GOVERNORATES.map((gov) => (
                                                <SelectItem key={gov} value={gov} className="font-bold text-flora-dark rounded-xl my-1">{gov}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">City / Delegation</Label>
                                    <Select
                                        disabled={!selectedGov}
                                        value={addressForm.city}
                                        onValueChange={(v) => setAddressForm({ ...addressForm, city: v })}
                                    >
                                        <SelectTrigger className="w-full rounded-2xl border-pink-100 focus:ring-pink-200 h-14 font-bold text-flora-dark bg-white">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-pink-100 shadow-xl max-h-60">
                                            {availableCities.map((city) => (
                                                <SelectItem key={city} value={city} className="font-bold text-flora-dark rounded-xl my-1">{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Detailed Address</Label>
                                <Input
                                    placeholder="Street name, building, apartment..."
                                    className="rounded-2xl border-pink-100 focus:ring-pink-200 py-7 px-5 font-bold text-flora-dark"
                                    value={addressForm.detailedAddress}
                                    onChange={(e) => setAddressForm({ ...addressForm, detailedAddress: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleSaveAddress}
                                disabled={isSavingAddress}
                                className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-8 font-black text-xl shadow-xl shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {isSavingAddress ? (
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                ) : (
                                    editingAddress ? "Update Destination" : "Save Destination"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Update Modal */}
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-md">
                    <div className="p-6 lg:p-8 space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-flora-dark text-center flex items-center justify-center gap-2">
                                Edit Profile
                                <User className="w-8 h-8 text-primary" />
                            </DialogTitle>
                            <DialogDescription className="text-center font-bold text-gray-400">
                                Update your personal information.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Profile Picture</Label>
                                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center gap-4">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white group">
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <User className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <UploadButton
                                        endpoint="profileImage"
                                        onUploadBegin={() => {
                                            setIsUploadingImage(true);
                                            toast.info("Uploading image...", { duration: 2000 });
                                        }}
                                        onClientUploadComplete={async (res) => {
                                            if (res && res[0]) {
                                                // If we have a previous un-saved upload, delete it
                                                if (profileImage && profileImage !== session?.user?.image) {
                                                    await deleteUploadedFile(profileImage);
                                                }

                                                setProfileImage(res[0].url);
                                                setIsUploadingImage(false);
                                                toast.success("Image uploaded! Don't forget to save. 📸");
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            setIsUploadingImage(false);
                                            toast.error(`Error uploading: ${error.message}`);
                                        }}
                                        appearance={{
                                            button: `text-xs font-bold px-4 py-2 h-auto rounded-xl ${isUploadingImage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#FF75AA]'}`,
                                            allowedContent: "text-[10px] text-gray-400 font-bold"
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">Full Name</Label>
                                <Input
                                    placeholder="Your full name"
                                    className="rounded-2xl border-pink-100 focus:ring-pink-200 py-7 px-5 font-bold text-lg text-flora-dark"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleUpdateProfile}
                                disabled={isUpdatingProfile || isUploadingImage}
                                className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-8 font-black text-xl shadow-xl shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingProfile ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : isUploadingImage ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-7 h-7 animate-spin" />
                                        <span>Uploading Image...</span>
                                    </div>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
