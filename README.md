# Forrit

Bangumi tracker, subscribe manager and downloader with an elegant web UI and robust backend server.

Main branch is under active develop and is not ready for usage. For old stable version, see `legacy` branch.

## TODO

- [ ] (Frontend) Download job page
- [ ] (Frontend) Entry detail page
- [ ] (Frontend) Fix wrong matching (entry - meta) and create alias for the fix
- [ ] (Frontend) Manually override season info (meta)
- [ ] (Server) RSS html Sanitization (w/ [ammonia](https://github.com/rust-ammonia/ammonia))
- [ ] (Server) Read torrent info for better resolution and file size
- [ ] (Server) Transmission API
- [ ] (Server) Notifier (w/ [pling](https://github.com/EdJoPaTo/pling))
- [ ] (Server) Search
- [ ] (Server) Events
- [ ] (Server) Backoff for failed API request

## Server

Constantly running, fetching updates from source sites and send it to configured downloaders.

### Source

- [x] Any RSS feed that contains Bangumi updates (e.g. [Bangumi](https://bangumi.moe), [ACG.RIP](https://acg.rip) or [Mikan Project](https://mikanani.me))

### Downloader

- [x] QbitTorrent
- [ ] Transmission
- [ ] aria2
- [ ] rqbit (?)

## Installation

TODO

## License

MIT
