import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function joinClasses(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}