// DevExtreme license configuration
import config from "devextreme/core/config";

// Configure DevExtreme license key
const configureDevExtreme = () => {
  try {
    const licenseKey = process.env.NEXT_PUBLIC_DEVEXTREME_KEY;

    if (licenseKey) {
      config({ licenseKey });
      console.log('DevExtreme license configured successfully');
    } else {
      console.warn('DEVEXTREME_KEY environment variable not found');
    }
  } catch (error) {
    console.error('Failed to configure DevExtreme license:', error);
  }
};

// Initialize DevExtreme configuration
configureDevExtreme();

export default configureDevExtreme;