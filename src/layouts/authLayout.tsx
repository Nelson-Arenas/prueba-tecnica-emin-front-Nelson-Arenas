export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl white:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
    );
}