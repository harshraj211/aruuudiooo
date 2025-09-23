
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

export type MultiSelectOption = {
    value: string;
    label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
  className?: string
  placeholder?: string
}

function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select...",
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full", className)}>
            <div className="flex flex-wrap gap-1 rounded-md border border-input bg-background p-1.5 min-h-10 items-center">
                {selected.length === 0 && <span className="text-sm text-muted-foreground px-2">{placeholder}</span>}
                {selected.map((item) => (
                    <Badge
                        variant="secondary"
                        key={item}
                        className="py-1"
                    >
                        {options.find(opt => opt.value === item)?.label || item}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUnselect(item);
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={() => handleUnselect(item)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
            </div>
             <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <ScrollArea className="max-h-72">
            <CommandGroup>
                {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                    <CommandItem
                        key={option.value}
                        onSelect={() => {
                            if (isSelected) {
                                handleUnselect(option.value)
                            } else {
                                onChange([...selected, option.value])
                            }
                        }}
                    >
                        <Check
                            className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {option.label}
                    </CommandItem>
                )
                })}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
