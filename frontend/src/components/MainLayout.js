import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6"> 
        {/* Added padding to the main content area */}
        <Outlet /> {/* Child routes will render here */}
      </main>
      {/* Optional: Footer can be added here */}
      {/* <footer className="bg-gray-200 text-center p-4">
        © {new Date().getFullYear()} SIAP Application
      </footer> */}
    </div>
  );
};

export default MainLayout;
