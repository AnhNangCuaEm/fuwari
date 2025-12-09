"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.8,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();

  const lines = words.split("\n");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.1),
      }
    );
  }, [animate, duration, filter]);

  const renderWords = () => {
    let charIndex = 0;
    return (
      <motion.div ref={scope}>
        {lines.map((line, lineIdx) => (
          <div key={lineIdx}>
            {line.split("").map((char) => {
              charIndex++;
              return (
                <motion.span
                  key={charIndex}
                  className="opacity-0"
                  style={{
                    filter: filter ? "blur(10px)" : "none",
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
            {lineIdx < lines.length - 1 && <br />}
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div>
        <div>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};