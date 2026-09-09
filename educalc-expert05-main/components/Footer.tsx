
import React from 'react';
import { BrainCircuit, Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/20 border-t border-white/10">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <BrainCircuit className="h-7 w-7 text-indigo-400" />
              EduCalc Expert
            </div>
            <p className="text-gray-400 text-base">
              Your one-stop solution for calculations and expert academic help.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Solutions</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Calculators</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Q&A</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">For Students</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">For Experts</a></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">About</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Press</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Partners</a></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-base text-gray-400 xl:text-center">&copy; 2024 EduCalc Expert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
