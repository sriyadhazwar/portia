# Telunjuk

## Requirement

- docker
- docker-compose
- aws account
- ecs cluster
- ecr

## Membuat ECS Cluster

### Membuat Elastic IP

Buatlah elastic IP baru dengan cara:

- Masuk ke bagian EC2 Service
- Pilih navigasi elastic IP
- Klik tombol `Allocate new address`
- Catat Allocation ID yang yang nantinya kita gunakan pada saat membuat VPC

https://ap-southeast-1.console.aws.amazon.com/vpc/home?region=ap-southeast-1#Addresses:sort=PublicIp

### Membuat VPC

- Masuk ke bagian VPC Dashboard
- Klik tombol `launch new VPC Wizard`
- Pilih `VPC with public and private subnet` klik select


https://ap-southeast-1.console.aws.amazon.com/vpc/home?region=ap-southeast-1#dashboard:

## Telunjuk Core

Repo ini terdiri dari 3 buah role yang masing-masing memiliki fungsi masing-masing:

- feeder yang memiliki peran untuk mengambil product url pada list di sebuah page
- fetcher yang memiliki peran untuk mengambil raw html dari product detail
- extractor yang memiliki peran untuk melakukan extract meta data html

### Persiapan

**Kafka Topic**

Mohon untuk membuat kafka topic yang terdiri dari :

- topic-feeder-task
- topic-product-url
- topic-raw-html
- topic-json-result

**Service**

- Buat deploy token pada gitlab registry, ikuti link https://gitlab.com/labtek/telunjuk/telunjuk-core/-/settings/repository
  ambil username dan password yang muncul pada form tersebut
- Buka terminal command prompt lalu login terlebih dahulu kepada gitlab registry dengan cara
  `docker login -u username -p password registry.gitlab.com` ganti `username` dengan informasi
  yang terdapat pada deploy token dan ganti `password` juga
- Masuk ke directory `services`
- Lakukan `docker-compose pull` untuk melakukan pull image secara otomatis yang sudah tertera pada
  pada docker-compose.yml
- Konfirmasi docker image yang sudah di pull tadi dengan menggunakan `docker images`

### Pengaturan Konfigurasi Service Komponen

- Pada masing-masing service buatlah sebuah file .env dengan cara mengkopi .env.example

  - services/feeder/manager
    - .env
    - .env.example
    - ...
  - services/fetcher/manager
    - .env
    - .env.example
    - ...
  - services/extractor/manager
    - .env
    - .env.example
    - ...

- Sesuaikan konfigurasi pada masing-masing .env

### Menjalankan Service

Lakukan perintah `docker-compose up`

### Memulai Layanan

```
curl --location --request POST 'localhost:8080/feeder' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'url=https://www.lazada.co.id/cekak-musang-pria/' \
--data-urlencode 'driver=lazada'
```
