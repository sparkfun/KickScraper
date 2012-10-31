# KickScraper

A utility for scraping backing information from a KickStarter project and automatically messaging backers with additional information.

## Requirements
- *nodejs* (latest stable)
- *zombie* node module
- *mongodb* node module

## Getting Started

First, install the latest stable version of nodejs, clone the KickScraper repo, and install the node modules.

    $ git clone git@github.com:sparkfun/KickScraper.git
    $ cd KickScraper
    $ npm install zombie
    $ npm install mongodb

Then, make a copy of the default config file and create a symlink called 'config.js' that points to it.

    $ cp default.js myconfig.js
    $ ln -s myconfig.js config.js

Finally, modify the exports.accounts object in myconfig.js to match your account info.

## Starting the scraper

    $ ./kickscraper


