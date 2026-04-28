/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ParkPedia.app',
      build:
        'xcodebuild -workspace ios/ParkPedia.xcworkspace -scheme ParkPedia -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -arch arm64',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/ParkPedia.app',
      build:
        'xcodebuild -workspace ios/ParkPedia.xcworkspace -scheme ParkPedia -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -arch arm64',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro',
      },
    },
    'simulator.iphone15': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro Max',
      },
    },
    'simulator.ipad': {
      type: 'ios.simulator',
      device: {
        type: 'iPad Pro 11-inch (M4)',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'ios.sim.iphone15': {
      device: 'simulator.iphone15',
      app: 'ios.debug',
    },
    'ios.sim.ipad': {
      device: 'simulator.ipad',
      app: 'ios.debug',
    },
  },
};
