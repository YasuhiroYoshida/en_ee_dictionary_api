# English-Estonian Dictionary API

This is a forked version of an English-Estonian dictionary originally created by [@jfilter](https://github.com/jfilter/eesti-kelt).

This was initially forked so that I can customize it for my own use. This may be made available later for the classmates of my Estonian language course and even later on maybe for the public in general.

## What is it?

This is a dictionary that translates an English word into an Estonian one and provides the first three cases, namely *normative*, *genitive*, and *accusative*, which are considered to be the most basic and important among the fourteen cases of the language. This will benefit beginners of the language the most while it can serve anyone at all levels.

In the background, this dictionary combines two dictionary services available on the internet:

* [IES - English-Estonian MT dictionary](http://www.eki.ee/dict/ies/index.cgi)
* [ÕS - Eesti õigekeelsussõnaraamat ÕS 2013](http://www.eki.ee/dict/qs/index.cgi)

In essence, this dictionary first has IES translate your word into an Estonian one and then has ÕS return its three cases for you.

## Run

* Prerequisite: [Node.js](https://nodejs.org/en/)

* `yarn`
* `npm start` to run a start a development server

  \* The default listner port is `8030`. Make sure it is not taken.
