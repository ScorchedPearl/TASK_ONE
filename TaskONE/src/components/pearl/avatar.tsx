import { Menu } from '@headlessui/react';
import { ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/auth_interface';

interface AvatarProps {
  user: User;
  onLogout: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const avatarUrl = user.profileImage;

  const generateDummyAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
    );
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
        <div className="relative" title={user.name}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-cyan-500/30 object-cover group-hover:border-cyan-400/50 transition-all duration-200"
              onError={(e) => {
                
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.appendChild(generateDummyAvatar(user.name).props.children);
                }
              }}
            />
          ) : (
            generateDummyAvatar(user.name)
          )}
          

        </div>
        
       
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-gray-300 dark:text-gray-200 text-sm font-medium group-hover:text-cyan-400 transition-colors duration-200">
            {user.name.split(' ')[0]} 
          </span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-all duration-200 group-hover:rotate-180" />
        </div>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-56 bg-gray-900/95 dark:bg-black/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-700/50 dark:border-gray-600/50 focus:outline-none z-50 overflow-hidden">

        <div className="px-4 py-3 border-b border-gray-700/50 dark:border-gray-600/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-cyan-500/30 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                  {user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 dark:text-gray-200 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleProfileClick}
                className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                  active 
                    ? 'bg-cyan-500/20 text-cyan-300' 
                    : 'text-gray-300 dark:text-gray-200'
                }`}
              >
                <UserIcon className="w-4 h-4 mr-3" />
                View Profile
              </button>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                  active 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'text-gray-300 dark:text-gray-200'
                }`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default Avatar;