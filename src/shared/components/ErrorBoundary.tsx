import { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Separate functional component to use hooks like `useTranslation`
function ErrorBoundaryFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full rounded-xl bg-white p-8 text-center shadow-lg border border-red-100">
        <span className="material-symbols-outlined mx-auto mb-4 text-[48px] text-red-500">
          error
        </span>
        <h2 className="mb-2 font-display text-2xl font-bold text-slate-800">
          {t("errorBoundary.title", "Đã xảy ra lỗi")}
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          {error?.message || t("errorBoundary.description", "Có lỗi xảy ra trong quá trình tải dữ liệu. Vui lòng thử lại.")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          {t("errorBoundary.retry", "Tải lại trang")}
        </button>
      </div>
    </div>
  );
}

export const ErrorBoundary = ErrorBoundaryClass;
