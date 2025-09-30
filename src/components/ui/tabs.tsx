"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Tab = {
    title: string;
    value: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content?: string | React.ReactNode | any;
};

export const Tabs = ({
    tabs: propTabs,
    containerClassName,
    activeTabClassName,
    tabClassName,
    contentClassName,
}: {
    tabs: Tab[];
    containerClassName?: string;
    activeTabClassName?: string;
    tabClassName?: string;
    contentClassName?: string;
}) => {
    const [active, setActive] = useState<Tab>(propTabs[0]);
    const [tabs, setTabs] = useState<Tab[]>(propTabs);

    const moveSelectedTabToTop = (idx: number) => {
        const newTabs = [...propTabs];
        const selectedTab = newTabs.splice(idx, 1);
        newTabs.unshift(selectedTab[0]);
        setTabs(newTabs);
        setActive(newTabs[0]);
    };

    const [hovering, setHovering] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "flex flex-row items-center justify-center [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
                    containerClassName
                )}
            >
                {propTabs.map((tab, idx) => (
                    <button
                        key={tab.title}
                        onClick={() => {
                            moveSelectedTabToTop(idx);
                        }}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className={cn("relative px-4 py-2 rounded-full", tabClassName)}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {active.value === tab.value && (
                            <motion.div
                                layoutId="clickedbutton"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                className={cn(
                                    "absolute inset-0 bg-almond-6 rounded-full ",
                                    activeTabClassName
                                )}
                            />
                        )}

                        <span className="relative block text-black">
                            {tab.title}
                        </span>
                    </button>
                ))}
            </div>
            <FadeInDiv
                tabs={tabs}
                active={active}
                key={active.value}
                hovering={hovering}
                className={(contentClassName)}
            />
        </>
    );
};

export const FadeInDiv = ({
    className,
    tabs,
}: {
    className?: string;
    key?: string;
    tabs: Tab[];
    active: Tab;
    hovering?: boolean;
}) => {
    // Only render the active tab to avoid layout issues
    const activeTab = tabs[0];

    return (
        <div className="relative w-full">
            <motion.div
                key={activeTab.value}
                layoutId={activeTab.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn("w-full", className)}
            >
                {activeTab.content}
            </motion.div>
        </div>
    );
};
