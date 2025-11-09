"use client";

import { CornerRightUp } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  loadingDuration?: number;
  thinkingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  autoAnimate?: boolean;
  autoType?: {
    texts: string[];
    speed?: number;
    autoSubmit?: boolean;
    delayBetweenTexts?: number;
  };
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Ask me anything!",
  minHeight = 56,
  maxHeight = 200,
  loadingDuration = 3000,
  thinkingDuration = 1000,
  onSubmit,
  className,
  autoAnimate = false,
  autoType
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(autoAnimate);
  const [isAnimating, setIsAnimating] = useState(autoAnimate);
  const [isTyping, setIsTyping] = useState(false);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleSubmit = useCallback(async (valueToSubmit?: string) => {
    const value = valueToSubmit || inputValue;
    if (!value.trim() || submitted || isTyping) return;
    
    setSubmitted(true);
    await onSubmit?.(value);
    setInputValue("");
    adjustHeight(true);
    
    setTimeout(() => {
      setSubmitted(false);
    }, loadingDuration);
  }, [inputValue, submitted, isTyping, onSubmit, adjustHeight, loadingDuration]);

  // Auto-typing effect with multiple texts
  const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  
  useEffect(() => {
    if (!autoType || !autoType.texts || autoType.texts.length === 0) {
      console.log("Auto-type not triggered:", { autoType, hasTexts: autoType?.texts?.length });
      return;
    }

    console.log("Starting auto-type with texts:", autoType.texts);
    const texts = autoType.texts;
    const speed = autoType.speed || 50;
    const delayBetweenTexts = autoType.delayBetweenTexts || 2000;

    const typeText = (textIndex: number) => {
      if (textIndex >= texts.length) return;

      setIsTyping(true);
      setInputValue("");
      const textToType = texts[textIndex];
      let currentCharIndex = 0;

      // Clear any existing interval
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
      }

      typeIntervalRef.current = setInterval(() => {
        if (currentCharIndex < textToType.length) {
          setInputValue(textToType.slice(0, currentCharIndex + 1));
          adjustHeight();
          currentCharIndex++;
        } else {
          if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
          }
          setIsTyping(false);
          
          // Auto-submit if enabled
          if (autoType.autoSubmit) {
            const submitTimeout = setTimeout(async () => {
              setSubmitted(true);
              await onSubmit?.(textToType);
              setInputValue("");
              adjustHeight(true);
              const resetTimeout = setTimeout(() => {
                setSubmitted(false);
                
                // Move to next text after delay
                if (textIndex < texts.length - 1) {
                  const nextTextTimeout = setTimeout(() => {
                    typeText(textIndex + 1);
                  }, delayBetweenTexts);
                  timeoutRefs.current.push(nextTextTimeout);
                }
              }, loadingDuration);
              timeoutRefs.current.push(resetTimeout);
            }, 500);
            timeoutRefs.current.push(submitTimeout);
          } else {
            // Move to next text even without submit
            if (textIndex < texts.length - 1) {
              const nextTextTimeout = setTimeout(() => {
                typeText(textIndex + 1);
              }, delayBetweenTexts);
              timeoutRefs.current.push(nextTextTimeout);
            }
          }
        }
      }, speed);
    };

    // Start typing the first text
    typeText(0);

    return () => {
      if (typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
      }
      // Clear all timeouts
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, [autoType, adjustHeight, onSubmit, loadingDuration]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runAnimation = () => {
      if (!isAnimating) return;
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, thinkingDuration);
      }, loadingDuration);
    };

    if (isAnimating) {
      runAnimation();
    }

    return () => clearTimeout(timeoutId);
  }, [isAnimating, loadingDuration, thinkingDuration]);

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-start flex-col gap-2">
        <div className="relative max-w-xl w-full mx-auto">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "max-w-xl bg-black/5 dark:bg-white/5 w-full rounded-3xl pl-6 pr-10 py-4",
              "placeholder:text-black/70 dark:placeholder:text-white/70",
              "border-none ring-black/30 dark:ring-white/30",
              "text-black dark:text-white resize-none text-wrap leading-[1.2]"
            )}
            style={{ minHeight: `${minHeight}px` }}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={submitted || isTyping}
          />
          <button
            onClick={() => handleSubmit()}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1",
              submitted ? "bg-none" : "bg-black/5 dark:bg-white/5"
            )}
            type="button"
            disabled={submitted || isTyping}
          >
            {submitted ? (
              <div
                className="w-4 h-4 bg-black dark:bg-white rounded-sm animate-spin transition duration-700"
                style={{ animationDuration: "3s" }}
              />
            ) : (
              <CornerRightUp
                className={cn(
                  "w-4 h-4 transition-opacity dark:text-white",
                  inputValue ? "opacity-100" : "opacity-30"
                )}
              />
            )}
          </button>
        </div>
        <p className="pl-4 h-4 text-xs mx-auto text-black/70 dark:text-white/70">
          {submitted ? "AI is thinking..." : isTyping ? "Typing..." : "Ready to submit!"}
        </p>
      </div>
    </div>
  );
}

