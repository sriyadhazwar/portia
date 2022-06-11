# Worker Feeder

## Tugas

Ada beberapa tugas utama dari Worker Feeder:
1. Consume job dari RabbitMQ untuk crawl site url
2. Kirim hasil crawling yang berisi url detail dari produk-produk di site ke RabbitMQ

## Pre-requisites
1. NodeJS V12.x.x
2. Typescript v3.9.x
3. Docker
4. Docker compose
5. ☕️ untuk menemani sesi koding

## Development
### Menjalankan Docker Container
1. Masuk ke folder `./infrastructure/docker-compose`
1. Run `docker-compose up --detach` jika container-containernya belum ada. Atau run `docker-compose start` jika container-containernya sudah ada

### Menjalankan Worker Feeder Service
1. Masuk ke folder `./worker-feeder`
2. Copy-paste dan/atau ubah file `.env-template` menjadi `.env` untuk konfigurasi environment variables service
3. Run `npm install` terlebih dahulu jika belum ada folder `node_modules` di dalam folder
4. Run `npm run watch`. **NOTE:** Di npm script `watch` menggunakan flag `-r` atau `--require` untuk init environment variable menggunakan module `dotenv`
