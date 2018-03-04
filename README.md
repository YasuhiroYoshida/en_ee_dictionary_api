# English-Estonian Dictionary API

This is a dictionary that translates an English word into an Estonian one and provides the first three cases, namely **normative**, **genitive**, and **accusative**, which are considered to be the most basic and important among the fourteen cases of the language. This will benefit beginners of the language the most while it can serve anyone at all levels.

In the background, this dictionary combines two dictionary services available on the internet:

* [IES - English-Estonian MT dictionary](http://www.eki.ee/dict/ies/index.cgi)
* [ÕS - Eesti õigekeelsussõnaraamat ÕS 2013](http://www.eki.ee/dict/qs/index.cgi)

You enter your search word,
IES translates it into Estonian ones,
and ÕS returns the three cases of each one of the Estonian ones to you.

## How to run this application locally

1. Install [Node.js](https://nodejs.org/en/)
1. Install [Yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Install packages

```
yarn
```

&#8291;5. Run `start` script

```
npm start
```

  \* The default listner port is `8030`. Make sure it is not taken.

## Note
This was initially forked from [English to Estonian Dictionary](https://github.com/jfilter/eesti-kelt) by @jfilter so that I can customize and run it locally for my own use in learning Estonian language. This may be made available to my classmates and eventually to the public in general.
rerequisite: [Node.js](https://nodejs.org/en/)
