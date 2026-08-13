import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-screen pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
