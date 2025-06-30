import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileCardProps {
    user: any; // You might want to define a more specific type for user
    level: number;
    xp: number;
    nextLevelXp: number;
    progressPercentage: number;
    isCollapsed: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = React.memo(
    ({ user, level, xp, nextLevelXp, progressPercentage, isCollapsed }) => {
        return (
            <div className={`p-6 border-b border-teal-500/20 ${isCollapsed ? 'p-3' : 'p-6'}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                            {user?.firstName?.charAt(0)}
                        </span>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1"
                            >
                                <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-sm text-gray-400">Level {level}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* XP Progress */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-hidden"
                        >
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>XP Progress</span>
                                <span>
                                    {xp} / {nextLevelXp}
                                </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <motion.div
                                    className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-green-500"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${progressPercentage}%`
                                    }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.isCollapsed === nextProps.isCollapsed &&
            prevProps.level === nextProps.level &&
            prevProps.xp === nextProps.xp &&
            prevProps.nextLevelXp === nextProps.nextLevelXp &&
            prevProps.progressPercentage === nextProps.progressPercentage &&
            prevProps.user?.firstName === nextProps.user?.firstName &&
            prevProps.user?.lastName === nextProps.user?.lastName
        );
    }
); 