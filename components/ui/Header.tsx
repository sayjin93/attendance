
//icon
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';

//constants
import navigationItems from '@/constants/navigation';

const Header = ({ name = 'Dashboard' }) => {
    // Flatten the navigation items to find the current one
    const allItems = navigationItems.flatMap(category => category.items);
    const currentNavItem = allItems.find(item => item.name === name);
    const Icon = currentNavItem ? currentNavItem.icon : HomeIcon;

    return (
        <div className="hidden lg:flex border-b border-gray-200 pb-5 mb-5 items-center space-x-2">
            <Icon className="w-6 h-6 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        </div>
    );
};

export default Header;
