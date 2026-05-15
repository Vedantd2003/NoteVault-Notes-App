import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children, sidebarProps }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar {...sidebarProps} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
