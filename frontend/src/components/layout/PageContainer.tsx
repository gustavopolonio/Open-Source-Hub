import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    // 64.8px -> header height
    // 220.8px -> footer height
    <div className="max-w-5xl min-h-[calc(100vh-64.8px-220.8px)] flex flex-col justify-center mx-auto py-16 px-4 space-y-14">
      {children}
    </div>
  );
}
