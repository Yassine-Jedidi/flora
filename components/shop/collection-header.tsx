"use client";

import { motion } from "motion/react";

interface CollectionHeaderProps {
    title: string;
    subtitle: string;
    showCollectionWord?: boolean;
    isSale?: boolean;
}

export function CollectionHeader({ title, subtitle, showCollectionWord = true, isSale = false }: CollectionHeaderProps) {
    return (
        <div className="relative overflow-hidden bg-white pt-12 pb-12 flex items-center justify-center">
            {/* Simple Dotted Pattern Background */}
            <div
                className="absolute inset-0 opacity-[0.2]"
                style={{
                    backgroundImage: `radial-gradient(${isSale ? 'oklch(0.637 0.237 25.331)' : 'var(--primary)'} 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                {/* Floating Ornaments */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 left-[10%] text-2xl opacity-40"
                    >
                        {isSale ? '🔥' : '✨'}
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 12, 0],
                            rotate: [0, -15, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-10 right-[15%] text-xl opacity-30"
                    >
                        {isSale ? '🏷️' : '🌸'}
                    </motion.div>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 right-[25%] text-sm"
                    >
                        {isSale ? '💥' : '✨'}
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute top-1/2 left-[20%] text-lg opacity-25"
                    >
                        {isSale ? '🎈' : '🎀'}
                    </motion.div>
                </div>

                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Minimal Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <span className={`px-5 py-1.5 rounded-full ${isSale ? 'bg-red-50 text-red-500 border-red-100' : 'bg-pink-50/50 text-primary border-pink-100/30'} text-[10px] font-black uppercase tracking-[0.3em] border`}>
                            {isSale ? 'Limited Time Sparkle' : 'Exclusive Treasures'}
                        </span>
                    </motion.div>

                    {/* Clean Title */}
                    <div className="relative">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none flex flex-col md:flex-row items-center justify-center gap-x-6">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-flora-dark relative"
                            >
                                {title}
                            </motion.span>
                            {showCollectionWord && (
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-primary drop-shadow-sm whitespace-nowrap"
                                >
                                    Collection
                                </motion.span>
                            )}
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-10"
                    >
                        <p className="text-[#8B7E84]/80 text-lg md:text-xl font-medium tracking-tight max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
