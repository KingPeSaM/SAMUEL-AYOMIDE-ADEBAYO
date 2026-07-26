import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      let errorMessage = "Something went wrong.";
      let isQuotaError = false;

      try {
        const parsedError = JSON.parse((this as any).state.error?.message || "{}");
        if (parsedError.error) {
          if (parsedError.error.includes("Quota limit exceeded") || parsedError.error.includes("Quota exceeded")) {
            isQuotaError = true;
            errorMessage = "We've hit our daily limit for database reads. This free tier quota will reset tomorrow. Please check back then!";
          } else {
            errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
          }
        }
      } catch (e) {
        errorMessage = (this as any).state.error?.message || errorMessage;
        if (errorMessage.includes("Quota limit exceeded") || errorMessage.includes("Quota exceeded")) {
          isQuotaError = true;
          errorMessage = "We've hit our daily limit for database reads. This free tier quota will reset tomorrow. Please check back then!";
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF0F0] p-4">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-[#C0132C]/10">
            <div className="w-20 h-20 bg-[#FAF0F0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#C0132C]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-3xl font-serif text-[#8B0A2A] mb-4">{isQuotaError ? "Daily Limit Reached" : "Oops!"}</h2>
            <p className="text-[#7a5a5a] mb-8 leading-relaxed">{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#C0132C] text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[0.8rem] hover:bg-[#8B0A2A] transition-all shadow-lg shadow-[#C0132C]/20 active:scale-95"
              >
                Try Reloading
              </button>
              {isQuotaError && (
                <p className="text-[0.7rem] text-[#7a5a5a] opacity-60 uppercase tracking-tighter">
                  Quota resets daily at midnight US Pacific Time
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
