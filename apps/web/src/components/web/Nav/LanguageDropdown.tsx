"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    nativeName: "English",
  },
  {
    code: "fr",
    name: "French",
    flag: "🇫🇷",
    nativeName: "Français",
  },
  {
    code: "es",
    name: "Spanish",
    flag: "🇪🇸",
    nativeName: "Español",
  },
];

interface LanguageDropdownProps {
  className?: string;
}

export default function LanguageDropdown({
  className = "",
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages[0]
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Detect current language from URL
  useEffect(() => {
    const pathSegments = pathname.split("/");
    const langFromUrl = pathSegments[1]; // Get the language code from URL

    const detectedLanguage = languages.find(
      (lang) => lang.code === langFromUrl
    );
    if (detectedLanguage) {
      setCurrentLanguage(detectedLanguage);
    }
  }, [pathname]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language: Language) => {
    const segments = pathname.split("/");
    segments[1] = language.code;
    const newPath = segments.join("/");

    console.log("newPath", newPath, pathname);

    // Use replace instead of push to avoid adding history entry
    router.replace(newPath, { scroll: false });

    setCurrentLanguage(language);
    setIsOpen(false);

    console.log(`Language switched to: ${language.code}`);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 h-8 md:h-10 px-2 md:px-3 hover:bg-secondary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-5 w-5 md:h-6 md:w-6">
          <AvatarFallback className="text-xs md:text-sm">
            {currentLanguage.flag}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline text-xs md:text-sm font-medium">
          {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-md shadow-lg z-50 border border-border overflow-hidden">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors w-full text-left ${
                  currentLanguage.code === language.code
                    ? "bg-primary/10 text-primary"
                    : ""
                }`}
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {language.flag}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {language.nativeName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
