import { PRODUCT } from "../../config/product";
import { BrandMark } from "../../components/layout/Brand";

export function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="text-center" role="status" aria-live="polite">
        <BrandMark className="mx-auto size-11" />
        <p className="mt-4 text-base font-semibold text-ink">{PRODUCT.name}</p>
        <p className="mt-1 text-sm text-muted">Restoring your workspace…</p>
        <div className="mx-auto mt-5 h-1 w-28 overflow-hidden rounded-full bg-subtle">
          <div className="h-full w-1/2 animate-loading-bar rounded-full bg-brand-600 motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  );
}
