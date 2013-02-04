# KickScraper

A utility for scraping backing information from a KickStarter project and automatically messaging backers with additional information.  This utility was written to funnel data from the [SparkFun National Tour KickStarter Campaign](http://www.kickstarter.com/projects/2112812006/sparkfun-national-tour) to the [sparkfun.com](http://sparkfun.com) hosted [Voting System](http://www.sparkfun.com/edukickstarter/).

## Requirements
- *nodejs* (latest stable)
- *zombie* node module
- *mongodb* node module
- *cli-color* node module

## Getting Started

First, install the latest stable version of nodejs, clone the KickScraper repo, and install the node modules.

    $ git clone git@github.com:sparkfun/KickScraper.git
    $ cd KickScraper
    $ npm install zombie
    $ npm install mongodb
    $ npm install cli-color

Then, make a copy of the default config file and create a symlink called 'config.js' that points to it.

    $ cp default.js myconfig.js
    $ ln -s myconfig.js config.js

Finally, modify the exports.accounts object in myconfig.js to match your account info.

## Starting the scraper

    $ ./kickscraper


