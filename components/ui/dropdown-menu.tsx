"use client"

import * as React from "react"

// Simple dropdown menu components for the vendor header


const DropdownMenuTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    return (
        <div
            ref={ref}
            onClick={() => context?.toggle()}
            {...props}
        >
            {children}
        </div>
    )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }
>(({ children, className = "", align = "end", ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    if (!context?.isOpen) return null

    return (
        <>
            {/* Backdrop to close on outside click */}
            <div className="fixed inset-0 z-40" onClick={() => context.close()} />
            <div
                ref={ref}
                className={`absolute z-50 mt-2 rounded-md border bg-white shadow-lg py-1 ${align === "end" ? "right-0" : "left-0"
                    } ${className}`}
                {...props}
            >
                {children}
            </div>
        </>
    )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    return (
        <div
            ref={ref}
            className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
            onClick={() => context?.close()}
            {...props}
        >
            {children}
        </div>
    )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = () => {
    return <div className="h-px bg-gray-200 my-1" />
}

// Context for managing open/close state
type DropdownContextType = {
    isOpen: boolean
    toggle: () => void
    close: () => void
}

const DropdownContext = React.createContext<DropdownContextType | null>(null)

const DropdownMenuRoot = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])
    const close = React.useCallback(() => setIsOpen(false), [])

    return (
        <DropdownContext.Provider value={{ isOpen, toggle, close }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropdownContext.Provider>
    )
}

export {
    DropdownMenuRoot as DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
}
