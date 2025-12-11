import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    id,
    type,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-stone-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={id}
                    type={inputType}
                    className={`
            block w-full 
            ${leftIcon ? 'pl-11' : 'pl-3'} 
            ${rightIcon || isPassword ? 'pr-10' : 'pr-3'} 
            py-3 border rounded-xl leading-5 
            bg-stone-50 placeholder-stone-400 
            focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 
            transition-all duration-200 sm:text-sm
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-stone-200'}
            ${className}
          `}
                    {...props}
                />

                {/* Custom Right Icon takes precedence */}
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 pointer-events-none">
                        {rightIcon}
                    </div>
                )}

                {/* Password Toggle (only if no rightIcon is provided) */}
                {!rightIcon && isPassword && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};
