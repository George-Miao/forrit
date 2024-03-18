# Actors

## Resolve

- No first class season (stand alone objects) in db as TMDB is not very good at updating the lastest seasons.

### Index

Load items from [bangumi-data](https://github.com/bangumi-data/bangumi-data/), match them to a tv season in tmdb database and populates meta storage.

Input:
- `title (string)`
- `begin? (date)`
- `end? (date)`

Proc:
* Search for title, match to a `tmdb_id`
* Get the seasons
* Match the begin and end dates to the seasons

### Extract

Extract data from a file name, usually invoked by [sourcers](#sourcers).

Input:
- `file_name (string)`
- `now (date)`

Proc:
* Extract the title (and maybe more) from the file name
* Match the title to a `tmdb_id`
* Match the date to a season of the tv show

## Sourcer

Get torrent link and filename from a torrent site, only RSS is supported for now.

## Subscription

Manage subscriptions. Gets updated when new entries are available from sourcer. Create job for downloader.

## Downloader

Download torrent files and store them in a folder.

## Notifier

Notify the user when a new episode is available and downloaded.



