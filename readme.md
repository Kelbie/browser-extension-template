Disclaimer: I vibe coded this.

# About

This is mainly a proof of concept of how a Cashu.me wallet extension that I vibe coded. This would likely require some security consideration before getting merged into Cashu.me. If any experts on browser security with regard to browser extensions, iframes and post messages then your feedback is super appreciated.

Ideally this extension shouldn't need much updates after we have it working, it uses an iframe for Cashu.me.

# Getting Started
```
npm install
rm -rf .parcel-cache distribution # I've found that its often necessary to run this otherwise the caching is sometimes weird.
npm run watch
npm install --global web-ext # (only only for the first time)
web-ext run -t chromium

git clone https://github.com/kelbie/cashu.me 
npm install
npm run dev
```
In browser open up `https://localhost:8080`. You need to do this otherwise theres some security warning in the popup because of `https`.

# TODO

- I think there may be an extra step or two when sending the messages from the website -> cashu.me.
- We will need to request specific permissions to make some functionality work like camera, copy, etc.
- Firefox extension iframe feels buggy compares to chrome, mainly onhover styles being applied weirdly and elements vanishing for no reason.
- Create a super simple publish script which generates all the folders and zips them up in the way Firefox, Chrome, etc. expect them and include links to the pages to update the versions. This way we have smoother release schedule. 

I'm happy to transfer the browser extension accounts over to anyone at Cashu.me upon request but until then its under control by [Kelbie](https://x.com/KevinKelbie). I registered them everywhere I could publish this extension so that it reduces the risk of imposters but I'm not trying to squat on these if someone at Cashu.me org wants to bring them under their wing.

# Download

Important: These versions that I submitted only have very basic functionality. So they just add an icon to your toolbar which you can click on to open Cashu.me. They will get all the other features if I ever manage to get my Cashu.me changes merged.

- [Chrome Web Store](https://chromewebstore.google.com/detail/cashume/adfafhcbnbehkgpkfgpbgagkjlddkohj)

...others are in review