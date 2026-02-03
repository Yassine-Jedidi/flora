"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession, changePassword, signOut } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    MapPin,
    Shield,
    Loader2,
} from "lucide-react";
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} from "@/app/actions/address";
import { updateProfile, getUserSessions, revokeSession, checkUserHasPassword, setUserPassword, getUserAccounts, deleteUserAccount } from "@/app/actions/user";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// Sub-components
import { ProfileHero } from "./profile-hero";
import { AddressSection } from "./address-section";
import { AccountSection } from "./account-section";
import { SecuritySection } from "./security-section";

// Modals
import { AddressModal } from "./modals/address-modal";
import { EditProfileModal } from "./modals/edit-profile-modal";
import { PasswordModal } from "./modals/password-modal";
import { DeleteAccountModal } from "./modals/delete-account-modal";

function ProfileContent() {
    const t = useTranslations("Profile");
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

    // Change Password State
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [hasPassword, setHasPassword] = useState<boolean>(true);

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

    // Linked Accounts State
    const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

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
            loadAccounts();
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            checkUserHasPassword().then((res) => {
                if (res.success) {
                    setHasPassword(res.hasPassword ?? false);
                }
            });
        }
    }, [session]);

    // Track if user was previously logged in to differentiate between "Sign Out" and "Direct Access"
    const wasLoggedIn = useRef(false);

    useEffect(() => {
        if (session) {
            wasLoggedIn.current = true;
        }
    }, [session]);

    useEffect(() => {
        if (!isSessionPending && !session) {
            if (wasLoggedIn.current) {
                // User was logged in and now is not (Sign Out) -> Go Home
                router.push("/");
            } else {
                // User was never logged in (Direct Access) -> Go Sign In
                router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            }
        }
    }, [isSessionPending, session, router, pathname]);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        const result = await getUserSessions();
        if (result.success) {
            setSessions(result.data || []);
        }
        setIsLoadingSessions(false);
    };

    const loadAccounts = async () => {
        setIsLoadingAccounts(true);
        const result = await getUserAccounts();
        if (result.success) {
            setLinkedAccounts(result.data || []);
        }
        setIsLoadingAccounts(false);
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            const result = await revokeSession(sessionId);
            if (result.success) {
                toast.success(t("security.revokeSuccess"));
                loadSessions();
            } else {
                toast.error(result.error || t("security.revokeError"));
            }
        } catch (error) {
            toast.error(t("errors.unexpected"));
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
            if (addresses.length >= 4) {
                toast.error(t("addresses.limitReached"));
                return;
            }
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
            toast.error(t("addresses.fillAllFields"));
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
                toast.success(editingAddress ? t("addresses.updateSuccess") : t("addresses.saveSuccess"));
                setIsAddressModalOpen(false);
                loadAddresses();
            } else {
                toast.error(result.error || t("errors.unexpected"));
            }
        } catch (error) {
            toast.error(t("errors.saveAddress"));
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string, name: string) => {
        if (!confirm(t("addresses.card.deleteConfirm", { name }))) return;

        try {
            const result = await deleteAddress(id);
            if (result.success) {
                toast.success(t("addresses.deleteSuccess"));
                loadAddresses();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(t("errors.deleteAddress"));
        }
    };

    const handleSetDefaultAddress = async (address: any) => {
        try {
            // Only update the isDefault field, not the entire address
            const result = await updateAddress(address.id, {
                isDefault: true
            });

            if (result.success) {
                toast.success(t("addresses.defaultSuccess"));
                loadAddresses();
            } else {
                toast.error(result.error || t("errors.unexpected"));
            }
        } catch (error) {
            toast.error(t("errors.unexpected"));
        }
    };

    const handleUpdateProfile = async () => {
        if (!profileName.trim()) {
            toast.error(t("editProfile.nameEmpty"));
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const result = await updateProfile({
                name: profileName,
                image: profileImage || undefined
            });
            if (result.success) {
                toast.success(t("editProfile.success"));
                setIsProfileModalOpen(false);
                router.refresh(); // This will refresh the server components
                // Force a reload to ensure the new image is fetched fresh if needed
                window.location.reload();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(t("errors.updateProfile"));
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        if ((hasPassword && !passwordForm.currentPassword) || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error(t("passwordModal.fillAllFields"));
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(t("passwordModal.mismatch"));
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error(t("passwordModal.length"));
            return;
        }

        if (hasPassword && passwordForm.newPassword === passwordForm.currentPassword) {
            toast.error(t("passwordModal.sameAsOld"));
            return;
        }

        setIsChangingPassword(true);
        if (!hasPassword) {
            // Set password for the first time
            try {
                const result = await setUserPassword(passwordForm.newPassword);
                if (result.success) {
                    toast.success(t("passwordModal.successSet"));
                    setIsChangePasswordModalOpen(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setHasPassword(true);
                    router.refresh();
                } else {
                    toast.error(result.error || t("errors.setPassword"));
                }
            } catch (error) {
                toast.error(t("errors.unexpected"));
            }
            setIsChangingPassword(false);
            return;
        }

        // Change existing password
        try {
            await changePassword({
                newPassword: passwordForm.newPassword,
                currentPassword: passwordForm.currentPassword,
                revokeOtherSessions: true,
            }, {
                onSuccess: () => {
                    toast.success(t("passwordModal.successChange"));
                    setIsChangePasswordModalOpen(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || t("errors.changePassword"));
                }
            });
        } catch (error) {
            toast.error(t("errors.unexpected"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const result = await deleteUserAccount();
            if (result.success) {
                toast.success(t("deleteAccount.success"));
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/");
                        }
                    }
                });
            } else {
                toast.error(result.error || t("errors.deleteAccount"));
                setIsDeletingAccount(false);
            }
        } catch (error) {
            toast.error(t("errors.unexpected"));
            setIsDeletingAccount(false);
        }
    };

    if (isSessionPending || !session) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 md:pt-32 md:pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProfileHero
                        session={session}
                        onEditProfile={() => {
                            setProfileName(session.user.name ?? "");
                            setProfileImage(session.user.image || null);
                            setIsProfileModalOpen(true);
                        }}
                    />

                    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-8 md:space-y-12">
                        <div className="flex justify-center">
                            <TabsList className="bg-gray-100/50 p-1 rounded-full h-12 md:h-16 border border-gray-100">
                                <TabsTrigger
                                    value="addresses"
                                    className="rounded-full px-4 md:px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[10px] md:text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <MapPin className="w-4 h-4 min-[400px]:mr-2" />
                                    <span className="hidden min-[400px]:inline">{t("tabs.addresses")}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="account"
                                    className="rounded-full px-4 md:px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[10px] md:text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <User className="w-4 h-4 min-[400px]:mr-2" />
                                    <span className="hidden min-[400px]:inline">{t("tabs.account")}</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className="rounded-full px-4 md:px-8 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg font-black text-[10px] md:text-xs uppercase tracking-widest transition-all h-full"
                                >
                                    <Shield className="w-4 h-4 min-[400px]:mr-2" />
                                    <span className="hidden min-[400px]:inline">{t("tabs.security")}</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="addresses" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AddressSection
                                addresses={addresses}
                                isLoadingAddresses={isLoadingAddresses}
                                onAddAddress={() => handleOpenAddressModal()}
                                onEditAddress={handleOpenAddressModal}
                                onDeleteAddress={handleDeleteAddress}
                                onSetDefaultAddress={handleSetDefaultAddress}
                            />
                        </TabsContent>

                        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AccountSection
                                session={session}
                                onEditProfile={() => {
                                    setProfileName(session.user.name ?? "");
                                    setProfileImage(session.user.image || null);
                                    setIsProfileModalOpen(true);
                                }}
                                addresses={addresses}
                                linkedAccounts={linkedAccounts}
                                isLoadingAccounts={isLoadingAccounts}
                            />
                        </TabsContent>

                        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SecuritySection
                                sessions={sessions}
                                isLoadingSessions={isLoadingSessions}
                                onRevokeSession={handleRevokeSession}
                                onOpenPasswordModal={() => setIsChangePasswordModalOpen(true)}
                                onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
                                hasPassword={hasPassword}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />

            <AddressModal
                isOpen={isAddressModalOpen}
                onOpenChange={setIsAddressModalOpen}
                editingAddress={editingAddress}
                addressForm={addressForm}
                setAddressForm={setAddressForm}
                isSavingAddress={isSavingAddress}
                onSave={handleSaveAddress}
            />

            <EditProfileModal
                isOpen={isProfileModalOpen}
                onOpenChange={setIsProfileModalOpen}
                session={session}
                profileName={profileName}
                setProfileName={setProfileName}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
                isUpdatingProfile={isUpdatingProfile}
                isUploadingImage={isUploadingImage}
                setIsUploadingImage={setIsUploadingImage}
                onUpdate={handleUpdateProfile}
            />

            <PasswordModal
                isOpen={isChangePasswordModalOpen}
                onOpenChange={setIsChangePasswordModalOpen}
                hasPassword={hasPassword}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                isChangingPassword={isChangingPassword}
                onSave={handlePasswordChange}
            />

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                isDeletingAccount={isDeletingAccount}
                onDelete={handleDeleteAccount}
            />
        </div>
    );
}

export function ProfileClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
