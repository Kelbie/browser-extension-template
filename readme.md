`npm install`
`rm -rf .parcel-cache distribution` I've found that its often necessary to run this otherwise the caching is sometimes weird.
`npm run watch`
`npm install --global web-ext` (only only for the first time)
`web-ext run -t chromium`

`git clone https://github.com/kelbie/cashu.me`
`npm install`
`npm run dev`

In browser open up `https://localhost:8080`. You need to do this otherwise theres some security warning in the popup.

I'm happy to transfer the browser extension accounts over to anyone at Cashu.me upon request but until then its under control by [Kelbie](https://x.com/KevinKelbie). I registered them everywhere I could publish this extension so that it reduces the risk of imposters but I'm not trying to squat on these if someone at Cashu.me org wants to bring them under their wing.