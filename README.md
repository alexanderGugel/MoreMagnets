**WIP** This project has been created by me within less than two days during the Solo Hackathon at [Hack Reactor](http://www.hackreactor.com/). Because of the hight interest in it, we're currently working on it as a team of four. You can see our progress at [Trrnts/Trrnts](https://github.com/Trrnts/Trrnts). This repo is a primarily a PoC.

# trrnts

= The Pirate Bay + Digg - annoying porn ads

### Screenshots of the web interface

![](https://raw.githubusercontent.com/alexanderGugel/trrnts/gh-pages/1.png)

![](https://raw.githubusercontent.com/alexanderGugel/trrnts/gh-pages/2.png)

![](https://raw.githubusercontent.com/alexanderGugel/trrnts/gh-pages/3.png)

![](https://raw.githubusercontent.com/alexanderGugel/trrnts/gh-pages/4.png)

![](https://raw.githubusercontent.com/alexanderGugel/trrnts/gh-pages/5.png)

*Please note that the web interface represents only a small fraction of the data that has been indexed by the crawler (e.g. graphs could be visualized, too).*

### Getting started

1. Start Redis.
2. Install dependencies using `npm install` and `bower install`.
3. Start server and worker processes using `npm start`.
4. Run bootstrap script using `npm bootstrap` - This script inserts some random magnet links, just to get started.

The app can be stopped using `npm stop`.

### Redis data layout

- *Hash Set* - **m:[infohash]**

  *mu:* **magnet URI**  
  *n:* **name of torrent**  
  *ih:* **infohash**  
  *ca:* **created at** (Unix timestamp)  
  *ip:* inserted by **ip**  
  *ps:* **points** (-1 if not crawled, determined by crawler)

- *Set* - **m:all**

  contains **infohashes**

- *Sorted Set* - **m:ca**

  *key:* **created at**  
  *value:* **infohash**

- *List* - **m:latest**

  contains **infohashes** (newest first)

- *Set* - **m:ip:[ip]**

  contains **infohashes** submitted over this **ip address**

- *List* - **m:crawl**

  job queue used by crawler for crawling torrents - contains **infohashes**

- *Sorted Set* - **edges**

  *key:* **discovered at**  
  *value:* **[from addr]-[to addr]**

- *Sorted Set* - **edges:past**

  *key:* **timestamp** (changes every 5 seconds)  
  *value:* **number** (snapshot) of edges at this timestamp

- *Sorted Set* - **nodes**

  *key:* **last seen at**  
  *value:* **ip** of node

- *Sorted Set* - **m:[infoHash]:p**

  *key:* **last seen at**  
  *value:* **ip** of peer

- *Sorted Set* - **m:[infoHash]:ps**

  *key:* **timestamp** (changes every 5 seconds)  
  *value:* **number** of peers that have been discovered within 5 seconds
  at this point in time

### Design Principles

*Partly inspired by [npm-www](https://github.com/npm/npm-www#design-philosophy)*

1. No SPA insanity.

  Focus on Progressive Enhancement. The still should be usable without JavaScript.

2. Speed.

  Performance is a feature. Everything *should* be cached. The reason for choosing Redis over MongoDB is its performance.

3. KISS-Principle.

  Keep it simple. Two workers and one server is enough. Try to reduce complexity where possible. This aspect is even more important than raw performance.

#### Credits

- This product includes GeoLite data created by MaxMind, available from [maxmind.com](http://www.maxmind.com").
- Map idea by [Neil Lobo](https://github.com/neillobo).
