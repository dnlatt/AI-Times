import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import React from 'react';
import MainContent from '@/components/home/MainContent';
 

const HomePage = () => (
<div className="min-h-screen flex flex-col max-w-6xl mx-auto">
  <Header />
  <main className="flex-1">
    <MainContent />
  </main>
  <Footer />
</div>
);

export default HomePage;