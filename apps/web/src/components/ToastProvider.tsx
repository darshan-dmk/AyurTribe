// src/components/ToastProvider.tsx
import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: '!bg-stone-800 !text-stone-50 !rounded-xl !shadow-lg !font-medium',
          style: {
            background: '#292524', // stone-800
            color: '#fafaf9', // stone-50
            padding: '12px 16px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // emerald-500
              secondary: '#ecfdf5', // emerald-50
            },
            style: {
              background: '#064e3b', // emerald-900
              color: '#ecfdf5', // emerald-50
              border: '1px solid #059669' // emerald-600
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#fef2f2', // red-50
            },
            style: {
              background: '#450a0a', // red-950
              color: '#fef2f2', // red-50
              border: '1px solid #b91c1c' // red-700
            }
          },
        }}
      />
    </>
  );
};