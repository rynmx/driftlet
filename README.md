 <h1> <img src="./public/logo.png" width="25px" height="25px" /> driftlet</h1>

a minimalist, modern, and performant blogging and portfolio platform.

[live demo](https://ryanaque.com) • [driftlet.xyz](https://driftlet.xyz)

> [!NOTE]
> we don't have documentation yet, you will be rick rolled if you click on the documentation in the website.

**note**: this is a very early-stage project. things may be broken or incomplete.

## roadmap for 1.0

- [x] create/edit/delete posts
- [x] basic account stuff
- [x] basic home page stuff
- [x] links
- [ ] page view tracker
- [x] page tags
- [ ] basic theming
- [x] an actual icon for the project

## deploying

this project uses docker. run `docker-compose up -d` to pull the latest image from [docker hub](https://hub.docker.com/r/rynmx/driftlet) and start the app.

new images are built automatically by github actions on every push to `main`.

### 1. populate .env

create a `.env` file in the root of the project and add the following:

```env
# nextauth secret - change this to a random string
NEXTAUTH_SECRET=your-super-secret-key

# database connection (matches docker-compose.yml)
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=driftlet
DATABASE_URL="postgresql://user:password@localhost:5432/driftlet"

# database connection pool configuration (optional - defaults shown)
DB_POOL_MAX_CONNECTIONS=20
DB_POOL_MIN_CONNECTIONS=2
DB_CONNECTION_TIMEOUT_MS=5000
DB_IDLE_TIMEOUT_MS=30000
DB_QUERY_TIMEOUT_MS=30000
DB_STATEMENT_TIMEOUT_MS=60000
```

### 2. run the server

```bash
docker compose up -d
```

your site should now be available at port `3000`, but you should use a reverse proxy to expose it to the internet.
(i suggest [caddy](https://github.com/caddyserver/caddy) or [nginx proxy manager](hhttps://github.com/NginxProxyManager/nginx-proxy-manager))

## getting started (dev)

### 1. populate .env

create a `.env` file in the root of the project and add the following:

```env
# nextauth secret - change this to a random string
NEXTAUTH_SECRET=your-super-secret-key

# database connection (matches docker-compose.yml)
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=driftlet
DATABASE_URL="postgresql://user:password@localhost:5432/driftlet"

# database connection pool configuration (optional - defaults shown)
DB_POOL_MAX_CONNECTIONS=20
DB_POOL_MIN_CONNECTIONS=2
DB_CONNECTION_TIMEOUT_MS=5000
DB_IDLE_TIMEOUT_MS=30000
DB_QUERY_TIMEOUT_MS=30000
DB_STATEMENT_TIMEOUT_MS=60000
```

### 2. set up the database

this project uses docker to run a postgresql database. make sure you have docker and docker-compose installed.

```bash
docker compose up -d db
```

### 3. install dependencies

```bash
npm install
```

### 4. run the development server

```bash
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

### 5. logging in

the database is seeded with a default user:

- **username**: `admin`
- **password**: `password`

you need to manually go to [http://localhost:3000/login](http://localhost:3000/login) to login as the login button is hidden.

## contributing

contributions welcome! please open an issue or submit a pull request.
