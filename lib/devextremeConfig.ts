// DevExtreme license configuration
import config from "devextreme/core/config";

// Configure DevExtreme license key
const configureDevExtreme = () => {
  try {
    const licenseKey = process.env.NEXT_PUBLIC_DEVEXTREME_KEY;

    if (licenseKey) {
      config({ licenseKey });
      if (process.env.NODE_ENV === "development") {
        console.log('DevExtreme license configured successfully');
      }
    } else {
      if (process.env.NODE_ENV === "development") {

        console.warn('DEVEXTREME_KEY environment variable not found');
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {

      console.error('Failed to configure DevExtreme license:', error);
    }
  }
};

// Initialize DevExtreme configuration
configureDevExtreme();

export default configureDevExtreme;