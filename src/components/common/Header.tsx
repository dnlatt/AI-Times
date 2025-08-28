import { Sparkles } from 'lucide-react';
import React from 'react';
import { ModeToggle } from './ToggleMode';


const Header = () => (
  <header className="flex justify-between items-center p-4 border-b">
    <h1 className="flex items-center text-xl font-bold gap-2">
      <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
      AI TIMES
    </h1>

    <ModeToggle />
    
  </header>
);

export default Header;