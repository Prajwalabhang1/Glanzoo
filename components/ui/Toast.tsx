'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-500 text-green-900',
        iconClassName: 'text-green-500',
    },
    error: {
        icon: XCircle,
        className: 'bg-red-50 border-red-500 text-red-900',
        iconClassName: 'text-red-500',
    },
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-500 text-blue-900',
        iconClassName: 'text-blue-500',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        iconClassName: 'text-yellow-500',
    },
};

export default function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const config = toastConfig[type];
    const Icon = config.icon;

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        // Wait for exit animation before removing
        setTimeout(() => {
            onClose(id);
        }, 300);
    }, [id, onClose]);

    useEffect(() => {
        // Trigger enter animation
        const showTimer = setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after duration
        const dismissTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(dismissTimer);
        };
    }, [duration, handleClose]);

    return (
        <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`
                relative flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
                backdrop-blur-sm transition-all duration-300 ease-in-out
                ${config.className}
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                <Icon className={`w-5 h-5 ${config.iconClassName}`} />
            </div>

            {/* Message */}
            <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium leading-relaxed">{message}</p>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
                <div
                    className="h-full bg-current opacity-30"
                    style={{
                        animation: `shrink ${duration}ms linear forwards`,
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </div>
    );
}
