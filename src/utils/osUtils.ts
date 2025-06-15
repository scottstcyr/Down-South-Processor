import os from 'os';

export const enum OperatingSystem {
  Unknown = 'Unknown',
  Windows = 'Windows',
  MacOS = 'Mac',
  Linux = 'Linux',
}

let platform: OperatingSystem | undefined;
// The return value is 'darwin' for macOS, 'linux' for Linux, and 'win32' for Windows, regardless of the Windows version.

export function getOS(): OperatingSystem {
  if (platform === undefined) {
    switch (os.platform()) {
      case 'darwin':
        platform = OperatingSystem.MacOS;
        break;
      case 'win32':
        platform = OperatingSystem.Windows;
        break;
      case 'linux':
        platform = OperatingSystem.Linux;
        break;
      default:
        platform = OperatingSystem.Unknown;
        break;
    }
    console.log(`Running on OS: ${platform}`);
  }
  return platform!;
}
