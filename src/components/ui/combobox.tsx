
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"

type ComboboxOption = {
  value: string;
  label: string;
};

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
}


export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  ({ options, value, onChange, placeholder, searchPlaceholder, emptyText }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');

    React.useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue;
        onChange(newValue);
        setInputValue(newValue);
        setOpen(false);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typedValue = e.target.value;
        setInputValue(typedValue);
        onChange(typedValue); // Update form value as user types
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <div className="flex w-full items-center gap-1">
             <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
            />
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[40px] shrink-0 justify-center px-0"
                >
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
        </div>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
            <CommandInput placeholder={searchPlaceholder || "Search..."} />
            <CommandEmpty>{emptyText || "No results found."}</CommandEmpty>
            <ScrollArea className="h-72">
                <CommandGroup>
                    {options.map((option) => (
                    <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSelect}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {option.label}
                    </CommandItem>
                    ))}
                </CommandGroup>
            </ScrollArea>
            </Command>
        </PopoverContent>
        </Popover>
    )
  }
)
Combobox.displayName = "Combobox";

