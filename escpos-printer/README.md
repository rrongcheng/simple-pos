# Install
## Update Node and NPM 
### Ubuntu
#### Run an update first
sudo apt-get update
sudo apt-get install build-essential checkinstall libssl-dev
#### install or update nvm
Get url for latest version on https://github.com/creationix/nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash

##  install libusb http://www.linuxfromscratch.org/blfs/view/svn/general/libusb.html
sudo apt-get install libudev-dev

## install packages
npm install

## Manually install usb if it's missing
npm install --save usb
> failed 
