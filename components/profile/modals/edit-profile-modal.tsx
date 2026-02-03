"use client";

import { useTranslations } from "next-intl";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { deleteUploadedFile } from "@/app/actions/user";

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    session: any;
    profileName: string;
    setProfileName: (name: string) => void;
    profileImage: string | null;
    setProfileImage: (image: string | null) => void;
    isUpdatingProfile: boolean;
    isUploadingImage: boolean;
    setIsUploadingImage: (uploading: boolean) => void;
    onUpdate: () => Promise<void>;
}

export function EditProfileModal({
    isOpen,
    onOpenChange,
    session,
    profileName,
    setProfileName,
    profileImage,
    setProfileImage,
    isUpdatingProfile,
    isUploadingImage,
    setIsUploadingImage,
    onUpdate
}: EditProfileModalProps) {
    const t = useTranslations("Profile");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl md:rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-md bg-white">
                <div className="p-5 md:p-6 lg:p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-black text-flora-dark text-center flex items-center justify-center gap-2">
                            {t("editProfile.title")}
                            <User className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-gray-400">
                            {t("editProfile.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("editProfile.profilePicture")}</Label>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white group">
                                    {profileImage ? (
                                        <Image
                                            src={profileImage}
                                            alt="Profile"
                                            fill
                                            sizes="128px"
                                            className="object-cover"
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
                                        toast.info(t("editProfile.uploading"), { duration: 2000 });
                                    }}
                                    onClientUploadComplete={async (res) => {
                                        try {
                                            if (res && res[0]) {
                                                // If we have a previous un-saved upload, delete it
                                                if (profileImage && profileImage !== session?.user?.image) {
                                                    await deleteUploadedFile(profileImage);
                                                }

                                                setProfileImage(res[0].url);
                                                toast.success(t("editProfile.uploadSuccess"));
                                            }
                                        } finally {
                                            setIsUploadingImage(false);
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        setIsUploadingImage(false);
                                        toast.error(t("editProfile.uploadError", { message: error.message }));
                                    }}
                                    appearance={{
                                        button: `text-xs font-bold px-4 py-2 h-auto rounded-xl ${isUploadingImage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#FF75AA]'}`,
                                        allowedContent: "text-[10px] text-gray-400 font-bold"
                                    }}
                                    content={{
                                        button({ ready }) {
                                            if (ready) return t("editProfile.uploadBtn");
                                            return t("editProfile.uploading");
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("editProfile.fullName")}</Label>
                            <Input
                                placeholder={t("editProfile.fullNamePlaceholder")}
                                className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 py-4 md:py-7 px-5 font-bold text-base md:text-lg text-flora-dark"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={onUpdate}
                            disabled={isUpdatingProfile || isUploadingImage}
                            className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-4 md:py-8 font-black text-lg md:text-xl shadow-xl shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdatingProfile ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                    <span>{t("editProfile.saving")}</span>
                                </div>
                            ) : isUploadingImage ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                    <span>{t("editProfile.uploading")}</span>
                                </div>
                            ) : (
                                t("editProfile.submit")
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
