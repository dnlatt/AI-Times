import React from 'react';

const Footer = () => (
  <footer className="p-4 border-t text-sm text-center">
    <div className="space-x-4">
      {['Privacy Policy', 'Terms of Service', 'Site Map', 'Help', 'Subscriptions'].map((link) => (
        <a key={link} href="#" className="hover:underline">
          {link}
        </a>
      ))}
    </div>
    <p className="mt-2">&copy; 2025 AI Times</p>
  </footer>
);

export default Footer;