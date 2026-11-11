# PANDUAN DEPLOYMENT: VPS & CLOUD HOSTING
## FLAG HUNTER (Next.js + MySQL 8 + Prisma)

Panduan ini berisi instruksi langkah demi langkah untuk melakukan deploy aplikasi **FLAG HUNTER** pada:
1. **VPS (Virtual Private Server)**: Ubuntu/Debian dengan Nginx, PM2, dan MySQL 8.
2. **Cloud Hosting / PaaS**: cPanel (Node.js Selector) / Coolify / Dokploy / Docker.

---

# BAGIAN 1: DEPLOYMENT PADA VPS (Ubuntu / Debian)

### 1. Prasyarat Server VPS
- OS: Ubuntu 22.04 LTS / 24.04 LTS atau Debian 11/12
- Spesifikasi minimal: 1 vCPU, 2 GB RAM, 20 GB SSD (disarankan 2 vCPU, 4 GB RAM)
- Domain / Subdomain yang sudah diarahkan ke IP publik VPS (A Record DNS).

---

### 2. Update Sistem & Instalasi Paket Dasar

Masuk via SSH ke VPS:
```bash
ssh root@ip_server_anda
```

Update repositori dan instal paket pendukung:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential
```

---

### 3. Instalasi Node.js (v20 atau v22) & PM2

Gunakan NodeSource untuk menginstal Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Periksa versi:
```bash
node -v # minimal v20.x
npm -v
pm2 -v
```

---

### 4. Instalasi & Konfigurasi Database MySQL 8

Jika MySQL belum terpasang di VPS:
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Masuk ke MySQL shell:
```bash
sudo mysql
```

Jalankan perintah SQL untuk membuat database dan pengguna khusus:
```sql
CREATE DATABASE flag_hunter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'flag_user'@'localhost' IDENTIFIED BY 'PasswordKuatAnda123!@#';
GRANT ALL PRIVILEGES ON flag_hunter.* TO 'flag_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. Clone Repository & Setup Aplikasi

Clone proyek ke direktori `/var/www/flag-hunter`:
```bash
sudo mkdir -p /var/www/flag-hunter
sudo chown -R $USER:$USER /var/www/flag-hunter
cd /var/www/flag-hunter

# Clone repository atau salin file proyek ke direktori ini
git clone https://github.com/username/flag-hunter.git .
```

Instal dependensi:
```bash
npm install
```

---

### 6. Konfigurasi Environment (`.env`)

Buat file `.env` di direktori root aplikasi:
```bash
nano .env
```

Isi dengan konfigurasi produksi:
```env
# URL Database MySQL (Perhatikan URL Encoding jika ada karakter khusus: @ = %40, # = %23, ! = !)
DATABASE_URL="mysql://flag_user:PasswordKuatAnda123!%40%23@localhost:3306/flag_hunter"

# Kunci rahasia JWT (Gunakan minimal 32 karakter acak yang kuat)
AUTH_SECRET="buat_kunci_acak_super_rahasia_dan_panjang_minimal_32_karakter_disini"

# Domain publik Anda
NEXT_PUBLIC_APP_NAME="FLAG HUNTER"
NEXT_PUBLIC_APP_URL="https://flaghunter.domainanda.com"
NODE_ENV="production"
PORT=3000
```
*Simpan dengan menekan `Ctrl + O` lalu `Enter`, dan keluar dengan `Ctrl + X`.*

---

### 7. Migrasi Database & Seeding Awal

Jalankan sinkronisasi skema Prisma ke database MySQL dan jalankan seeder demo:
```bash
npx prisma db push
npm run seed
```

---

### 8. Build Aplikasi Next.js

Jalankan kompilasi build produksi:
```bash
npm run build
```

---

### 9. Menjalankan Aplikasi dengan PM2

Jalankan aplikasi di background menggunakan PM2:
```bash
pm2 start npm --name "flag-hunter" -- start -- -p 3000
pm2 save
pm2 startup
```
*(Ikuti instruksi baris perintah yang ditampilkan oleh `pm2 startup` agar PM2 otomatis menyala saat server restart).*

Periksa status aplikasi:
```bash
pm2 status
pm2 logs flag-hunter
```

---

### 10. Konfigurasi Reverse Proxy Nginx & SSL HTTPS

Instal Nginx:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Buat file konfigurasi Nginx untuk domain Anda:
```bash
sudo nano /etc/nginx/sites-available/flag-hunter
```

Tempelkan konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name flaghunter.domainanda.com; # Ganti dengan domain/subdomain Anda

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 50M;
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/flag-hunter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Pasang Sertifikat SSL Gratis (Let's Encrypt):
```bash
sudo certbot --nginx -d flaghunter.domainanda.com
```

Buka Firewall UFW:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

Aplikasi kini telah aktif di `https://flaghunter.domainanda.com`.

---

# BAGIAN 2: DEPLOYMENT PADA CPANEL (Cloud Web Hosting)

Jika menggunakan layanan Shared/Cloud Hosting berbasis cPanel yang mendukung **Node.js Selector (CloudLinux / Phusion Passenger)**:

### 1. Buat Database MySQL di cPanel
1. Masuk ke cPanel &rarr; pilih menu **MySQL Databases**.
2. Buat database baru (misal: `usercpanel_flaghunter`).
3. Buat pengguna baru dengan kata sandi kuat.
4. Hubungkan pengguna ke database tersebut dengan hak akses **ALL PRIVILEGES**.

### 2. Setup Node.js App di cPanel
1. Pada cPanel, cari dan buka menu **Setup Node.js App**.
2. Klik tombol **Create Application**.
3. Isi parameter:
   - **Node.js version**: Pilih versi `20.x` atau `22.x`.
   - **Application mode**: `Production`.
   - **Application root**: `flag-hunter` (folder di dalam home cPanel).
   - **Application URL**: Pilih domain/subdomain yang diinginkan.
   - **Application startup file**: `server.js` (atau biarkan default).
4. Klik **Create**.

### 3. Unggah File Proyek
1. Unggah seluruh file proyek (kecuali folder `node_modules` dan `.next`).
2. Masuk via SSH cPanel atau Terminal cPanel ke direktori proyek:
   ```bash
   cd ~/flag-hunter
   ```
3. Buat file `.env` dan masukkan kredensial MySQL cPanel:
   ```env
   DATABASE_URL="mysql://usercpanel_dbuser:PasswordAnda@localhost:3306/usercpanel_flaghunter"
   AUTH_SECRET="kunci_rahasia_acak_minimal_32_karakter"
   NEXT_PUBLIC_APP_NAME="FLAG HUNTER"
   NEXT_PUBLIC_APP_URL="https://domainanda.com"
   NODE_ENV="production"
   ```

### 4. Instal Dependensi & Build
Jalankan di Terminal cPanel:
```bash
npm install
npx prisma db push
npm run seed
npm run build
```

### 5. Setup Custom Server Entry Point untuk cPanel
Di cPanel, buat file `server.js` pada root direktori:
```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "localhost";
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```
6. Buka kembali menu **Setup Node.js App** di cPanel dan klik tombol **Restart**.

---

# BAGIAN 3: DOCKER / DOKPLOY / COOLIFY (Opsional Modern)

Jika Anda menggunakan PaaS seperti Coolify, Dokploy, atau Docker Compose:

### File `Dockerfile`:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

---

# BAGIAN 4: CHECKLIST PERAWATAN & BACKUP

### 1. Backup Otomatis Database Harian (Cron Job VPS)
Tambahkan ke `crontab -e`:
```bash
0 2 * * * mysqldump -u flag_user -p'PasswordKuatAnda123!@#' flag_hunter | gzip > /var/backups/flag_hunter_$(date +\%F).sql.gz
```

### 2. Update Versi Aplikasi (Saat Ada Perubahan Kode)
Cukup jalankan urutan perintah berikut di server VPS:
```bash
cd /var/www/flag-hunter
git pull origin main
npm install
npx prisma db push
npm run build
pm2 reload flag-hunter
```
Semua sesi pengguna tetap aman dan aplikasi berjalan tanpa *downtime*.
