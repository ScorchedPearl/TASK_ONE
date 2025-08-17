import { ThemeToggle } from '@/components/pearl/themetoggle';
import { VoiceControl } from '@/components/pearl/voiceControl';
import Avatar from '@/components/pearl/avatar';
import type { User } from '@/types/auth_interface';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onVoiceCommand: (command: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onVoiceCommand }) => {
  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-800/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
              PearlChef
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700/50">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700/50">K</kbd>
              <span>to search</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <VoiceControl onCommand={onVoiceCommand} />
            <ThemeToggle />
            <Avatar user={currentUser} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;