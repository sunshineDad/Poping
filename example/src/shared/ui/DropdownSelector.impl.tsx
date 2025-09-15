import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react'
import { Check, ArrowUp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@shared/ui'
import { Button } from '@shared/ui'
import { cn } from '@/lib/utils'

export interface DropdownOption<T = string> { value: T; label: string; disabled?: boolean; description?: string }

interface DropdownSelectorProps<T = string> {
  options: DropdownOption<T>[]; value?: T; onChange: (value: T) => void; placeholder?: string; showFilterInput?: boolean;
  filterTextRef?: React.RefObject<HTMLInputElement>; isOpen?: boolean; onOpenChange?: (open: boolean) => void; renderOption?: (option: DropdownOption<T>) => React.ReactNode;
  className?: string; dropdownClassName?: string; maxHeight?: number; position?: 'absolute' | 'fixed'; filterPredicate?: (option: DropdownOption<T>, searchText: string) => boolean;
  renderTrigger: (props: { isOpen: boolean; value?: T; onClick: () => void }) => React.ReactNode; customFilterInput?: React.ReactNode; maxVisibleItems?: number; initialFocusedIndex?: number; onFocusReturn?: () => void; visualFocusOnly?: boolean; focusedIndexControlled?: number;
}

export const DropdownSelector = forwardRef<HTMLDivElement, DropdownSelectorProps<any>>(function DropdownSelector<T = string>({ options, value, onChange, placeholder='Select an option', showFilterInput=true, filterTextRef, isOpen: controlledIsOpen, onOpenChange, renderOption, className, dropdownClassName, maxHeight=360, position='absolute', filterPredicate, renderTrigger, customFilterInput, maxVisibleItems=-1, initialFocusedIndex, onFocusReturn, visualFocusOnly=false, focusedIndexControlled }: DropdownSelectorProps<T>, ref) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const filterInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])
  const commandRef = useRef<HTMLDivElement>(null)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = useCallback((open: boolean) => { if (controlledIsOpen === undefined) setInternalIsOpen(open); onOpenChange?.(open) }, [controlledIsOpen, onOpenChange])
  const triggerRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const combinedContainerRef = useCallback((node: HTMLDivElement | null) => { containerRef.current = node; if (triggerRef.current !== node) (triggerRef as any).current = node; if (typeof ref === 'function') ref(node); else if (ref) (ref as any).current = node }, [ref, triggerRef])
  const getFilterText = useCallback(() => (filterTextRef?.current ? filterTextRef.current.value : filterText), [filterText, filterTextRef])
  const fuzzyMatch = (text: string, pattern: string) => { const tl=text.toLowerCase(), pl=pattern.toLowerCase(); let pi=0; for (let i=0;i<tl.length && pi<pl.length;i++){ if (tl[i]===pl[pi]) pi++ } return pi===pl.length }
  const defaultFilterPredicate = useCallback((option: DropdownOption<T>, searchText: string) => { if (!searchText.trim()) return true; if (option.label.toLowerCase().includes(searchText.toLowerCase())) return true; return fuzzyMatch(option.label, searchText) }, [])
  const calculateMatchScore = (text: string, pattern: string) => { const tl=text.toLowerCase(), pl=pattern.toLowerCase(); if (tl===pl) return -1000; const idx=tl.indexOf(pl); if (idx!==-1) return idx; let score=1000, pi=0, last=-1; for (let i=0;i<tl.length && pi<pl.length;i++){ if (tl[i]===pl[pi]){ if (last!==-1) score += (i-last-1)*10; last=i; pi++; } } return pi!==pl.length?Infinity:score }
  const filteredOptions = (() => { const searchText=getFilterText(); if (!searchText.trim()) return options; const predicate=filterPredicate||defaultFilterPredicate; const filtered=options.filter(o=>predicate(o,searchText)); if (!filterPredicate){ return filtered.sort((a,b)=>calculateMatchScore(a.label,searchText)-calculateMatchScore(b.label,searchText)) } return filtered })()
  const visibleOptions = maxVisibleItems===-1 ? filteredOptions : filteredOptions.slice(0,maxVisibleItems)
  useEffect(()=>{ if (isOpen && showFilterInput && filterInputRef.current && !visualFocusOnly) filterInputRef.current.focus() },[isOpen,showFilterInput,visualFocusOnly])
  useEffect(()=>{ if (!visualFocusOnly){ if (focusedIndex>=0 && focusedIndex<optionRefs.current.length) optionRefs.current[focusedIndex]?.focus(); else if (focusedIndex===-1 && showFilterInput && filterInputRef.current) filterInputRef.current.focus() } },[focusedIndex,showFilterInput,visualFocusOnly])
  useEffect(()=>{ if (focusedIndexControlled!==undefined) setFocusedIndex(focusedIndexControlled) },[focusedIndexControlled])
  useEffect(()=>{ if (!isOpen){ setFocusedIndex(-1); setFilterText('') } else if (isOpen && initialFocusedIndex!==undefined){ setFocusedIndex(initialFocusedIndex) } },[isOpen, initialFocusedIndex])
  useEffect(()=>{ setFocusedIndex(-1) },[filterText, filterTextRef])
  const handleKeyDown=(e: React.KeyboardEvent)=>{ switch(e.key){ case 'ArrowDown': e.preventDefault(); if (focusedIndex<visibleOptions.length-1) setFocusedIndex(focusedIndex+1); break; case 'ArrowUp': e.preventDefault(); if (focusedIndex>0) setFocusedIndex(focusedIndex-1); else if (focusedIndex===0 && !showFilterInput && onFocusReturn) onFocusReturn(); break; case 'Enter': e.preventDefault(); if (focusedIndex>=0 && focusedIndex<visibleOptions.length){ const option=visibleOptions[focusedIndex]; if (!option.disabled){ onChange(option.value); setIsOpen(false) } } else if (focusedIndex===-1 && filterText.trim()){ onChange(filterText.trim() as T); setIsOpen(false) } break; case 'Escape': e.preventDefault(); setIsOpen(false); break; case 'p': if (e.ctrlKey){ e.preventDefault(); if (focusedIndex>-1) setFocusedIndex(focusedIndex-1) } break; case 'n': if (e.ctrlKey){ e.preventDefault(); if (focusedIndex<visibleOptions.length-1) setFocusedIndex(focusedIndex+1) } break; } }
  const handleOptionClick=(option: DropdownOption<T>)=>{ if (!option.disabled){ onChange(option.value); setIsOpen(false) } }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div ref={combinedContainerRef} className={className}>{renderTrigger({ isOpen, value, onClick: ()=>setIsOpen(!isOpen) })}</div>
      </PopoverTrigger>
      <PopoverContent className={cn('w-80 p-0 rounded-[18px] border border-black/15 bg-white shadow-lg','dark:border-white/10 dark:bg-neutral-900 dark:shadow-2xl', dropdownClassName)} align="start" sideOffset={5} avoidCollisions onKeyDown={handleKeyDown} ref={dropdownRef} onOpenAutoFocus={(e)=>{ if (visualFocusOnly) e.preventDefault() }} onCloseAutoFocus={(e)=>{ if (visualFocusOnly){ e.preventDefault(); onFocusReturn?.() } }} style={{ maxHeight: `${maxHeight}px` }}>
        <Command className="bg-transparent" ref={commandRef}>
          {customFilterInput ? (<>{customFilterInput}<div className="h-px bg-black/15 dark:bg-white/10 w-full"/></>) : (showFilterInput && !filterTextRef && (<><div className="flex items-center gap-2 px-2 py-1.5 bg-transparent"><CommandInput ref={filterInputRef} placeholder={placeholder} value={filterText} onValueChange={setFilterText} className="flex-1 bg-transparent border-none rounded-lg px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100 outline-none transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-400" aria-label="Filter options" aria-autocomplete="list" aria-controls="dropdown-options" />{filterText.trim() && (<Button type="button" variant="ghost" size="sm" className="p-1 h-auto rounded-full hover:bg-transparent" onClick={() => { onChange(filterText.trim() as T); setIsOpen(false) }} aria-label="Select input text"><ArrowUp size={18}/></Button>)}</div><div className="h-px bg-black/15 dark:bg-white/10 w-full"/></>))}
          <CommandList id="dropdown-options" className="overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 scrollbar-track-transparent" role="listbox" aria-label="Available options">
            <CommandEmpty className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400" role="status">No options found</CommandEmpty>
            <CommandGroup>
              {visibleOptions.map((option, index) => (
                <CommandItem key={String(option.value)} ref={(el) => { optionRefs.current[index] = el }} value={option.label} onSelect={() => handleOptionClick(option)} disabled={option.disabled} className={cn("flex items-center justify-between w-full px-3 py-2.5 rounded-[10px] cursor-pointer transition-all gap-4 text-left text-sm text-neutral-900 dark:text-neutral-100 mb-px","hover:bg-black/5 dark:hover:bg-white/5","focus:bg-black/5 dark:focus:bg-white/5 focus:outline-none","disabled:opacity-50 disabled:cursor-not-allowed", value===option.value && "bg-transparent dark:bg-transparent", focusedIndex===index && "bg-black/5 dark:bg-white/5")} role="option" aria-selected={value===option.value} aria-disabled={option.disabled}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">{renderOption ? renderOption(option) : (<span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap direction-rtl text-left">{option.label}</span>)}</div>
                  {value===option.value && (<div className="flex items-center justify-center min-w-[20px] text-neutral-900 dark:text-neutral-100"><Check size={16}/></div>)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
